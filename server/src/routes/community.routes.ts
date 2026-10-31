import { Router } from 'express';
import { CommunityController } from '../controllers/community.controller.ts';
import { authenticateToken } from '../middleware/auth.ts';

const router = Router();

router.get('/listings', CommunityController.getCommunityListings);
router.get('/requests', CommunityController.getRequests);

// Protected community actions
router.post('/listings', authenticateToken, CommunityController.createCommunityListing);
router.post('/requests', authenticateToken, CommunityController.createRequest);
router.get('/my-requests', authenticateToken, CommunityController.getMyRequests);
router.post('/report', authenticateToken, CommunityController.submitReport);

export default router;
