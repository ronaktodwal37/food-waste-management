import { Router } from 'express';
import { NgoController } from '../controllers/ngo.controller.ts';
import { authenticateToken, requireRole } from '../middleware/auth.ts';

const router = Router();

// Apply auth + NGO role check
router.use(authenticateToken);
router.use(requireRole('NGO', 'ADMIN'));

router.post('/register-org', NgoController.registerOrg);
router.get('/profile', NgoController.getProfile);
router.get('/discover', NgoController.discoverFood);
router.post('/claim', NgoController.claimAllocation);
router.get('/allocations', NgoController.getMyAllocations);
router.post('/confirm-intake', NgoController.confirmIntake);

export default router;
