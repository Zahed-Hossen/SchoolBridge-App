import { apiCall } from '../client';
import { StorageUtils } from '../utils/storage';
import { withErrorHandling } from '../utils/errorHandler';
import { API_CONFIG } from '../../constants/config';

const ROLES = {
  ADMIN: 'Admin',
  TEACHER: 'Teacher',
  STUDENT: 'Student',
  PARENT: 'Parent',
};

const login = withErrorHandling(async (credentials) => {
  console.log("Logging in...");

  // Make the API request using fetch
  const response = await fetch(`${API_CONFIG.BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.status} - ${response.statusText}`);
  }

  // Parse response JSON
  const raw = await response.json();
  let data, success, message;

  // Check if the response has the standard API shape
  if (raw && typeof raw === 'object' && ('data' in raw || 'success' in raw)) {
    data = raw.data || {};
    success = raw.success !== false;
    message = raw.message || 'Login successful';
  } else {
    // Handle flat response structure (user, accessToken, etc. at top level)
    data = raw;
    success = true;
    message = 'Login successful';
  }

  // Save tokens and user data if present
  const tokens = {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  };
  const userData = data.user || data;
  
  if (!userData.role) throw new Error('User role not found in response');
  
  if (tokens.accessToken) {
    await StorageUtils.auth.saveTokens(tokens.accessToken, tokens.refreshToken);
    await StorageUtils.auth.saveUserData(userData, userData.role, credentials.email);
  }

  return { success, data, message };
});


const register = withErrorHandling(async (userData, role = ROLES.STUDENT) => {
  if (!Object.values(ROLES).includes(role))
    throw new Error('Invalid user role');
  const payload = { ...userData, role, signupType: 'visitor' };
  const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.auth.register}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Error: ${response.status} - ${response.statusText}`);
  }
  const raw = await response.json();
  const data = raw.data || raw;
  if (data.accessToken) {
    await StorageUtils.auth.saveTokens(data.accessToken, data.refreshToken);
    await StorageUtils.auth.saveUserData(
      data.user || data,
      role,
      userData.email,
    );
  }
  return data;
});

const googleAuth = withErrorHandling(async (googleData) => {
  const payload = {
    user: {
      googleId: googleData.user.googleId,
      email: googleData.user.email,
      firstName: googleData.user.firstName,
      lastName: googleData.user.lastName,
      fullName: googleData.user.name,
      avatar: googleData.user.avatar,
      verified: googleData.user.verified,
    },
    role: googleData.role,
    tokens: googleData.tokens,
    idToken: googleData.tokens?.idToken,
  };
  const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.auth.googleAuth}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Error: ${response.status} - ${response.statusText}`);
  }
  const raw = await response.json();
  const tokens = {
    accessToken: raw.accessToken,
    refreshToken: raw.refreshToken,
  };
  const userData = raw.user || raw;
  if (tokens.accessToken) {
    await StorageUtils.auth.saveTokens(tokens.accessToken, tokens.refreshToken);
    await StorageUtils.auth.saveUserData(
      userData,
      userData.role || googleData.role,
      'google',
    );
  }
  return userData;
});

const logout = withErrorHandling(async () => {
  const refreshToken = await StorageUtils.auth.getRefreshToken();
  if (refreshToken) {
    try {
      await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.auth.logout}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
    } catch (serverError) {}
  }
  await StorageUtils.auth.clearAll();
  return { success: true, message: 'Logged out successfully' };
});

const refresh = withErrorHandling(async (refreshToken) => {
  const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.auth.refresh}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!response.ok) {
    throw new Error(`Error: ${response.status} - ${response.statusText}`);
  }
  const raw = await response.json();
  return raw.data || raw;
});

const forgotPassword = withErrorHandling(async (email) => {
  const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.auth.forgotPassword}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) {
    throw new Error(`Error: ${response.status} - ${response.statusText}`);
  }
  const raw = await response.json();
  return raw.data || raw;
});

const resetPassword = withErrorHandling(async (token, password) => {
  const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.auth.resetPassword}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  });
  if (!response.ok) {
    throw new Error(`Error: ${response.status} - ${response.statusText}`);
  }
  const raw = await response.json();
  return raw.data || raw;
});

const getCurrentUser = withErrorHandling(async () => {
  const userData = await StorageUtils.auth.getUserData();
  if (!userData) throw new Error('No user session found');
  return userData;
});

const hasRole = withErrorHandling(async (requiredRoles) => {
  const user = await getCurrentUser();
  const userRole = user?.role;
  if (!userRole) return false;
  if (Array.isArray(requiredRoles)) {
    return requiredRoles.includes(userRole);
  }
  return userRole === requiredRoles;
});

const isTeacher = withErrorHandling(async () => hasRole(ROLES.TEACHER));
const isStudent = withErrorHandling(async () => hasRole(ROLES.STUDENT));
const isAdmin = withErrorHandling(async () => hasRole(ROLES.ADMIN));

const validateSession = withErrorHandling(async () => {
  const response = await apiCall('GET', '/auth/validate');
  return response.data.data || response.data;
});

const validateActivationToken = withErrorHandling(async (token) => {
  const response = await apiCall(
    'GET',
    `/auth/activate/validate?token=${encodeURIComponent(token)}`,
  );
  return response.data.data || response.data;
});

const activateAccount = withErrorHandling(async (payload) => {
  const response = await apiCall('POST', '/auth/activate', payload);
  const tokens = {
    accessToken: response.data?.accessToken || response.accessToken,
    refreshToken: response.data?.refreshToken || response.refreshToken,
  };
  const userData = response.data?.user || response.user || response.data;
  if (tokens.accessToken && userData) {
    await StorageUtils.auth.saveTokens(tokens.accessToken, tokens.refreshToken);
    await StorageUtils.auth.saveUserData(userData, userData.role, 'email');
  }
  return userData;
});

// --- Additional Auth Routes ---

const verifyEmail = withErrorHandling(async (payload) => {
  const response = await apiCall('POST', '/auth/verify-email', payload);
  return response.data.data || response.data;
});

const sendOtp = withErrorHandling(async (payload) => {
  const response = await apiCall('POST', '/auth/send-otp', payload);
  return response.data.data || response.data;
});

const generateOtp = withErrorHandling(async (payload) => {
  const response = await apiCall('POST', '/auth/generate-otp', payload);
  return response.data.data || response.data;
});

const resendOtp = withErrorHandling(async (payload) => {
  const response = await apiCall('POST', '/auth/resend-otp', payload);
  return response.data.data || response.data;
});

const refreshToken = withErrorHandling(async (payload) => {
  const response = await apiCall('POST', '/auth/refresh-token', payload);
  return response.data.data || response.data;
});

const checkAuth = withErrorHandling(async () => {
  const response = await apiCall('GET', '/auth/check-auth');
  return response.data.data || response.data;
});

const getUserId = withErrorHandling(async () => {
  const response = await apiCall('GET', '/auth/user-id');
  return response.data.data || response.data;
});

const authService = {
  login,
  register,
  googleAuth,
  logout,
  refresh,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  hasRole,
  isTeacher,
  isStudent,
  isAdmin,
  validateSession,
  validateActivationToken,
  activateAccount,
  verifyEmail,
  sendOtp,
  generateOtp,
  resendOtp,
  refreshToken,
  checkAuth,
  getUserId,
  ROLES,
};

export default authService;
