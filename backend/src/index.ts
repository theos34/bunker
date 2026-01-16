import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

import { db, initializeDatabase } from './lib/db';
import { authMiddleware } from './middleware/auth';
import authRoutes from './routes/auth';
import kpisRoutes from './routes/kpis';
import clientsRoutes from './routes/clients';
import affiliatesRoutes from './routes/affiliates';
import activityRoutes from './routes/activity';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use(
  '*',
  cors({
    origin: (origin) => origin || '*',
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
);

// Public routes
app.route('/api/auth', authRoutes);

// Protected routes
app.use('/api/*', authMiddleware);
app.route('/api/kpis', kpisRoutes);
app.route('/api/clients', clientsRoutes);
app.route('/api/affiliates', affiliatesRoutes);
app.route('/api', activityRoutes);

// Health check
app.get('/health', (c) => c.json({ status: 'ok' }));

// Initialize database and start server
const port = parseInt(process.env.PORT || '3000');

initializeDatabase()
  .then(() => {
    console.log('Database initialized');
    console.log(`Server running on port ${port}`);
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });

export default {
  port,
  fetch: app.fetch,
};
