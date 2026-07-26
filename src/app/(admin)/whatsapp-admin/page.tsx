"use client";

import React, { useState, useEffect } from "react";
import { FiMessageSquare, FiSend, FiRefreshCw, FiCheckCircle, FiAlertCircle, FiClock, FiSmartphone, FiCode, FiLayers, FiActivity, FiExternalLink } from "react-icons/fi";
import toast from "react-hot-toast";

export default function WhatsAppAdminPage() {
  const [activeTab, setActiveTab] = useState<"templates" | "logs">("templates");
  const [templates, setTemplates] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [otps, setOtps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingTemplate, setTestingTemplate] = useState<any | null>(null);

  // Test form state
  const [testMobile, setTestMobile] = useState("9618443558");
  const [testParam, setTestParam] = useState("");
  const [testButtonUrlParam, setTestButtonUrlParam] = useState("sample_token_12345");
  const [sendingTest, setSendingTest] = useState(false);

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

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/client/v1/whatsapp/logs");
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages || []);
        setOtps(data.otps || []);
      }
    } catch (err: any) {
      toast.error("Error loading logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "templates") {
      fetchTemplates();
    } else {
      fetchLogs();
    }
  }, [activeTab]);

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testingTemplate) return;

    setSendingTest(true);
    try {
      const res = await fetch("/api/client/v1/whatsapp/test-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile: testMobile,
          templateName: testingTemplate.name,
          languageCode: testingTemplate.language || "en_US",
          parameters: testParam ? [testParam] : undefined,
          buttonUrlParam: testButtonUrlParam ? testButtonUrlParam : undefined
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Template "${testingTemplate.name}" sent to +91 ${testMobile}!`);
      } else {
        toast.error(`Send Failed: ${data.error || data.details}`);
      }
    } catch (err: any) {
      toast.error("An error occurred while sending test template");
    } finally {
      setSendingTest(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case "APPROVED":
      case "DELIVERED":
      case "READ":
      case "SENT":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><FiCheckCircle /> {status}</span>;
      case "PENDING":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20"><FiClock /> {status}</span>;
      case "REJECTED":
      case "FAILED":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20"><FiAlertCircle /> {status}</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-500/10 text-gray-400 border border-gray-500/20">{status || "UNKNOWN"}</span>;
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-[#161923]/80 border border-[#2a2d3e] rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <FiMessageSquare size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">WhatsApp & Templates Hub</h1>
              <p className="text-gray-400 text-sm mt-0.5">Manage Meta Cloud API message templates and inspect live WhatsApp message logs</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => activeTab === "templates" ? fetchTemplates() : fetchLogs()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#202433] hover:bg-[#2a2d3e] border border-[#2a2d3e] text-white text-sm font-semibold transition-all shadow-lg"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#2a2d3e] pb-1">
        <button
          onClick={() => setActiveTab("templates")}
          className={`inline-flex items-center gap-2 px-5 py-3 rounded-t-xl text-sm font-bold transition-all ${
            activeTab === "templates"
              ? "bg-[#161923] text-orange-400 border-t-2 border-orange-500 border-x border-[#2a2d3e]"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <FiLayers /> Message Templates & Tester
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={`inline-flex items-center gap-2 px-5 py-3 rounded-t-xl text-sm font-bold transition-all ${
            activeTab === "logs"
              ? "bg-[#161923] text-orange-400 border-t-2 border-orange-500 border-x border-[#2a2d3e]"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <FiActivity /> Live Message Logs ({messages.length})
        </button>
      </div>

      {/* Main Tab Contents */}
      {activeTab === "templates" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Template List */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="bg-[#161923] border border-[#2a2d3e] rounded-2xl p-12 text-center text-gray-400">
                <FiRefreshCw className="animate-spin mx-auto text-2xl mb-3 text-orange-500" />
                Fetching your approved and pending templates from Meta...
              </div>
            ) : templates.length === 0 ? (
              <div className="bg-[#161923] border border-[#2a2d3e] rounded-2xl p-12 text-center space-y-3">
                <FiAlertCircle className="mx-auto text-4xl text-amber-500" />
                <h3 className="text-lg font-bold text-white">No Templates Found or Check Access Token</h3>
                <p className="text-gray-400 text-sm max-w-md mx-auto">
                  Make sure your <code className="text-orange-400">WHATSAPP_BUSINESS_ACCOUNT_ID</code> (WABA ID: 4575637675998391) and <code className="text-orange-400">WHATSAPP_ACCESS_TOKEN</code> are set in <code className="text-gray-300">.env</code>.
                </p>
              </div>
            ) : (
              templates.map((tpl: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-[#161923] border border-[#2a2d3e] hover:border-orange-500/50 rounded-2xl p-6 transition-all space-y-4 shadow-xl"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg font-bold text-white font-mono">{tpl.name}</span>
                        {getStatusBadge(tpl.status)}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                        <span>Category: <strong className="text-gray-200">{tpl.category}</strong></span>
                        <span>•</span>
                        <span>Language: <strong className="text-gray-200">{tpl.language}</strong></span>
                      </div>
                    </div>

                    <button
                      onClick={() => setTestingTemplate(tpl)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 font-semibold text-xs transition-all"
                    >
                      <FiSend /> 🧪 Test Template
                    </button>
                  </div>

                  {/* Components Preview */}
                  <div className="bg-[#0f1117] border border-[#2a2d3e]/60 rounded-xl p-4 text-xs font-mono text-gray-300 space-y-2">
                    {tpl.components?.map((comp: any, cIdx: number) => (
                      <div key={cIdx} className="border-b last:border-b-0 border-[#2a2d3e]/40 pb-2 last:pb-0">
                        <span className="text-orange-400 font-bold uppercase">{comp.type}: </span>
                        <span>{comp.text || (comp.buttons ? `Buttons (${comp.buttons.length})` : JSON.stringify(comp))}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right Column: Template Tester Panel */}
          <div className="lg:col-span-1">
            <div className="bg-[#161923] border border-[#2a2d3e] rounded-2xl p-6 space-y-5 sticky top-24 shadow-2xl">
              <div className="flex items-center gap-2.5 border-b border-[#2a2d3e] pb-4">
                <FiSmartphone className="text-orange-400 text-xl" />
                <div>
                  <h3 className="font-bold text-white">🧪 Quick Template Tester</h3>
                  <p className="text-xs text-gray-400">Send any template to your phone instantly</p>
                </div>
              </div>

              {testingTemplate ? (
                <form onSubmit={handleSendTest} className="space-y-4">
                  <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl text-xs text-orange-300">
                    Selected Template: <strong className="text-white font-mono">{testingTemplate.name}</strong> ({testingTemplate.language})
                  </div>

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
                    {sendingTest ? "Sending..." : "🚀 Send Test WhatsApp Message"}
                  </button>
                </form>
              ) : (
                <div className="text-center py-10 text-gray-500 space-y-2">
                  <FiSend className="mx-auto text-3xl opacity-40" />
                  <p className="text-sm">Select any template from the left list and click <strong className="text-orange-400">"🧪 Test Template"</strong> to try it out!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Logs Tab */
        <div className="space-y-6">
          <div className="bg-[#161923] border border-[#2a2d3e] rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-[#2a2d3e] flex items-center justify-between">
              <h3 className="font-bold text-white text-base">Recent WhatsApp Messages (whatsapp.db)</h3>
              <span className="text-xs text-gray-400 font-mono">Total Shown: {messages.length}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#2a2d3e] bg-[#0f1117]/50 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <th className="p-4">Time</th>
                    <th className="p-4">Direction</th>
                    <th className="p-4">Phone Number</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Content / Template</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2d3e]/60 text-sm">
                  {messages.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">
                        No WhatsApp messages logged yet. Send a test message to start logging!
                      </td>
                    </tr>
                  ) : (
                    messages.map((msg: any, idx: number) => (
                      <tr key={idx} className="hover:bg-[#202433]/40 transition-colors">
                        <td className="p-4 text-gray-400 text-xs font-mono whitespace-nowrap">
                          {new Date(msg.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${
                            msg.direction === "OUTGOING" ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400"
                          }`}>
                            {msg.direction}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-white text-xs">{msg.phoneNumber}</td>
                        <td className="p-4 text-gray-300 text-xs font-semibold">{msg.type}</td>
                        <td className="p-4 text-gray-300 text-xs max-w-md truncate font-mono" title={msg.content}>
                          {msg.content}
                        </td>
                        <td className="p-4">{getStatusBadge(msg.status)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
