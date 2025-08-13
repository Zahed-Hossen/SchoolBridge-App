import express from 'express';
import { createResponse, handleError } from '../../utils/helpers.js';
import { HTTP_STATUS } from '../../utils/constants.js';

const router = express.Router();

// ✅ GET /api/notifications - Get user notifications
router.get('/', async (req, res) => {
  try {
    const { limit = 10, page = 1, type, read } = req.query;

    const notifications = [
      {
        id: 1,
        type: 'assignment',
        title: 'New Assignment Posted',
        message: 'Math Assignment 5 has been posted and is due Friday',
        data: { assignmentId: 1, subject: 'Mathematics' },
        read: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        type: 'grade',
        title: 'Grade Updated',
        message: 'Your Physics test grade is now available',
        data: { gradeId: 1, subject: 'Physics', score: 85 },
        read: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 3,
        type: 'attendance',
        title: 'Attendance Reminder',
        message: 'Don\'t forget to mark your attendance for today\'s classes',
        data: { date: new Date().toISOString().split('T')[0] },
        read: true,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 4,
        type: 'announcement',
        title: 'System Maintenance',
        message: 'Scheduled maintenance this weekend from 2-4 AM',
        data: { announcementId: 2 },
        read: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    // Filter notifications
    let filteredNotifications = notifications;

    if (type) {
      filteredNotifications = filteredNotifications.filter(n => n.type === type);
    }

    if (read !== undefined) {
      const isRead = read === 'true';
      filteredNotifications = filteredNotifications.filter(n => n.read === isRead);
    }

    // Pagination
    const total = filteredNotifications.length;
    const startIndex = (page - 1) * limit;
    const paginatedNotifications = filteredNotifications
      .slice(startIndex, startIndex + parseInt(limit));

    // Count unread notifications
    const unreadCount = notifications.filter(n => !n.read).length;

    res.status(HTTP_STATUS.OK).json(
      createResponse(true, 'Notifications retrieved successfully', {
        notifications: paginatedNotifications,
        unreadCount,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      })
    );

  } catch (error) {
    const errorInfo = handleError(error, 'Get notifications');
    res.status(errorInfo.status).json(
      createResponse(false, errorInfo.message, null, errorInfo.details)
    );
  }
});

export default router;
