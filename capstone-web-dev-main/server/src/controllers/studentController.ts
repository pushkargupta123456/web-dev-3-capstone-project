import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import { createAuditLog } from '../utils/auditLogger';
import User from '../models/User';
import Student from '../models/Student';
import mongoose from 'mongoose';

export const getStudents = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = req.query.search as string;
  const department = req.query.department as string;
  const semester = req.query.semester as string;
  const skip = (page - 1) * limit;

  const studentQuery: any = { isActive: true };

  if (department) studentQuery.department = department;
  if (semester) studentQuery.semester = parseInt(semester);

  if (search) {
    const users = await User.find({
      role: 'STUDENT',
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ],
    }).select('_id');
    const userIds = users.map(u => u._id);

    const studentsWithReg = await Student.find({
      registrationNumber: { $regex: search, $options: 'i' },
    }).select('userId');
    const regUserIds = studentsWithReg.map(s => s.userId);

    const allUserIds = [...new Set([...userIds.map(id => id.toString()), ...regUserIds.map(id => id.toString())])];
    studentQuery.userId = { $in: allUserIds.map(id => new mongoose.Types.ObjectId(id)) };
  }

  const [students, total] = await Promise.all([
    Student.find(studentQuery)
      .populate('userId', 'name email isActive lastLogin')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Student.countDocuments(studentQuery),
  ]);

  sendPaginated(res, students, total, page, limit, 'Students fetched');
});

export const getStudent = asyncHandler(async (req: AuthRequest, res: Response) => {
  const student = await Student.findById(req.params.id).populate('userId', 'name email isActive');
  if (!student) return sendError(res, 'Student not found', 404);
  
  if (req.user?.role === 'STUDENT') {
    const userStudent = await Student.findOne({ userId: req.user.id });
    if (!userStudent || userStudent._id.toString() !== student._id.toString()) {
      return sendError(res, 'Access denied', 403);
    }
  }

  sendSuccess(res, student, 'Student fetched');
});

export const createStudent = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, email, password, registrationNumber, department, semester, academicYear, phone, dateOfBirth, guardianName, guardianPhone, address } = req.body;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) return sendError(res, 'Email already exists', 400);

  const existingReg = await Student.findOne({ registrationNumber });
  if (existingReg) return sendError(res, 'Registration number already exists', 400);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.create([{ name, email: email.toLowerCase(), password, role: 'STUDENT' }], { session });
    const student = await Student.create([{
      userId: user[0]._id,
      registrationNumber,
      department,
      semester,
      academicYear,
      phone,
      dateOfBirth,
      guardianName,
      guardianPhone,
      address,
    }], { session });

    await session.commitTransaction();

    await createAuditLog({
      userId: req.user!.id,
      action: 'CREATE_STUDENT',
      resource: 'students',
      resourceId: student[0]._id.toString(),
      details: { name, email, registrationNumber },
    });

    sendSuccess(res, { user: user[0], student: student[0] }, 'Student created', 201);
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

export const updateStudent = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, email, department, semester, academicYear, phone, dateOfBirth, guardianName, guardianPhone, address, isActive } = req.body;

  const student = await Student.findById(req.params.id);
  if (!student) return sendError(res, 'Student not found', 404);

  if (name || email) {
    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email.toLowerCase();
    await User.findByIdAndUpdate(student.userId, updateData);
  }

  const updatedStudent = await Student.findByIdAndUpdate(
    req.params.id,
    { department, semester, academicYear, phone, dateOfBirth, guardianName, guardianPhone, address, isActive },
    { new: true, runValidators: true }
  ).populate('userId', 'name email');

  await createAuditLog({
    userId: req.user!.id,
    action: 'UPDATE_STUDENT',
    resource: 'students',
    resourceId: req.params.id,
  });

  sendSuccess(res, updatedStudent, 'Student updated');
});

export const deleteStudent = asyncHandler(async (req: AuthRequest, res: Response) => {
  const student = await Student.findById(req.params.id);
  if (!student) return sendError(res, 'Student not found', 404);

  student.isActive = false;
  await student.save();
  await User.findByIdAndUpdate(student.userId, { isActive: false });

  await createAuditLog({
    userId: req.user!.id,
    action: 'DEACTIVATE_STUDENT',
    resource: 'students',
    resourceId: req.params.id,
  });

  sendSuccess(res, null, 'Student deactivated');
});

export const getMyProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const student = await Student.findOne({ userId: req.user?.id }).populate('userId', 'name email lastLogin');
  if (!student) return sendError(res, 'Student profile not found', 404);
  sendSuccess(res, student, 'Profile fetched');
});
