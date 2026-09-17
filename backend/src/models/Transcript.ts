import mongoose, { Document, Schema } from 'mongoose';

export interface ISegment {
  speaker: string;
  text: string;
  timestamp: number;
}

export interface ITranscriptDocument extends Document {
  transcriptId: string;
  meetingId: string;
  segments: ISegment[];
  fullText: string;
  audioFileUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SegmentSchema = new Schema<ISegment>(
  {
    speaker: { type: String, required: true },
    text: { type: String, required: true },
    timestamp: { type: Number, required: true },
  },
  { _id: false }
);

const TranscriptSchema = new Schema<ITranscriptDocument>(
  {
    transcriptId: { type: String, required: true, unique: true, index: true },
    meetingId: { type: String, required: true, unique: true, index: true },
    segments: [SegmentSchema],
    fullText: { type: String, required: true },
    audioFileUrl: { type: String },
  },
  {
    timestamps: true,
  }
);

export const Transcript = mongoose.model<ITranscriptDocument>('Transcript', TranscriptSchema);
