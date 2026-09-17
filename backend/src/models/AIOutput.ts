import mongoose, { Document, Schema } from 'mongoose';

export interface IActionItem {
  assignee: string;
  task: string;
  status?: 'pending' | 'completed';
}

export interface IFlashcard {
  question: string;
  answer: string;
}

export interface IAIOutputDocument extends Document {
  outputId: string;
  meetingId: string;
  summary: string;
  actionItems: IActionItem[];
  keyDecisions: string[];
  importantPoints: string[];
  flashcards: IFlashcard[];
  meetingDocument: string;
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ActionItemSchema = new Schema<IActionItem>(
  {
    assignee: { type: String, required: true },
    task: { type: String, required: true },
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  },
  { _id: false }
);

const FlashcardSchema = new Schema<IFlashcard>(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { _id: false }
);

const AIOutputSchema = new Schema<IAIOutputDocument>(
  {
    outputId: { type: String, required: true, unique: true, index: true },
    meetingId: { type: String, required: true, unique: true, index: true },
    summary: { type: String, required: true },
    actionItems: [ActionItemSchema],
    keyDecisions: [{ type: String }],
    importantPoints: [{ type: String }],
    flashcards: [FlashcardSchema],
    meetingDocument: { type: String, required: true },
    generatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export const AIOutput = mongoose.model<IAIOutputDocument>('AIOutput', AIOutputSchema);
