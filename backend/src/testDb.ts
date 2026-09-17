import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from './config/db';
import { User } from './models/User';
import { Meeting } from './models/Meeting';
import { Transcript } from './models/Transcript';
import { AIOutput } from './models/AIOutput';

dotenv.config();

const runTest = async () => {
  try {
    console.log('Connecting to MongoDB via Mongoose...');
    await connectDB();

    console.log('\n--- 1. Testing Users ---');
    const users = await User.find().lean();
    console.log(`Found ${users.length} user(s):`, users.map((u) => ({ id: u.userId, email: u.email, name: u.name })));

    console.log('\n--- 2. Testing Meetings ---');
    const meetings = await Meeting.find().lean();
    console.log(`Found ${meetings.length} meeting(s):`, meetings.map((m) => ({ id: m.meetingId, title: m.title, status: m.status })));

    console.log('\n--- 3. Testing Transcripts ---');
    const transcripts = await Transcript.find().lean();
    console.log(`Found ${transcripts.length} transcript(s):`, transcripts.map((t) => ({ id: t.transcriptId, meetingId: t.meetingId, segmentsCount: t.segments.length })));

    console.log('\n--- 4. Testing AI Outputs ---');
    const aiOutputs = await AIOutput.find().lean();
    console.log(`Found ${aiOutputs.length} AI output(s):`, aiOutputs.map((a) => ({ id: a.outputId, meetingId: a.meetingId, actionItemsCount: a.actionItems.length, flashcardsCount: a.flashcards.length })));

    console.log('\nAll Mongoose models and queries verified successfully!');
  } catch (err) {
    console.error('Test DB Error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  }
};

runTest();
