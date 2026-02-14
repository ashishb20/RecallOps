import express from "express";
import mongoose, { mongo } from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

dotenv.config();

const app = express();
//  CORS : Allows fronted to communicate with backend

app.use(cors());
app.use(express.json());
app.use(express.urlencoded( { extended: true } ));


app.use((req, res, next ) => {
  console.log(`${req.method} ${req.path}`);
  next();
})

connectDB();

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'RecallOps API is Running',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});


app.get('/api/test-db', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const states = {
      0: 'Disconnected',
      1: 'Connected',
      2: 'Connecting',
      3: 'Disconnecting'
    };
    if(dbState === 1) {
      res.json({
        status:' success',
        message: 'Database is connected',
        state: states[dbState],
        database:mongoose.connection.name,
        host:mongoose.connection.host
      });
    } else {
      res.status(500).json({
        status:'error',
        message: 'Database is not connected',
        state: states[dbState]
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Database connection test failed',
      error:error.message
    });
  }
});

// API Routes
import authRoutes from './routes/auth.js';
app.use('/api/auth', authRoutes);


app.use((req, res) => {
  res.status(404).json({
    status:'error',
    message:`Route ${req.method} ${req.path} not found`
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

const PORT = process.env.PORT || 5000; 

app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ========================================');
  console.log(`🚀  Server running on port ${PORT}`);
  console.log(`🚀  http://localhost:${PORT}`);
  console.log('🚀 ========================================');
  console.log('');
  console.log('📊 Available endpoints:');
  console.log(`   ✓ Health: http://localhost:${PORT}/api/health`);
  console.log(`   ✓ Test DB: http://localhost:${PORT}/api/test-db`);
  console.log(`   ✓ Register: http://localhost:${PORT}/api/auth/register`);
  console.log(`   ✓ Login: http://localhost:${PORT}/api/auth/login`);
  console.log(`   ✓ Get User: http://localhost:${PORT}/api/auth/user`);
  console.log('');
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('');
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


