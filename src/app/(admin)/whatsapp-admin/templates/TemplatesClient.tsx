"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiSend,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiCornerUpLeft,
  FiRefreshCw
} from "react-icons/fi";
import toast from "react-hot-toast";

export default function TemplatesClient({ initialTemplates }: { initialTemplates: any[] }) {
  const [templates, setTemplates] = useState<any[]>(initialTemplates);
  const [testingTemplate, setTestingTemplate] = useState<any | null>(null);
  const [testMobile, setTestMobile] = useState("9618443558");
  const [testParam, setTestParam] = useState("");
  const [testButtonUrlParam, setTestButtonUrlParam] = useState("sample_token_12345");
  const [sendingTest, setSendingTest] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case "APPROVED":
      case "DELIVERED":
      case "READ":
      case "SENT":
      case "GREEN":
      case "CONNECTED":
      case "ONLINE":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><FiCheckCircle /> {status}</span>;
      case "PENDING":
      case "YELLOW":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20"><FiClock /> {status}</span>;
      case "REJECTED":
      case "FAILED":
      case "RED":
      case "OFFLINE":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20"><FiAlertCircle /> {status}</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-500/10 text-gray-400 border border-gray-500/20">{status || "UNKNOWN"}</span>;
    }
  };

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/client/v1/whatsapp/templates");
      const data = await res.json();
      if (data.success) {
        setTemplates(data.templates || []);
      } else {
        toast.error(data.error || "Could not fetch templates from Meta");
      }
    } catch (err: any) {
      toast.error("Error loading templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialTemplates || initialTemplates.length === 0) {
      fetchTemplates();
    }
  }, [initialTemplates]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/client/v1/upload/direct", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      const imageUrl = uploadData.publicUrl || uploadData.url;

      if (imageUrl) {
        // Save to template DB config
        const saveRes = await fetch(`/api/client/v1/whatsapp/templates/${testingTemplate.name}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ headerImageUrl: imageUrl })
        });
        const saveData = await saveRes.json();

        if (saveData.success) {
          toast.success("Default image configured successfully!");
          // Update local state
          setTemplates(prev => prev.map(t => t.name === testingTemplate.name ? { ...t, headerImageUrl: imageUrl } : t));
          setTestingTemplate({ ...testingTemplate, headerImageUrl: imageUrl });
        } else {
          toast.error("Failed to save image config.");
        }
      } else {
        toast.error(uploadData.error || "Upload failed");
      }
    } catch (err: any) {
      toast.error("Error uploading image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSendTestTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testingTemplate || !testMobile) return;

    setSendingTest(true);
    try {
      const payload: any = {
        templateName: testingTemplate.name,
        languageCode: testingTemplate.language,
        mobile: testMobile,
      };

      if (testParam.trim()) {
        payload.parameters = [testParam.trim()];
      }
      if (testButtonUrlParam.trim()) {
        payload.buttonUrlParam = testButtonUrlParam.trim();
      }

      const res = await fetch("/api/client/v1/whatsapp/test-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(`Template sent via Meta API! Message ID: ${data.data?.messages?.[0]?.id || "OK"}`);
        setTestingTemplate(null);
      } else {
        toast.error(`Send failed: ${data.error || "Unknown Meta API error"}`);
      }
    } catch (err: any) {
      toast.error("Error sending template");
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-[100dvh] bg-[#0b141a] overflow-hidden text-gray-200">
      {/* Header */}
      <div className="h-16 shrink-0 bg-[#202c33] border-b border-[#2a3942] px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/whatsapp-admin" className="p-2 hover:bg-[#2a3942] rounded-full transition-colors text-gray-300">
            <FiCornerUpLeft className="text-xl" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-white">WhatsApp Templates Tester</h1>
            <p className="text-xs text-gray-400">View and send Meta approved templates</p>
          </div>
        </div>
        <button
          onClick={fetchTemplates}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#2a3942] hover:bg-[#374b57] rounded-lg text-sm transition-colors"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto w-full">
        {/* Left 2 Cols: Templates Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#161923] border border-[#2a2d3e] rounded-2xl p-5 shadow-xl flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-base">Approved Meta Cloud API Templates</h3>
              <p className="text-xs text-gray-400">Click &ldquo;Test Template&rdquo; to send a live WhatsApp test message</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {templates.length} Templates
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-500 font-mono text-sm">
              Fetching templates from Meta Cloud API...
            </div>
          ) : templates.length === 0 ? (
            <div className="p-12 text-center text-gray-500 font-mono text-sm bg-[#161923] border border-[#2a2d3e] rounded-2xl">
              No templates returned from Meta. Check your token and WABA ID in .env!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((tpl: any, idx: number) => {
                const isSelected = testingTemplate?.id === tpl.id;
                return (
                  <div
                    key={idx}
                    className={`bg-[#161923] border rounded-2xl p-5 flex flex-col justify-between transition-all ${
                      isSelected ? "border-orange-500 shadow-lg shadow-orange-500/10 bg-[#202433]" : "border-[#2a2d3e] hover:border-gray-700"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-mono font-bold text-white text-sm break-all">{tpl.name}</h4>
                        {getStatusBadge(tpl.status)}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                        <span className="font-mono uppercase bg-[#0f1117] px-2 py-0.5 rounded border border-[#2a2d3e]">
                          {tpl.language}
                        </span>
                        <span className="capitalize">{tpl.category}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#2a2d3e] flex items-center justify-between">
                      <span className="text-[11px] text-gray-500 font-mono">ID: {tpl.id}</span>
                      <button
                        onClick={() => {
                          setTestingTemplate(tpl);
                          toast.success(`Selected template: ${tpl.name}`);
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          isSelected
                            ? "bg-orange-500 text-white"
                            : "bg-[#202433] hover:bg-[#2a2d3e] text-gray-300"
                        }`}
                      >
                        <FiSend /> {isSelected ? "Selected" : "Test Template"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Template Tester Box */}
        <div className="lg:col-span-1">
          <div className="bg-[#161923] border border-[#2a2d3e] rounded-2xl p-6 sticky top-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-2 text-orange-400 font-bold text-base">
              <FiSend />
              <h3>Live Template Sender</h3>
            </div>

            {!testingTemplate ? (
              <div className="p-8 text-center border border-dashed border-[#2a2d3e] rounded-xl text-gray-500 text-xs">
                Select a template from the list on the left to configure parameters and send a live test.
              </div>
            ) : (
              <form onSubmit={handleSendTestTemplate} className="space-y-4">
                <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl text-xs text-orange-300">
                  Selected Template: <strong className="text-white font-mono">{testingTemplate.name}</strong> ({testingTemplate.language})
                </div>

                {testingTemplate?.components?.some((c: any) => c.type === 'HEADER' && c.format === 'IMAGE') && (
                  <div className="p-4 bg-[#202433] border border-[#2a2d3e] rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-gray-300">
                        Default Header Image
                      </label>
                      {testingTemplate.headerImageUrl && (
                        <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">Configured</span>
                      )}
                    </div>
                    
                    {testingTemplate.headerImageUrl ? (
                      <div className="relative group rounded-lg overflow-hidden border border-[#2a2d3e] bg-[#0f1117] flex items-center justify-center h-32">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={testingTemplate.headerImageUrl} alt="Header" className="max-h-full max-w-full object-contain" />
                        <div className="absolute bottom-2 right-2 flex flex-col items-center justify-center">
                          <label className="cursor-pointer bg-white/90 backdrop-blur text-black text-xs font-bold px-3 py-1.5 rounded shadow-lg hover:bg-white transition-all">
                            {uploadingImage ? "Uploading..." : "Change Image"}
                            <input type="file" accept="image/jpeg, image/png, image/webp" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div className="border border-dashed border-[#2a2d3e] rounded-lg p-4 text-center">
                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white text-xs font-bold rounded shadow hover:bg-orange-600 transition-colors">
                          {uploadingImage ? "Uploading..." : "Upload Image"}
                          <input type="file" accept="image/jpeg, image/png, image/webp" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                        </label>
                        <p className="text-[10px] text-gray-500 mt-2">This image will be used when sending this template.</p>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">
                    Recipient Mobile Number (+91)
                  </label>
                  <input
                    type="text"
                    required
                    value={testMobile}
                    onChange={(e) => setTestMobile(e.target.value)}
                    placeholder="e.g. 9618443558"
                    className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:border-orange-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">
                    Button URL Parameter (Optional)
                  </label>
                  <input
                    type="text"
                    value={testButtonUrlParam}
                    onChange={(e) => setTestButtonUrlParam(e.target.value)}
                    placeholder="e.g. sample_token_12345"
                    className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-xl px-4 py-2 text-white font-mono text-xs focus:border-orange-500 outline-none"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    If your template has a Dynamic URL button (like Magic Login link), this value is appended to the URL.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">
                    Body Parameter {'{{1}}'} (Optional)
                  </label>
                  <input
                    type="text"
                    value={testParam}
                    onChange={(e) => setTestParam(e.target.value)}
                    placeholder="e.g. Alaqmar"
                    className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-xl px-4 py-2 text-white font-mono text-xs focus:border-orange-500 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sendingTest}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-orange-500/20 transition-all"
                >
                  <FiSend /> {sendingTest ? "Sending via Meta..." : "Send Test Template"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
