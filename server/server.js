import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import pino from "pino";
import pinoHttp from "pino-http";
import connectDB from "./config/db.js";
import { errorHandler, notFoundHandler } from "./utils/errors.js";

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set');
  process.exit(1);
}

const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty', options: { colorize: true } } : undefined,
});

const app = express();
app.set('logger', logger);
//  CORS : Allows frontend to communicate with backend — exact origins only
const corsOptions = {

  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:5172',
      'http://127.0.0.1:5172',
      process.env.CLIENT_URL,
    ].filter(Boolean);
    // Allow requests with no origin (mobile apps, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(pinoHttp({ logger: app.get('logger') }));


const db = connectDB();

app.get('/', (req, res) => {
  res.status(200).json({ status: 'Success', message: 'RecallOps Server is running perfectly!' });
});

app.get('/api/health', async (req, res) => {
  let dbStatus = 'disconnected';
  let dbLatency = null;
  try {
    const start = Date.now();
    await mongoose.connection.db.admin().ping();
    dbLatency = Date.now() - start;
    dbStatus = 'connected';
  } catch {
    dbStatus = 'error';
  }

  const healthy = dbStatus === 'connected';
  const statusCode = healthy ? 200 : 503;

  res.status(statusCode).json({
    status: healthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      status: dbStatus,
      latencyMs: dbLatency,
      readyState: mongoose.connection.readyState,
    },
    environment: process.env.NODE_ENV || 'development',
  });
});


// API Routes
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);


app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info({ port: PORT, env: process.env.NODE_ENV || 'development' }, 'Server running');
});

const shutdown = async (signal) => {
  logger.info({ signal }, 'Shutting down...');
  server.close(async () => {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (err) => {
  logger.fatal({ err }, 'Unhandled Rejection');
  shutdown('unhandledRejection');
});

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught Exception');
  shutdown('uncaughtException');
});
