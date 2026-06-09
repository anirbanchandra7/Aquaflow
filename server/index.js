import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import distributorRoutes from './routes/distributor.js';
import driverRoutes from './routes/driver.js';

const app = express();
// credentials: true is required so the browser sends the httpOnly auth cookie.
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'aquaflow-api' }));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/distributor', distributorRoutes);
app.use('/api/driver', driverRoutes);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`AquaFlow API listening on port ${PORT}`);
});

export default app;
