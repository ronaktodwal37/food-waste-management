import { Router } from 'express';
import { DonorController } from '../controllers/donor.controller.ts';
import { authenticateToken, requireRole } from '../middleware/auth.ts';

const router = Router();

// Apply auth + FOOD_DONOR role check to all donor routes
router.use(authenticateToken);
router.use(requireRole('FOOD_DONOR', 'ADMIN'));

router.post('/listings', DonorController.createListing);
router.get('/listings', DonorController.getMyListings);
router.put('/listings/:id', DonorController.updateListing);
router.delete('/listings/:id', DonorController.deleteListing);
router.get('/listings/:id/matches', DonorController.getMatchingNgos);
router.get('/listings/:id/allocations', DonorController.getListingAllocations);

export default router;
