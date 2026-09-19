import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import { prisma } from '../src/core/database/prisma';
dotenv.config();

// Environment Paths
const ROOT_DIR = path.join(__dirname, '..');
const LOGS_DIR = path.join(ROOT_DIR, 'logs');
const PRISMA_DIR = path.join(ROOT_DIR, 'prisma');
const KEY_PATH = path.join(ROOT_DIR, 'gdrive-service-account.json');

// Google Drive Auth
const auth = new google.auth.GoogleAuth({
  keyFile: KEY_PATH,
  scopes: ['https://www.googleapis.com/auth/drive'], // Full drive access
});
const drive = google.drive({ version: 'v3', auth });

async function uploadFile(filePath: string, folderId: string, mimeType: string = 'application/octet-stream') {
  const fileName = path.basename(filePath);
  console.log(`[Backup] Uploading ${fileName}...`);
  
  const fileMetadata = {
    name: `${new Date().toISOString().split('T')[0]}_${fileName}`,
    parents: [folderId]
  };
  
  const media = {
    mimeType: mimeType,
    body: fs.createReadStream(filePath)
  };
  
  const response = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: 'id'
  });
  
  console.log(`[Backup] Uploaded ${fileName} with ID: ${response.data.id}`);
  return response.data.id;
}

async function getOrCreateFolder(folderName: string, parentId?: string): Promise<string> {
  const query = parentId 
    ? `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false and '${parentId}' in parents`
    : `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`;

  const res = await drive.files.list({
    q: query,
    fields: 'files(id, name)',
    spaces: 'drive'
  });
  
  if (res.data.files && res.data.files.length > 0) {
    return res.data.files[0].id!;
  }
  
  // Create folder
  console.log(`[Backup] Creating folder ${folderName}...`);
  const folderMetadata: any = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder'
  };
  if (parentId) {
    folderMetadata.parents = [parentId];
  }
  
  const folder = await drive.files.create({
    requestBody: folderMetadata,
    fields: 'id'
  });
  
  return folder.data.id!;
}

async function runBackup() {
  try {
    console.log('[Backup] Starting daily backup service...');
    
    // 1. Get Base Folder (From DB setting or root)
    const folderSetting = await prisma.setting.findUnique({ where: { key: "GDRIVE_BACKUP_FOLDER_ID" } });
    let baseFolderId = folderSetting?.value || process.env.GDRIVE_BACKUP_FOLDER_ID;
    
    if (!baseFolderId) {
       console.log('[Backup] GDRIVE_BACKUP_FOLDER_ID not found in DB or .env, using Service Account root.');
       baseFolderId = await getOrCreateFolder('SportsVilla_Backups');
    } else {
       console.log(`[Backup] Using configured Google Drive folder ID: ${baseFolderId}`);
    }
    
    // 2. Create Today's Subfolder
    const todayStr = new Date().toISOString().split('T')[0];
    const todayFolderId = await getOrCreateFolder(`Backup_${todayStr}`, baseFolderId);

    // 3. Backup Databases
    console.log('[Backup] Backing up databases...');
    if (fs.existsSync(PRISMA_DIR)) {
      const dbFiles = fs.readdirSync(PRISMA_DIR).filter(f => f.endsWith('.db') || f.endsWith('.db-wal') || f.endsWith('.db-shm'));
      for (const dbFile of dbFiles) {
        const dbPath = path.join(PRISMA_DIR, dbFile);
        await uploadFile(dbPath, todayFolderId);
      }
    }
    
    // 4. Backup Logs and Clean Up
    console.log('[Backup] Backing up and rotating logs...');
    if (fs.existsSync(LOGS_DIR)) {
      const logFiles = fs.readdirSync(LOGS_DIR).filter(f => f.endsWith('.log'));
      // A day rolling log like app-2026-09-19.log
      const currentDayPrefix = `app-${todayStr}`; 
      
      for (const logFile of logFiles) {
        const logPath = path.join(LOGS_DIR, logFile);
        
        // Upload the log file
        await uploadFile(logPath, todayFolderId, 'text/plain');
        
        // Retain only the current day log
        if (!logFile.includes(currentDayPrefix)) {
          console.log(`[Backup] Deleting old log file from server: ${logFile}`);
          fs.unlinkSync(logPath);
        } else {
          console.log(`[Backup] Retaining current day log: ${logFile}`);
        }
      }
    }

    console.log('[Backup] Backup completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('[Backup] Backup failed:', err);
    process.exit(1);
  }
}

runBackup();
