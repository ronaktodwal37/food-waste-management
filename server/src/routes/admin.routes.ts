import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.ts';
import { authenticateToken, requireRole } from '../middleware/auth.ts';

const router = Router();

// Apply auth + ADMIN role check strictly to all admin endpoints
router.use(authenticateToken);
router.use(requireRole('ADMIN'));

router.get('/stats', AdminController.getPlatformStats);
router.get('/users', AdminController.getUsers);
router.patch('/users/:id/status', AdminController.setUserStatus);
router.get('/ngos/pending', AdminController.getPendingNgos);
router.post('/ngos/:id/verify', AdminController.verifyNgo);
router.get('/audit-logs', AdminController.getAuditLogs);
router.get('/reports', AdminController.getReports);
router.post('/reports/:id/resolve', AdminController.resolveReport);
router.get('/credit-rules', AdminController.getCreditRules);
router.put('/credit-rules', AdminController.updateCreditRules);

export default router;
