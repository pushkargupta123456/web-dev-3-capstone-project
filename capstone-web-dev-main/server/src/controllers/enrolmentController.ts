import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import { createAuditLog } from '../utils/auditLogger';
import Enrolment from '../models/Enrolment';
import Section from '../models/Section';
import Student from '../models/Student';

export const getEnrolments = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const studentId = req.query.studentId as string;
  const courseId = req.query.courseId as string;
  const sectionId = req.query.sectionId as string;
  const skip = (page - 1) * limit;

  const query: any = { isActive: true };
  if (studentId) query.studentId = studentId;
  if (courseId) query.courseId = courseId;
  if (sectionId) query.sectionId = sectionId;

  if (req.user?.role === 'STUDENT') {
    const student = await Student.findOne({ userId: req.user.id });
    if (student) query.studentId = student._id;
  }

  const [enrolments, total] = await Promise.all([
    Enrolment.find(query)
      .populate({ path: 'studentId', populate: { path: 'userId', select: 'name email' } })
      .populate('courseId', 'title courseCode department credits semester')
      .populate({ path: 'sectionId', populate: [
        { path: 'facultyId', populate: { path: 'userId', select: 'name email' } }
      ]})
      .sort({ enrolledAt: -1 })
      .skip(skip)
      .limit(limit),
    Enrolment.countDocuments(query),
  ]);

  sendPaginated(res, enrolments, total, page, limit, 'Enrolments fetched');
});

export const createEnrolment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { studentId, sectionId } = req.body;

  const section = await Section.findById(sectionId);
  if (!section) return sendError(res, 'Section not found', 404);

  const student = await Student.findById(studentId);
  if (!student) return sendError(res, 'Student not found', 404);

  const existing = await Enrolment.findOne({ studentId, sectionId, isActive: true });
  if (existing) return sendError(res, 'Student already enrolled in this section', 400);

  const enrolledCount = await Enrolment.countDocuments({ sectionId, isActive: true });
  if (enrolledCount >= section.maxStudents) {
    return sendError(res, 'Section is full', 400);
  }

  const enrolment = await Enrolment.create({
    studentId,
    courseId: section.courseId,
    sectionId,
    academicYear: section.academicYear,
    semester: section.semester,
  });

  await createAuditLog({
    userId: req.user!.id,
    action: 'CREATE_ENROLMENT',
    resource: 'enrolments',
    resourceId: enrolment._id.toString(),
    details: { studentId, sectionId },
  });

  const populated = await Enrolment.findById(enrolment._id)
    .populate({ path: 'studentId', populate: { path: 'userId', select: 'name email' } })
    .populate('courseId', 'title courseCode')
    .populate('sectionId', 'sectionName');

  sendSuccess(res, populated, 'Enrolment created', 201);
});

export const deleteEnrolment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const enrolment = await Enrolment.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!enrolment) return sendError(res, 'Enrolment not found', 404);

  await createAuditLog({
    userId: req.user!.id,
    action: 'REMOVE_ENROLMENT',
    resource: 'enrolments',
    resourceId: req.params.id,
  });

  sendSuccess(res, null, 'Enrolment removed');
});
