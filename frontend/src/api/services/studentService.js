import { apiCall } from '../client';
import { withErrorHandling } from '../utils/errorHandler';

const studentService = {
  // Dashboard & Overview
  getDashboard: withErrorHandling(async () => {
    return await apiCall('get', '/student/dashboard');
  }),

  // Announcements
  getAnnouncements: withErrorHandling(async (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.limit) queryParams.append('limit', filters.limit);
    if (filters.status) queryParams.append('status', filters.status);
    const url =
      '/announcements' +
      (queryParams.toString() ? `?${queryParams.toString()}` : '');
    return await apiCall('get', url);
  }),

  // Assignments
  getAssignments: withErrorHandling(async (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.dueDate) queryParams.append('dueDate', filters.dueDate);
    if (filters.classId) queryParams.append('classId', filters.classId);
    const url =
      '/student/assignments' +
      (queryParams.toString() ? `?${queryParams.toString()}` : '');
    return await apiCall('get', url);
  }),
  getAssignmentDetails: withErrorHandling(async (assignmentId) => {
    return await apiCall('get', `/student/assignments/${assignmentId}`);
  }),
  submitAssignment: withErrorHandling(async (assignmentId, submissionData) => {
    return await apiCall(
      'post',
      `/student/assignments/${assignmentId}/submit`,
      submissionData,
    );
  }),

  // Grades & Performance
  getGrades: withErrorHandling(async (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.semester) queryParams.append('semester', filters.semester);
    if (filters.subject) queryParams.append('subject', filters.subject);
    if (filters.classId) queryParams.append('classId', filters.classId);
    const url =
      '/student/grades' +
      (queryParams.toString() ? `?${queryParams.toString()}` : '');
    return await apiCall('get', url);
  }),
  getAttendance: withErrorHandling(async (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.month) queryParams.append('month', filters.month);
    if (filters.year) queryParams.append('year', filters.year);
    const url =
      '/student/attendance' +
      (queryParams.toString() ? `?${queryParams.toString()}` : '');
    return await apiCall('get', url);
  }),

  // Schedule & Timetable
  getSchedule: withErrorHandling(async (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.weekStart) queryParams.append('weekStart', filters.weekStart);
    if (filters.weekEnd) queryParams.append('weekEnd', filters.weekEnd);
    if (filters.classId) queryParams.append('classId', filters.classId);
    const url =
      '/student/schedule' +
      (queryParams.toString() ? `?${queryParams.toString()}` : '');
    return await apiCall('get', url);
  }),
};

export default studentService;
