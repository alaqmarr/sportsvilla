"use client";
import { useState } from "react";
import { createAdmin, deleteAdmin } from "./actions";
import { useAlert } from "@/components/AlertProvider";
import { FiTrash2 } from "react-icons/fi";

export default function AdminClient({ initialAdmins }: { initialAdmins: any[] }) {
  const { showAlert } = useAlert();
  const [admins, setAdmins] = useState(initialAdmins);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const admin = await createAdmin({ name, email, password });
      setAdmins([admin, ...admins]);
      setName("");
      setEmail("");
      setPassword("");
      showAlert("Admin Created", `The admin account '${name}' has been successfully created.`, "success");
    } catch (err) {
      showAlert("Creation Failed", "There was an error creating the admin account. The username might already be in use.", "error");
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure?")) return;
    try {
      await deleteAdmin(id);
      setAdmins(admins.filter(a => a.id !== id));
      showAlert("Admin Deleted", "The admin account has been permanently removed.", "success");
    } catch (err) {
      showAlert("Deletion Failed", "Cannot delete this admin account right now.", "error");
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-['Outfit'] text-white">Manage Admins</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-5">Add New Admin</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Full Name</label>
              <input type="text" className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-sm" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Email Address</label>
              <input type="email" className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-sm" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Password</label>
              <input type="password" className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-sm" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
            </div>
            <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-5 py-3 text-sm font-semibold transition-colors cursor-pointer border-none disabled:opacity-50" disabled={loading}>
              {loading ? "Creating..." : "Create Admin"}
            </button>
          </form>
        </div>

        <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-5">Existing Admins</h3>
          <div className="divide-y divide-[#2a2d3e]">
            {admins.map(admin => (
              <div key={admin.id} className="flex justify-between items-center py-4 first:pt-0 last:pb-0">
                <div>
                  <div className="font-semibold text-white text-sm">{admin.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{admin.email}</div>
                </div>
                <button onClick={() => handleDelete(admin.id)} className="border border-[#2a2d3e] hover:bg-red-500/10 text-red-400 rounded-lg p-2 transition-colors cursor-pointer bg-transparent">
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
