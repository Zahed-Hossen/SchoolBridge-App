import { apiCall } from '../client';

export const studentService = {
  async getDashboard() {
    try {
      console.log('📊 Fetching student dashboard...');
      const response = await apiCall('GET', '/dashboard/student');
      console.log('✅ Student dashboard fetched successfully');
      return response;
    } catch (error) {
      console.error('❌ Get dashboard error:', error.message);
      throw error;
    }
  },
  async getAnnouncements(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (filters.limit) queryParams.append('limit', filters.limit);

      const url = `/announcements${
        queryParams.toString() ? `?${queryParams}` : ''
      }`;
      return await apiCall('GET', url);
    } catch (error) {
      if (error.status === 404) {
        console.log('📢 Using mock announcements data (endpoint not found)');
        return {
          success: true,
          data: {
            announcements: [
              {
                id: 1,
                title: 'Mock Announcement',
                content: 'This is mock data',
                time: '1 hour ago',
              },
            ],
          },
        };
      }
      throw error;
    }
  },

  async getNotifications(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (filters.limit) queryParams.append('limit', filters.limit);

      const url = `/notifications${
        queryParams.toString() ? `?${queryParams}` : ''
      }`;
      return await apiCall('GET', url);
    } catch (error) {
      if (error.status === 404) {
        console.log('🔔 Using empty notifications (endpoint not found)');
        return {
          success: true,
          data: { notifications: [] },
        };
      }
      throw error;
    }
  },

    async getPerformance(filters = {}) {
      try {
        const queryParams = new URLSearchParams();
        if (filters.userId) queryParams.append('userId', filters.userId);
        if (filters.semester) queryParams.append('semester', filters.semester);
        if (filters.includeAnalytics) queryParams.append('includeAnalytics', filters.includeAnalytics);
        if (filters.includeProgress) queryParams.append('includeProgress', filters.includeProgress);

        const url = `/student/performance${queryParams.toString() ? `?${queryParams}` : ''}`;
        return await apiCall('GET', url);
      } catch (error) {
        if (error.status === 404) {
          console.log('📊 Using mock performance data (endpoint not found)');
          return this.getMockPerformanceData();
        }
        throw error;
      }
    },

    getMockPerformanceData() {
      return {
        success: true,
        data: {
          overallGPA: 3.57,
          rank: 12,
          totalStudents: 150,
          semester: 'Fall 2024',
          lastUpdated: '2024-08-04',
          attendance: {
            present: 42,
            total: 50,
            percentage: 84.0,
            trend: 'stable',
            totalDays: 120,
            presentDays: 110
          },
          grades: [
            { subject: 'Mathematics', score: 92, grade: 'A', credits: 4, gpa: 4.0, trend: 'up', lastUpdated: '2024-08-01' },
            { subject: 'Physics', score: 88, grade: 'B+', credits: 4, gpa: 3.7, trend: 'stable', lastUpdated: '2024-08-02' },
            { subject: 'Chemistry', score: 85, grade: 'B', credits: 3, gpa: 3.3, trend: 'down', lastUpdated: '2024-08-03' },
            { subject: 'English', score: 95, grade: 'A', credits: 3, gpa: 4.0, trend: 'up', lastUpdated: '2024-08-04' },
            { subject: 'History', score: 79, grade: 'B-', credits: 2, gpa: 2.7, trend: 'stable', lastUpdated: '2024-08-01' },
            { subject: 'Biology', score: 90, grade: 'A-', credits: 4, gpa: 3.7, trend: 'up', lastUpdated: '2024-08-02' }
          ],
          analytics: {
            overallGPA: 3.57,
            rank: 12,
            totalStudents: 150,
            totalCredits: 20,
            improvement: '+5.2%',
            strengths: ['Mathematics', 'English'],
            improvements: ['History'],
            classAverage: 81.3,
            gradeAverage: 82.8,
            percentile: 87.5,
            academicStanding: 'Good Standing'
          },
          benchmark: {
            classAverages: {
              Mathematics: 78.5,
              Physics: 82.3,
              Chemistry: 80.1,
              English: 85.7,
              History: 77.9,
              Biology: 83.2,
            },
            schoolAverage: 81.3,
            gradeAverage: 82.8,
          },
          progressHistory: [
            { month: 'Jan', gpa: 3.2 },
            { month: 'Feb', gpa: 3.3 },
            { month: 'Mar', gpa: 3.4 },
            { month: 'Apr', gpa: 3.5 },
            { month: 'May', gpa: 3.57 },
          ],
          recentAssignments: [
            { subject: 'Mathematics', title: 'Calculus Quiz', score: 95, date: '2024-08-01' },
            { subject: 'Physics', title: 'Lab Report', score: 88, date: '2024-07-30' },
            { subject: 'Chemistry', title: 'Midterm Exam', score: 85, date: '2024-07-28' },
          ],
        },
        message: "Performance data retrieved successfully (mock)"
      };
    },


  async getAssignments(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (filters.subject) queryParams.append('subject', filters.subject);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.dueDate) queryParams.append('dueDate', filters.dueDate);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const url = `/student/assignments${
        queryParams.toString() ? `?${queryParams}` : ''
      }`;
      return await apiCall('GET', url);
    } catch (error) {
      if (error.status === 404) {
        console.log('📋 Using mock assignments data (endpoint not found)');
        return this.getMockAssignmentsData();
      }
      throw error;
    }
  },

  async getAssignmentDetails(assignmentId) {
    try {
      return await apiCall('GET', `/student/assignments/${assignmentId}`);
    } catch (error) {
      if (error.status === 404) {
        console.log('📄 Using mock assignment details (endpoint not found)');
        return this.getMockAssignmentDetails(assignmentId);
      }
      throw error;
    }
  },

  async submitAssignment(assignmentId, submissionData) {
    try {
      return await apiCall(
        'POST',
        `/student/assignments/${assignmentId}/submit`,
        submissionData,
      );
    } catch (error) {
      if (error.status === 404) {
        console.log('📤 Using mock submission response (endpoint not found)');
        return this.getMockSubmissionResponse(assignmentId, submissionData);
      }
      throw error;
    }
  },

  async getGrades(filters = {}) {
    const queryParams = new URLSearchParams();
    if (filters.subject) queryParams.append('subject', filters.subject);
    if (filters.semester) queryParams.append('semester', filters.semester);
    if (filters.year) queryParams.append('year', filters.year);

    const url = `/student/grades${
      queryParams.toString() ? `?${queryParams}` : ''
    }`;
    return await apiCall('GET', url);
  },

  async getAttendance(filters = {}) {
    const queryParams = new URLSearchParams();
    if (filters.subject) queryParams.append('subject', filters.subject);
    if (filters.month) queryParams.append('month', filters.month);
    if (filters.year) queryParams.append('year', filters.year);

    const url = `/student/attendance${
      queryParams.toString() ? `?${queryParams}` : ''
    }`;
    return await apiCall('GET', url);
  },

  async getSchedule(filters = {}) {
    const queryParams = new URLSearchParams();
    if (filters.date) queryParams.append('date', filters.date);
    if (filters.week) queryParams.append('week', filters.week);

    const url = `/student/schedule${
      queryParams.toString() ? `?${queryParams}` : ''
    }`;
    return await apiCall('GET', url);
  },

  async getExams(filters = {}) {
    const queryParams = new URLSearchParams();
    if (filters.subject) queryParams.append('subject', filters.subject);
    if (filters.type) queryParams.append('type', filters.type);
    if (filters.upcoming) queryParams.append('upcoming', filters.upcoming);

    const url = `/student/exams${
      queryParams.toString() ? `?${queryParams}` : ''
    }`;
    return await apiCall('GET', url);
  },

  async getTimetable(filters = {}) {
    const queryParams = new URLSearchParams();
    if (filters.week) queryParams.append('week', filters.week);
    if (filters.date) queryParams.append('date', filters.date);

    const url = `/student/timetable${
      queryParams.toString() ? `?${queryParams}` : ''
    }`;
    return await apiCall('GET', url);
  },

  // Mock data methods (move these to a separate mock file if needed)
  getMockPerformanceData() {
    return {
      success: true,
      data: {
        overallGPA: 3.57,
        rank: 12,
        totalStudents: 150,
        semester: 'Fall 2024',
        lastUpdated: '2024-08-04',
        attendance: {
          present: 42,
          total: 50,
          percentage: 84.0,
          trend: 'stable',
          totalDays: 120,
          presentDays: 110,
        },
        grades: [
          {
            subject: 'Mathematics',
            score: 92,
            grade: 'A',
            credits: 4,
            gpa: 4.0,
            trend: 'up',
            lastUpdated: '2024-08-01',
          },
          {
            subject: 'Physics',
            score: 88,
            grade: 'B+',
            credits: 4,
            gpa: 3.7,
            trend: 'stable',
            lastUpdated: '2024-08-02',
          },
          {
            subject: 'Chemistry',
            score: 85,
            grade: 'B',
            credits: 3,
            gpa: 3.3,
            trend: 'down',
            lastUpdated: '2024-08-03',
          },
          {
            subject: 'English',
            score: 95,
            grade: 'A',
            credits: 3,
            gpa: 4.0,
            trend: 'up',
            lastUpdated: '2024-08-04',
          },
          {
            subject: 'History',
            score: 79,
            grade: 'B-',
            credits: 2,
            gpa: 2.7,
            trend: 'stable',
            lastUpdated: '2024-08-01',
          },
          {
            subject: 'Biology',
            score: 90,
            grade: 'A-',
            credits: 4,
            gpa: 3.7,
            trend: 'up',
            lastUpdated: '2024-08-02',
          },
        ],
        analytics: {
          overallGPA: 3.57,
          rank: 12,
          totalStudents: 150,
          totalCredits: 20,
          improvement: '+5.2%',
          strengths: ['Mathematics', 'English'],
          improvements: ['History'],
          classAverage: 81.3,
          gradeAverage: 82.8,
          percentile: 87.5,
          academicStanding: 'Good Standing',
        },
      },
      message: 'Performance data retrieved successfully (mock)',
    };
  },

  getMockAssignmentsData() {
    return {
      success: true,
      data: {
        assignments: [
          {
            id: 1,
            title: 'Calculus Problem Set 6',
            subject: 'Mathematics',
            dueDate: '2024-08-15T23:59:00Z',
            status: 'pending',
            priority: 'high',
            totalPoints: 100,
            submittedPoints: null,
            teacher: 'Mr. Johnson',
          },
          {
            id: 2,
            title: 'Chemistry Lab Report',
            subject: 'Science',
            dueDate: '2024-08-12T23:59:00Z',
            status: 'submitted',
            priority: 'medium',
            totalPoints: 50,
            submittedPoints: 45,
            teacher: 'Ms. Smith',
          },
          {
            id: 3,
            title: 'Essay on Shakespeare',
            subject: 'English',
            dueDate: '2024-08-20T23:59:00Z',
            status: 'pending',
            priority: 'medium',
            totalPoints: 75,
            submittedPoints: null,
            teacher: 'Mrs. Davis',
          },
        ],
        pagination: { page: 1, limit: 10, total: 3, totalPages: 1 },
        stats: {
          total: 3,
          pending: 2,
          submitted: 1,
          graded: 0,
          overdue: 0,
        },
      },
      message: 'Assignments retrieved successfully (mock)',
    };
  },

  getMockAssignmentDetails(assignmentId) {
    return {
      success: true,
      data: {
        assignment: {
          id: parseInt(assignmentId) || 1,
          title: 'Calculus Problem Set 6',
          subject: 'Mathematics',
          description:
            'Complete problems 1-20 from Chapter 8. Show all work for full credit.',
          dueDate: '2024-08-15T23:59:00Z',
          priority: 'high',
          status: 'pending',
          totalPoints: 100,
          teacher: 'Mr. Johnson',
          instructions: 'Submit solutions with detailed explanations.',
          attachments: [
            { name: 'problem_set_6.pdf', size: '2.3 MB', type: 'pdf' },
          ],
          submissionType: ['text', 'file'],
          allowLateSubmission: true,
          lateSubmissionPenalty: '10% per day',
          createdAt: '2024-07-28T10:00:00Z',
          estimatedTime: '2-3 hours',
          difficulty: 'medium',
        },
      },
      message: 'Assignment details retrieved successfully (mock)',
    };
  },

  getMockSubmissionResponse(assignmentId, submissionData) {
    return {
      success: true,
      message: 'Assignment submitted successfully (mock)',
      data: {
        submissionId: `sub_${Date.now()}`,
        submittedAt: new Date().toISOString(),
        status: 'submitted',
        assignmentId: assignmentId,
        submissionType: submissionData.type || 'text',
        points: null,
        feedback: null,
      },
    };
  },
};
