import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getTeacherClasses,
  getClass,
  createClass,
  updateClass,
  deleteClass,
  getAllAssignments,
  addNewAssignment,
  updateAssignment,
  deleteAssignment,
} from '../controllers/teacherController.js';

const router = express.Router();

// All routes are protected and require authentication
router.use(protect);

// Only teacher-specific class route
router.route('/:teacherId/classes').get(getTeacherClasses);

// Assignment CRUD endpoints for teacher
router
  .route('/:teacherId/assignments')
  .get(getAllAssignments) // Get all assignments for a teacher
  .post(addNewAssignment); // Create new assignment

router
  .route('/:teacherId/assignments/:id')
  .put(updateAssignment) // Update assignment
  .delete(deleteAssignment); // Delete assignment

export default router;
