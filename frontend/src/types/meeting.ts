export interface User {
  userId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Meeting {
  meetingId: string;
  userId: string;
  title: string;
  scheduledAt: string;
  duration?: number;
  participants: string[];
  meetLink: string;
  calendarEventId?: string;
  status: 'upcoming' | 'completed' | 'missed';
}

export interface TranscriptSegment {
  speaker: string;
  text: string;
  timestamp: number;
}

export interface ActionItem {
  assignee: string;
  task: string;
}

export interface Flashcard {
  question: string;
  answer: string;
}

export interface AIOutput {
  outputId: string;
  meetingId: string;
  summary: string;
  actionItems: ActionItem[];
  keyDecisions: string[];
  importantPoints: string[];
  flashcards: Flashcard[];
  meetingDocument: string;
  generatedAt: string;
}
