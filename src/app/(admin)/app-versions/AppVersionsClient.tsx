"use client";

import React, { useState, useRef } from "react";
import toast from "react-hot-toast";
import { saveAppVersion } from "./actions";
import { FiUploadCloud, FiSmartphone, FiSave } from "react-icons/fi";
import { FaApple } from "react-icons/fa";
import { PageHeader, Card, Button, Input, Switch } from "@/components/admin/ui";

interface AppVersionRecord {
  platform: string;
  version: string;
  forceUpdate: boolean;
  downloadUrl: string;
  fileKey: string;
  releaseNotes: string;
}

export default function AppVersionsClient({ initialVersions }: { initialVersions: any[] }) {
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const defaultAndroid: AppVersionRecord = initialVersions.find(v => v.platform === 'android') || {
    platform: 'android', version: '1.0.0', forceUpdate: true, downloadUrl: '', fileKey: '', releaseNotes: ''
  };
  const defaultIos: AppVersionRecord = initialVersions.find(v => v.platform === 'ios') || {
    platform: 'ios', version: '1.0.0', forceUpdate: true, downloadUrl: '', fileKey: '', releaseNotes: ''
  };

  const [androidData, setAndroidData] = useState<AppVersionRecord>(defaultAndroid);
  const [iosData, setIosData] = useState<AppVersionRecord>(defaultIos);

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

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
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

      setAndroidData((prev) => ({ ...prev, downloadUrl: publicUrl, fileKey: key }));
      toast.success("APK uploaded successfully!", { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to upload APK", { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async (platform: string, data: AppVersionRecord) => {
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
    <div className="max-w-5xl mx-auto space-y-8 pb-20 font-sans">
      <PageHeader
        title="App Versions"
        subtitle="Manage mobile application releases, downloads, and forced updates."
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Settings", href: "/settings" },
          { label: "App Versions" },
        ]}
      />

      <div className="grid md:grid-cols-2 gap-8">
        {/* Android Card */}
        <Card variant="default" padding="lg">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-sv-border-subtle">
            <div className="w-10 h-10 rounded-sv-md bg-sv-success-subtle text-sv-status-success flex items-center justify-center text-xl">
              <FiSmartphone />
            </div>
            <div>
              <h2 className="text-lg font-bold text-sv-text font-sans">Android Settings</h2>
              <p className="text-xs text-sv-text-muted">Configure APK delivery and version controls</p>
            </div>
          </div>

          <div className="space-y-4">
            <Input
              label="Version Number"
              value={androidData.version}
              onChange={(e) => setAndroidData({ ...androidData, version: e.target.value })}
              placeholder="1.0.0"
            />

            <Input
              label="Download URL (APK or PlayStore)"
              value={androidData.downloadUrl}
              onChange={(e) => setAndroidData({ ...androidData, downloadUrl: e.target.value })}
              placeholder="https://"
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-sv-text-secondary select-none">
                Upload New APK to R2
              </label>
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
                className={`flex items-center justify-center gap-2.5 w-full p-3.5 rounded-sv-sm border border-dashed text-sm font-medium transition-colors ${
                  isUploading
                    ? "bg-sv-surface-raised border-sv-border cursor-not-allowed opacity-70 text-sv-text-muted"
                    : "bg-sv-surface hover:bg-sv-surface-hover border-sv-border hover:border-sv-border-focus text-sv-text cursor-pointer"
                }`}
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-sv-brand border-t-transparent rounded-full" />
                    <span className="text-sv-text-muted">Uploading APK... Please wait</span>
                  </>
                ) : (
                  <>
                    <FiUploadCloud className="text-sv-brand text-lg" />
                    <span>Click to upload APK</span>
                  </>
                )}
              </label>
            </div>

            <div className="py-2">
              <Switch
                label="Force Update"
                description="Require users to update before accessing the application."
                checked={Boolean(androidData.forceUpdate)}
                onChange={(checked) => setAndroidData({ ...androidData, forceUpdate: checked })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-sv-text-secondary select-none">
                Release Notes
              </label>
              <textarea
                value={androidData.releaseNotes || ""}
                onChange={(e) => setAndroidData({ ...androidData, releaseNotes: e.target.value })}
                className="w-full bg-sv-bg border border-sv-border focus:border-sv-brand focus:ring-1 focus:ring-sv-brand text-sv-text placeholder:text-sv-text-muted text-sm rounded-sv-sm p-3 outline-none h-24 resize-none transition-colors"
                placeholder="What's new in this version?"
              />
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full mt-2"
              onClick={() => handleSave("android", androidData)}
              isLoading={loading}
              leftIcon={<FiSave />}
            >
              Save Android Version
            </Button>
          </div>
        </Card>

        {/* iOS Card */}
        <Card variant="default" padding="lg">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-sv-border-subtle">
            <div className="w-10 h-10 rounded-sv-md bg-sv-surface-raised text-sv-text flex items-center justify-center text-xl border border-sv-border">
              <FaApple />
            </div>
            <div>
              <h2 className="text-lg font-bold text-sv-text font-sans">iOS Settings</h2>
              <p className="text-xs text-sv-text-muted">Configure App Store URL and version controls</p>
            </div>
          </div>

          <div className="space-y-4">
            <Input
              label="Version Number"
              value={iosData.version}
              onChange={(e) => setIosData({ ...iosData, version: e.target.value })}
              placeholder="1.0.0"
            />

            <Input
              label="App Store URL"
              value={iosData.downloadUrl}
              onChange={(e) => setIosData({ ...iosData, downloadUrl: e.target.value })}
              placeholder="https://apps.apple.com/..."
            />

            <div className="py-2">
              <Switch
                label="Force Update"
                description="Require users to update before accessing the application."
                checked={Boolean(iosData.forceUpdate)}
                onChange={(checked) => setIosData({ ...iosData, forceUpdate: checked })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-sv-text-secondary select-none">
                Release Notes
              </label>
              <textarea
                value={iosData.releaseNotes || ""}
                onChange={(e) => setIosData({ ...iosData, releaseNotes: e.target.value })}
                className="w-full bg-sv-bg border border-sv-border focus:border-sv-brand focus:ring-1 focus:ring-sv-brand text-sv-text placeholder:text-sv-text-muted text-sm rounded-sv-sm p-3 outline-none h-24 resize-none transition-colors"
                placeholder="What's new in this version?"
              />
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full mt-2"
              onClick={() => handleSave("ios", iosData)}
              isLoading={loading}
              leftIcon={<FiSave />}
            >
              Save iOS Version
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
