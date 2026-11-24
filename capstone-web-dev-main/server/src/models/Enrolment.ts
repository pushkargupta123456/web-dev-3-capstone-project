import mongoose, { Document, Schema } from 'mongoose';

export interface IEnrolment extends Document {
  _id: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  sectionId: mongoose.Types.ObjectId;
  academicYear: string;
  semester: number;
  enrolledAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const enrolmentSchema = new Schema<IEnrolment>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
    academicYear: { type: String, required: true },
    semester: { type: Number, required: true },
    enrolledAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Prevent duplicate enrolments
enrolmentSchema.index({ studentId: 1, sectionId: 1 }, { unique: true });
enrolmentSchema.index({ studentId: 1, courseId: 1, academicYear: 1, semester: 1 });
enrolmentSchema.index({ sectionId: 1 });
enrolmentSchema.index({ courseId: 1 });

export default mongoose.model<IEnrolment>('Enrolment', enrolmentSchema);
