import mongoose, { Document, Schema } from 'mongoose';

export interface IUserDocument extends Document {
  userId: string;
  googleId?: string;
  email: string;
  name: string;
  avatarUrl?: string;
  googleTokens?: {
    accessToken?: string;
    refreshToken?: string;
    expiryDate?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    googleId: { type: String, unique: true, sparse: true, index: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true },
    name: { type: String, required: true },
    avatarUrl: { type: String },
    googleTokens: {
      accessToken: { type: String },
      refreshToken: { type: String },
      expiryDate: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUserDocument>('User', UserSchema);
