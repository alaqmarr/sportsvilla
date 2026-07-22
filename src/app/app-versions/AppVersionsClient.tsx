"use client";

import React, { useState, useRef } from "react";
import toast from "react-hot-toast";
import { saveAppVersion } from "./actions";
import { FiUploadCloud, FiSmartphone, FiSave, FiExternalLink, FiDownload, FiX } from "react-icons/fi";
import { FaApple } from "react-icons/fa";

export default function AppVersionsClient({ initialVersions }: { initialVersions: any[] }) {
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const defaultAndroid = initialVersions.find(v => v.platform === 'android') || {
    platform: 'android', version: '1.0.0', forceUpdate: true, downloadUrl: '', fileKey: '', releaseNotes: ''
  };
  const defaultIos = initialVersions.find(v => v.platform === 'ios') || {
    platform: 'ios', version: '1.0.0', forceUpdate: true, downloadUrl: '', fileKey: '', releaseNotes: ''
  };

  const [androidData, setAndroidData] = useState(defaultAndroid);
  const [iosData, setIosData] = useState(defaultIos);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleApkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.apk')) {
      toast.error("Please select a valid APK file");
      return;
    }

    const toastId = toast.loading("Uploading APK to R2...");
    setIsUploading(true);
    try {
      const { name, type } = file;

      const res = await fetch("/api/client/v1/upload/presigned-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileExtension: 'apk', contentType: type || 'application/vnd.android.package-archive' }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to get presigned URL");
      }

      const { signedUrl, publicUrl, key } = await res.json();

      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", signedUrl, true);
        xhr.setRequestHeader("Content-Type", type || 'application/vnd.android.package-archive');
        
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            toast.loading(`Uploading APK... ${percent}%`, { id: toastId });
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(xhr.response);
          } else {
            reject(new Error(`Upload failed with status: ${xhr.status}`));
          }
        };
        
        xhr.onerror = () => reject(new Error("Network Error. Check if R2 Bucket CORS is configured."));
        xhr.send(file);
      });

      setAndroidData((prev: any) => ({ ...prev, downloadUrl: publicUrl, fileKey: key }));
      toast.success("APK uploaded successfully!", { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to upload APK", { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async (platform: string, data: any) => {
    setLoading(true);
    try {
      await saveAppVersion(data);
      toast.success(`${platform.toUpperCase()} version updated successfully!`);
    } catch (error: any) {
      toast.error(error.message || `Failed to update ${platform} version`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-8">App Versions Management</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Android Card */}
        <div className="bg-[#1e1e1e] p-6 rounded-2xl border border-[#333]">
          <div className="flex items-center gap-3 mb-6">
            <FiSmartphone className="text-emerald-500 text-2xl" />
            <h2 className="text-xl font-bold">Android Settings</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Version Number</label>
              <input
                type="text"
                value={androidData.version}
                onChange={e => setAndroidData({ ...androidData, version: e.target.value })}
                className="w-full bg-[#2a2a2a] p-3 rounded-lg border border-[#444] text-white"
                placeholder="1.0.0"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Download URL (APK or PlayStore)</label>
              <input
                type="text"
                value={androidData.downloadUrl}
                onChange={e => setAndroidData({ ...androidData, downloadUrl: e.target.value })}
                className="w-full bg-[#2a2a2a] p-3 rounded-lg border border-[#444] text-white"
                placeholder="https://"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Upload New APK to R2</label>
              <input
                type="file"
                accept=".apk"
                ref={fileInputRef}
                onChange={handleApkUpload}
                className="hidden"
                id="apk-upload"
              />
              <label
                htmlFor={isUploading ? undefined : "apk-upload"}
                className={`flex items-center justify-center gap-2 w-full p-3 rounded-lg border border-dashed text-gray-300 transition-colors ${isUploading ? 'bg-[#333] border-[#555] cursor-not-allowed opacity-70' : 'bg-[#2a2a2a] hover:bg-[#333] border-[#555] cursor-pointer'}`}
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-emerald-500 border-t-transparent rounded-full" />
                    Uploading APK... Please wait
                  </>
                ) : (
                  <>
                    <FiUploadCloud />
                    Click to upload APK
                  </>
                )}
              </label>
            </div>

            <div className="flex items-center gap-3 py-2">
              <input
                type="checkbox"
                checked={androidData.forceUpdate}
                onChange={e => setAndroidData({ ...androidData, forceUpdate: e.target.checked })}
                className="w-5 h-5 accent-emerald-500"
              />
              <label className="text-sm">Force Update</label>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Release Notes</label>
              <textarea
                value={androidData.releaseNotes || ''}
                onChange={e => setAndroidData({ ...androidData, releaseNotes: e.target.value })}
                className="w-full bg-[#2a2a2a] p-3 rounded-lg border border-[#444] text-white h-24"
                placeholder="What's new?"
              />
            </div>

            <button
              onClick={() => handleSave('android', androidData)}
              disabled={loading}
              className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2"
            >
              <FiSave />
              Save Android Version
            </button>
          </div>
        </div>

        {/* iOS Card */}
        <div className="bg-[#1e1e1e] p-6 rounded-2xl border border-[#333]">
          <div className="flex items-center gap-3 mb-6">
            <FaApple className="text-emerald-500 text-2xl" />
            <h2 className="text-xl font-bold">iOS Settings</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Version Number</label>
              <input
                type="text"
                value={iosData.version}
                onChange={e => setIosData({ ...iosData, version: e.target.value })}
                className="w-full bg-[#2a2a2a] p-3 rounded-lg border border-[#444] text-white"
                placeholder="1.0.0"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">App Store URL</label>
              <input
                type="text"
                value={iosData.downloadUrl}
                onChange={e => setIosData({ ...iosData, downloadUrl: e.target.value })}
                className="w-full bg-[#2a2a2a] p-3 rounded-lg border border-[#444] text-white"
                placeholder="https://apps.apple.com/..."
              />
            </div>

            <div className="flex items-center gap-3 py-2">
              <input
                type="checkbox"
                checked={iosData.forceUpdate}
                onChange={e => setIosData({ ...iosData, forceUpdate: e.target.checked })}
                className="w-5 h-5 accent-emerald-500"
              />
              <label className="text-sm">Force Update</label>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Release Notes</label>
              <textarea
                value={iosData.releaseNotes || ''}
                onChange={e => setIosData({ ...iosData, releaseNotes: e.target.value })}
                className="w-full bg-[#2a2a2a] p-3 rounded-lg border border-[#444] text-white h-24"
                placeholder="What's new?"
              />
            </div>

            <button
              onClick={() => handleSave('ios', iosData)}
              disabled={loading}
              className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2"
            >
              <FiSave />
              Save iOS Version
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
