import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

if (!getApps().length) {
  try {
    const serviceAccount = require('../../firebase-admin.json');
    initializeApp({
      credential: cert(serviceAccount),
    });
  } catch (error) {
    console.error("Firebase Admin Initialization Error:", error);
  }
}

const admin = {
  auth: getAuth,
};

export { admin };
