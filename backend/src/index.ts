import express from 'express';
import cors from 'cors';
import orderRoutes from './routes/order-routes.js';
import signalRoutes from './routes/signal-routes.js';
import { config } from './config/index.js';
import { loggingMiddleware } from './middleware/logging.js';
import { rateLimitMiddleware } from './middleware/rate-limit.js';
import { authMiddleware } from './middleware/auth.js';
import { observability } from './services/observability.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(loggingMiddleware);
app.use(rateLimitMiddleware);

app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));
app.get('/metrics', (_req, res) => res.status(200).json(observability.getMetrics()));

app.use('/orders', authMiddleware, orderRoutes);
app.use('/signals', authMiddleware, signalRoutes);

app.use((req, res) => res.status(404).json({ error: 'NOT_FOUND' }));

app.listen(config.port, () => {
  console.log(`Backend listening on http://localhost:${config.port}`);
});
