import mongoose, { Document, Schema } from 'mongoose';

export interface ISection extends Document {
  _id: mongoose.Types.ObjectId;
  sectionName: string;
  courseId: mongoose.Types.ObjectId;
  facultyId: mongoose.Types.ObjectId;
  academicYear: string;
  semester: number;
  roomNumber?: string;
  schedule?: Array<{
    day: string;
    startTime: string;
    endTime: string;
  }>;
  maxStudents: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const sectionSchema = new Schema<ISection>(
  {
    sectionName: { type: String, required: true, trim: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    facultyId: { type: Schema.Types.ObjectId, ref: 'Faculty', required: true },
    academicYear: { type: String, required: true },
    semester: { type: Number, required: true, min: 1, max: 10 },
    roomNumber: { type: String },
    schedule: [{
      day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] },
      startTime: { type: String },
      endTime: { type: String },
    }],
    maxStudents: { type: Number, default: 60 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

sectionSchema.index({ courseId: 1 });
sectionSchema.index({ facultyId: 1 });
sectionSchema.index({ academicYear: 1, semester: 1 });

export default mongoose.model<ISection>('Section', sectionSchema);
