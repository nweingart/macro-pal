import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { authMiddleware } from './middleware/auth';
import logRoutes from './routes/log';
import foodsRoutes from './routes/foods';
import profileRoutes from './routes/profile';
import trackingRoutes from './routes/tracking';
import nutrientsRoutes from './routes/nutrients';

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const isProduction = process.env.NODE_ENV === 'production';

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no Origin header (mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      // In non-production, allow any localhost origin
      if (!isProduction && /^https?:\/\/localhost(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }

      // Allow explicitly listed origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Protected routes
app.use('/api/log', authMiddleware as express.RequestHandler, logRoutes);
app.use('/api/foods', authMiddleware as express.RequestHandler, foodsRoutes);
app.use('/api/profile', authMiddleware as express.RequestHandler, profileRoutes);
app.use('/api/tracking', authMiddleware as express.RequestHandler, trackingRoutes);
app.use('/api/nutrients', authMiddleware as express.RequestHandler, nutrientsRoutes);

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Only listen when running directly (not on Vercel)
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
