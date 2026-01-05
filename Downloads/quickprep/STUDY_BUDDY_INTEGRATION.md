# 🤖 AI Study Buddy - Backend Integration Guide

## Overview

The AI Study Buddy is now fully integrated with the QuickPrep backend, enabling real-time AI-powered educational support using Google's Gemini API.

## Architecture

```
┌─────────────────────────────┐
│   StudyBuddy Component      │
│  (src/components/           │
│   StudyBuddy.tsx)          │
└──────────┬──────────────────┘
           │
           │ Uses
           ▼
┌─────────────────────────────┐
│  API Client Layer           │
│  (src/lib/apiClient.ts)     │
│  - sendStudyBuddyMessage()  │
│  - generateContent()        │
└──────────┬──────────────────┘
           │
           │ Calls
           ▼
┌─────────────────────────────┐
│  Backend API Routes         │
│  - /api/studybuddy          │
│  - /api/generate            │
└──────────┬──────────────────┘
           │
           │ Uses
           ▼
┌─────────────────────────────┐
│  Google Gemini API          │
│  (models/gemini-2.5-flash)  │
└─────────────────────────────┘
```

## Features

### 1. **Welcome Messages**
- Personalized greetings based on user stats
- Study streak recognition
- Emotional tone: `excited`

```typescript
await sendStudyBuddyMessage({
  type: 'welcome',
  userName: 'John',
  studyStreak: 7,
  totalStudyTime: 120,
  completedTasks: 5
});
```

### 2. **Real-time Responses**
- Answers to student questions
- Context-aware responses
- Integration with generated content

```typescript
await sendStudyBuddyMessage({
  type: 'response',
  userMessage: 'Can you explain photosynthesis?',
  context: 'Generated study notes...',
  userName: 'John'
});
```

### 3. **Content-Based Interactions**
The Study Buddy can help students interact with generated content:

- **explain**: Break down complex concepts
- **examples**: Provide real-world applications
- **quiz**: Create assessment questions
- **summary**: Condense key points
- **relate**: Connect to other topics
- **deepen**: Explore advanced concepts

```typescript
await sendStudyBuddyMessage({
  type: 'content_explain',
  userMessage: 'Make this simpler',
  context: 'Generated notes...',
  userName: 'John'
});
```

### 4. **Motivational Support**
- Study streak tracking
- Achievement celebration
- Emotional intelligence

```typescript
await sendStudyBuddyMessage({
  type: 'motivation',
  userName: 'John',
  studyStreak: 7,
  currentMood: 'tired'
});
```

### 5. **Break Suggestions**
- Personalized rest recommendations
- Recharge guidance
- Energy management

```typescript
await sendStudyBuddyMessage({
  type: 'break',
  userName: 'John',
  totalStudyTime: 300,
  currentMood: 'focused'
});
```

### 6. **Health Check**
- Backend connectivity verification
- Service status monitoring

```typescript
await sendStudyBuddyMessage({
  type: 'health_check'
});
// Returns: { success: true, status: 'healthy', version: '2.0' }
```

## API Client Functions

### `sendStudyBuddyMessage(payload)`

Sends a message request to the Study Buddy backend.

**Parameters:**
```typescript
{
  type: StudyBuddyType;              // Request type (see types below)
  userMessage?: string;              // User's question or input
  userName?: string;                 // Student's name
  studyStreak?: number;              // Current study streak (days)
  totalStudyTime?: number;           // Total minutes studied
  completedTasks?: number;           // Number of completed tasks
  currentMood?: string;              // Student's emotional state
  context?: string;                  // Content context (notes, generated content)
  mode?: string;                     // Generation mode (summary, quiz, etc.)
}
```

**Returns:**
```typescript
{
  success: boolean;                  // Operation success status
  message: string;                   // AI-generated response
  emotion?: string;                  // Emotional tone
  suggestions?: string[];            // Optional suggestions
  error?: string;                    // Error details (if any)
}
```

**Example:**
```typescript
import { sendStudyBuddyMessage } from '@/lib/apiClient';

const response = await sendStudyBuddyMessage({
  type: 'response',
  userMessage: 'How do I remember this?',
  userName: 'Alice',
  context: 'Study notes about photosynthesis...'
});

console.log(response.message);  // AI response
console.log(response.emotion);  // 'supportive'
```

## Backend API Routes

### POST `/api/studybuddy`

**Request Body:**
```json
{
  "type": "response",
  "userMessage": "How does this work?",
  "userName": "John",
  "context": "Generated content..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Here's how it works...",
  "emotion": "supportive"
}
```

**Error Handling:**
- If Gemini API fails, returns fallback response with `success: true`
- Includes error details in response for debugging
- Graceful degradation with predetermined responses

## Request Types (StudyBuddyType)

| Type | Purpose | Example Use Case |
|------|---------|------------------|
| `welcome` | Initial greeting | User opens Study Buddy |
| `response` | Answer questions | User asks clarification |
| `motivation` | Encouragement | After completing task |
| `break` | Suggest rest | Study session timeout |
| `help` | General assistance | Student asks for help |
| `content_explain` | Simplify concepts | Make notes easier |
| `content_examples` | Practical examples | Real-world applications |
| `content_quiz` | Assessment | Test understanding |
| `content_summary` | Condensed version | Quick review |
| `content_relate` | Connect topics | See bigger picture |
| `content_deepen` | Advanced learning | Explore deeply |
| `health_check` | API status | Verify connection |

## Emotion Types

The Study Buddy communicates with different emotional tones:

- `excited` - Enthusiastic, energized
- `encouraging` - Supportive, motivating
- `supportive` - Caring, attentive
- `celebratory` - Achievement recognition
- `concerned` - Empathetic, understanding

## Implementation in StudyBuddy Component

### Initialization
```tsx
useEffect(() => {
  const data = await sendStudyBuddyMessage({
    type: 'welcome',
    userName,
    studyStreak: stats.studyStreak,
    totalStudyTime: stats.totalStudyTime,
    completedTasks: stats.completedTasks
  });
  
  setMessages([{
    text: data.message,
    emotion: data.emotion,
    type: 'buddy'
  }]);
}, [userName]);
```

### Message Handling
```tsx
const handleSendMessage = async () => {
  const userMessage = { text: input, type: 'user' };
  setMessages(prev => [...prev, userMessage]);
  
  const data = await sendStudyBuddyMessage({
    type: 'response',
    userMessage: input,
    userName,
    context: generatedContent
  });
  
  setMessages(prev => [...prev, {
    text: data.message,
    emotion: data.emotion,
    type: 'buddy'
  }]);
};
```

### Content Actions
```tsx
const handleContentAction = async (action: 'explain' | 'examples' | 'quiz') => {
  const data = await sendStudyBuddyMessage({
    type: `content_${action}`,
    context: generatedContent,
    userName
  });
  
  // Display response
};
```

## Error Handling & Fallbacks

The integration includes robust error handling:

1. **Network Errors**: Gracefully falls back to predetermined responses
2. **API Rate Limits**: Handles 429 status with timeout and retry logic
3. **Invalid API Keys**: Returns helpful error messages
4. **Timeout**: Falls back after 15-second timeout

**Fallback Responses:**
```typescript
{
  motivation: "You're doing amazing! Keep up the great work! 💪",
  response: "That's a great question! I'm here to help you understand it better.",
  welcome: "Welcome back! Ready to continue your learning journey? 📚",
  break: "You've earned a well-deserved break! Take some time to recharge. ☕",
  help: "I'm here to help! What specific concept are you struggling with?"
}
```

## Environment Variables

Required in `.env.local`:

```
GEMINI_API_KEY=AIzaSy... # Get from https://aistudio.google.com/
GEMINI_MODEL=models/gemini-2.5-flash # Optional, defaults to this
```

## Response Structure Examples

### Welcome Response
```json
{
  "success": true,
  "message": "Welcome back, John! 👋 Your 7-day streak is amazing! Let's make today count! 🚀",
  "emotion": "excited"
}
```

### Content Explanation Response
```json
{
  "success": true,
  "message": "Great question! Think of photosynthesis like a solar panel for plants. Just as solar panels convert sunlight into electricity, plants convert sunlight, water, and CO2 into glucose (food) and oxygen...",
  "emotion": "encouraging"
}
```

### Help Response
```json
{
  "success": true,
  "message": "Don't worry, here are some proven study techniques...",
  "emotion": "concerned",
  "suggestions": [
    "Break down complex topics into smaller parts",
    "Use active recall techniques",
    "Take regular breaks using the Pomodoro method",
    "Explain concepts in your own words"
  ]
}
```

## Debugging

### Enable Logging

The backend logs all requests:
```
📚 Study Buddy API Request: { type: 'response', userHasMessage: true, ... }
💬 Generated prompt for type: response
✅ Received message from Gemini, length: 256
```

### Health Check
```typescript
const health = await sendStudyBuddyMessage({ type: 'health_check' });
console.log(health.status); // 'healthy'
console.log(health.version); // '2.0'
```

### Error Inspection
```typescript
try {
  const response = await sendStudyBuddyMessage({...});
  if (response.error) {
    console.error('API Error:', response.error);
  }
} catch (error) {
  console.error('Network Error:', error);
}
```

## Performance Tips

1. **Caching**: Store frequently asked questions
2. **Request Batching**: Combine multiple questions into one request
3. **Throttling**: Limit requests to prevent API rate limits
4. **Local Fallbacks**: Use offline responses for common questions

## Future Enhancements

- [ ] Message history persistence
- [ ] User preference learning
- [ ] Multi-language support
- [ ] Voice interaction
- [ ] Collaborative study groups
- [ ] Real-time session analytics
- [ ] Integration with learning analytics

## Testing the Integration

### Manual Testing
```typescript
// Open browser console and test:
const response = await fetch('/api/studybuddy', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'welcome',
    userName: 'TestUser',
    studyStreak: 5
  })
});
console.log(await response.json());
```

### Using the Study Buddy Component
1. Navigate to a page with the StudyBuddy component
2. Send a message
3. Check browser console for logs
4. Verify response appears in chat

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "API key missing" | Add GEMINI_API_KEY to .env.local |
| "Invalid API key" | Get new key from aistudio.google.com |
| "Quota exceeded" | Wait a moment before retrying |
| "Empty response" | Check Gemini API status or use fallback |
| No messages appear | Check browser console for errors |

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review backend logs in terminal
3. Verify API key is valid
4. Test health check endpoint

---

**Version**: 2.0  
**Last Updated**: January 3, 2026  
**Status**: ✅ Fully Functional
