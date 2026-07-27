"use client";
import { useState } from "react";
import { useAlert } from "@/components/AlertProvider";
import { FiTrash2, FiEdit2, FiShield, FiCheck, FiX, FiPlus, FiAlertCircle, FiZap } from "react-icons/fi";
import { RBAC_CATEGORIES, AdminUser } from "@/lib/rbac";

const ROLE_TEMPLATES: Record<string, string[]> = {
  "Turf Manager": ["view:calendar", "manage:calendar", "view:bookings", "manage:bookings", "view:checkin", "manage:checkin", "view:turfs", "view:reports"],
  "Support Agent": ["view:members", "view:whatsapp", "manage:whatsapp", "view:bookings", "view:calendar"],
  "Finance Manager": ["view:wallets", "manage:wallets", "view:plans", "manage:plans", "view:reports", "manage:reports", "view:bookings"]
};

export default function AdminClient({ initialAdmins }: { initialAdmins: AdminUser[] }) {
  const { showAlert } = useAlert();
  const [admins, setAdmins] = useState<AdminUser[]>(initialAdmins);
  const [loading, setLoading] = useState(false);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdminId, setEditingAdminId] = useState<string | null>(null);
  
  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("ADMIN"); // Default to ADMIN
  const [isActive, setIsActive] = useState(true);
  const [permissions, setPermissions] = useState<Set<string>>(new Set());

  function openNewModal() {
    setEditingAdminId(null);
    setName("");
    setEmail("");
    setPassword("");
    setRole("ADMIN");
    setIsActive(true);
    setPermissions(new Set());
    setIsModalOpen(true);
  }

  function openEditModal(admin: AdminUser) {
    setEditingAdminId(admin.id!);
    setName(admin.name || "");
    setEmail(admin.email || "");
    setPassword(""); // Leave blank so we only update if provided
    setRole(admin.role || "ADMIN");
    setIsActive(admin.isActive ?? true);
    
    // Parse permissions
    const perms = admin.permissions 
      ? new Set(admin.permissions.split(",").map(p => p.trim()).filter(Boolean)) 
      : new Set<string>();
    setPermissions(perms);
    
    setIsModalOpen(true);
  }

  function togglePermission(key: string) {
    const newPerms = new Set(permissions);
    if (newPerms.has(key)) {
      newPerms.delete(key);
    } else {
      newPerms.add(key);
    }
    setPermissions(newPerms);
  }

  function handleSelectAll(categoryIdx: number) {
    const newPerms = new Set(permissions);
    RBAC_CATEGORIES[categoryIdx].modules.forEach(mod => {
      newPerms.add(mod.viewKey);
      if (mod.manageKey) newPerms.add(mod.manageKey);
    });
    setPermissions(newPerms);
  }

  function handleClearAll(categoryIdx: number) {
    const newPerms = new Set(permissions);
    RBAC_CATEGORIES[categoryIdx].modules.forEach(mod => {
      newPerms.delete(mod.viewKey);
      if (mod.manageKey) newPerms.delete(mod.manageKey);
    });
    setPermissions(newPerms);
  }

  function handleApplyTemplate(templateName: string) {
    setPermissions(new Set(ROLE_TEMPLATES[templateName]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const permsString = Array.from(permissions).join(",");
      const payload = {
        name,
        email,
        password,
        role,
        isActive,
        permissions: permsString,
      };

      if (editingAdminId) {
        // Update
        const res = await fetch("/api/admin/admins", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingAdminId, ...payload }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Update failed");
        
        setAdmins(admins.map(a => (a.id === editingAdminId ? data.admin : a)));
        showAlert("Admin Updated", "The admin profile has been updated.", "success");
      } else {
        // Create
        const res = await fetch("/api/admin/admins", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Creation failed");
        
        setAdmins([data.admin, ...admins]);
        showAlert("Admin Created", "New admin account successfully created.", "success");
      }
      setIsModalOpen(false);
    } catch (err: any) {
      showAlert("Action Failed", err.message, "error");
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this admin permanently?")) return;
    try {
      const res = await fetch(`/api/admin/admins?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Deletion failed");
      
      setAdmins(admins.filter(a => a.id !== id));
      showAlert("Admin Deleted", "The admin account has been removed.", "success");
    } catch (err: any) {
      showAlert("Deletion Failed", err.message, "error");
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold font-['Outfit'] text-white">Role & Admin Users</h1>
          <p className="text-gray-400 text-sm mt-1">Manage platform administrators and granular access controls.</p>
        </div>
        <button
          onClick={openNewModal}
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors flex items-center gap-2 border-none cursor-pointer shadow-lg shadow-orange-500/20"
        >
          <FiPlus />
          Add Admin
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {admins.map(admin => (
          <div key={admin.id} className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-5 hover:border-[#383c52] transition-colors relative group">
            {!admin.isActive && (
              <div className="absolute top-4 right-4 bg-red-500/10 text-red-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-red-500/20">
                Inactive
              </div>
            )}
            {admin.isActive && (
              <div className="absolute top-4 right-4">
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                  admin.role === "SUPERADMIN"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                }`}>
                  {admin.role || "ADMIN"}
                </span>
              </div>
            )}
            
            <div className="flex items-center gap-3 mb-4 mt-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                admin.role === "SUPERADMIN" ? "bg-amber-500/10 text-amber-400" : "bg-blue-500/10 text-blue-400"
              }`}>
                <FiShield />
              </div>
              <div className="truncate pr-16">
                <h3 className="text-white font-semibold text-sm truncate">{admin.name || "Unknown"}</h3>
                <p className="text-xs text-gray-500 truncate">{admin.email}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#2a2d3e] flex gap-2">
              <button 
                onClick={() => openEditModal(admin)}
                className="flex-1 bg-[#1f2331] hover:bg-blue-500/10 border border-[#2a2d3e] hover:border-blue-500/30 text-gray-400 hover:text-blue-400 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FiEdit2 />
                Edit Roles
              </button>
              <button 
                onClick={() => handleDelete(admin.id!)}
                className="bg-[#1f2331] hover:bg-red-500/10 border border-[#2a2d3e] hover:border-red-500/30 text-gray-400 hover:text-red-400 px-3 rounded-lg transition-colors cursor-pointer"
                title="Delete Admin"
              >
                <FiTrash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Slide-over Modal for Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-2xl bg-[#0f1117] h-full shadow-2xl flex flex-col border-l border-[#2a2d3e] transform transition-transform animate-in slide-in-from-right">
            <div className="p-6 border-b border-[#2a2d3e] flex justify-between items-center bg-[#161923]">
              <h2 className="text-xl font-bold text-white font-['Outfit']">
                {editingAdminId ? "Edit Admin User" : "Add New Admin User"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-[#2a2d3e] transition-colors">
                <FiX size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 styled-scrollbar">
              <form id="adminForm" onSubmit={handleSubmit} className="space-y-8">
                
                {/* Basic Details Section */}
                <section>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Basic Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">Full Name</label>
                      <input type="text" className="w-full bg-[#161923] border border-[#2a2d3e] rounded-lg px-3 py-2 text-white focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 outline-none text-sm transition-all" value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">Email Address</label>
                      <input type="email" className="w-full bg-[#161923] border border-[#2a2d3e] rounded-lg px-3 py-2 text-white focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 outline-none text-sm transition-all" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">
                        {editingAdminId ? "Reset Password (Optional)" : "Password"}
                      </label>
                      <input type="password" className="w-full bg-[#161923] border border-[#2a2d3e] rounded-lg px-3 py-2 text-white focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 outline-none text-sm transition-all" value={password} onChange={e => setPassword(e.target.value)} minLength={6} required={!editingAdminId} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">Account Status</label>
                      <select className="w-full bg-[#161923] border border-[#2a2d3e] rounded-lg px-3 py-2 text-white focus:border-orange-500/50 outline-none text-sm" value={isActive ? "active" : "inactive"} onChange={e => setIsActive(e.target.value === "active")}>
                        <option value="active">Active (Can Login)</option>
                        <option value="inactive">Inactive (Suspended)</option>
                      </select>
                    </div>
                  </div>
                </section>

                {/* Role Assignment */}
                <section>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Role Assignment</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <label className={`cursor-pointer rounded-xl border p-4 flex gap-3 transition-all ${role === "ADMIN" ? "bg-blue-500/10 border-blue-500/50" : "bg-[#161923] border-[#2a2d3e] opacity-70 hover:opacity-100"}`}>
                      <input type="radio" name="role" value="ADMIN" checked={role === "ADMIN"} onChange={() => setRole("ADMIN")} className="mt-1" />
                      <div>
                        <div className={`font-bold text-sm ${role === "ADMIN" ? "text-blue-400" : "text-white"}`}>Restricted Admin</div>
                        <div className="text-xs text-gray-500 mt-1 leading-relaxed">Customize granular access to specific modules and actions.</div>
                      </div>
                    </label>

                    <label className={`cursor-pointer rounded-xl border p-4 flex gap-3 transition-all ${role === "SUPERADMIN" ? "bg-amber-500/10 border-amber-500/50" : "bg-[#161923] border-[#2a2d3e] opacity-70 hover:opacity-100"}`}>
                      <input type="radio" name="role" value="SUPERADMIN" checked={role === "SUPERADMIN"} onChange={() => setRole("SUPERADMIN")} className="mt-1" />
                      <div>
                        <div className={`font-bold text-sm ${role === "SUPERADMIN" ? "text-amber-400" : "text-white"}`}>Superadmin</div>
                        <div className="text-xs text-gray-500 mt-1 leading-relaxed">Unrestricted access to all modules, settings, and other admins.</div>
                      </div>
                    </label>
                  </div>
                </section>

                {/* Granular Permissions Matrix */}
                {role === "ADMIN" && (
                  <section className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex justify-between items-end mb-4">
                      <div>
                        <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest">Granular Permissions</h3>
                        <p className="text-xs text-gray-500 mt-1">Select exactly what this admin can view and modify.</p>
                      </div>
                    </div>

                    {/* Role Templates */}
                    <div className="mb-6 bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <FiZap className="text-blue-400" size={14} />
                        <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">Quick Templates</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {Object.keys(ROLE_TEMPLATES).map(template => (
                          <button
                            key={template}
                            type="button"
                            onClick={() => handleApplyTemplate(template)}
                            className="text-xs font-medium bg-[#1c1f2e] hover:bg-[#2a2d3e] border border-[#2a2d3e] hover:border-blue-500/50 text-white px-3 py-1.5 rounded-lg transition-all"
                          >
                            {template}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6">
                      {RBAC_CATEGORIES.map((category, idx) => (
                        <div key={category.title} className="bg-[#161923] border border-[#2a2d3e] rounded-xl overflow-hidden">
                          <div className="bg-[#1c1f2e] px-4 py-2 border-b border-[#2a2d3e] flex justify-between items-center">
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">{category.title}</h4>
                            <div className="flex gap-3">
                              <button type="button" onClick={() => handleSelectAll(idx)} className="text-[10px] font-medium text-emerald-400 hover:text-emerald-300 transition-colors">Select All</button>
                              <span className="text-gray-600">|</span>
                              <button type="button" onClick={() => handleClearAll(idx)} className="text-[10px] font-medium text-gray-400 hover:text-gray-300 transition-colors">Clear</button>
                            </div>
                          </div>
                          
                          <div className="divide-y divide-[#2a2d3e]">
                            {category.modules.map(mod => {
                              const canView = permissions.has(mod.viewKey);
                              const canManage = mod.manageKey ? permissions.has(mod.manageKey) : false;
                              
                              return (
                                <div key={mod.id} className="p-4 flex items-center justify-between hover:bg-[#1a1e2b] transition-colors">
                                  <div className="flex-1 pr-4">
                                    <div className="text-sm font-semibold text-white">{mod.name}</div>
                                    <div className="text-xs text-gray-500 mt-0.5">{mod.description}</div>
                                  </div>
                                  <div className="flex items-center gap-4 shrink-0">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input 
                                        type="checkbox" 
                                        checked={canView} 
                                        onChange={() => togglePermission(mod.viewKey)}
                                        className="w-4 h-4 rounded border-[#2a2d3e] bg-[#0f1117] text-blue-500 focus:ring-blue-500/50"
                                      />
                                      <span className={`text-xs font-medium ${canView ? 'text-gray-200' : 'text-gray-500'}`}>View</span>
                                    </label>
                                    
                                    {mod.manageKey && (
                                      <label className="flex items-center gap-2 cursor-pointer w-[72px]">
                                        <input 
                                          type="checkbox" 
                                          checked={canManage} 
                                          onChange={() => {
                                            // Automatically check View if Manage is checked
                                            if (!canManage && !permissions.has(mod.viewKey)) {
                                              const newPerms = new Set(permissions);
                                              newPerms.add(mod.viewKey);
                                              newPerms.add(mod.manageKey!);
                                              setPermissions(newPerms);
                                            } else {
                                              togglePermission(mod.manageKey!);
                                            }
                                          }}
                                          className="w-4 h-4 rounded border-[#2a2d3e] bg-[#0f1117] text-orange-500 focus:ring-orange-500/50"
                                        />
                                        <span className={`text-xs font-medium ${canManage ? 'text-orange-400' : 'text-gray-500'}`}>Manage</span>
                                      </label>
                                    )}
                                    {!mod.manageKey && <div className="w-[72px]" />}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

              </form>
            </div>

            <div className="p-6 border-t border-[#2a2d3e] bg-[#161923] flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-[#2a2d3e] transition-colors border border-transparent"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="adminForm"
                disabled={loading}
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-6 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 border-none shadow-lg shadow-orange-500/20 flex items-center gap-2"
              >
                {loading ? (
                  "Saving..."
                ) : (
                  <>
                    <FiCheck /> {editingAdminId ? "Save Changes" : "Create Admin"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
