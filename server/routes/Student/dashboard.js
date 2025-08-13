import express from 'express';
import auth from '../../middleware/auth.js';

const router = express.Router();

// ✅ GET /api/dashboard/student - Student dashboard
router.get('/student', auth, async (req, res) => {
  try {
    // Check if user is a student
    if (req.user.role !== 'Student') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Student role required.'
      });
    }

    const dashboardData = {
      student: {
        id: req.user.userId,
        name: req.user.fullName || `${req.user.firstName} ${req.user.lastName}`,
        email: req.user.email,
        grade: '10th Grade',
        section: 'A',
        studentId: 'STU001',
        profileImage: req.user.avatar || null
      },
      stats: {
        totalSubjects: 8,
        averageGrade: 85,
        attendancePercentage: 92,
        pendingAssignments: 3,
        upcomingExams: 2,
        completedAssignments: 15,
        totalAssignments: 18
      },
      recentActivity: [
        {
          id: 1,
          type: 'assignment',
          title: 'Math Assignment 5',
          subject: 'Mathematics',
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
          priority: 'high'
        },
        {
          id: 2,
          type: 'grade',
          title: 'Physics Test Result',
          subject: 'Physics',
          grade: 'A-',
          score: 87,
          date: new Date().toISOString(),
          status: 'graded'
        },
        {
          id: 3,
          type: 'attendance',
          title: 'Present in Chemistry Class',
          subject: 'Chemistry',
          date: new Date().toISOString(),
          status: 'present'
        }
      ],
      upcomingClasses: [
        {
          id: 1,
          subject: 'Mathematics',
          teacher: 'Mr. Johnson',
          time: '09:00 AM',
          room: 'Room 101',
          duration: '1 hour',
          type: 'lecture'
        },
        {
          id: 2,
          subject: 'Physics',
          teacher: 'Ms. Smith',
          time: '10:30 AM',
          room: 'Lab 2',
          duration: '1.5 hours',
          type: 'practical'
        },
        {
          id: 3,
          subject: 'English',
          teacher: 'Mrs. Brown',
          time: '02:00 PM',
          room: 'Room 205',
          duration: '45 minutes',
          type: 'discussion'
        }
      ],
      announcements: [
        {
          id: 1,
          title: 'School Holiday Announcement',
          content: 'School will be closed on Monday for maintenance.',
          date: new Date().toISOString(),
          priority: 'high',
          category: 'general'
        },
        {
          id: 2,
          title: 'Library Hours Extended',
          content: 'Library will now be open until 8 PM on weekdays.',
          date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          priority: 'medium',
          category: 'facilities'
        }
      ],
      quickActions: [
        {
          id: 'view_assignments',
          title: 'View Assignments',
          icon: 'document-text',
          route: 'Assignments',
          badge: 3
        },
        {
          id: 'check_grades',
          title: 'Check Grades',
          icon: 'school',
          route: 'Grades'
        },
        {
          id: 'view_attendance',
          title: 'Attendance',
          icon: 'calendar',
          route: 'Attendance'
        },
        {
          id: 'library_access',
          title: 'Library',
          icon: 'library',
          route: 'Library'
        }
      ]
    };

    res.status(200).json({
      success: true,
      message: 'Student dashboard data retrieved successfully',
      data: dashboardData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Get student dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard data',
      error: error.message
    });
  }
});

// ✅ GET /api/dashboard/teacher - Teacher dashboard
router.get('/teacher', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Teacher role required.'
      });
    }

    const dashboardData = {
      teacher: {
        id: req.user.userId,
        name: req.user.fullName || `${req.user.firstName} ${req.user.lastName}`,
        email: req.user.email,
        department: 'Mathematics',
        employeeId: 'TCH001'
      },
      stats: {
        totalClasses: 5,
        totalStudents: 120,
        pendingGrading: 8,
        upcomingClasses: 3,
        completedLessons: 45,
        totalLessons: 60
      },
      // Add teacher-specific data here
    };

    res.status(200).json({
      success: true,
      message: 'Teacher dashboard data retrieved successfully',
      data: dashboardData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Get teacher dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard data',
      error: error.message
    });
  }
});

// ✅ GET /api/dashboard/parent - Parent dashboard
router.get('/parent', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Parent') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Parent role required.'
      });
    }

    const dashboardData = {
      parent: {
        id: req.user.userId,
        name: req.user.fullName || `${req.user.firstName} ${req.user.lastName}`,
        email: req.user.email
      },
      children: [
        {
          id: 1,
          name: 'John Doe',
          grade: '8th Grade',
          section: 'B',
          attendance: 95,
          averageGrade: 88
        }
      ],
      // Add parent-specific data here
    };

    res.status(200).json({
      success: true,
      message: 'Parent dashboard data retrieved successfully',
      data: dashboardData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Get parent dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard data',
      error: error.message
    });
  }
});

// ✅ GET /api/dashboard/admin - Admin dashboard
router.get('/admin', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const dashboardData = {
      admin: {
        id: req.user.userId,
        name: req.user.fullName || `${req.user.firstName} ${req.user.lastName}`,
        email: req.user.email
      },
      stats: {
        totalUsers: 500,
        totalStudents: 350,
        totalTeachers: 25,
        totalParents: 125,
        systemHealth: 'Good'
      },
      // Add admin-specific data here
    };

    res.status(200).json({
      success: true,
      message: 'Admin dashboard data retrieved successfully',
      data: dashboardData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Get admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard data',
      error: error.message
    });
  }
});

export default router;
