import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  addStudentToClass,
  getClassStudents,
  removeStudentFromClass,
} from '../controllers/classStudentsController.js';

const router = express.Router({ mergeParams: true });

router.use(protect);

// POST /api/classes/:classId/students - add student
router.post('/:classId/students', addStudentToClass);
// GET /api/classes/:classId/students - list students
router.get('/:classId/students', getClassStudents);
// DELETE /api/classes/:classId/students/:studentId - remove student
router.delete('/:classId/students/:studentId', removeStudentFromClass);

export default router;
