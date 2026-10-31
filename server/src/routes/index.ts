import { Router } from 'express';
import healthRoutes from './health.routes.ts';
import authRoutes from './auth.routes.ts';
import donorRoutes from './donor.routes.ts';
import ngoRoutes from './ngo.routes.ts';
import volunteerRoutes from './volunteer.routes.ts';
import communityRoutes from './community.routes.ts';
import adminRoutes from './admin.routes.ts';

const apiRouter = Router();

// Mount all module routers
apiRouter.use('/health', healthRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/donor', donorRoutes);
apiRouter.use('/ngo', ngoRoutes);
apiRouter.use('/volunteer', volunteerRoutes);
apiRouter.use('/community', communityRoutes);
apiRouter.use('/admin', adminRoutes);

// Catalog index
apiRouter.get('/', (req, res) => {
  res.json({
    name: 'Zero-Waste Food Sharing & Redistribution Platform API',
    version: 'v1',
    description: 'Complete REST API connecting Donors, NGOs, Volunteers, Community, and Admins',
    endpoints: {
      health: '/api/v1/health',
      auth: '/api/v1/auth',
      donor: '/api/v1/donor',
      ngo: '/api/v1/ngo',
      volunteer: '/api/v1/volunteer',
      community: '/api/v1/community',
      admin: '/api/v1/admin',
    },
  });
});

export default apiRouter;
