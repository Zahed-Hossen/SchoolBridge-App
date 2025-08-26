import { apiCall } from '../client';
import { withErrorHandling } from '../utils/errorHandler';

// Class Operations
const teacherService = {
  // Get all classes for a teacher
  getTeacherClasses: withErrorHandling(async (teacherId) => {
    return await apiCall('get', `/teachers/${teacherId}/classes`);
  }),

  // Get all students in a class
  getClassStudents: withErrorHandling(async (classId) => {
    return await apiCall('get', `/classes/${classId}/students`);
  }),

  // Add a student to a class
  addStudentToClass: withErrorHandling(async (classId, studentData) => {
    return await apiCall('post', `/classes/${classId}/students`, studentData);
  }),

  // Remove a student from a class
  removeStudentFromClass: withErrorHandling(async (classId, studentId) => {
    return await apiCall('delete', `/classes/${classId}/students/${studentId}`);
  }),
  // Assignment CRUD
  // Get all assignments for a teacher
  getTeacherAssignments: withErrorHandling(async (teacherId) => {
    return await apiCall('get', `/teachers/${teacherId}/assignments`);
  }),

  // Create a new assignment
  createAssignment: withErrorHandling(async (teacherId, assignmentData) => {
    return await apiCall(
      'post',
      `/teachers/${teacherId}/assignments`,
      assignmentData,
    );
  }),

  // Update an assignment
  updateAssignment: withErrorHandling(
    async (teacherId, assignmentId, assignmentData) => {
      return await apiCall(
        'put',
        `/teachers/${teacherId}/assignments/${assignmentId}`,
        assignmentData,
      );
    },
  ),

  // Delete an assignment
  deleteAssignment: withErrorHandling(async (teacherId, assignmentId) => {
    return await apiCall(
      'delete',
      `/teachers/${teacherId}/assignments/${assignmentId}`,
    );
  }),

  // Get a single class by ID
  getClass: withErrorHandling(async (classId) => {
    return await apiCall('get', `/classes/${classId}`);
  }),
  // Create a new class
  createClass: withErrorHandling(async (classData) => {
    // Remove teacher field if present
    const { teacher, ...payload } = classData;
    // Capitalize schedule.days if present
    if (payload.schedule && Array.isArray(payload.schedule.days)) {
      payload.schedule.days = payload.schedule.days.map(
        (d) => d.charAt(0).toUpperCase() + d.slice(1).toLowerCase(),
      );
    }
    return await apiCall('post', '/classes', payload);
  }),
  // Update an existing class
  updateClass: withErrorHandling(async (classId, classData) => {
    return await apiCall('put', `/classes/${classId}`, classData);
  }),
  // Delete a class
  deleteClass: withErrorHandling(async (classId) => {
    return await apiCall('delete', `/classes/${classId}`);
  }),
};

export default teacherService;
