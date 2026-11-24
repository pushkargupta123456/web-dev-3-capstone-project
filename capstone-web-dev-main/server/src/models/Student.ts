import mongoose, { Document, Schema } from 'mongoose';

export interface IStudent extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  registrationNumber: string;
  department: string;
  semester: number;
  academicYear: string;
  dateOfBirth?: Date;
  phone?: string;
  address?: string;
  guardianName?: string;
  guardianPhone?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const studentSchema = new Schema<IStudent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    registrationNumber: { type: String, required: true, unique: true, trim: true },
    department: { type: String, required: true, trim: true },
    semester: { type: Number, required: true, min: 1, max: 10 },
    academicYear: { type: String, required: true },
    dateOfBirth: { type: Date },
    phone: { type: String },
    address: { type: String },
    guardianName: { type: String },
    guardianPhone: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

studentSchema.index({ department: 1 });
studentSchema.index({ semester: 1 });

export default mongoose.model<IStudent>('Student', studentSchema);
