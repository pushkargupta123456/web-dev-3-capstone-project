import mongoose, { Document, Schema } from 'mongoose';

export interface IFaculty extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  employeeId: string;
  department: string;
  designation: string;
  qualification?: string;
  phone?: string;
  joiningDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const facultySchema = new Schema<IFaculty>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    employeeId: { type: String, required: true, unique: true, trim: true },
    department: { type: String, required: true, trim: true },
    designation: { type: String, required: true, trim: true },
    qualification: { type: String },
    phone: { type: String },
    joiningDate: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

facultySchema.index({ department: 1 });

export default mongoose.model<IFaculty>('Faculty', facultySchema);
