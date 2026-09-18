"use client";
import React, { useState } from "react";
import { useAlert } from "@/components/AlertProvider";
import { FiTrash2, FiEdit2, FiShield, FiCheck, FiX, FiPlus, FiZap } from "react-icons/fi";
import { RBAC_CATEGORIES, AdminUser } from "@/lib/rbac";
import {
  Card,
  Button,
  Badge,
  PageHeader,
  Input,
  Select,
} from "@/components/admin/ui";

const ROLE_TEMPLATES: Record<string, string[]> = {
  "Turf Manager": ["view:calendar", "manage:calendar", "view:bookings", "manage:bookings", "view:checkin", "manage:checkin", "view:turfs", "view:reports"],
  "Support Agent": ["view:members", "view:whatsapp", "manage:whatsapp", "view:bookings", "view:calendar"],
  "Finance Manager": ["view:wallets", "manage:wallets", "view:plans", "manage:plans", "view:reports", "manage:reports", "view:bookings"]
};

export default function AdminClient({ initialAdmins }: { initialAdmins: AdminUser[] }) {
  const { showAlert, showConfirm } = useAlert();
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
    showConfirm(
      "Confirm Deletion",
      "Are you sure you want to delete this admin permanently?",
      async () => {
        try {
          const res = await fetch(`/api/admin/admins?id=${id}`, { method: "DELETE" });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Deletion failed");
          
          setAdmins(admins.filter(a => a.id !== id));
          showAlert("Admin Deleted", "The admin account has been removed.", "success");
        } catch (err: any) {
          showAlert("Deletion Failed", err.message, "error");
        }
      },
      undefined,
      "Delete",
      "Cancel",
      "error"
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Role & Admin Users"
        subtitle="Manage platform administrators and granular access controls."
        actions={
          <Button onClick={openNewModal} leftIcon={<FiPlus />}>
            Add Admin
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {admins.map(admin => (
          <Card
            key={admin.id}
            variant="default"
            padding="md"
            hoverEffect
            className="flex flex-col justify-between relative"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                  admin.role === "SUPERADMIN" ? "bg-amber-500/10 text-amber-400" : "bg-blue-500/10 text-blue-400"
                }`}>
                  <FiShield />
                </div>
                <div>
                  {!admin.isActive ? (
                    <Badge variant="error" size="sm">Inactive</Badge>
                  ) : (
                    <Badge variant={admin.role === "SUPERADMIN" ? "warning" : "info"} size="sm">
                      {admin.role || "ADMIN"}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="truncate">
                <h3 className="text-sv-text font-bold text-sm truncate">{admin.name || "Unknown"}</h3>
                <p className="text-xs text-sv-text-muted truncate mt-0.5">{admin.email}</p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-sv-border-subtle flex gap-2">
              <Button 
                variant="outline"
                size="sm"
                onClick={() => openEditModal(admin)}
                leftIcon={<FiEdit2 size={12} />}
                className="flex-1 text-xs"
              >
                Edit Roles
              </Button>
              <Button 
                variant="danger"
                size="icon"
                onClick={() => handleDelete(admin.id!)}
                title="Delete Admin"
              >
                <FiTrash2 size={14} />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Slide-over Modal for Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative w-full max-w-2xl bg-sv-bg h-full shadow-sv-xl flex flex-col border-l border-sv-border border-[#2a2d3e] transform transition-transform animate-in slide-in-from-right">
            <div className="p-6 border-b border-sv-border border-[#2a2d3e] flex justify-between items-center bg-sv-surface">
              <h2 className="text-xl font-bold text-sv-text font-sans">
                {editingAdminId ? "Edit Admin User" : "Add New Admin User"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-sv-text-muted hover:text-sv-text p-2 rounded-sv-sm hover:bg-sv-surface-hover transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 styled-scrollbar">
              <form id="adminForm" onSubmit={handleSubmit} className="space-y-8">
                
                {/* Basic Details Section */}
                <section className="space-y-4">
                  <h3 className="text-xs font-bold text-sv-text-secondary uppercase tracking-widest">
                    Basic Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                    <Input
                      label={editingAdminId ? "Reset Password (Optional)" : "Password *"}
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      minLength={6}
                      required={!editingAdminId}
                    />
                    <Select
                      label="Account Status"
                      value={isActive ? "active" : "inactive"}
                      onChange={e => setIsActive(e.target.value === "active")}
                    >
                      <option value="active">Active (Can Login)</option>
                      <option value="inactive">Inactive (Suspended)</option>
                    </Select>
                  </div>
                </section>

                {/* Role Assignment */}
                <section className="space-y-4">
                  <h3 className="text-xs font-bold text-sv-text-secondary uppercase tracking-widest">
                    Role Assignment
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label
                      className={`cursor-pointer rounded-sv-lg border border-[#2a2d3e] p-4 flex gap-3 transition-all ${
                        role === "ADMIN"
                          ? "bg-sv-info-subtle border-sv-status-info/50"
                          : "bg-sv-surface border-sv-border border-[#2a2d3e] opacity-70 hover:opacity-100"
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value="ADMIN"
                        checked={role === "ADMIN"}
                        onChange={() => setRole("ADMIN")}
                        className="mt-1 accent-orange-500"
                      />
                      <div>
                        <div className={`font-bold text-sm ${role === "ADMIN" ? "text-sv-status-info" : "text-sv-text"}`}>
                          Restricted Admin
                        </div>
                        <div className="text-xs text-sv-text-muted mt-1 leading-relaxed">
                          Customize granular access to specific modules and actions.
                        </div>
                      </div>
                    </label>

                    <label
                      className={`cursor-pointer rounded-sv-lg border border-[#2a2d3e] p-4 flex gap-3 transition-all ${
                        role === "SUPERADMIN"
                          ? "bg-sv-warning-subtle border-sv-status-warning/50"
                          : "bg-sv-surface border-sv-border border-[#2a2d3e] opacity-70 hover:opacity-100"
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value="SUPERADMIN"
                        checked={role === "SUPERADMIN"}
                        onChange={() => setRole("SUPERADMIN")}
                        className="mt-1 accent-orange-500"
                      />
                      <div>
                        <div className={`font-bold text-sm ${role === "SUPERADMIN" ? "text-sv-status-warning" : "text-sv-text"}`}>
                          Superadmin
                        </div>
                        <div className="text-xs text-sv-text-muted mt-1 leading-relaxed">
                          Unrestricted access to all modules, settings, and other admins.
                        </div>
                      </div>
                    </label>
                  </div>
                </section>

                {/* Granular Permissions Matrix */}
                {role === "ADMIN" && (
                  <section className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div>
                      <h3 className="text-xs font-bold text-sv-status-info uppercase tracking-widest">
                        Granular Permissions
                      </h3>
                      <p className="text-xs text-sv-text-muted mt-1">
                        Select exactly what this admin can view and modify.
                      </p>
                    </div>

                    {/* Role Templates */}
                    <div className="bg-sv-info-subtle border border-[#2a2d3e] border-sv-info-border border-[#2a2d3e] rounded-sv-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <FiZap className="text-sv-status-info" size={14} />
                        <h4 className="text-xs font-bold text-sv-status-info uppercase tracking-wider">
                          Quick Templates
                        </h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {Object.keys(ROLE_TEMPLATES).map(template => (
                          <Button
                            key={template}
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => handleApplyTemplate(template)}
                            className="text-xs"
                          >
                            {template}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6">
                      {RBAC_CATEGORIES.map((category, idx) => (
                        <Card key={category.title} variant="default" padding="none" className="overflow-hidden">
                          <div className="bg-sv-surface-raised px-4 py-2.5 border-b border-sv-border border-[#2a2d3e] flex justify-between items-center">
                            <h4 className="text-xs font-bold text-sv-text uppercase tracking-wider">
                              {category.title}
                            </h4>
                            <div className="flex gap-3">
                              <button
                                type="button"
                                onClick={() => handleSelectAll(idx)}
                                className="text-[10px] font-semibold text-sv-status-success hover:underline"
                              >
                                Select All
                              </button>
                              <span className="text-sv-border-strong">|</span>
                              <button
                                type="button"
                                onClick={() => handleClearAll(idx)}
                                className="text-[10px] font-semibold text-sv-text-muted hover:text-sv-text"
                              >
                                Clear
                              </button>
                            </div>
                          </div>
                          
                          <div className="divide-y divide-sv-border-subtle bg-sv-surface">
                            {category.modules.map(mod => {
                              const canView = permissions.has(mod.viewKey);
                              const canManage = mod.manageKey ? permissions.has(mod.manageKey) : false;
                              
                              return (
                                <div key={mod.id} className="p-4 flex items-center justify-between hover:bg-sv-surface-hover/50 transition-colors">
                                  <div className="flex-1 pr-4">
                                    <div className="text-sm font-semibold text-sv-text">{mod.name}</div>
                                    <div className="text-xs text-sv-text-muted mt-0.5">{mod.description}</div>
                                  </div>
                                  <div className="flex items-center gap-4 shrink-0">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input 
                                        type="checkbox" 
                                        checked={canView} 
                                        onChange={() => togglePermission(mod.viewKey)}
                                        className="w-4 h-4 rounded accent-orange-500"
                                      />
                                      <span className={`text-xs font-medium ${canView ? 'text-sv-text' : 'text-sv-text-muted'}`}>
                                        View
                                      </span>
                                    </label>
                                    
                                    {mod.manageKey && (
                                      <label className="flex items-center gap-2 cursor-pointer w-[72px]">
                                        <input 
                                          type="checkbox" 
                                          checked={canManage} 
                                          onChange={() => {
                                            if (!canManage && !permissions.has(mod.viewKey)) {
                                              const newPerms = new Set(permissions);
                                              newPerms.add(mod.viewKey);
                                              newPerms.add(mod.manageKey!);
                                              setPermissions(newPerms);
                                            } else {
                                              togglePermission(mod.manageKey!);
                                            }
                                          }}
                                          className="w-4 h-4 rounded accent-orange-500"
                                        />
                                        <span className={`text-xs font-medium ${canManage ? 'text-sv-brand font-semibold' : 'text-sv-text-muted'}`}>
                                          Manage
                                        </span>
                                      </label>
                                    )}
                                    {!mod.manageKey && <div className="w-[72px]" />}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </section>
                )}

              </form>
            </div>

            <div className="p-6 border-t border-sv-border border-[#2a2d3e] bg-sv-surface flex justify-end gap-3">
              <Button 
                type="button"
                variant="secondary"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                form="adminForm"
                disabled={loading}
                isLoading={loading}
                variant="primary"
                leftIcon={<FiCheck />}
              >
                {editingAdminId ? "Save Changes" : "Create Admin"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
