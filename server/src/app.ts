import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import apiRouter from './routes/index.ts';
import healthRoutes from './routes/health.routes.ts';
import { errorHandler } from './middleware/errorHandler.ts';
import { notFoundHandler } from './middleware/notFound.ts';
import { apiRateLimiter } from './middleware/rateLimiter.ts';
import { initializeFirebaseAdmin } from './config/firebase.ts';
import { config } from './config/env.ts';

export function createApp(): Express {
  const app = express();

  // Initialize Firebase Admin placeholder / credentials
  initializeFirebaseAdmin();

  // Security Middleware
  app.use(
    helmet({
      contentSecurityPolicy: false, // Let Vite handle script injection in development
      crossOriginEmbedderPolicy: false,
    })
  );

  // CORS Middleware
  app.use(
    cors({
      origin: config.corsOrigin === '*' ? true : config.corsOrigin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Body Parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Apply rate limiter to API routes
  app.use('/api', apiRateLimiter);

  // Root & Health routes
  app.use('/api/health', healthRoutes);
  app.use('/api/v1/health', healthRoutes);

  // Mount API v1
  app.use('/api/v1', apiRouter);

  return app;
}
