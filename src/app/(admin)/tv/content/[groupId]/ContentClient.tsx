"use client";

import { useState } from "react";
import { deleteContentItem, reorderContentItems } from "./actions";
import { useAlert } from "@/components/AlertProvider";

export default function ContentClient({ group, initialItems, publicUrlBase }: { group: any, initialItems: any[], publicUrlBase: string }) {
  const { showAlert, showConfirm } = useAlert();
  const [items, setItems] = useState(initialItems);
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState("10"); // seconds for images

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("screenGroupId", group.id);
      formData.append("durationSeconds", duration);

      const res = await fetch("/api/admin/tv/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      
      if (!data.success) throw new Error(data.error || "Upload failed");
      
      showAlert("Uploaded successfully!");
      // reload page to see new item
      window.location.reload();
    } catch (e: any) {
      showAlert(e.message, "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    showConfirm("Delete Content", "Are you sure you want to delete this content?", async () => {
      try {
        await deleteContentItem(id);
        setItems(items.filter(i => i.id !== id));
        showAlert("Deleted!");
      } catch (e: any) {
        showAlert(e.message, "error");
      }
    });
  };

  const handlePublish = async () => {
    showConfirm("Publish Playlist", "Publish this playlist to all paired screens?", async () => {
      try {
        const res = await fetch("/api/admin/tv/publish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ screenGroupId: group.id })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        showAlert("Published successfully!");
      } catch (e: any) {
        showAlert(e.message, "error");
      }
    });
  };

  const moveItem = async (index: number, direction: -1 | 1) => {
    if (index + direction < 0 || index + direction >= items.length) return;
    
    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[index + direction];
    newItems[index + direction] = temp;
    
    // Update sortOrders locally
    const updated = newItems.map((item, idx) => ({ ...item, sortOrder: idx + 1 }));
    setItems(updated);

    try {
      await reorderContentItems(updated.map(u => ({ id: u.id, sortOrder: u.sortOrder })));
    } catch (e: any) {
      showAlert("Failed to save order", "error");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Content: {group.name}</h1>
        <button 
          onClick={handlePublish}
          className="bg-green-600 text-white px-6 py-2 rounded font-semibold shadow"
        >
          Publish to Screens
        </button>
      </div>

      <div className="bg-white p-6 rounded shadow flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-semibold mb-1">Upload Media (JPG/PNG/MP4)</label>
          <input 
            type="file" 
            accept="image/*,video/mp4"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="border p-2 rounded w-full"
          />
        </div>
        {file && file.type.startsWith("image/") && (
          <div>
            <label className="block text-sm font-semibold mb-1">Duration (s)</label>
            <input 
              type="number" 
              value={duration} 
              onChange={e => setDuration(e.target.value)}
              className="border p-2 rounded w-24"
            />
          </div>
        )}
        <button 
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50 h-[42px]"
        >
          {isUploading ? "Uploading..." : "Upload"}
        </button>
      </div>

      <div className="bg-white p-6 rounded shadow space-y-4">
        <h2 className="text-xl font-bold">Playlist Order</h2>
        {items.length === 0 && <p className="text-gray-500">No content added yet.</p>}
        
        {items.map((item, idx) => (
          <div key={item.id} className="flex items-center gap-4 border p-4 rounded bg-gray-50">
            <div className="flex flex-col gap-1">
              <button 
                onClick={() => moveItem(idx, -1)} 
                disabled={idx === 0}
                className="p-1 bg-gray-200 rounded disabled:opacity-30"
              >
                ↑
              </button>
              <button 
                onClick={() => moveItem(idx, 1)} 
                disabled={idx === items.length - 1}
                className="p-1 bg-gray-200 rounded disabled:opacity-30"
              >
                ↓
              </button>
            </div>
            
            <div className="w-24 h-16 bg-black flex items-center justify-center overflow-hidden rounded">
              {item.type === "image" ? (
                <img src={`${publicUrlBase}/${item.r2Key}`} alt="thumb" className="object-cover w-full h-full" />
              ) : (
                <span className="text-white text-xs">VIDEO</span>
              )}
            </div>

            <div className="flex-1">
              <p className="font-mono text-xs text-gray-500 truncate">{item.r2Key}</p>
              <p className="text-sm">Type: {item.type.toUpperCase()} • {item.durationSeconds ? `${item.durationSeconds}s` : 'Full'}</p>
            </div>

            <button onClick={() => handleDelete(item.id)} className="text-red-600 px-4">
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
