// MongoDB setup script for MeetScribe
const dbName = 'meetscribe';
const db = db.getSiblingDB(dbName);

print(`Connecting to database: ${dbName}...`);

// 1. Create collections if they don't exist
const collections = ['users', 'meetings', 'transcripts', 'aioutputs'];
const existingCollections = db.getCollectionNames();

collections.forEach((col) => {
  if (!existingCollections.includes(col)) {
    db.createCollection(col);
    print(`Created collection: ${col}`);
  } else {
    print(`Collection already exists: ${col}`);
  }
});

// 2. Create Indexes
print('\nCreating indexes...');

// Users indexes
db.users.createIndex({ userId: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ googleId: 1 }, { unique: true, sparse: true });
print('-> Created indexes for users collection');

// Meetings indexes
db.meetings.createIndex({ meetingId: 1 }, { unique: true });
db.meetings.createIndex({ userId: 1, scheduledAt: -1 });
db.meetings.createIndex({ calendarEventId: 1 }, { sparse: true });
print('-> Created indexes for meetings collection');

// Transcripts indexes
db.transcripts.createIndex({ transcriptId: 1 }, { unique: true });
db.transcripts.createIndex({ meetingId: 1 }, { unique: true });
print('-> Created indexes for transcripts collection');

// AIOutputs indexes
db.aioutputs.createIndex({ outputId: 1 }, { unique: true });
db.aioutputs.createIndex({ meetingId: 1 }, { unique: true });
print('-> Created indexes for aioutputs collection');

// 3. Upsert Sample Documents
print('\nInserting sample data...');

// Sample User
db.users.updateOne(
  { userId: 'usr_101' },
  {
    $set: {
      userId: 'usr_101',
      googleId: 'google_sub_987654321',
      email: 'jayraj@example.com',
      name: 'Jayraj Bhatti',
      avatarUrl: 'https://lh3.googleusercontent.com/a/sample-avatar',
      googleTokens: {
        accessToken: 'ya29.sample_access_token',
        refreshToken: '1//sample_refresh_token',
        expiryDate: new Date('2026-09-18T10:00:00Z'),
      },
      createdAt: new Date(),
    },
  },
  { upsert: true }
);

// Sample Meetings
db.meetings.updateOne(
  { meetingId: 'meet_001' },
  {
    $set: {
      meetingId: 'meet_001',
      userId: 'usr_101',
      title: 'AI Project Architecture & RAG Discussion',
      scheduledAt: new Date('2026-09-18T14:00:00Z'),
      duration: 45,
      participants: ['jayraj@example.com', 'yash@example.com', 'alex@example.com'],
      meetLink: 'https://meet.google.com/abc-defg-hij',
      calendarEventId: 'cal_event_54321',
      status: 'completed',
      createdAt: new Date(),
    },
  },
  { upsert: true }
);

db.meetings.updateOne(
  { meetingId: 'meet_002' },
  {
    $set: {
      meetingId: 'meet_002',
      userId: 'usr_101',
      title: 'Weekly Sprint Planning & Review',
      scheduledAt: new Date('2026-09-19T10:30:00Z'),
      duration: 30,
      participants: ['jayraj@example.com', 'team@example.com'],
      meetLink: 'https://meet.google.com/xyz-uvwx-rst',
      calendarEventId: 'cal_event_98765',
      status: 'upcoming',
      createdAt: new Date(),
    },
  },
  { upsert: true }
);

// Sample Transcript
db.transcripts.updateOne(
  { transcriptId: 'trn_001' },
  {
    $set: {
      transcriptId: 'trn_001',
      meetingId: 'meet_001',
      audioFileUrl: 'https://storage.googleapis.com/meetscribe-audio/meet_001.webm',
      fullText:
        'Jayraj: Let us discuss the architecture. Yash: We should use RAG with vector embeddings. Jayraj: Agreed. I will implement document ingestion.',
      segments: [
        {
          speaker: 'Jayraj',
          text: 'Let us discuss the architecture for the AI assistant.',
          timestamp: 0.5,
        },
        {
          speaker: 'Yash',
          text: 'We should use RAG with vector embeddings for fast retrieval.',
          timestamp: 12.0,
        },
        {
          speaker: 'Jayraj',
          text: 'Agreed. I will implement document ingestion by Monday.',
          timestamp: 25.4,
        },
      ],
      createdAt: new Date(),
    },
  },
  { upsert: true }
);

// Sample AI Output
db.aioutputs.updateOne(
  { outputId: 'out_001' },
  {
    $set: {
      outputId: 'out_001',
      meetingId: 'meet_001',
      summary:
        'The team agreed on implementing a RAG architecture for document retrieval and split tasks across members.',
      actionItems: [
        { assignee: 'Jayraj', task: 'Implement document ingestion pipeline', status: 'pending' },
        { assignee: 'Yash', task: 'Prepare embedding and vector store pipeline', status: 'pending' },
      ],
      keyDecisions: [
        'Adopted RAG (Retrieval-Augmented Generation) instead of fine-tuning for document queries.',
      ],
      importantPoints: [
        'Target response latency must stay below 2 seconds.',
        'Initial testing with chunk size of 512 tokens.',
      ],
      flashcards: [
        {
          question: 'What architecture was selected for document retrieval?',
          answer: 'RAG (Retrieval-Augmented Generation).',
        },
        {
          question: 'Who is responsible for the document ingestion pipeline?',
          answer: 'Jayraj.',
        },
      ],
      meetingDocument:
        '# AI Project Architecture\n\n## Summary\nAdopted RAG architecture for scalable retrieval.',
      generatedAt: new Date(),
    },
  },
  { upsert: true }
);

print('\nSetup completed successfully!');
print('Collections in meetscribe:');
printjson(db.getCollectionNames());
print('Sample user document:');
printjson(db.users.findOne({ userId: 'usr_101' }));
