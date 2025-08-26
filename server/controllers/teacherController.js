// Get all assignments for a teacher
// GET /api/teachers/:teacherId/assignments
export const getAllAssignments = async (req, res, next) => {
  try {
    const assignments = await Assignment.find({
      teacher: req.params.teacherId,
    }).populate('class', 'name');
    res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments,
    });
  } catch (err) {
    next(err);
  }
};

// Create new assignment
// POST /api/teachers/:teacherId/assignments
export const addNewAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.create({
      ...req.body,
      teacher: req.params.teacherId,
    });
    res.status(201).json({
      success: true,
      data: assignment,
    });
  } catch (err) {
    next(err);
  }
};

// Update assignment
// PUT /api/teachers/:teacherId/assignments/:id
export const updateAssignment = async (req, res, next) => {
  try {
    let assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res
        .status(404)
        .json({ success: false, error: 'Assignment not found' });
    }
    // Only teacher who owns the assignment can update
    if (assignment.teacher.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }
    assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ success: true, data: assignment });
  } catch (err) {
    next(err);
  }
};

// Delete assignment
// DELETE /api/teachers/:teacherId/assignments/:id
export const deleteAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res
        .status(404)
        .json({ success: false, error: 'Assignment not found' });
    }
    // Only teacher who owns the assignment can delete
    if (assignment.teacher.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }
    await assignment.remove();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
import Class from '../models/Class.js';
import Assignment from '../models/Assignment.js';

// Get all classes for a teacher
// GET /api/teachers/:teacherId/classes
export const getTeacherClasses = async (req, res, next) => {
  try {
    const classes = await Class.find({ teacher: req.params.teacherId })
      .populate('students', 'name email')
      .populate('assignments', 'title dueDate');

    res.status(200).json({
      success: true,
      count: classes.length,
      data: classes,
    });
  } catch (err) {
    next(err);
  }
};

// Get single class
// GET /api/classes/:id
export const getClass = async (req, res, next) => {
  try {
    const classItem = await Class.findById(req.params.id)
      .populate('students', 'name email')
      .populate('assignments', 'title description dueDate')
      .populate('teacher', 'name email');

    if (!classItem) {
      return res.status(404).json({
        success: false,
        error: 'Class not found',
      });
    }

    res.status(200).json({
      success: true,
      data: classItem,
    });
  } catch (err) {
    next(err);
  }
};

// Create class
// POST /api/classes
export const createClass = async (req, res, next) => {
  try {
    // Add teacher to the class data (fix: use req.user.userId as set by auth middleware)
    req.body.teacher = req.user.userId;
    const newClass = await Class.create(req.body);
    res.status(201).json({
      success: true,
      data: newClass,
    });
  } catch (err) {
    next(err);
  }
};

// Update class
// PUT /api/classes/:id
export const updateClass = async (req, res, next) => {
  try {
    let classItem = await Class.findById(req.params.id);

    if (!classItem) {
      return res.status(404).json({
        success: false,
        error: 'Class not found',
      });
    }

    // Make sure user is class owner
    if (classItem.teacher.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this class',
      });
    }

    classItem = await Class.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: classItem,
    });
  } catch (err) {
    next(err);
  }
};

// Delete class
// DELETE /api/classes/:id
export const deleteClass = async (req, res, next) => {
  try {
    const classItem = await Class.findById(req.params.id);

    if (!classItem) {
      return res.status(404).json({
        success: false,
        error: 'Class not found',
      });
    }

    // Make sure user is class owner
    if (classItem.teacher.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this class',
      });
    }

    await classItem.remove();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};
