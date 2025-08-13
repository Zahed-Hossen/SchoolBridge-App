import express from 'express';
import auth from '../../middleware/auth.js';
import { createResponse, handleError } from '../../utils/helpers.js';
import { HTTP_STATUS } from '../../utils/constants.js';

const router = express.Router();

// ✅ GET /api/student/dashboard - Student dashboard
router.get('/dashboard', auth, async (req, res) => {
  try {
    // Check if user is a student
    if (req.user.role !== 'Student') {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        createResponse(false, 'Access denied. Student role required.')
      );
    }

    const dashboardData = {
      student: {
        id: req.user.userId,
        name: req.user.fullName,
        grade: '10th Grade',
        section: 'A',
        studentId: 'STU001'
      },
      stats: {
        totalSubjects: 8,
        averageGrade: 85,
        attendancePercentage: 92,
        pendingAssignments: 3,
        upcomingExams: 2
      },
      recentActivity: [
        {
          id: 1,
          type: 'assignment',
          title: 'Math Assignment 5',
          subject: 'Mathematics',
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending'
        },
        {
          id: 2,
          type: 'grade',
          title: 'Physics Test Result',
          subject: 'Physics',
          grade: 'A-',
          date: new Date().toISOString()
        }
      ],
      upcomingClasses: [
        {
          id: 1,
          subject: 'Mathematics',
          teacher: 'Mr. Johnson',
          time: '09:00 AM',
          room: 'Room 101'
        },
        {
          id: 2,
          subject: 'Physics',
          teacher: 'Ms. Smith',
          time: '10:30 AM',
          room: 'Lab 2'
        }
      ]
    };

    res.status(HTTP_STATUS.OK).json(
      createResponse(true, 'Student dashboard data retrieved successfully', dashboardData)
    );

  } catch (error) {
    const errorInfo = handleError(error, 'Get student dashboard');
    res.status(errorInfo.status).json(
      createResponse(false, errorInfo.message, null, errorInfo.details)
    );
  }
});

// ✅ GET /api/student/assignments - Student assignments
router.get('/assignments', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Student') {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        createResponse(false, 'Access denied. Student role required.')
      );
    }

    const { status, subject, page = 1, limit = 10 } = req.query;

    // Mock assignments data
    const assignments = [
      {
        id: 1,
        title: 'Math Assignment 5: Algebra Problems',
        subject: 'Mathematics',
        teacher: 'Mr. Johnson',
        description: 'Solve the algebra problems from chapter 5',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        priority: 'high',
        maxScore: 100,
        submittedScore: null,
        attachments: ['algebra_problems.pdf']
      },
      {
        id: 2,
        title: 'Physics Lab Report',
        subject: 'Physics',
        teacher: 'Ms. Smith',
        description: 'Write a report on the motion experiment',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        priority: 'medium',
        maxScore: 50,
        submittedScore: null,
        attachments: []
      },
      {
        id: 3,
        title: 'English Essay',
        subject: 'English',
        teacher: 'Mrs. Brown',
        description: 'Write an essay about Shakespeare',
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'submitted',
        priority: 'medium',
        maxScore: 100,
        submittedScore: 85,
        attachments: []
      }
    ];

    // Filter assignments based on query parameters
    let filteredAssignments = assignments;

    if (status) {
      filteredAssignments = filteredAssignments.filter(a => a.status === status);
    }

    if (subject) {
      filteredAssignments = filteredAssignments.filter(a => a.subject.toLowerCase().includes(subject.toLowerCase()));
    }

    const total = filteredAssignments.length;
    const startIndex = (page - 1) * limit;
    const paginatedAssignments = filteredAssignments.slice(startIndex, startIndex + parseInt(limit));

    res.status(HTTP_STATUS.OK).json(
      createResponse(true, 'Assignments retrieved successfully', {
        assignments: paginatedAssignments,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      })
    );

  } catch (error) {
    const errorInfo = handleError(error, 'Get assignments');
    res.status(errorInfo.status).json(
      createResponse(false, errorInfo.message, null, errorInfo.details)
    );
  }
});

// ✅ GET /api/student/grades - Student grades
router.get('/grades', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Student') {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        createResponse(false, 'Access denied. Student role required.')
      );
    }

    const { subject, semester, year } = req.query;

    const grades = [
      {
        id: 1,
        subject: 'Mathematics',
        teacher: 'Mr. Johnson',
        grades: [
          { type: 'Quiz', score: 85, maxScore: 100, date: '2024-08-01', weight: 20 },
          { type: 'Test', score: 92, maxScore: 100, date: '2024-08-15', weight: 40 },
          { type: 'Assignment', score: 88, maxScore: 100, date: '2024-08-20', weight: 40 }
        ],
        average: 89,
        letterGrade: 'B+',
        semester: 'Fall 2024'
      },
      {
        id: 2,
        subject: 'Physics',
        teacher: 'Ms. Smith',
        grades: [
          { type: 'Lab Report', score: 95, maxScore: 100, date: '2024-08-05', weight: 30 },
          { type: 'Test', score: 78, maxScore: 100, date: '2024-08-18', weight: 50 },
          { type: 'Quiz', score: 90, maxScore: 100, date: '2024-08-22', weight: 20 }
        ],
        average: 84,
        letterGrade: 'B',
        semester: 'Fall 2024'
      }
    ];

    let filteredGrades = grades;

    if (subject) {
      filteredGrades = filteredGrades.filter(g => g.subject.toLowerCase().includes(subject.toLowerCase()));
    }

    const overallGPA = filteredGrades.reduce((sum, grade) => sum + grade.average, 0) / filteredGrades.length;

    res.status(HTTP_STATUS.OK).json(
      createResponse(true, 'Grades retrieved successfully', {
        grades: filteredGrades,
        summary: {
          overallGPA: Math.round(overallGPA * 100) / 100,
          totalSubjects: filteredGrades.length,
          semester: 'Fall 2024'
        }
      })
    );

  } catch (error) {
    const errorInfo = handleError(error, 'Get grades');
    res.status(errorInfo.status).json(
      createResponse(false, errorInfo.message, null, errorInfo.details)
    );
  }
});

// ✅ GET /api/student/attendance - Student attendance
router.get('/attendance', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Student') {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        createResponse(false, 'Access denied. Student role required.')
      );
    }

    const attendance = {
      overview: {
        totalDays: 100,
        presentDays: 92,
        absentDays: 8,
        attendancePercentage: 92,
        status: 'Good'
      },
      bySubject: [
        { subject: 'Mathematics', present: 18, total: 20, percentage: 90 },
        { subject: 'Physics', present: 19, total: 20, percentage: 95 },
        { subject: 'English', present: 17, total: 20, percentage: 85 },
        { subject: 'Chemistry', present: 19, total: 20, percentage: 95 }
      ],
      recent: [
        { date: '2024-08-04', status: 'present', subjects: ['Math', 'Physics', 'English'] },
        { date: '2024-08-03', status: 'present', subjects: ['Math', 'Chemistry', 'English'] },
        { date: '2024-08-02', status: 'absent', subjects: ['Math', 'Physics'], reason: 'Sick' },
        { date: '2024-08-01', status: 'present', subjects: ['Chemistry', 'English', 'Physics'] }
      ]
    };

    res.status(HTTP_STATUS.OK).json(
      createResponse(true, 'Attendance retrieved successfully', attendance)
    );

  } catch (error) {
    const errorInfo = handleError(error, 'Get attendance');
    res.status(errorInfo.status).json(
      createResponse(false, errorInfo.message, null, errorInfo.details)
    );
  }
});

// ✅ GET /api/student/schedule - Student schedule
router.get('/schedule', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Student') {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        createResponse(false, 'Access denied. Student role required.')
      );
    }

    const schedule = {
      today: [
        {
          id: 1,
          time: '09:00 - 10:00',
          subject: 'Mathematics',
          teacher: 'Mr. Johnson',
          room: 'Room 101',
          type: 'lecture'
        },
        {
          id: 2,
          time: '10:30 - 11:30',
          subject: 'Physics',
          teacher: 'Ms. Smith',
          room: 'Lab 2',
          type: 'lab'
        },
        {
          id: 3,
          time: '13:00 - 14:00',
          subject: 'English',
          teacher: 'Mrs. Brown',
          room: 'Room 205',
          type: 'lecture'
        }
      ],
      weekly: {
        Monday: [
          { time: '09:00', subject: 'Mathematics', teacher: 'Mr. Johnson', room: 'Room 101' },
          { time: '10:30', subject: 'Physics', teacher: 'Ms. Smith', room: 'Lab 2' }
        ],
        Tuesday: [
          { time: '09:00', subject: 'English', teacher: 'Mrs. Brown', room: 'Room 205' },
          { time: '10:30', subject: 'Chemistry', teacher: 'Dr. Wilson', room: 'Lab 1' }
        ]
        // Add more days as needed
      }
    };

    res.status(HTTP_STATUS.OK).json(
      createResponse(true, 'Schedule retrieved successfully', schedule)
    );

  } catch (error) {
    const errorInfo = handleError(error, 'Get schedule');
    res.status(errorInfo.status).json(
      createResponse(false, errorInfo.message, null, errorInfo.details)
    );
  }
});

export default router;
