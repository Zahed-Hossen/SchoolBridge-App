import Class from '../models/Class.js';
import User from '../models/User.js';

// Add a student to a class (create student if not exists)
export const addStudentToClass = async (req, res, next) => {
  try {
    let { name, fullName, email, rollNumber } = req.body;
    const { classId } = req.params;
    // Accept either name or fullName
    name = name || fullName;
    if (!name || !email || !rollNumber) {
      return res
        .status(400)
        .json({ success: false, error: 'All fields required' });
    }
    let student = await User.findOne({ email });
    if (!student) {
      student = await User.create({ name, email, rollNumber, role: 'student' });
    }
    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      return res.status(404).json({ success: false, error: 'Class not found' });
    }
    if (!classDoc.students.includes(student._id)) {
      classDoc.students.push(student._id);
      await classDoc.save();
    }
    res.status(200).json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
};

// List students in a class
export const getClassStudents = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const classDoc = await Class.findById(classId).populate(
      'students',
      'name email rollNumber',
    );
    if (!classDoc) {
      return res.status(404).json({ success: false, error: 'Class not found' });
    }
    res.status(200).json({ success: true, data: classDoc.students });
  } catch (err) {
    next(err);
  }
};

// Remove student from class
export const removeStudentFromClass = async (req, res, next) => {
  try {
    const { classId, studentId } = req.params;
    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      return res.status(404).json({ success: false, error: 'Class not found' });
    }
    classDoc.students = classDoc.students.filter(
      (id) => id.toString() !== studentId,
    );
    await classDoc.save();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
