import mongoose, { Document, Schema } from 'mongoose';

export interface IMeetingDocument extends Document {
  meetingId: string;
  userId: string;
  title: string;
  scheduledAt: Date;
  duration?: number;
  participants: string[];
  meetLink: string;
  calendarEventId?: string;
  status: 'upcoming' | 'completed' | 'missed';
  createdAt: Date;
  updatedAt: Date;
}

const MeetingSchema = new Schema<IMeetingDocument>(
  {
    meetingId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    scheduledAt: { type: Date, required: true, index: true },
    duration: { type: Number, default: 30 },
    participants: [{ type: String }],
    meetLink: { type: String, required: true },
    calendarEventId: { type: String, sparse: true, index: true },
    status: {
      type: String,
      enum: ['upcoming', 'completed', 'missed'],
      default: 'upcoming',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient user meeting queries sorted by scheduled date
MeetingSchema.index({ userId: 1, scheduledAt: -1 });

export const Meeting = mongoose.model<IMeetingDocument>('Meeting', MeetingSchema);
