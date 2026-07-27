"use client";

import React, { useState, useEffect } from "react";
import { FiSave, FiRefreshCw, FiZap, FiSettings, FiCheckCircle } from "react-icons/fi";

export default function EventsTab() {
  const [events, setEvents] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/client/v1/whatsapp/events");
      const data = await res.json();
      if (data.success) {
        setEvents(data.events || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/client/v1/whatsapp/templates");
      const data = await res.json();
      if (data.success) {
        setTemplates(data.templates || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchTemplates();
  }, []);

  const handleSave = async (eventName: string, isActive: boolean, templateName: string) => {
    setSaving(eventName);
    try {
      const res = await fetch("/api/client/v1/whatsapp/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName,
          templateName,
          isActive
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("Saved successfully!");
        fetchEvents();
      } else {
        alert("Failed to save: " + data.error);
      }
    } catch (e) {
      alert("Error saving event");
    } finally {
      setSaving(null);
    }
  };

  // Pre-defined known system events that trigger WhatsApp messages
  const knownEvents = [
    { id: "BOOKING_CONFIRMED", label: "Booking Confirmed", desc: "Sent when a turf booking is successfully created." },
    { id: "MEMBERSHIP_EXPIRED", label: "Membership Expired", desc: "Sent when a user's membership plan expires." },
    { id: "ADMIN_MANUAL_BOOKING", label: "Admin Booking", desc: "Sent when an admin creates a manual booking." },
    { id: "ADMIN_CHECKIN", label: "Check-in Complete", desc: "Sent when an admin manually checks in a customer." }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Event Triggers</h2>
          <p className="text-gray-500">Configure which WhatsApp templates to send automatically for system events.</p>
        </div>
        <button
          onClick={fetchEvents}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {knownEvents.map(evt => {
          const dbEvent = events.find(e => e.eventName === evt.id) || { eventName: evt.id, isActive: false, templateName: "" };
          return (
            <EventCard 
              key={evt.id} 
              eventDef={evt} 
              dbEvent={dbEvent} 
              templates={templates} 
              onSave={handleSave} 
              saving={saving === evt.id} 
            />
          );
        })}
      </div>
    </div>
  );
}

function EventCard({ eventDef, dbEvent, templates, onSave, saving }: any) {
  const [isActive, setIsActive] = useState(dbEvent.isActive);
  const [templateName, setTemplateName] = useState(dbEvent.templateName || "");

  return (
    <div className={`p-5 bg-white border rounded-xl shadow-sm ${isActive ? 'border-green-400' : 'border-gray-200'}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
            <FiZap size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{eventDef.label}</h3>
            <p className="text-xs text-gray-500 mt-1">{eventDef.desc}</p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            className="sr-only peer" 
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
        </label>
      </div>

      <div className="space-y-4 mt-6">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">WhatsApp Template</label>
          <select 
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">-- Select Template --</option>
            {templates.filter((t: any) => t.status === "APPROVED").map((t: any) => (
              <option key={t.id} value={t.name}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-gray-100">
        <button 
          onClick={() => onSave(eventDef.id, isActive, templateName)}
          disabled={saving}
          className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? <FiRefreshCw className="animate-spin" /> : <FiSave />}
          {saving ? "Saving..." : "Save Configuration"}
        </button>
      </div>
    </div>
  );
}
