# 🎓 SchoolBridge - Comprehensive School Management System

A modern, role-based educational platform built with React Native and Node.js, designed to connect students, teachers, parents, and administrators.

## 🌟 Features

### 🔐 **Authentication & Security**
- Google OAuth 2.0 integration
- JWT-based authentication
- Role-based access control (Student, Teacher, Parent, Admin)
- Secure token management

### 👥 **Role-Based Dashboards**
- **Students**: Course tracking, assignments, grades, attendance
- **Teachers**: Class management, grading, student progress
- **Parents**: Child monitoring, communication with teachers
- **Admins**: System management, user oversight, analytics

### 🛠️ **Technical Stack**
- **Frontend**: React Native, Expo
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Authentication**: Google OAuth 2.0, JWT
- **Security**: Helmet, CORS, Rate Limiting

## 📱 Screenshots

*[Add screenshots here]*

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- Expo CLI
- MongoDB Atlas account
- Google Cloud Console project

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Zahed-Hossen/schoolbridge.git
   cd schoolbridge
   ```

2. **Install Frontend Dependencies:**
   ```bash
   cd frontend
   npm install
   ```

3. **Install Backend Dependencies:**
   ```bash
   cd ../backend
   npm install
   ```

4. **Environment Setup:**
   ```bash
   # Copy environment files
   cp frontend/.env frontend/.env
   cp backend/.env backend/.env

   # Edit .env files with your configurations
   ```

5. **Start Development Servers:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npx expo start
   ```

## ⚙️ Configuration

### Google OAuth Setup
1. Create Google Cloud Console project
2. Enable Google+ API and People API
3. Create OAuth 2.0 credentials
4. Add client IDs to configuration

### MongoDB Setup
1. Create MongoDB Atlas cluster
2. Create database user
3. Whitelist IP addresses
4. Add connection string to backend .env

## 📁 Project Structure

```
SchoolBridgeApp/
│
├── app/                        # Main app code
│   ├── assets/                  # Images, fonts, icons
│   ├── components/              # Reusable components (Buttons, Inputs, Modals)
│   ├── constants/               # Colors, Fonts, App config
│   ├── context/                 # Context API (Auth, Theme, User Role)
│   ├── hooks/                   # Custom hooks (useAuth, useFetch)
│   ├── navigation/              # All navigation stacks & tabs
│   │   ├── AuthStack.js
│   │   ├── StudentStack.js
│   │   ├── TeacherStack.js
│   │   ├── AdminStack.js
│   │   ├── RootNavigator.js
│   │   └── index.js
│   ├── screens/                 # Screen Pages
│   │   ├── Auth/
│   │   │   ├── LoginScreen.jsx
│   │   │   ├── RegisterScreen.jsx
│   │   │   ├── RoleSelectionScreen.jsx
│   │   │   └── ForgotPasswordScreen.jsx
│   │   ├── Student/
│   │   │   ├── DashboardScreen.jsx
│   │   │   ├── ClassesScreen.jsx
│   │   │   ├── AttendanceScreen.jsx
│   │   │   ├── AnnouncementsScreen.jsx
│   │   │   ├── NewsScreen.jsx
│   │   │   ├── GradesScreen.jsx
│   │   │   ├── AssignmentsScreen.jsx
│   │   │   ├── LibraryScreen.jsx
│   │   │   └── SettingsScreen.jsx
│   │   ├── Teacher/
│   │   │   ├── DashboardScreen.jsx
│   │   │   ├── ManageClassesScreen.jsx
│   │   │   ├── AttendanceScreen.jsx
│   │   │   ├── AssignmentsScreen.jsx
│   │   │   ├── GradesScreen.jsx
│   │   │   ├── AnnouncementsScreen.jsx
│   │   │   └── SettingsScreen.jsx
│   │   ├── SchoolAdmin/
│   │   │   ├── DashboardScreen.jsx
│   │   │   ├── ManageAccountsScreen.jsx
│   │   │   ├── PermissionsScreen.jsx
│   │   │   ├── SchoolSettingsScreen.jsx
│   │   │   └── ReportsScreen.jsx
│   │   ├── SuperAdmin/   # App builder's control
│   │   │   ├── DashboardScreen.jsx
│   │   │   ├── ManageSchoolsScreen.jsx
│   │   │   ├── ManageAdminsScreen.jsx
│   │   │   ├── GlobalSettingsScreen.jsx
│   │   │   └── AnalyticsScreen.jsx
│   │   └── Shared/
│   │       ├── ProfileScreen.jsx
│   │       └── NotificationsScreen.jsx
│   ├── services/                 # API calls
│   │   ├── authService.js
│   │   ├── studentService.js
│   │   ├── teacherService.js
│   │   ├── adminService.js
│   │   └── superAdminService.js
│   ├── styles/                   # Global styles
│   └── App.js
│
├── backend/                      # Node.js + Express API
│   ├── config/                   # DB config, JWT secret
│   ├── controllers/              # Route handlers
│   ├── middleware/               # Auth, Role check
│   ├── models/                   # MongoDB Schemas
│   ├── routes/                   # API routes
│   ├── utils/                    # Helpers
│   ├── server.js
│   └── package.json
│
├── package.json
└── README.md

```

## 🔧 API Documentation

### Authentication Endpoints
- `POST /api/auth/google` - Google OAuth authentication
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/auth/me` - Get current user

### User Endpoints
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/dashboard` - Get role-specific dashboard

## 🧪 Testing

```bash
# Run frontend tests
cd frontend
npm run dev

# Run backend tests
cd backend
npx expo start
```

## 🚀 Deployment

### Frontend (Expo)
```bash
cd frontend
expo build:android
expo build:ios
```

### Backend (Node.js)
- Deploy to Heroku, AWS, or DigitalOcean
- Set environment variables
- Configure MongoDB Atlas production connection

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@schoolbridge.com
- 💬 Discord: [SchoolBridge Community](https://discord.gg/schoolbridge)
- 📖 Documentation: [docs.schoolbridge.com](https://docs.schoolbridge.com)

## 🙏 Acknowledgments

- React Native team for the amazing framework
- Expo team for development tools
- MongoDB for database services
- Google for OAuth services

---

**Built with ❤️ by the SchoolBridge Team**
