"use client";

import React, { useState, useEffect } from "react";
import { PageHeader, Card, Button, Modal } from "@/components/admin/ui";
import { useAlert } from "@/components/AlertProvider";
import { FiRefreshCw, FiPlay, FiExternalLink, FiFolder, FiFile, FiDatabase, FiCheckCircle, FiXCircle, FiLoader } from "react-icons/fi";
import { listBackups, triggerManualBackup } from "./action";

export default function BackupsClient() {
  const { showAlert } = useAlert();
  const [backups, setBackups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [backupStatus, setBackupStatus] = useState<"confirming" | "processing" | "success" | "error">("confirming");
  const [backupMessage, setBackupMessage] = useState("");

  async function fetchBackups() {
    setLoading(true);
    const res = await listBackups();
    if (res.success) {
      setBackups(res.files || []);
    } else {
      showAlert("Error", res.error || "Failed to fetch backups", "error");
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchBackups();
  }, []);

  function openBackupModal() {
    setBackupStatus("confirming");
    setBackupMessage("");
    setIsModalOpen(true);
  }

  async function executeBackup() {
    setBackupStatus("processing");
    const res = await triggerManualBackup();
    
    if (res.success) {
      setBackupStatus("success");
      setBackupMessage("The manual backup finished successfully. Your Google Drive has been updated.");
      fetchBackups();
    } else {
      setBackupStatus("error");
      setBackupMessage(res.error || "Unknown error occurred during backup.");
    }
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Automated Backups"
          subtitle="View your database and log backups currently stored securely in Google Drive."
        />
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={fetchBackups} 
            disabled={loading}
            leftIcon={<FiRefreshCw className={loading ? "animate-spin" : ""} />}
          >
            Refresh
          </Button>
          <Button 
            variant="primary" 
            onClick={openBackupModal} 
            leftIcon={<FiPlay />}
          >
            Trigger Manual Backup
          </Button>
        </div>
      </div>

      <Card variant="default" padding="none">
        <div className="p-6 border-b border-sv-border-subtle bg-sv-surface-raised flex items-center gap-3">
          <FiDatabase className="text-sv-brand text-xl" />
          <h2 className="text-lg font-bold font-sans text-sv-text">Google Drive Backup Explorer</h2>
        </div>
        <div className="p-6 overflow-x-auto">
          {loading ? (
            <div className="text-center text-sv-text-muted py-8">Loading backups from Google Drive...</div>
          ) : backups.length === 0 ? (
            <div className="text-center text-sv-text-muted py-8">No backups found in the configured folder.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-sv-border-subtle text-sv-text-muted text-sm font-semibold uppercase">
                  <th className="py-3 px-4 font-sans tracking-wide w-12">Type</th>
                  <th className="py-3 px-4 font-sans tracking-wide">Name / File</th>
                  <th className="py-3 px-4 font-sans tracking-wide">Created At</th>
                  <th className="py-3 px-4 font-sans tracking-wide text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sv-border-subtle">
                {backups.map((file) => {
                  const isFolder = file.mimeType === "application/vnd.google-apps.folder";
                  return (
                    <tr key={file.id} className="hover:bg-sv-surface-raised transition-colors group">
                      <td className="py-3 px-4 text-center">
                        {isFolder ? <FiFolder className="text-blue-400 text-lg inline" /> : <FiFile className="text-sv-text-muted text-lg inline" />}
                      </td>
                      <td className="py-3 px-4 text-sv-text font-medium text-sm">
                        {file.name}
                      </td>
                      <td className="py-3 px-4 text-sv-text-muted text-sm">
                        {new Date(file.createdTime).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {file.webViewLink && (
                          <a 
                            href={file.webViewLink} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded bg-sv-bg border border-sv-border text-sv-text hover:bg-sv-surface-raised transition-colors"
                          >
                            <FiExternalLink /> View
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => backupStatus !== "processing" && setIsModalOpen(false)}
        title="Manual Backup"
        size="md"
        closeOnOverlayClick={backupStatus !== "processing"}
        closeOnEsc={backupStatus !== "processing"}
      >
        <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
          {backupStatus === "confirming" && (
            <>
              <FiDatabase className="text-5xl text-sv-text-muted mb-2" />
              <h3 className="text-lg font-bold text-sv-text">Start Manual Backup?</h3>
              <p className="text-sm text-sv-text-muted px-4">
                This will zip your database and logs, and upload them directly to your configured Google Drive folder. This process may take up to a minute depending on the file size.
              </p>
              <div className="flex gap-3 pt-4 w-full">
                <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button variant="primary" className="flex-1" onClick={executeBackup}>Start Backup</Button>
              </div>
            </>
          )}

          {backupStatus === "processing" && (
            <>
              <FiLoader className="text-5xl text-sv-brand animate-spin mb-2" />
              <h3 className="text-lg font-bold text-sv-text">Processing Backup...</h3>
              <p className="text-sm text-sv-text-muted px-4">
                Please do not close this window. Your databases and logs are being uploaded to Google Drive.
              </p>
            </>
          )}

          {backupStatus === "success" && (
            <>
              <FiCheckCircle className="text-5xl text-green-500 mb-2" />
              <h3 className="text-lg font-bold text-sv-text">Backup Successful</h3>
              <p className="text-sm text-sv-text-muted px-4">
                {backupMessage}
              </p>
              <div className="pt-4 w-full">
                <Button variant="primary" className="w-full" onClick={() => setIsModalOpen(false)}>Close</Button>
              </div>
            </>
          )}

          {backupStatus === "error" && (
            <>
              <FiXCircle className="text-5xl text-sv-error-text mb-2" />
              <h3 className="text-lg font-bold text-sv-text">Backup Failed</h3>
              <p className="text-sm text-sv-error-text px-4 bg-sv-error-bg p-3 rounded-sv-md border border-sv-error-border mt-2 w-full text-left">
                {backupMessage}
              </p>
              <div className="pt-4 w-full">
                <Button variant="outline" className="w-full" onClick={() => setIsModalOpen(false)}>Close</Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
