"use client";

import React, { useState, useEffect } from "react";
import { FiSave, FiRefreshCw, FiZap } from "react-icons/fi";
import { useAlert } from "@/components/AlertProvider";
import {
  Card,
  Button,
} from "@/components/admin/ui";

export default function EventsClient({ initialEvents, initialTemplates }: { initialEvents: any[], initialTemplates: any[] }) {
  const [events, setEvents] = useState<any[]>(initialEvents);
  const [templates, setTemplates] = useState<any[]>(initialTemplates);
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(false);
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
    if (!initialEvents || initialEvents.length === 0) {
      fetchEvents();
    }
    if (!initialTemplates || initialTemplates.length === 0) {
      fetchTemplates();
    }
  }, [initialEvents, initialTemplates]);

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
        showAlert("Success", "Saved successfully!", "success");
        fetchEvents();
      } else {
        showAlert("Error", "Failed to save: " + data.error, "error");
      }
    } catch (e) {
      showAlert("Error", "Error saving event", "error");
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
          <h2 className="text-xl font-bold text-sv-text font-sans">Event Triggers</h2>
          <p className="text-sv-text-muted text-xs">Configure which WhatsApp templates to send automatically for system events.</p>
        </div>
        <Button
          onClick={fetchEvents}
          variant="secondary"
          size="sm"
          disabled={loading}
          isLoading={loading}
          leftIcon={<FiRefreshCw className={loading ? "animate-spin" : ""} />}
        >
          Refresh
        </Button>
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
    <Card
      variant="default"
      padding="lg"
      className={`shadow-sv-lg transition-all ${isActive ? 'border-emerald-500/50 shadow-emerald-500/10' : 'border-sv-border border-[#2a2d3e]'}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-sv-sm ${isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-sv-surface-raised text-sv-text-muted'}`}>
            <FiZap size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-sv-text text-sm">{eventDef.label}</h3>
            <p className="text-xs text-sv-text-muted mt-0.5">{eventDef.desc}</p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            className="sr-only peer" 
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          <div className="w-11 h-6 bg-sv-surface-raised peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#161923] after:border-[#2a2d3e] after:border border-[#2a2d3e] after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
        </label>
      </div>

      <div className="space-y-4 mt-6">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-sv-text-secondary">WhatsApp Template</label>
          <select 
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="w-full text-sm bg-sv-bg border border-[#2a2d3e] border-sv-border border-[#2a2d3e] text-sv-text rounded-sv-sm focus:border-emerald-500 outline-none px-3 py-2.5"
          >
            <option value="">-- Select Template --</option>
            {templates.filter((t: any) => t.status === "APPROVED").map((t: any) => (
              <option key={t.id} value={t.name}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-sv-border-subtle">
        <Button 
          onClick={() => onSave(eventDef.id, isActive, templateName)}
          disabled={saving}
          isLoading={saving}
          variant="primary"
          size="sm"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
          leftIcon={<FiSave />}
        >
          Save Configuration
        </Button>
      </div>
    </Card>
  );
}
