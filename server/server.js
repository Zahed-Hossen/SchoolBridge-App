import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import connectDB from './config/database.js';
import apiRoutes from './routes/index.js';
import { getNetworkIP } from './utils/helpers.js';
import { RATE_LIMITS } from './utils/constants.js';
import './jobs/tokenCleanup.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';


connectDB();


app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  }),
);

// ✅ Rate limiting
const generalLimiter = rateLimit(RATE_LIMITS.GENERAL);
app.use('/api', generalLimiter);

// ✅ CORS configuration
const corsOptions = {
  origin: ['*'],
  credentials: true,
  exposedHeaders: ['Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// ✅ Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ Request logging in development
if (NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// ✅ API routes
app.use('/api', apiRoutes);

// ✅ Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to SchoolBridge API',
    version: '1.0.0',
    documentation: `http://${getNetworkIP()}:${PORT}/api/docs`,
    health: `http://${getNetworkIP()}:${PORT}/api/health`,
    environment: NODE_ENV,
  });
});

// ✅ 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
    documentation: `http://${getNetworkIP()}:${PORT}/api/docs`,
  });
});

// ✅ Global error handler
app.use((error, req, res, next) => {
  console.error('❌ Global error handler:', error);

  res.status(error.status || 500).json({
    success: false,
    error: NODE_ENV === 'development' ? error.message : 'Internal server error',
    ...(NODE_ENV === 'development' && { stack: error.stack }),
  });
});

// ✅ Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// ✅ Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 ====================================');
  console.log('🚀 SchoolBridge API Server Started');
  console.log('🚀 ====================================');
  console.log(`📡 Environment: ${NODE_ENV}`);
  console.log(`🌐 Local: http://localhost:${PORT}`);
  console.log(`🌐 Network: http://${getNetworkIP()}:${PORT}`);
  console.log(`🏥 Health: http://${getNetworkIP()}:${PORT}/api/health`);
  console.log(`📚 Docs: http://${getNetworkIP()}:${PORT}/api/docs`);
  console.log('🚀 ====================================');
});

export default app;
