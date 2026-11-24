import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import { createAuditLog } from '../utils/auditLogger';
import ClassSession from '../models/ClassSession';
import Attendance from '../models/Attendance';
import Faculty from '../models/Faculty';
import Student from '../models/Student';
import Section from '../models/Section';
import mongoose from 'mongoose';
import eventBus from '../utils/eventBus';

export const createSession = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { courseId, sectionId, date, startTime, endTime, topic } = req.body;

  let facultyId: string;

  if (req.user?.role === 'FACULTY') {
    const faculty = await Faculty.findOne({ userId: req.user.id });
    if (!faculty) return sendError(res, 'Faculty profile not found', 404);
    
    const section = await Section.findOne({ _id: sectionId, facultyId: faculty._id, courseId });
    if (!section) return sendError(res, 'You are not authorized for this section', 403);
    facultyId = faculty._id.toString();
  } else {
    facultyId = req.body.facultyId;
  }

  const section = await Section.findById(sectionId);
  if (!section) return sendError(res, 'Section not found', 404);

  const session = await ClassSession.create({
    courseId, sectionId,
    facultyId: new mongoose.Types.ObjectId(facultyId),
    date: new Date(date),
    startTime, endTime, topic,
    academicYear: section.academicYear,
    semester: section.semester,
  });

  sendSuccess(res, session, 'Class session created', 201);
});

export const getSessions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const courseId = req.query.courseId as string;
  const sectionId = req.query.sectionId as string;
  const skip = (page - 1) * limit;

  const query: any = {};
  if (courseId) query.courseId = courseId;
  if (sectionId) query.sectionId = sectionId;

  if (req.user?.role === 'FACULTY') {
    const faculty = await Faculty.findOne({ userId: req.user.id });
    if (faculty) query.facultyId = faculty._id;
  }

  const [sessions, total] = await Promise.all([
    ClassSession.find(query)
      .populate('courseId', 'title courseCode')
      .populate('sectionId', 'sectionName')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit),
    ClassSession.countDocuments(query),
  ]);

  sendPaginated(res, sessions, total, page, limit, 'Sessions fetched');
});

export const markAttendance = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { classSessionId, attendanceData } = req.body;

  const session = await ClassSession.findById(classSessionId);
  if (!session) return sendError(res, 'Class session not found', 404);

  if (req.user?.role === 'FACULTY') {
    const faculty = await Faculty.findOne({ userId: req.user.id });
    if (!faculty || session.facultyId.toString() !== faculty._id.toString()) {
      return sendError(res, 'Not authorized to mark attendance for this session', 403);
    }
  }

  const operations = attendanceData.map((item: { studentId: string; status: string }) => ({
    updateOne: {
      filter: { studentId: new mongoose.Types.ObjectId(item.studentId), classSessionId: session._id },
      update: {
        $set: {
          studentId: new mongoose.Types.ObjectId(item.studentId),
          classSessionId: session._id,
          courseId: session.courseId,
          sectionId: session.sectionId,
          status: item.status,
          markedBy: new mongoose.Types.ObjectId(req.user?.id),
        },
      },
      upsert: true,
    },
  }));

  await Attendance.bulkWrite(operations);
  
  session.isCompleted = true;
  await session.save();

  await createAuditLog({
    userId: req.user!.id,
    action: 'MARK_ATTENDANCE',
    resource: 'attendance',
    resourceId: classSessionId,
    details: { count: attendanceData.length },
  });

  // Trigger Node.js EventEmitter for decoupled absent notification & low attendance alert processing
  eventBus.emit('ATTENDANCE_MARKED', {
    session,
    attendanceRecords: attendanceData,
    facultyUserId: req.user!.id,
  });

  sendSuccess(res, null, 'Attendance marked successfully');
});

export const updateAttendance = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { status, remark } = req.body;
  
  const attendance = await Attendance.findById(req.params.id).populate('classSessionId');
  if (!attendance) return sendError(res, 'Attendance record not found', 404);

  const session = attendance.classSessionId as any;
  
  if (req.user?.role === 'FACULTY') {
    const faculty = await Faculty.findOne({ userId: req.user.id });
    if (!faculty || session.facultyId.toString() !== faculty._id.toString()) {
      return sendError(res, 'Not authorized to edit this attendance', 403);
    }
  }

  const oldStatus = attendance.status;
  attendance.status = status;
  if (remark !== undefined) attendance.remark = remark;
  await attendance.save();

  await createAuditLog({
    userId: req.user!.id,
    action: 'UPDATE_ATTENDANCE',
    resource: 'attendance',
    resourceId: req.params.id,
    details: { oldStatus, newStatus: status, remark },
  });

  sendSuccess(res, attendance, 'Attendance updated');
});

export const getStudentAttendance = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { studentId } = req.params;
  const courseId = req.query.courseId as string;

  if (req.user?.role === 'STUDENT') {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student || student._id.toString() !== studentId) {
      return sendError(res, 'Access denied', 403);
    }
  }

  const matchStage: any = { studentId: new mongoose.Types.ObjectId(studentId) };
  if (courseId) matchStage.courseId = new mongoose.Types.ObjectId(courseId);

  const attendanceSummary = await Attendance.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$courseId',
        total: { $sum: 1 },
        present: { $sum: { $cond: [{ $eq: ['$status', 'PRESENT'] }, 1, 0] } },
        absent: { $sum: { $cond: [{ $eq: ['$status', 'ABSENT'] }, 1, 0] } },
        late: { $sum: { $cond: [{ $eq: ['$status', 'LATE'] }, 1, 0] } },
      },
    },
    {
      $addFields: {
        attended: { $add: ['$present', '$late'] },
        percentage: {
          $round: [{
            $multiply: [
              { $divide: [{ $add: ['$present', '$late'] }, { $max: ['$total', 1] }] },
              100,
            ],
          }, 2],
        },
      },
    },
    {
      $lookup: {
        from: 'courses',
        localField: '_id',
        foreignField: '_id',
        as: 'course',
      },
    },
    { $unwind: '$course' },
  ]);

  const detailedAttendance = await Attendance.find(matchStage)
    .populate('classSessionId', 'date startTime endTime topic')
    .populate('courseId', 'title courseCode')
    .sort({ createdAt: -1 });

  sendSuccess(res, { summary: attendanceSummary, detailed: detailedAttendance }, 'Attendance fetched');
});

export const getCourseAttendance = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { courseId } = req.params;
  const sectionId = req.query.sectionId as string;

  const matchStage: any = { courseId: new mongoose.Types.ObjectId(courseId) };
  if (sectionId) matchStage.sectionId = new mongoose.Types.ObjectId(sectionId);

  const studentSummary = await Attendance.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$studentId',
        total: { $sum: 1 },
        present: { $sum: { $cond: [{ $eq: ['$status', 'PRESENT'] }, 1, 0] } },
        absent: { $sum: { $cond: [{ $eq: ['$status', 'ABSENT'] }, 1, 0] } },
        late: { $sum: { $cond: [{ $eq: ['$status', 'LATE'] }, 1, 0] } },
      },
    },
    {
      $addFields: {
        attended: { $add: ['$present', '$late'] },
        percentage: {
          $round: [{
            $multiply: [
              { $divide: [{ $add: ['$present', '$late'] }, { $max: ['$total', 1] }] },
              100,
            ],
          }, 2],
        },
      },
    },
    {
      $lookup: {
        from: 'students',
        localField: '_id',
        foreignField: '_id',
        as: 'student',
      },
    },
    { $unwind: '$student' },
    {
      $lookup: {
        from: 'users',
        localField: 'student.userId',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
  ]);

  sendSuccess(res, studentSummary, 'Course attendance fetched');
});

export const getAttendanceReports = asyncHandler(async (req: AuthRequest, res: Response) => {
  const threshold = parseInt(req.query.threshold as string) || 75;
  const courseId = req.query.courseId as string;
  
  const matchStage: any = {};
  if (courseId) matchStage.courseId = new mongoose.Types.ObjectId(courseId);

  const lowAttendance = await Attendance.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: { studentId: '$studentId', courseId: '$courseId' },
        total: { $sum: 1 },
        attended: { $sum: { $cond: [{ $in: ['$status', ['PRESENT', 'LATE']] }, 1, 0] } },
      },
    },
    {
      $addFields: {
        percentage: {
          $round: [{
            $multiply: [
              { $divide: ['$attended', { $max: ['$total', 1] }] },
              100,
            ],
          }, 2],
        },
      },
    },
    { $match: { percentage: { $lt: threshold } } },
    {
      $lookup: { from: 'students', localField: '_id.studentId', foreignField: '_id', as: 'student' },
    },
    { $unwind: '$student' },
    {
      $lookup: { from: 'users', localField: 'student.userId', foreignField: '_id', as: 'user' },
    },
    { $unwind: '$user' },
    {
      $lookup: { from: 'courses', localField: '_id.courseId', foreignField: '_id', as: 'course' },
    },
    { $unwind: '$course' },
    { $sort: { percentage: 1 } },
  ]);

  sendSuccess(res, { lowAttendance, threshold }, 'Attendance report generated');
});
