import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import connectDB from './config/database.js';
import apiRoutes from './routes/index.js';
import { getNetworkIP } from './utils/helpers.js';
import { RATE_LIMITS } from './utils/constants.js';

// ✅ Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ✅ Connect to MongoDB
connectDB();

// ✅ Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// ✅ Rate limiting
const generalLimiter = rateLimit(RATE_LIMITS.GENERAL);
app.use('/api', generalLimiter);

// ✅ CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:19000',
    'http://localhost:19001',
    'http://localhost:19002',
    `http://${getNetworkIP()}:19000`,
    `http://${getNetworkIP()}:19001`,
    `http://${getNetworkIP()}:19002`,
    `exp://${getNetworkIP()}:19000`,
    `exp://${getNetworkIP()}:19001`,
    `exp://${getNetworkIP()}:19002`,
  ],
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











// import express from 'express';
// import cors from 'cors';
// import { networkInterfaces } from 'os';

// const app = express();
// const PORT = 5000;

// // ✅ In-memory user storage
// const users = new Map();

// // ✅ Pre-populate with test user
// users.set('test@schoolbridge.com', {
//   id: 1,
//   fullName: 'Test User',
//   email: 'test@schoolbridge.com',
//   password: 'password123',
//   phone: '1234567890',
//   role: 'Student',
//   provider: 'email',
//   createdAt: new Date().toISOString()
// });

// console.log('👤 Pre-loaded test user: test@schoolbridge.com / password123');

// // ✅ Get network IP
// function getNetworkIP() {
//   const nets = networkInterfaces();
//   const results = [];

//   for (const name of Object.keys(nets)) {
//     for (const net of nets[name]) {
//       if (net.family === 'IPv4' && !net.internal) {
//         results.push(net.address);
//       }
//     }
//   }

//   return results[0] || 'localhost';
// }

// const HOST_IP = getNetworkIP();

// // ✅ Middleware
// app.use(cors({
//   origin: '*',
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with'],
//   credentials: false
// }));

// app.use(express.json({ limit: '50mb' }));

// // ✅ Request logging
// app.use((req, res, next) => {
//   const timestamp = new Date().toISOString();
//   console.log(`\n${timestamp} - ${req.method} ${req.originalUrl}`);
//   if (Object.keys(req.body || {}).length > 0) {
//     console.log('Body:', req.body);
//   }
//   next();
// });

// // ✅ ROUTES - Using simple string paths to avoid path-to-regexp issues

// // Test endpoint
// app.get('/api/test', (req, res) => {
//   console.log('✅ Test endpoint hit');
//   res.json({
//     message: 'Server is running!',
//     timestamp: new Date().toISOString(),
//     server: 'SchoolBridge Test Server',
//     status: 'OK',
//     registeredUsers: users.size,
//     ip: HOST_IP,
//     port: PORT
//   });
// });

// // Login endpoint
// app.post('/api/auth/login', (req, res) => {
//   const { email, password, role } = req.body;

//   console.log('🔐 Login attempt:', { email, role });

//   if (!email || !password) {
//     console.log('❌ Login failed - missing email or password');
//     return res.status(400).json({
//       success: false,
//       message: 'Email and password are required'
//     });
//   }

//   const user = users.get(email.toLowerCase());

//   if (!user) {
//     console.log('❌ Login failed - user not found:', email);
//     return res.status(401).json({
//       success: false,
//       message: 'No account found with this email address. Please sign up first.'
//     });
//   }

//   if (user.password !== password) {
//     console.log('❌ Login failed - incorrect password for:', email);
//     return res.status(401).json({
//       success: false,
//       message: 'Incorrect password. Please try again.'
//     });
//   }

//   if (role && role !== user.role) {
//     console.log(`🔄 Updating user role: ${user.role} → ${role}`);
//     user.role = role;
//     users.set(email.toLowerCase(), user);
//   }

//   console.log('✅ Login successful for:', email);
//   res.json({
//     success: true,
//     message: 'Login successful',
//     accessToken: `access-token-${user.id}-${Date.now()}`,
//     refreshToken: `refresh-token-${user.id}-${Date.now()}`,
//     user: {
//       id: user.id,
//       email: user.email,
//       fullName: user.fullName,
//       role: user.role,
//       phone: user.phone,
//       avatar: user.avatar || null,
//       provider: user.provider || 'email',
//       verified: true
//     }
//   });
// });

// // Signup endpoint
// app.post('/api/auth/signup', (req, res) => {
//   const { fullName, email, phone, password, role } = req.body;

//   console.log('📝 Signup attempt:', { fullName, email, role });

//   if (!fullName || !email || !password) {
//     console.log('❌ Signup failed - missing required fields');
//     return res.status(400).json({
//       success: false,
//       message: 'Full name, email, and password are required'
//     });
//   }

//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   if (!emailRegex.test(email)) {
//     console.log('❌ Signup failed - invalid email format');
//     return res.status(400).json({
//       success: false,
//       message: 'Please provide a valid email address'
//     });
//   }

//   if (users.has(email.toLowerCase())) {
//     console.log('❌ Signup failed - email already exists:', email);
//     return res.status(409).json({
//       success: false,
//       message: 'An account with this email already exists. Please try logging in instead.'
//     });
//   }

//   const newUser = {
//     id: users.size + 1,
//     fullName,
//     email: email.toLowerCase(),
//     password,
//     phone: phone || null,
//     role: role || 'Student',
//     avatar: null,
//     provider: 'email',
//     createdAt: new Date().toISOString()
//   };

//   users.set(email.toLowerCase(), newUser);

//   console.log('✅ Signup successful for:', email);
//   console.log('👥 Total registered users:', users.size);

//   res.status(201).json({
//     success: true,
//     message: 'Account created successfully! You can now log in.',
//     user: {
//       id: newUser.id,
//       fullName: newUser.fullName,
//       email: newUser.email,
//       phone: newUser.phone,
//       role: newUser.role,
//       avatar: null,
//       provider: 'email',
//       createdAt: newUser.createdAt
//     }
//   });
// });

// // Google OAuth endpoint
// app.post('/api/auth/google', (req, res) => {
//   const { idToken, user, role } = req.body;

//   console.log('🔐 Google OAuth attempt for:', user?.email);

//   if (!user || !user.email) {
//     return res.status(400).json({
//       success: false,
//       message: 'Invalid Google user data'
//     });
//   }

//   const email = user.email.toLowerCase();
//   let existingUser = users.get(email);

//   if (existingUser) {
//     existingUser.role = role || existingUser.role;
//     existingUser.avatar = user.avatar || user.picture || existingUser.avatar;
//     users.set(email, existingUser);
//     console.log('✅ Existing Google user updated:', email);
//   } else {
//     const newGoogleUser = {
//       id: users.size + 1,
//       fullName: user.name,
//       email: email,
//       password: null,
//       phone: null,
//       role: role || 'Student',
//       avatar: user.avatar || user.picture,
//       provider: 'google',
//       verified: true,
//       createdAt: new Date().toISOString()
//     };

//     users.set(email, newGoogleUser);
//     existingUser = newGoogleUser;
//     console.log('✅ New Google user created:', email);
//   }

//   console.log('✅ Google OAuth successful');
//   res.json({
//     success: true,
//     message: 'Google authentication successful',
//     accessToken: `google-access-token-${existingUser.id}-${Date.now()}`,
//     refreshToken: `google-refresh-token-${existingUser.id}-${Date.now()}`,
//     user: {
//       id: existingUser.id,
//       fullName: existingUser.fullName,
//       email: existingUser.email,
//       phone: existingUser.phone,
//       role: existingUser.role,
//       avatar: existingUser.avatar,
//       provider: 'google',
//       verified: true,
//       createdAt: existingUser.createdAt
//     }
//   });
// });

// // Token refresh endpoint
// app.post('/api/auth/refresh', (req, res) => {
//   const { refreshToken } = req.body;
//   console.log('🔄 Token refresh attempt');

//   if (!refreshToken) {
//     return res.status(400).json({
//       success: false,
//       message: 'Refresh token is required'
//     });
//   }

//   console.log('✅ Token refresh successful');
//   res.json({
//     success: true,
//     accessToken: `new-access-token-${Date.now()}`,
//     message: 'Token refreshed successfully'
//   });
// });

// // Logout endpoint
// app.post('/api/auth/logout', (req, res) => {
//   console.log('🚪 Logout request');
//   res.json({
//     success: true,
//     message: 'Logged out successfully'
//   });
// });

// // Debug users endpoint
// app.get('/api/debug/users', (req, res) => {
//   const userList = Array.from(users.values()).map(user => ({
//     id: user.id,
//     email: user.email,
//     fullName: user.fullName,
//     role: user.role,
//     provider: user.provider,
//     createdAt: user.createdAt
//   }));

//   res.json({
//     success: true,
//     totalUsers: users.size,
//     users: userList
//   });
// });

// // Health check
// app.get('/health', (req, res) => {
//   console.log('🏥 Health check');
//   res.json({
//     status: 'healthy',
//     timestamp: new Date().toISOString(),
//     uptime: process.uptime(),
//     registeredUsers: users.size,
//     ip: HOST_IP,
//     port: PORT
//   });
// });

// // Root endpoint
// app.get('/', (req, res) => {
//   res.json({
//     message: 'SchoolBridge Test Server',
//     version: '1.0.0',
//     registeredUsers: users.size,
//     endpoints: [
//       'GET  /',
//       'GET  /health',
//       'GET  /api/test',
//       'GET  /api/debug/users',
//       'POST /api/auth/login',
//       'POST /api/auth/signup',
//       'POST /api/auth/google',
//       'POST /api/auth/refresh',
//       'POST /api/auth/logout'
//     ],
//     network: {
//       ip: HOST_IP,
//       port: PORT,
//       mobileUrl: `http://${HOST_IP}:${PORT}/api`
//     }
//   });
// });

// // 404 handler
// app.use((req, res) => {
//   console.log(`❌ 404 - Endpoint not found: ${req.method} ${req.originalUrl}`);
//   res.status(404).json({
//     success: false,
//     message: 'Endpoint not found',
//     path: req.originalUrl,
//     method: req.method
//   });
// });

// // Error handler
// app.use((err, req, res, next) => {
//   console.error('💥 Server error:', err);
//   res.status(500).json({
//     success: false,
//     message: 'Internal server error'
//   });
// });

// // ✅ Start server
// app.listen(PORT, '0.0.0.0', () => {
//   console.log('\n🚀 SchoolBridge Test Server Started!');
//   console.log(`📡 Server running on: http://0.0.0.0:${PORT}`);
//   console.log(`🌐 Network IP: ${HOST_IP}`);
//   console.log(`📱 Mobile API URL: http://${HOST_IP}:${PORT}/api`);
//   console.log(`🔗 Health Check: http://${HOST_IP}:${PORT}/health`);
//   console.log(`👥 Debug Users: http://${HOST_IP}:${PORT}/api/debug/users`);

//   console.log('\n📋 Available endpoints:');
//   console.log('  - GET  /api/test');
//   console.log('  - GET  /api/debug/users');
//   console.log('  - POST /api/auth/login');
//   console.log('  - POST /api/auth/signup');
//   console.log('  - POST /api/auth/google');
//   console.log('  - POST /api/auth/refresh');
//   console.log('  - POST /api/auth/logout');
//   console.log('  - GET  /health');

//   console.log('\n🧪 Pre-loaded test credentials:');
//   console.log('  📧 Email: test@schoolbridge.com');
//   console.log('  🔐 Password: password123');
//   console.log('  👤 Role: any (Teacher, Student, Parent, Admin)');

//   console.log('\n✅ Server ready for mobile app connections!');
//   console.log('📱 You can now register new users and login with them!');
// });
