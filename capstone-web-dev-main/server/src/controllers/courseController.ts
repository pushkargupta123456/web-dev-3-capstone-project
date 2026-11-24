import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import { createAuditLog } from '../utils/auditLogger';
import Course from '../models/Course';

export const getCourses = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = req.query.search as string;
  const department = req.query.department as string;
  const semester = req.query.semester as string;
  const skip = (page - 1) * limit;

  const query: any = { isActive: true };
  if (department) query.department = department;
  if (semester) query.semester = parseInt(semester);
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { courseCode: { $regex: search, $options: 'i' } },
    ];
  }

  const [courses, total] = await Promise.all([
    Course.find(query).sort({ courseCode: 1 }).skip(skip).limit(limit),
    Course.countDocuments(query),
  ]);

  sendPaginated(res, courses, total, page, limit, 'Courses fetched');
});

export const getCourse = asyncHandler(async (req: AuthRequest, res: Response) => {
  const course = await Course.findById(req.params.id);
  if (!course) return sendError(res, 'Course not found', 404);
  sendSuccess(res, course, 'Course fetched');
});

export const createCourse = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { courseCode, title, department, credits, semester, description } = req.body;

  const existing = await Course.findOne({ courseCode: courseCode.toUpperCase() });
  if (existing) return sendError(res, 'Course code already exists', 400);

  const course = await Course.create({ courseCode: courseCode.toUpperCase(), title, department, credits, semester, description });

  await createAuditLog({
    userId: req.user!.id,
    action: 'CREATE_COURSE',
    resource: 'courses',
    resourceId: course._id.toString(),
  });

  sendSuccess(res, course, 'Course created', 201);
});

export const updateCourse = asyncHandler(async (req: AuthRequest, res: Response) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!course) return sendError(res, 'Course not found', 404);

  await createAuditLog({
    userId: req.user!.id,
    action: 'UPDATE_COURSE',
    resource: 'courses',
    resourceId: req.params.id,
  });

  sendSuccess(res, course, 'Course updated');
});

export const deleteCourse = asyncHandler(async (req: AuthRequest, res: Response) => {
  const course = await Course.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!course) return sendError(res, 'Course not found', 404);

  await createAuditLog({
    userId: req.user!.id,
    action: 'DELETE_COURSE',
    resource: 'courses',
    resourceId: req.params.id,
  });

  sendSuccess(res, null, 'Course deactivated');
});
