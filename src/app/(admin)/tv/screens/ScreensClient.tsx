"use client";

import { useState } from "react";
import { createScreenGroup, createScreen, deleteScreen } from "./actions";
import { useAlert } from "@/components/AlertProvider";

export default function ScreensClient({ initialScreens, screenGroups }: { initialScreens: any[], screenGroups: any[] }) {
  const { showAlert, showConfirm } = useAlert();
  const [screens, setScreens] = useState(initialScreens);
  const [groups, setGroups] = useState(screenGroups);
  
  const [newGroupName, setNewGroupName] = useState("");
  const [newScreenLabel, setNewScreenLabel] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateGroup = async () => {
    if (!newGroupName) return;
    setIsSubmitting(true);
    try {
      const group = await createScreenGroup(newGroupName);
      setGroups([...groups, group]);
      setNewGroupName("");
      showAlert("Group created!");
    } catch (e: any) {
      showAlert(e.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateScreen = async () => {
    if (!newScreenLabel || !selectedGroupId) return;
    setIsSubmitting(true);
    try {
      const screen = await createScreen(newScreenLabel, selectedGroupId);
      setScreens([ { ...screen, screenGroup: groups.find(g => g.id === selectedGroupId) }, ...screens ]);
      setNewScreenLabel("");
      showAlert("Screen created!");
    } catch (e: any) {
      showAlert(e.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteScreen = async (id: string) => {
    showConfirm("Delete Screen", "Are you sure you want to delete this screen?", async () => {
      try {
        await deleteScreen(id);
        setScreens(screens.filter((s) => s.id !== id));
        showAlert("Screen deleted!");
      } catch (e: any) {
        showAlert(e.message, "error");
      }
    });
  };

  const handleGeneratePairCode = async (screenId: string) => {
    try {
      const res = await fetch("/api/admin/tv/pair/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ screenId }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed");
      
      setScreens(screens.map(s => s.id === screenId ? { ...s, pairingCode: data.pairingCode, pairingExpiresAt: data.expiresAt } : s));
      showAlert(`Code generated: ${data.pairingCode}`);
    } catch (e: any) {
      showAlert(e.message, "error");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">TV Screens Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Create Screen Group</h2>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="e.g. Lobby Screens" 
              className="border p-2 rounded flex-1"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
            />
            <button 
              onClick={handleCreateGroup} 
              disabled={isSubmitting || !newGroupName}
              className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Add Group
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Register New Screen</h2>
          <div className="space-y-3">
            <select 
              className="border p-2 rounded w-full"
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
            >
              <option value="">Select Group...</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
            <input 
              type="text" 
              placeholder="e.g. TV 1 (Entrance)" 
              className="border p-2 rounded w-full"
              value={newScreenLabel}
              onChange={(e) => setNewScreenLabel(e.target.value)}
            />
            <button 
              onClick={handleCreateScreen} 
              disabled={isSubmitting || !newScreenLabel || !selectedGroupId}
              className="bg-blue-600 text-white px-4 py-2 rounded w-full disabled:opacity-50"
            >
              Register Screen
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Screens</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="py-2">Label</th>
              <th className="py-2">Group</th>
              <th className="py-2">Status</th>
              <th className="py-2">Pairing</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {screens.map(s => {
              const isStale = s.lastHeartbeatAt && (new Date().getTime() - new Date(s.lastHeartbeatAt).getTime() > 20 * 60 * 1000);
              return (
                <tr key={s.id} className="border-b">
                  <td className="py-3 font-semibold">{s.label}</td>
                  <td className="py-3 text-gray-600">
                    <a href={`/tv/content/${s.screenGroupId}`} className="text-blue-600 underline">
                      {s.screenGroup?.name}
                    </a>
                  </td>
                  <td className="py-3">
                    {s.lastHeartbeatAt ? (
                      <span className={`px-2 py-1 rounded text-xs text-white ${isStale ? 'bg-red-500' : 'bg-green-500'}`}>
                        {isStale ? 'Stale' : 'Online'}
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded text-xs text-gray-800 bg-gray-200">Offline</span>
                    )}
                  </td>
                  <td className="py-3">
                    {s.deviceToken ? (
                      <span className="text-green-600">Paired</span>
                    ) : s.pairingCode ? (
                      <span className="font-mono bg-gray-100 p-1">{s.pairingCode}</span>
                    ) : (
                      <button 
                        onClick={() => handleGeneratePairCode(s.id)}
                        className="text-sm text-blue-600 underline"
                      >
                        Generate Code
                      </button>
                    )}
                  </td>
                  <td className="py-3">
                    <button onClick={() => handleDeleteScreen(s.id)} className="text-red-600 text-sm">Delete</button>
                  </td>
                </tr>
              );
            })}
            {screens.length === 0 && (
              <tr>
                <td colSpan={5} className="py-4 text-center text-gray-500">No screens registered</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
