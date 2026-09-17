import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'MeetScribe Backend API',
    timestamp: new Date().toISOString(),
  });
});

// Root route
app.get('/', (_req: Request, res: Response) => {
  res.send('MeetScribe API Server is running');
});

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[MeetScribe API] Server is running on port ${PORT}`);
  });
};

startServer();

export default app;
