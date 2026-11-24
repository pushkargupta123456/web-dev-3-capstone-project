import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import { createAuditLog } from '../utils/auditLogger';
import User from '../models/User';
import Faculty from '../models/Faculty';
import Section from '../models/Section';
import mongoose from 'mongoose';

export const getFaculty = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = req.query.search as string;
  const department = req.query.department as string;
  const skip = (page - 1) * limit;

  const facultyQuery: any = { isActive: true };
  if (department) facultyQuery.department = department;

  if (search) {
    const users = await User.find({
      role: 'FACULTY',
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ],
    }).select('_id');
    facultyQuery.userId = { $in: users.map(u => u._id) };
  }

  const [faculty, total] = await Promise.all([
    Faculty.find(facultyQuery).populate('userId', 'name email isActive').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Faculty.countDocuments(facultyQuery),
  ]);

  sendPaginated(res, faculty, total, page, limit, 'Faculty fetched');
});

export const getFacultyById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const faculty = await Faculty.findById(req.params.id).populate('userId', 'name email');
  if (!faculty) return sendError(res, 'Faculty not found', 404);
  
  const sections = await Section.find({ facultyId: faculty._id, isActive: true }).populate('courseId', 'title courseCode');
  sendSuccess(res, { faculty, sections }, 'Faculty fetched');
});

export const createFaculty = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, email, password, employeeId, department, designation, qualification, phone, joiningDate } = req.body;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) return sendError(res, 'Email already exists', 400);

  const existingEmp = await Faculty.findOne({ employeeId });
  if (existingEmp) return sendError(res, 'Employee ID already exists', 400);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.create([{ name, email: email.toLowerCase(), password, role: 'FACULTY' }], { session });
    const faculty = await Faculty.create([{
      userId: user[0]._id,
      employeeId,
      department,
      designation,
      qualification,
      phone,
      joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
    }], { session });

    await session.commitTransaction();

    await createAuditLog({
      userId: req.user!.id,
      action: 'CREATE_FACULTY',
      resource: 'faculty',
      resourceId: faculty[0]._id.toString(),
    });

    sendSuccess(res, { user: user[0], faculty: faculty[0] }, 'Faculty created', 201);
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

export const updateFaculty = asyncHandler(async (req: AuthRequest, res: Response) => {
  const faculty = await Faculty.findById(req.params.id);
  if (!faculty) return sendError(res, 'Faculty not found', 404);

  const { name, email, department, designation, qualification, phone, joiningDate, isActive } = req.body;

  if (name || email) {
    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email.toLowerCase();
    await User.findByIdAndUpdate(faculty.userId, updateData);
  }

  const updated = await Faculty.findByIdAndUpdate(
    req.params.id,
    { department, designation, qualification, phone, joiningDate, isActive },
    { new: true }
  ).populate('userId', 'name email');

  await createAuditLog({
    userId: req.user!.id,
    action: 'UPDATE_FACULTY',
    resource: 'faculty',
    resourceId: req.params.id,
  });

  sendSuccess(res, updated, 'Faculty updated');
});

export const deleteFaculty = asyncHandler(async (req: AuthRequest, res: Response) => {
  const faculty = await Faculty.findById(req.params.id);
  if (!faculty) return sendError(res, 'Faculty not found', 404);

  faculty.isActive = false;
  await faculty.save();
  await User.findByIdAndUpdate(faculty.userId, { isActive: false });

  await createAuditLog({
    userId: req.user!.id,
    action: 'DEACTIVATE_FACULTY',
    resource: 'faculty',
    resourceId: req.params.id,
  });

  sendSuccess(res, null, 'Faculty deactivated');
});

export const getMyFacultyProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const faculty = await Faculty.findOne({ userId: req.user?.id }).populate('userId', 'name email');
  if (!faculty) return sendError(res, 'Faculty profile not found', 404);
  
  const sections = await Section.find({ facultyId: faculty._id, isActive: true })
    .populate('courseId', 'title courseCode department credits');
  
  sendSuccess(res, { faculty, sections }, 'Faculty profile fetched');
});
