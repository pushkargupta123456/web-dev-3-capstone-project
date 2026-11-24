import mongoose, { Document, Schema } from 'mongoose';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';

export interface IAttendance extends Document {
  _id: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  classSessionId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  sectionId: mongoose.Types.ObjectId;
  status: AttendanceStatus;
  markedBy: mongoose.Types.ObjectId;
  remark?: string;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    classSessionId: { type: Schema.Types.ObjectId, ref: 'ClassSession', required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
    status: { type: String, enum: ['PRESENT', 'ABSENT', 'LATE'], required: true },
    markedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    remark: { type: String },
  },
  { timestamps: true }
);

// Prevent duplicate attendance
attendanceSchema.index({ studentId: 1, classSessionId: 1 }, { unique: true });
attendanceSchema.index({ courseId: 1, sectionId: 1 });
attendanceSchema.index({ studentId: 1, courseId: 1 });

export default mongoose.model<IAttendance>('Attendance', attendanceSchema);
