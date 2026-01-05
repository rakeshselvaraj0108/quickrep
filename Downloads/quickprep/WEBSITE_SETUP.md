# QuickPrep - AI-Powered Study Assistant

A complete multi-user web application that transforms your notes into interactive flashcards, quizzes, and personalized learning paths using AI.

## 🚀 Features

✅ **User Authentication**
- Email/password registration and login
- Secure JWT-based authentication
- User profile management

✅ **AI-Powered Learning Modes**
- Smart Flashcards with spaced repetition
- Interactive Quizzes with instant feedback
- Visual Mind Maps
- Quick Summaries
- Study Planning

✅ **Dashboard & Analytics**
- Personal study dashboard
- Performance tracking
- Learning streak monitoring
- Progress analytics

✅ **Collaborative Learning**
- Study Buddy AI companion
- Real-time collaboration features
- Shared study sessions

✅ **Advanced Features**
- Gamification with achievement badges
- Timer-based study sessions
- PDF/file upload support
- Export and download options

## 📋 Technology Stack

**Frontend:**
- Next.js 16 (React)
- TypeScript
- Framer Motion (animations)
- TailwindCSS & custom CSS

**Backend:**
- Next.js API Routes
- Node.js
- MongoDB
- JWT Authentication
- Bcryptjs (password hashing)

**AI Integration:**
- Google Gemini API
- Socket.io (real-time features)

**Deployment:**
- Vercel (recommended)
- Docker support

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+
- MongoDB account (free at [mongodb.com](https://mongodb.com))
- Google Gemini API key (free at [aistudio.google.com](https://aistudio.google.com/app/apikey))

### 1. Clone Repository
```bash
git clone <repository-url>
cd quickprep
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create `.env.local` file with the following:

```env
# Google Gemini API
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/quickprep?retryWrites=true&w=majority

# JWT Secret (use a strong random string in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# App URL
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 4. Install Dependencies
```bash
npm install next-auth@beta mongoose bcryptjs jsonwebtoken
```

### 5. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

## 📚 User Flows

### 1. Landing Page (`/`)
- Public landing page with feature overview
- Call-to-action buttons for sign up/login
- Already logged-in users see dashboard link

### 2. User Registration (`/register`)
- Create new account with email and password
- Password validation and confirmation
- Redirect to login after successful registration

### 3. User Login (`/login`)
- Sign in with email and password
- JWT token stored in localStorage
- Redirect to dashboard on success

### 4. Dashboard (`/dashboard`)
- Main study interface (protected route)
- Input notes/materials on the left
- Select learning mode (flashcards, quiz, mindmap, summary)
- View results on the right side
- Track statistics and progress

### 5. Study Modes
- **Flashcards**: Interactive flip cards with difficulty ratings
- **Quizzes**: Multiple choice questions with instant feedback
- **Mind Maps**: Visual concept connections
- **Summaries**: Concise key points

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                 # Landing page
│   ├── layout.tsx               # Root layout
│   ├── login/
│   │   └── page.tsx            # Login page
│   ├── register/
│   │   └── page.tsx            # Registration page
│   ├── dashboard/
│   │   └── page.tsx            # User dashboard
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts   # Login API
│       │   └── register/route.ts # Register API
│       ├── generate/
│       │   └── route.ts         # Content generation
│       ├── history/
│       │   └── route.ts         # User history
│       └── stats/
│           └── route.ts         # User statistics
├── components/                  # React components
├── models/
│   ├── User.ts                 # User schema
│   └── StudySession.ts         # Study session schema
├── lib/
│   ├── db.ts                   # Database connection
│   ├── apiClient.ts            # API client
│   └── config.ts               # Configuration
└── types/
    └── ai.ts                   # TypeScript interfaces
```

## 🔐 Database Schema

### User Model
```typescript
{
  email: string (unique)
  password: string (hashed)
  name: string
  avatar?: string
  bio?: string
  studyGoal: 'school' | 'college' | 'exam' | 'career' | 'personal'
  preferences: {
    theme: 'dark' | 'light'
    notifications: boolean
    dailyReminder: boolean
  }
  stats: {
    totalSessions: number
    totalCardsReviewed: number
    currentStreak: number
    longestStreak: number
    masteryPercentage: number
  }
}
```

### StudySession Model
```typescript
{
  userId: ObjectId (ref: User)
  title: string
  subject: string
  contentType: 'notes' | 'pdf' | 'text'
  mode: 'flashcards' | 'quiz' | 'mindmap' | 'summary'
  flashcards: Array<{id, front, back, difficulty, reviewCount}>
  performance: {score, accuracy, timeSpent}
  isCompleted: boolean
}
```

## 🚀 Deployment

### Deploy to Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Environment Variables on Vercel
Set all `.env.local` variables in Vercel dashboard under Project Settings → Environment Variables

### MongoDB Atlas Setup
1. Go to [mongodb.com](https://mongodb.com)
2. Create free cluster
3. Get connection string
4. Add to MONGODB_URI in .env

## 📖 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Content Generation
- `POST /api/generate` - Generate flashcards/quiz/mindmap

### User Data
- `GET /api/history` - Get user's study history
- `GET /api/stats` - Get user statistics

## 🔄 Authentication Flow

1. User signs up → Password hashed with bcryptjs
2. User logs in → JWT token generated
3. Token stored in localStorage
4. Token included in API requests
5. Backend validates token for protected routes
6. Auto-logout if token expired

## 🎨 Customization

### Change Theme Colors
Edit CSS gradient colors in components:
- Primary: `#667eea` to `#764ba2`
- Secondary: `#06b6d4` to `#0891b2`

### Add New Modes
1. Update `GenerationMode` type in `types/ai.ts`
2. Create prompt in `utils/prompts.ts`
3. Update API endpoint
4. Create UI component

## 🐛 Troubleshooting

### MongoDB Connection Error
- Check MONGODB_URI is correct
- Ensure IP whitelist includes your IP
- Verify credentials are correct

### JWT Errors
- Clear localStorage: `localStorage.clear()`
- Regenerate JWT_SECRET (strong random string)
- Check token expiration

### API 500 Errors
- Check server logs for detailed errors
- Verify all env variables are set
- Check MongoDB connection

## 📝 License

MIT License - feel free to use this project!

## 👥 Support

For issues and questions:
1. Check troubleshooting section
2. Review the code comments
3. Check MongoDB and Google API documentation
4. Open an issue on GitHub

---

**Happy Learning! 🚀📚**
