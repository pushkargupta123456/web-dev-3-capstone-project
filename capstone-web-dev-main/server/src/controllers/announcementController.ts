import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import Announcement from '../models/Announcement';
import Notification from '../models/Notification';
import Enrolment from '../models/Enrolment';
import Student from '../models/Student';
import User from '../models/User';
import mongoose from 'mongoose';
import eventBus from '../utils/eventBus';

export const getAnnouncements = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const scope = req.query.scope as string;
  const courseId = req.query.courseId as string;
  const sectionId = req.query.sectionId as string;
  const skip = (page - 1) * limit;

  const query: any = { isPublished: true };
  
  if (scope) query.scope = scope;
  if (courseId) query.courseId = courseId;
  if (sectionId) query.sectionId = sectionId;

  if (req.user?.role === 'STUDENT') {
    const student = await Student.findOne({ userId: req.user.id });
    if (student) {
      const enrolments = await Enrolment.find({ studentId: student._id, isActive: true });
      const courseIds = enrolments.map(e => e.courseId);
      const sectionIds = enrolments.map(e => e.sectionId);
      
      query.$or = [
        { scope: 'UNIVERSITY' },
        { scope: 'COURSE', courseId: { $in: courseIds } },
        { scope: 'SECTION', sectionId: { $in: sectionIds } },
      ];
      delete query.scope;
      delete query.courseId;
      delete query.sectionId;
    }
  }

  const [announcements, total] = await Promise.all([
    Announcement.find(query)
      .populate('postedBy', 'name role')
      .populate('courseId', 'title courseCode')
      .populate('sectionId', 'sectionName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Announcement.countDocuments(query),
  ]);

  sendPaginated(res, announcements, total, page, limit, 'Announcements fetched');
});

export const createAnnouncement = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { title, content, scope, courseId, sectionId, publishAt, expiresAt } = req.body;

  const announcement = await Announcement.create({
    title, content, scope, courseId: courseId || undefined, sectionId: sectionId || undefined,
    postedBy: req.user?.id,
    publishAt, expiresAt,
    isPublished: true,
  });

  let userIds: mongoose.Types.ObjectId[] = [];

  if (scope === 'UNIVERSITY') {
    const users = await User.find({ isActive: true }).select('_id');
    userIds = users.map(u => u._id as mongoose.Types.ObjectId);
  } else if (scope === 'COURSE' && courseId) {
    const enrolments = await Enrolment.find({ courseId, isActive: true })
      .populate({ path: 'studentId', populate: { path: 'userId', select: '_id' } });
    userIds = enrolments.map(e => (e.studentId as any).userId._id);
  } else if (scope === 'SECTION' && sectionId) {
    const enrolments = await Enrolment.find({ sectionId, isActive: true })
      .populate({ path: 'studentId', populate: { path: 'userId', select: '_id' } });
    userIds = enrolments.map(e => (e.studentId as any).userId._id);
  }

  if (userIds.length > 0) {
    const notifications = userIds.map(uid => ({
      userId: uid,
      title: `New Announcement: ${title}`,
      message: content.substring(0, 100),
      type: 'announcement',
      referenceId: announcement._id as mongoose.Types.ObjectId,
      referenceModel: 'Announcement',
    }));
    await Notification.insertMany(notifications);
  }

  const populated = await Announcement.findById(announcement._id)
    .populate('postedBy', 'name role')
    .populate('courseId', 'title courseCode')
    .populate('sectionId', 'sectionName');

  // Trigger Node.js EventEmitter for decoupled real-time push and notification dispatch
  eventBus.emit('ANNOUNCEMENT_CREATED', { announcement: populated, userId: req.user?.id });

  sendSuccess(res, populated, 'Announcement created', 201);
});

export const updateAnnouncement = asyncHandler(async (req: AuthRequest, res: Response) => {
  const announcement = await Announcement.findById(req.params.id);
  if (!announcement) return sendError(res, 'Announcement not found', 404);

  if (req.user?.role !== 'ADMIN' && announcement.postedBy.toString() !== req.user?.id) {
    return sendError(res, 'Not authorized', 403);
  }

  const updated = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .populate('postedBy', 'name role');

  sendSuccess(res, updated, 'Announcement updated');
});

export const deleteAnnouncement = asyncHandler(async (req: AuthRequest, res: Response) => {
  const announcement = await Announcement.findById(req.params.id);
  if (!announcement) return sendError(res, 'Announcement not found', 404);

  if (req.user?.role !== 'ADMIN' && announcement.postedBy.toString() !== req.user?.id) {
    return sendError(res, 'Not authorized', 403);
  }

  await Announcement.findByIdAndDelete(req.params.id);
  sendSuccess(res, null, 'Announcement deleted');
});
