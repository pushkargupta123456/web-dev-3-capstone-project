import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { sendSuccess } from '../utils/response';
import Student from '../models/Student';
import Faculty from '../models/Faculty';
import Course from '../models/Course';
import Section from '../models/Section';
import Enrolment from '../models/Enrolment';
import ClassSession from '../models/ClassSession';
import Attendance from '../models/Attendance';
import Announcement from '../models/Announcement';
import Notification from '../models/Notification';

export const getAdminDashboard = asyncHandler(async (req: AuthRequest, res: Response) => {
  const [
    totalStudents,
    totalFaculty,
    totalCourses,
    totalSections,
    totalEnrolments,
  ] = await Promise.all([
    Student.countDocuments({ isActive: true }),
    Faculty.countDocuments({ isActive: true }),
    Course.countDocuments({ isActive: true }),
    Section.countDocuments({ isActive: true }),
    Enrolment.countDocuments({ isActive: true }),
  ]);

  const attendanceStats = await Attendance.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        present: { $sum: { $cond: [{ $in: ['$status', ['PRESENT', 'LATE']] }, 1, 0] } },
      },
    },
    {
      $addFields: {
        averageAttendance: {
          $round: [{ $multiply: [{ $divide: ['$present', { $max: ['$total', 1] }] }, 100] }, 2],
        },
      },
    },
  ]);

  const departmentDistribution = await Student.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$department', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const courseEnrolmentStats = await Enrolment.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$courseId', count: { $sum: 1 } } },
    {
      $lookup: { from: 'courses', localField: '_id', foreignField: '_id', as: 'course' },
    },
    { $unwind: '$course' },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  const monthlyActivity = await ClassSession.aggregate([
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
        },
        sessions: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 },
  ]);

  const recentAnnouncements = await Announcement.find({ isPublished: true })
    .populate('postedBy', 'name role')
    .sort({ createdAt: -1 })
    .limit(5);

  sendSuccess(res, {
    stats: {
      totalStudents,
      totalFaculty,
      totalCourses,
      totalSections,
      totalEnrolments,
      averageAttendance: attendanceStats[0]?.averageAttendance || 0,
    },
    departmentDistribution,
    courseEnrolmentStats,
    monthlyActivity: monthlyActivity.reverse(),
    recentAnnouncements,
  }, 'Admin dashboard data fetched');
});

export const getFacultyDashboard = asyncHandler(async (req: AuthRequest, res: Response) => {
  const faculty = await Faculty.findOne({ userId: req.user?.id });
  if (!faculty) {
    return sendSuccess(res, { sections: [], stats: {} }, 'Dashboard data fetched');
  }

  const sections = await Section.find({ facultyId: faculty._id, isActive: true })
    .populate('courseId', 'title courseCode department credits');

  const sectionIds = sections.map(s => s._id);
  const courseIds = [...new Set(sections.map(s => (s.courseId as any)?._id?.toString() || s.courseId.toString()))];

  const [totalStudents, totalSessions, recentAnnouncements, unreadNotifications] = await Promise.all([
    Enrolment.countDocuments({ sectionId: { $in: sectionIds }, isActive: true }),
    ClassSession.countDocuments({ sectionId: { $in: sectionIds } }),
    Announcement.find({ $or: [{ scope: 'UNIVERSITY' }, { scope: 'COURSE', courseId: { $in: courseIds } }] })
      .populate('postedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(5),
    Notification.countDocuments({ userId: req.user?.id, isRead: false }),
  ]);

  const attendanceStats = await Attendance.aggregate([
    { $match: { sectionId: { $in: sectionIds } } },
    {
      $group: {
        _id: '$courseId',
        total: { $sum: 1 },
        present: { $sum: { $cond: [{ $in: ['$status', ['PRESENT', 'LATE']] }, 1, 0] } },
      },
    },
    {
      $addFields: {
        percentage: {
          $round: [{ $multiply: [{ $divide: ['$present', { $max: ['$total', 1] }] }, 100] }, 2],
        },
      },
    },
    { $lookup: { from: 'courses', localField: '_id', foreignField: '_id', as: 'course' } },
    { $unwind: '$course' },
  ]);

  sendSuccess(res, {
    faculty,
    sections,
    stats: { totalStudents, totalSessions, totalSections: sections.length, unreadNotifications },
    attendanceStats,
    recentAnnouncements,
  }, 'Faculty dashboard data fetched');
});

export const getStudentDashboard = asyncHandler(async (req: AuthRequest, res: Response) => {
  const student = await Student.findOne({ userId: req.user?.id }).populate('userId', 'name email');
  if (!student) {
    return sendSuccess(res, { enrolments: [], stats: {} }, 'Dashboard data fetched');
  }

  const enrolments = await Enrolment.find({ studentId: student._id, isActive: true })
    .populate('courseId', 'title courseCode department credits semester')
    .populate({
      path: 'sectionId',
      populate: { path: 'facultyId', populate: { path: 'userId', select: 'name' } },
    });

  const courseIds = enrolments.map(e => (e.courseId as any)?._id || e.courseId);

  const attendanceSummary = await Attendance.aggregate([
    { $match: { studentId: student._id } },
    {
      $group: {
        _id: '$courseId',
        total: { $sum: 1 },
        present: { $sum: { $cond: [{ $eq: ['$status', 'PRESENT'] }, 1, 0] } },
        late: { $sum: { $cond: [{ $eq: ['$status', 'LATE'] }, 1, 0] } },
        absent: { $sum: { $cond: [{ $eq: ['$status', 'ABSENT'] }, 1, 0] } },
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
  ]);

  const sectionIds = enrolments.map(e => (e.sectionId as any)?._id || e.sectionId);
  const [recentAnnouncements, unreadNotifications] = await Promise.all([
    Announcement.find({
      $or: [
        { scope: 'UNIVERSITY' },
        { scope: 'COURSE', courseId: { $in: courseIds } },
        { scope: 'SECTION', sectionId: { $in: sectionIds } },
      ],
      isPublished: true,
    })
      .populate('postedBy', 'name role')
      .sort({ createdAt: -1 })
      .limit(5),
    Notification.countDocuments({ userId: req.user?.id, isRead: false }),
  ]);

  const overallAttendance = attendanceSummary.reduce(
    (acc, item) => {
      acc.total += item.total;
      acc.attended += item.attended;
      return acc;
    },
    { total: 0, attended: 0 }
  );

  sendSuccess(res, {
    student,
    enrolments,
    attendanceSummary,
    stats: {
      totalCourses: enrolments.length,
      overallAttendance: overallAttendance.total > 0
        ? Math.round((overallAttendance.attended / overallAttendance.total) * 100)
        : 0,
      unreadNotifications,
    },
    recentAnnouncements,
  }, 'Student dashboard data fetched');
});
