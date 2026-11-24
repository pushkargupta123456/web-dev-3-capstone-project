import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import { createAuditLog } from '../utils/auditLogger';
import Section from '../models/Section';
import Enrolment from '../models/Enrolment';
import Faculty from '../models/Faculty';

export const getSections = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const courseId = req.query.courseId as string;
  const facultyId = req.query.facultyId as string;
  const academicYear = req.query.academicYear as string;
  const skip = (page - 1) * limit;

  const query: any = { isActive: true };
  if (courseId) query.courseId = courseId;
  if (facultyId) query.facultyId = facultyId;
  if (academicYear) query.academicYear = academicYear;

  if (req.user?.role === 'FACULTY') {
    const faculty = await Faculty.findOne({ userId: req.user.id });
    if (faculty) query.facultyId = faculty._id;
  }

  const [sections, total] = await Promise.all([
    Section.find(query)
      .populate('courseId', 'title courseCode department credits semester')
      .populate({ path: 'facultyId', populate: { path: 'userId', select: 'name email' } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Section.countDocuments(query),
  ]);

  sendPaginated(res, sections, total, page, limit, 'Sections fetched');
});

export const getSectionById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const section = await Section.findById(req.params.id)
    .populate('courseId', 'title courseCode department credits')
    .populate({ path: 'facultyId', populate: { path: 'userId', select: 'name email' } });
    
  if (!section) return sendError(res, 'Section not found', 404);

  const enrolments = await Enrolment.find({ sectionId: section._id, isActive: true })
    .populate({ path: 'studentId', populate: { path: 'userId', select: 'name email' } });

  sendSuccess(res, { section, enrolments, totalEnrolled: enrolments.length }, 'Section fetched');
});

export const createSection = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { sectionName, courseId, facultyId, academicYear, semester, roomNumber, schedule, maxStudents } = req.body;

  const section = await Section.create({
    sectionName, courseId, facultyId, academicYear, semester, roomNumber, schedule, maxStudents,
  });

  await createAuditLog({
    userId: req.user!.id,
    action: 'CREATE_SECTION',
    resource: 'sections',
    resourceId: section._id.toString(),
  });

  const populated = await Section.findById(section._id)
    .populate('courseId', 'title courseCode')
    .populate({ path: 'facultyId', populate: { path: 'userId', select: 'name email' } });

  sendSuccess(res, populated, 'Section created', 201);
});

export const updateSection = asyncHandler(async (req: AuthRequest, res: Response) => {
  const section = await Section.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .populate('courseId', 'title courseCode')
    .populate({ path: 'facultyId', populate: { path: 'userId', select: 'name email' } });
    
  if (!section) return sendError(res, 'Section not found', 404);

  await createAuditLog({
    userId: req.user!.id,
    action: 'UPDATE_SECTION',
    resource: 'sections',
    resourceId: req.params.id,
  });

  sendSuccess(res, section, 'Section updated');
});

export const deleteSection = asyncHandler(async (req: AuthRequest, res: Response) => {
  const section = await Section.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!section) return sendError(res, 'Section not found', 404);

  sendSuccess(res, null, 'Section deactivated');
});
