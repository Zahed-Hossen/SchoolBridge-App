import Student from '../models/Student.js';
import Class from '../models/Class.js';

// @desc    Get all students
// @route   GET /api/students
// @access  Private
export async function getStudents(req, res, next) {
  try {
    const students = await Student.find();
    
    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private
export const getStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: student
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get student's classes
// @route   GET /api/students/:id/classes
// @access  Private
export const getStudentClasses = async (req, res, next) => {
  try {
    const classes = await Class.find({ students: req.params.id })
      .populate('teacher', 'name email')
      .populate('assignments', 'title dueDate');
    
    res.status(200).json({
      success: true,
      count: classes.length,
      data: classes
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update student profile
// @route   PUT /api/students/:id
// @access  Private
export const updateStudent = async (req, res, next) => {
  try {
    let student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }
    
    // Make sure user is the student or has admin role
    if (student._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this student'
      });
    }
    
    student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: student
    });
  } catch (err) {
    next(err);
  }
};
