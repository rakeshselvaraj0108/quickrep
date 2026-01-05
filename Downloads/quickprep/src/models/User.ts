import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: [true, 'Please provide an email'],
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false,
  },
  name: {
    type: String,
    required: [true, 'Please provide a name'],
  },
  avatar: {
    type: String,
    default: null,
  },
  bio: {
    type: String,
    default: '',
  },
  studyGoal: {
    type: String,
    enum: ['school', 'college', 'exam', 'career', 'personal'],
    default: 'personal',
  },
  preferences: {
    theme: {
      type: String,
      enum: ['dark', 'light'],
      default: 'dark',
    },
    notifications: {
      type: Boolean,
      default: true,
    },
    dailyReminder: {
      type: Boolean,
      default: false,
    },
  },
  stats: {
    totalSessions: {
      type: Number,
      default: 0,
    },
    totalCardsReviewed: {
      type: Number,
      default: 0,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    masteryPercentage: {
      type: Number,
      default: 0,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
