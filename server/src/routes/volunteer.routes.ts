import { Router } from 'express';
import { VolunteerController } from '../controllers/volunteer.controller.ts';
import { authenticateToken, requireRole } from '../middleware/auth.ts';

const router = Router();

// Apply auth + VOLUNTEER role check
router.use(authenticateToken);
router.use(requireRole('VOLUNTEER', 'ADMIN'));

router.get('/tasks/available', VolunteerController.getAvailableTasks);
router.post('/tasks/:id/accept', VolunteerController.acceptTask);
router.get('/tasks/my', VolunteerController.getMyTasks);
router.post('/verify/pickup', VolunteerController.verifyPickup);
router.post('/verify/delivery', VolunteerController.verifyDelivery);
router.get('/stats', VolunteerController.getStats);

export default router;
