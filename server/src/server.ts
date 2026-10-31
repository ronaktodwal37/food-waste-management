import { createApp } from './app.ts';
import { notFoundHandler } from './middleware/notFound.ts';
import { errorHandler } from './middleware/errorHandler.ts';

const app = createApp();

// Add not found and error handlers
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT || '5000', 10);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Standalone Backend server running on http://localhost:${PORT}`);
  console.log(`🩺 Health Check endpoint available at http://localhost:${PORT}/api/health`);
});
