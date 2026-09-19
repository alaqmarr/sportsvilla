"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/core/auth/auth";
import { google } from "googleapis";
import path from "path";
import { prisma } from "@/core/database/prisma";
import { exec } from "child_process";

async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }
}

function getDriveClient() {
  const ROOT_DIR = process.cwd();
  const KEY_PATH = path.join(ROOT_DIR, 'gdrive-service-account.json');
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_PATH,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });
  return google.drive({ version: 'v3', auth });
}

export async function listBackups() {
  await requireAdminSession();
  
  const folderSetting = await prisma.setting.findUnique({ where: { key: "GDRIVE_BACKUP_FOLDER_ID" } });
  const folderId = folderSetting?.value || process.env.GDRIVE_BACKUP_FOLDER_ID;
  
  if (!folderId) {
    return { success: false, error: "Google Drive Folder ID is not configured in settings." };
  }

  try {
    const drive = getDriveClient();
    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'files(id, name, mimeType, createdTime, webViewLink, webContentLink)',
      orderBy: 'createdTime desc',
      pageSize: 100,
    });
    
    return { success: true, files: res.data.files || [] };
  } catch (error: any) {
    console.error("Error listing backups:", error);
    return { success: false, error: error.message || "Failed to fetch backups from Google Drive." };
  }
}

export async function triggerManualBackup(): Promise<{ success: boolean; error?: string }> {
  await requireAdminSession();
  
  return new Promise((resolve) => {
    // Run backup in background asynchronously without blocking Next.js completely
    const scriptPath = path.join(process.cwd(), 'backup.sh');
    exec(`bash ${scriptPath}`, { cwd: process.cwd() }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Backup execution error: ${error}`);
        resolve({ success: false, error: error.message });
        return;
      }
      resolve({ success: true });
    });
  });
}
