import mongoose, { Document, Schema } from 'mongoose';

export interface IClassSession extends Document {
  _id: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  sectionId: mongoose.Types.ObjectId;
  facultyId: mongoose.Types.ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
  academicYear: string;
  semester: number;
  topic?: string;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const classSessionSchema = new Schema<IClassSession>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
    facultyId: { type: Schema.Types.ObjectId, ref: 'Faculty', required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    academicYear: { type: String, required: true },
    semester: { type: Number, required: true },
    topic: { type: String },
    isCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

classSessionSchema.index({ courseId: 1, sectionId: 1 });
classSessionSchema.index({ facultyId: 1 });
classSessionSchema.index({ date: 1 });

export default mongoose.model<IClassSession>('ClassSession', classSessionSchema);
