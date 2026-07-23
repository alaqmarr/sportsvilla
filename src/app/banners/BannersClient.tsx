"use client";

import { useState } from "react";
import { createBanner, toggleBannerStatus, deleteBanner, getAdminPresignedUrl } from "./actions";

export default function BannersClient({ initialBanners, sports }: { initialBanners: any[], sports: any[] }) {
  const [banners, setBanners] = useState(initialBanners);
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [targetSportId, setTargetSportId] = useState("");

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      // 1. Get presigned URL via Server Action
      const ext = file.name.split('.').pop() || 'png';
      const data = await getAdminPresignedUrl(file.type, ext);
      if (!data.success) throw new Error(data.error);

      // 2. Upload to R2 directly
      await fetch(data.signedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      // 3. Create banner in DB
      const newBanner = await createBanner({
        imageUrl: data.publicUrl,
        title,
        targetSportId: targetSportId || undefined
      });

      // Let's attach targetSport if available for instant UI update
      if (targetSportId) {
        newBanner.targetSport = sports.find(s => s.id === targetSportId);
      }
      setBanners([newBanner, ...banners]);
      
      // reset form
      setFile(null);
      setTitle("");
      setTargetSportId("");
    } catch (err: any) {
      alert("Failed to create banner: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Homepage Banners</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <h2 className="text-lg font-semibold">Upload New Banner</h2>
        <div className="text-sm text-gray-500 mb-2">
          Recommended resolution: 1080x450 (21:9) for optimal mobile viewing.
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            type="file" 
            accept="image/*"
            onChange={e => setFile(e.target.files?.[0] || null)}
            className="border p-2 rounded"
          />
          <input 
            type="text" 
            placeholder="Banner Title (Optional)" 
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="border p-2 rounded"
          />
          <select 
            value={targetSportId}
            onChange={e => setTargetSportId(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">Global Banner (All Users)</option>
            {sports.map(s => (
              <option key={s.id} value={s.id}>Target: {s.name} players</option>
            ))}
          </select>
        </div>
        <button 
          disabled={!file || isUploading}
          onClick={handleUpload}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {isUploading ? "Uploading..." : "Upload Banner"}
        </button>
      </div>

      <div className="space-y-4">
        {banners.map(b => (
          <div key={b.id} className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src={b.imageUrl} alt={b.title || "Banner"} className="h-24 w-auto object-contain rounded" />
              <div>
                <h3 className="font-semibold">{b.title || "Untitled Banner"}</h3>
                <p className="text-sm text-gray-500">
                  Target: {b.targetSport ? b.targetSport.name : "Global"}
                </p>
                <span className={`inline-block px-2 py-1 text-xs rounded mt-1 ${b.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {b.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="space-x-2">
              <button 
                onClick={async () => {
                  await toggleBannerStatus(b.id, !b.isActive);
                  setBanners(banners.map(banner => banner.id === b.id ? { ...banner, isActive: !b.isActive } : banner));
                }}
                className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
              >
                {b.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button 
                onClick={async () => {
                  if (confirm("Are you sure you want to delete this banner?")) {
                    await deleteBanner(b.id);
                    setBanners(banners.filter(banner => banner.id !== b.id));
                  }
                }}
                className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
