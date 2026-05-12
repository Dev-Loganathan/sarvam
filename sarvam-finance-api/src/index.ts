import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import dns from 'node:dns';

// Force IPv4 for database connections (Fixes ENETUNREACH on Render)
dns.setDefaultResultOrder('ipv4first');

dotenv.config();

import customerRoutes from './routes/customers';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Sarvam Finance API is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
