export interface IUser {
  userId: string;
  email: string;
  name: string;
  googleTokens?: {
    accessToken?: string;
    refreshToken?: string;
  };
  createdAt?: Date;
}

export interface IMeeting {
  meetingId: string;
  userId: string;
  title: string;
  scheduledAt: Date;
  duration?: number;
  participants: string[];
  meetLink: string;
  calendarEventId?: string;
  status: 'upcoming' | 'completed' | 'missed';
}

export interface ITranscriptSegment {
  speaker: string;
  text: string;
  timestamp: number;
}

export interface ITranscript {
  transcriptId: string;
  meetingId: string;
  segments: ITranscriptSegment[];
  fullText: string;
  audioFileUrl?: string;
}

export interface IActionItem {
  assignee: string;
  task: string;
}

export interface IFlashcard {
  question: string;
  answer: string;
}

export interface IAIOutput {
  outputId: string;
  meetingId: string;
  summary: string;
  actionItems: IActionItem[];
  keyDecisions: string[];
  importantPoints: string[];
  flashcards: IFlashcard[];
  meetingDocument: string;
  generatedAt?: Date;
}
