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
const app = express();
//  CORS : Allows fronted to communicate with backend
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


connectDB();

app.get('/', (req, res) => {
  res.status(200).json({ status: 'Success', message: 'RecallOps Server is running perfectly!' });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'RecallOps API is Running',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});


// API Routes
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);


app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.method} ${req.path} not found`
  });
});


app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
})
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

process.on('SIGINT', async () => {
  console.log('Gracefully shutting down...');
  await mongoose.connection.close();
  console.log('MongoDB connection closed.');
  process.exit(0);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  mongoose.connection.close();
  process.exit(1);
});
