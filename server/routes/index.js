import express from 'express';
import authRoutes from './auth.js';
import userRoutes from './users.js';
import invitationRoutes from './invitations.js';
import schoolsRoutes from './schools.js';

import { getNetworkIP, createResponse } from '../utils/helpers.js';

import teacherRoutes from './teacherRoutes.js';
import studentRoutes from './studentRoutes.js';
import classesRoutes from './teacherClasses.js';
import classStudentsRoutes from './classStudents.js';

const router = express.Router();

// Mount route modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/invitations', invitationRoutes);
router.use('/schools', schoolsRoutes);

// Teacher, Student, and Classes routes
router.use('/teachers', teacherRoutes);
router.use('/students', studentRoutes);
router.use('/classes', classesRoutes);
// Mount student CRD endpoints for classes
router.use('/classes', classStudentsRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json(
    createResponse(true, 'SchoolBridge API is running', {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      uptime: Math.floor(process.uptime()),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
      database: {
        status: 'Connected',
        readyState: 1,
        name: 'schoolbridge',
      },
      network: {
        ip: getNetworkIP(),
        port: process.env.PORT || 5000,
      },
    }),
  );
});

// ✅ Test endpoint
router.get('/test', (req, res) => {
  res.json(
    createResponse(true, 'API test successful', {
      timestamp: new Date().toISOString(),
      server: 'SchoolBridge API Server',
      network: {
        clientIP: req.ip || req.connection.remoteAddress,
        serverIP: getNetworkIP(),
        port: process.env.PORT || 5000,
        userAgent: req.get('User-Agent'),
      },
      endpoints: {
        health: '/api/health',
        test: '/api/test',
        auth: '/api/auth/*',
        users: '/api/users/*',
        announcements: '/api/announcements',
      },
    }),
  );
});

// Status endpoint
router.get('/status', (req, res) => {
  res.json(
    createResponse(true, 'All systems operational', {
      api: 'SchoolBridge',
      version: '1.0.0',
      status: 'operational',
      services: {
        database: 'healthy',
        authentication: 'healthy',
        fileStorage: 'healthy',
      },
      endpoints: [
        'GET /api/health',
        'GET /api/test',
        'GET /api/status',
        'POST /api/auth/login',
        'POST /api/auth/signup',
        'POST /api/auth/google',
        'GET /api/announcements',
      ],
    }),
  );
});

// API documentation endpoint
router.get('/docs', (req, res) => {
  res.json({
    success: true,
    message: 'SchoolBridge API Documentation',
    version: '1.0.0',
    baseUrl: `http://${getNetworkIP()}:${process.env.PORT || 5000}/api`,
    endpoints: {
      authentication: {
        signup: 'POST /api/auth/signup',
        login: 'POST /api/auth/login',
        google: 'POST /api/auth/google',
        logout: 'POST /api/auth/logout',
        refresh: 'POST /api/auth/refresh',
        validate: 'GET /api/auth/validate',
        me: 'GET /api/auth/me',
      },
      users: {
        profile: 'GET /api/users/profile',
        updateProfile: 'PUT /api/users/profile',
        dashboard: 'GET /api/users/dashboard',
      },
      system: {
        health: 'GET /api/health',
        test: 'GET /api/test',
        status: 'GET /api/status',
        docs: 'GET /api/docs',
      },
    },
  });
});

export default router;
