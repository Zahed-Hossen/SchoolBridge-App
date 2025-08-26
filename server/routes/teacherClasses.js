import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getClass,
  createClass,
  updateClass,
  deleteClass,
} from '../controllers/teacherController.js';

const router = express.Router();

// All routes are protected and require authentication
router.use(protect);

// Class by ID endpoints
router.route('/:id').get(getClass).put(updateClass).delete(deleteClass);

// Create class endpoint
router.route('/').post(createClass);

export default router;
