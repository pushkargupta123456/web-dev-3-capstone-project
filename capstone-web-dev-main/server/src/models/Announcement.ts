import mongoose, { Document, Schema } from 'mongoose';

export type AnnouncementScope = 'UNIVERSITY' | 'COURSE' | 'SECTION';

export interface IAnnouncement extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  content: string;
  scope: AnnouncementScope;
  courseId?: mongoose.Types.ObjectId;
  sectionId?: mongoose.Types.ObjectId;
  postedBy: mongoose.Types.ObjectId;
  isPublished: boolean;
  publishAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const announcementSchema = new Schema<IAnnouncement>(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    scope: { type: String, enum: ['UNIVERSITY', 'COURSE', 'SECTION'], required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section' },
    postedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isPublished: { type: Boolean, default: true },
    publishAt: { type: Date },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

announcementSchema.index({ scope: 1 });
announcementSchema.index({ courseId: 1 });
announcementSchema.index({ sectionId: 1 });
announcementSchema.index({ createdAt: -1 });

export default mongoose.model<IAnnouncement>('Announcement', announcementSchema);
