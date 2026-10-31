/**
 * Firebase Admin SDK Placeholder & Initialization Manager
 * Phase 1: Validates environment variables and provides placeholder status.
 * Phase 2: Will be activated for JWT ID token verification and server-side RBAC.
 */
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { config } from './env.ts';

let isFirebaseAdminInitialized = false;
let adminApp: App | undefined;

export function initializeFirebaseAdmin(): { initialized: boolean; message: string } {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    isFirebaseAdminInitialized = true;
    adminApp = existingApps[0];
    return { initialized: true, message: 'Firebase Admin already initialized' };
  }

  const { projectId, clientEmail, privateKey } = config.firebase;

  if (projectId && clientEmail && privateKey) {
    try {
      adminApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      isFirebaseAdminInitialized = true;
      console.log('✅ [Firebase Admin] Initialized with Service Account');
      return { initialized: true, message: 'Firebase Admin initialized with service account' };
    } catch (err: any) {
      console.warn('⚠️ [Firebase Admin] Initialization failed:', err.message);
      return { initialized: false, message: `Initialization error: ${err.message}` };
    }
  }

  // Phase 1 graceful fallback when service account credentials are pending
  console.log('ℹ️ [Firebase Admin] Credentials pending. Running in Phase 1 placeholder mode.');
  return {
    initialized: false,
    message: 'Firebase Admin credentials pending configuration (configured for Phase 2)',
  };
}

export function getFirebaseAdminStatus() {
  return {
    initialized: isFirebaseAdminInitialized || getApps().length > 0,
    projectIdConfigured: Boolean(config.firebase.projectId),
    clientEmailConfigured: Boolean(config.firebase.clientEmail),
    privateKeyConfigured: Boolean(config.firebase.privateKey),
  };
}

export { adminApp };
