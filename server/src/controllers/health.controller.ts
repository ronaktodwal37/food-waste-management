import { Request, Response } from 'express';
import { getFirebaseAdminStatus } from '../config/firebase.ts';
import { config } from '../config/env.ts';

export const getHealth = (req: Request, res: Response) => {
  const memoryUsage = process.memoryUsage();

  return res.status(200).json({
    status: 'healthy',
    application: 'Zero-Waste Food Sharing & Redistribution Platform API',
    phase: 'Phase 1 - Foundations & Architecture',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: config.nodeEnv,
    version: '1.0.0',
    system: {
      platform: process.platform,
      nodeVersion: process.version,
      memory: {
        heapUsedMB: Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100,
        heapTotalMB: Math.round((memoryUsage.heapTotal / 1024 / 1024) * 100) / 100,
      },
    },
    integrations: {
      firebaseAdmin: getFirebaseAdminStatus(),
      database: 'Firestore (configured for Phase 2/3)',
      storage: 'Firebase Storage (configured for Phase 10)',
      maps: 'OpenStreetMap + Leaflet (configured for Phase 5)',
    },
    modules: {
      auth: 'Pending Phase 2',
      donor: 'Pending Phase 3',
      ngo: 'Pending Phase 4',
      matching: 'Pending Phase 5',
      allocation: 'Pending Phase 6',
      volunteer: 'Pending Phase 7-8',
      community: 'Pending Phase 9',
      admin: 'Pending Phase 11',
    },
  });
};
