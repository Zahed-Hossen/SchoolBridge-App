import express from 'express';
import { createResponse, handleError } from '../../utils/helpers.js';
import { HTTP_STATUS } from '../../utils/constants.js';

const router = express.Router();

// ✅ GET /api/announcements - Get all announcements
router.get('/', async (req, res) => {
  try {
    const { limit = 10, page = 1, category, priority, search } = req.query;

    // Mock announcements data
    const announcements = [
      {
        id: 1,
        title: 'Welcome to SchoolBridge!',
        description: 'Your comprehensive school management system is now live and ready to use.',
        content: 'We are excited to introduce SchoolBridge, your new school management platform. This system will help students, teachers, and parents stay connected and organized.',
        category: 'System',
        priority: 'high',
        author: 'System Administrator',
        authorRole: 'Admin',
        date: new Date().toISOString(),
        read: false,
        attachments: [],
        tags: ['welcome', 'system', 'introduction']
      },
      {
        id: 2,
        title: 'Scheduled Maintenance Notice',
        description: 'System maintenance will be performed this weekend.',
        content: 'We will be performing scheduled maintenance on Saturday from 2:00 AM to 4:00 AM. The system may be temporarily unavailable during this time.',
        category: 'Maintenance',
        priority: 'medium',
        author: 'IT Team',
        authorRole: 'Admin',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        read: false,
        attachments: [],
        tags: ['maintenance', 'system', 'weekend']
      },
      {
        id: 3,
        title: 'New Assignment Posted',
        description: 'Math Assignment 5 has been posted for Grade 10.',
        content: 'Students in Grade 10 Mathematics class, please check your assignments section for the new algebra problems assignment due next Friday.',
        category: 'Academic',
        priority: 'high',
        author: 'Mr. Johnson',
        authorRole: 'Teacher',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        read: true,
        attachments: ['math_assignment_5.pdf'],
        tags: ['assignment', 'mathematics', 'grade10']
      }
    ];

    // Filter announcements
    let filteredAnnouncements = announcements;

    if (category && category !== 'All') {
      filteredAnnouncements = filteredAnnouncements.filter(a =>
        a.category.toLowerCase().includes(category.toLowerCase())
      );
    }

    if (priority) {
      filteredAnnouncements = filteredAnnouncements.filter(a => a.priority === priority);
    }

    if (search) {
      filteredAnnouncements = filteredAnnouncements.filter(a =>
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Pagination
    const total = filteredAnnouncements.length;
    const startIndex = (page - 1) * limit;
    const paginatedAnnouncements = filteredAnnouncements
      .slice(startIndex, startIndex + parseInt(limit));

    res.status(HTTP_STATUS.OK).json(
      createResponse(true, 'Announcements retrieved successfully', {
        announcements: paginatedAnnouncements,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        },
        categories: ['All', 'System', 'Academic', 'Maintenance', 'Events', 'Sports']
      })
    );

  } catch (error) {
    const errorInfo = handleError(error, 'Get announcements');
    res.status(errorInfo.status).json(
      createResponse(false, errorInfo.message, null, errorInfo.details)
    );
  }
});

// ✅ GET /api/announcements/categories - Get announcement categories
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      { id: 'all', name: 'All', count: 25 },
      { id: 'system', name: 'System', count: 5 },
      { id: 'academic', name: 'Academic', count: 12 },
      { id: 'maintenance', name: 'Maintenance', count: 3 },
      { id: 'events', name: 'Events', count: 4 },
      { id: 'sports', name: 'Sports', count: 1 }
    ];

    res.status(HTTP_STATUS.OK).json(
      createResponse(true, 'Categories retrieved successfully', { categories })
    );

  } catch (error) {
    const errorInfo = handleError(error, 'Get categories');
    res.status(errorInfo.status).json(
      createResponse(false, errorInfo.message, null, errorInfo.details)
    );
  }
});

export default router;
