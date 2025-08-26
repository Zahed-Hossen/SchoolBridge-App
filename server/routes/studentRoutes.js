import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getStudents,
  getStudent,
  getStudentClasses,
  updateStudent
} from '../controllers/studentController.js';

const router = express.Router();

// All routes are protected and require authentication
router.use(protect);

// Student routes
router.route('/')
  .get(getStudents);

router.route('/:id')
  .get(getStudent)
  .put(updateStudent);

router.route('/:id/classes')
  .get(getStudentClasses);

export default router;
