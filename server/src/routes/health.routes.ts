import { Router } from 'express';
import { getHealth } from '../controllers/health.controller.ts';

const router = Router();

// GET /api/health or /api/v1/health
router.get('/', getHealth);

export default router;
