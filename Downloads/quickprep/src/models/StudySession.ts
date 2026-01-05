import mongoose from 'mongoose';

const StudySessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  contentType: {
    type: String,
    enum: ['notes', 'pdf', 'text'],
    default: 'notes',
  },
  originalContent: {
    type: String,
    required: true,
  },
  duration: {
    type: Number, // in minutes
    default: 0,
  },
  mode: {
    type: String,
    enum: ['flashcards', 'quiz', 'mindmap', 'summary', 'interactive'],
    default: 'flashcards',
  },
  flashcards: [
    {
      id: String,
      front: String,
      back: String,
      difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
      },
      reviewCount: {
        type: Number,
        default: 0,
      },
      masteryLevel: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
    },
  ],
  quizzes: [
    {
      id: String,
      question: String,
      options: [String],
      correctAnswer: String,
      userAnswer: String,
      isCorrect: Boolean,
    },
  ],
  performance: {
    score: {
      type: Number,
      default: 0,
    },
    accuracy: {
      type: Number,
      default: 0,
    },
    timeSpent: {
      type: Number,
      default: 0,
    },
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
    default: null,
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

export default mongoose.models.StudySession || mongoose.model('StudySession', StudySessionSchema);
