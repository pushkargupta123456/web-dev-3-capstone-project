import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import Student from '../models/Student';
import Attendance from '../models/Attendance';
import mongoose from 'mongoose';

export const exportStudentsCSV = asyncHandler(async (req: AuthRequest, res: Response) => {
  const students = await Student.find({ isActive: true }).populate('userId', 'name email');

  const csvRows = [
    ['Name', 'Email', 'Registration Number', 'Department', 'Semester', 'Academic Year'].join(','),
  ];

  students.forEach((s: any) => {
    csvRows.push([
      `"${s.userId?.name || ''}"`,
      `"${s.userId?.email || ''}"`,
      `"${s.registrationNumber || ''}"`,
      `"${s.department || ''}"`,
      s.semester || '',
      `"${s.academicYear || ''}"`,
    ].join(','));
  });

  const csv = csvRows.join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="students.csv"');
  res.status(200).send(csv);
});

export const exportAttendanceCSV = asyncHandler(async (req: AuthRequest, res: Response) => {
  const courseId = req.query.courseId as string;
  const threshold = parseInt(req.query.threshold as string) || 75;

  const matchStage: any = {};
  if (courseId) matchStage.courseId = new mongoose.Types.ObjectId(courseId);

  const data = await Attendance.aggregate([
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
          $round: [{ $multiply: [{ $divide: ['$attended', { $max: ['$total', 1] }] }, 100] }, 2],
        },
      },
    },
    { $lookup: { from: 'students', localField: '_id.studentId', foreignField: '_id', as: 'student' } },
    { $unwind: '$student' },
    { $lookup: { from: 'users', localField: 'student.userId', foreignField: '_id', as: 'user' } },
    { $unwind: '$user' },
    { $lookup: { from: 'courses', localField: '_id.courseId', foreignField: '_id', as: 'course' } },
    { $unwind: '$course' },
  ]);

  const csvRows = [
    ['Name', 'Email', 'Registration Number', 'Course', 'Course Code', 'Total Classes', 'Classes Attended', 'Attendance %', 'Status'].join(','),
  ];

  data.forEach((d: any) => {
    csvRows.push([
      `"${d.user?.name || ''}"`,
      `"${d.user?.email || ''}"`,
      `"${d.student?.registrationNumber || ''}"`,
      `"${d.course?.title || ''}"`,
      `"${d.course?.courseCode || ''}"`,
      d.total,
      d.attended,
      d.percentage,
      d.percentage >= threshold ? 'OK' : 'LOW',
    ].join(','));
  });

  const csv = csvRows.join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="attendance_report.csv"');
  res.status(200).send(csv);
});
