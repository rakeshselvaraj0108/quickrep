import { NextRequest, NextResponse } from 'next/server';

interface StudyBuddyRequest {
  type: 'motivation' | 'response' | 'welcome' | 'break' | 'help' | 'content_question' | 'content_explain' | 'content_examples' | 'content_quiz' | 'content_summary' | 'content_relate' | 'content_deepen' | 'health_check';
  userMessage?: string;
  userName?: string;
  studyStreak?: number;
  totalStudyTime?: number;
  completedTasks?: number;
  currentMood?: string;
  context?: string;
}

interface StudyBuddyResponse {
  message: string;
  emotion?: 'excited' | 'encouraging' | 'concerned' | 'supportive' | 'celebratory';
  suggestions?: string[];
  success?: boolean;
  error?: string;
}

async function callGeminiForStudyBuddy(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'models/gemini-1.5-flash-latest';

  if (!apiKey) {
    console.error('GEMINI_API_KEY missing in environment variables');
    throw new Error('GEMINI_API_KEY missing in .env.local');
  }

  if (!apiKey.startsWith('AIzaSy')) {
    console.error('Invalid API key format - should start with AIzaSy');
    throw new Error('Invalid GEMINI_API_KEY format');
  }

  console.log('Making Gemini API call with model:', model);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.9,
            maxOutputTokens: 500,
          },
        }),
        signal: AbortSignal.timeout(15000)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error details:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });

      // For temporary service issues, rate limits, server errors, or model not found, use fallback
      if (response.status === 503 || response.status === 429 || response.status >= 500 || response.status === 404) {
        console.warn(`Gemini API issue (${response.status}), using fallback response`);
        return getFallbackResponse('response');
      }

      throw new Error(`Gemini API error: ${response.status} - ${response.statusText}`);
    }

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error('Failed to parse Gemini API response as JSON:', parseError);
      console.error('Raw response text:', await response.text());
      return getFallbackResponse('response');
    }

    console.log('Gemini API response received:', {
      hasCandidates: !!data.candidates,
      candidateCount: data.candidates?.length,
      hasContent: !!data.candidates?.[0]?.content,
      hasParts: !!data.candidates?.[0]?.content?.parts,
      partCount: data.candidates?.[0]?.content?.parts?.length
    });

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
      console.warn('Unexpected Gemini API response structure:', data);
      return getFallbackResponse('response');
    }

    return data.candidates[0].content.parts[0].text || getFallbackResponse('response');
  } catch (error) {
    console.error('Study Buddy API error:', error);
    // Always return a fallback response instead of throwing
    return getFallbackResponse('response');
  }
}

function getFallbackResponse(type: string): string {
  const fallbacks = {
    motivation: [
      "You're doing amazing! Keep up the great work! 💪",
      "Every study session brings you closer to your goals! 🎯",
      "Your dedication is inspiring! Keep pushing forward! 🔥",
      "Remember why you started - you're capable of great things! 🌟"
    ],
    response: [
      "That's a great question! I'm here to help you understand it better.",
      "I love that you're engaging with the material! Let's break this down.",
      "You're asking the right questions - that's how we learn! 🤔",
      "Great curiosity! Let me help you explore this concept."
    ],
    welcome: [
      "Welcome back! Ready to continue your learning journey? 📚",
      "Hey there! Excited to help you study today! 🎓",
      "Good to see you! Let's make this study session productive! 💡"
    ],
    break: [
      "You've earned a well-deserved break! Take some time to recharge. ☕",
      "Time for a quick reset! Your brain will thank you. 🧠",
      "Break time! Step away, stretch, and come back refreshed! 🌱"
    ],
    help: [
      "I'm here to help! What specific concept are you struggling with?",
      "Don't worry, we all get stuck sometimes. Let's work through this together!",
      "Learning is about progress, not perfection. Let's tackle this challenge! 🎯"
    ]
  };

  const responses = fallbacks[type as keyof typeof fallbacks] || fallbacks.response;
  return responses[Math.floor(Math.random() * responses.length)];
}

function generateMotivationalPrompt(data: StudyBuddyRequest): string {
  const { userName = 'Student', studyStreak = 0, totalStudyTime = 0, completedTasks = 0, currentMood } = data;

  return `You are an encouraging AI Study Buddy. Generate a personalized motivational message for ${userName} who has:
- ${studyStreak} day study streak
- ${Math.floor(totalStudyTime / 60)} hours total study time
- ${completedTasks} completed tasks
- Current mood: ${currentMood || 'focused'}

Make it encouraging, specific to their progress, and keep it under 100 words. Be enthusiastic and supportive!`;
}

function generateResponsePrompt(data: StudyBuddyRequest): string {
  const { userMessage = '', userName = 'Student', context = '' } = data;

  return `You are an expert AI Study Buddy having a conversation with a student named ${userName}.

Student's question/message: "${userMessage}"

${context ? `Content they're studying: ${context}` : ''}

Your task:
1. Directly answer their question or respond to their statement
2. Be clear, concise, and educational
3. If they're asking about a topic, explain it in a way that helps them learn
4. Include practical examples when relevant
5. Offer follow-up learning suggestions if appropriate
6. Keep a friendly, encouraging, supportive tone
7. Keep your response under 200 words

Respond naturally like ChatGPT - direct answers first, then explanation and tips.`;
}

function generateWelcomePrompt(data: StudyBuddyRequest): string {
  const { userName = 'Student', studyStreak = 0 } = data;

  return `Generate a warm, personalized welcome message for ${userName} who has a ${studyStreak}-day study streak.
Make it enthusiastic, mention their streak if positive, and encourage them to start studying.
Keep it under 80 words and very welcoming!`;
}

function generateBreakPrompt(data: StudyBuddyRequest): string {
  const { userName = 'Student', totalStudyTime = 0, currentMood } = data;

  return `You are an AI Study Buddy suggesting a break. The student (${userName}) has been studying for ${Math.floor(totalStudyTime / 60)} hours and their current mood is ${currentMood || 'focused'}.

Generate a supportive break suggestion that:
- Acknowledges their hard work
- Suggests specific break activities
- Encourages them to return refreshed
- Keep it under 100 words

Be caring and encouraging!`;
}

function generateContentQuestionPrompt(data: StudyBuddyRequest): string {
  const { userMessage = '', userName = 'Student', context = '' } = data;

  return `You are an AI Study Buddy helping a student understand generated content. The student (${userName}) asked: "${userMessage}"

Context about the generated content: ${context}

Please provide a helpful, specific answer that:
- Directly addresses their question about the content
- Uses the provided context to give accurate information
- Explains concepts clearly and simply
- Encourages further learning
- Keep it under 200 words

Be the perfect study companion who makes complex topics understandable!`;
}

function generateContentExplainPrompt(data: StudyBuddyRequest): string {
  const { userMessage = '', userName = 'Student', context = '' } = data;

  return `You are an AI Study Buddy explaining complex concepts from generated content to a student (${userName}).

Generated content context: ${context}

The student wants a deeper explanation. Please provide:
- Break down complex ideas into simpler parts
- Use analogies or real-world examples
- Connect concepts to what they might already know
- Make it conversational and encouraging
- Keep it under 250 words

Make learning enjoyable and accessible!`;
}

function generateContentExamplesPrompt(data: StudyBuddyRequest): string {
  const { userMessage = '', userName = 'Student', context = '' } = data;

  return `You are an AI Study Buddy providing practical examples for concepts in generated content to student (${userName}).

Generated content context: ${context}

Please provide:
- 2-3 real-world examples that illustrate the concepts
- Step-by-step applications
- Practical scenarios they might encounter
- Make examples relatable and memorable
- Keep it under 200 words

Help them see how theory applies to real life!`;
}

function generateContentQuizPrompt(data: StudyBuddyRequest): string {
  const { userMessage = '', userName = 'Student', context = '' } = data;

  return `You are an AI Study Buddy creating a quiz from generated content for student (${userName}).

Generated content context: ${context}

Create a short quiz with:
- 3-4 multiple choice questions
- One short answer question
- Include correct answers with brief explanations
- Make it challenging but fair
- Keep total under 300 words

Make testing their knowledge fun and educational!`;
}

function generateContentSummaryPrompt(data: StudyBuddyRequest): string {
  const { userMessage = '', userName = 'Student', context = '' } = data;

  return `You are an AI Study Buddy summarizing generated content for student (${userName}).

Generated content context: ${context}

Provide a concise summary that:
- Captures the main ideas and key points
- Maintains the important details
- Is easy to review and remember
- Highlights the most important takeaways
- Keep it under 150 words

Make complex information digestible!`;
}

function generateContentRelatePrompt(data: StudyBuddyRequest): string {
  const { userMessage = '', userName = 'Student', context = '' } = data;

  return `You are an AI Study Buddy helping student (${userName}) connect generated content to broader concepts.

Generated content context: ${context}

Show connections by:
- Relating to other subjects or topics
- Explaining how this fits into larger frameworks
- Mentioning related concepts or theories
- Showing interdisciplinary connections
- Keep it under 200 words

Help them see the bigger picture!`;
}

function generateContentDeepenPrompt(data: StudyBuddyRequest): string {
  const { userMessage = '', userName = 'Student', context = '' } = data;

  return `You are an AI Study Buddy providing deeper insights into generated content for advanced learning with student (${userName}).

Generated content context: ${context}

Provide deeper analysis including:
- Underlying principles or theories
- Historical context or development
- Current applications or implications
- Areas for further research
- Critical thinking questions
- Keep it under 250 words

Challenge them to think more deeply!`;
}

export async function POST(request: NextRequest) {
  try {
    const body: StudyBuddyRequest = await request.json();
    const { type, userMessage, userName, studyStreak, totalStudyTime, completedTasks, currentMood, context } = body;

    console.log('📚 Study Buddy API Request:', {
      type,
      userHasMessage: !!userMessage,
      userName,
      context: context ? 'provided' : 'none'
    });

    // Health check for connection status
    if (type === 'health_check') {
      console.log('✅ Health check passed');
      return NextResponse.json({
        success: true,
        status: 'healthy',
        message: 'AI Study Buddy backend is connected and ready!',
        timestamp: new Date().toISOString(),
        version: '2.0'
      });
    }

    let prompt = '';
    let emotion: StudyBuddyResponse['emotion'] = 'encouraging';

    switch (type) {
      case 'motivation':
        prompt = generateMotivationalPrompt(body);
        emotion = 'celebratory';
        break;
      case 'response':
        prompt = generateResponsePrompt(body);
        emotion = 'supportive';
        break;
      case 'welcome':
        prompt = generateWelcomePrompt(body);
        emotion = 'excited';
        break;
      case 'break':
        prompt = generateBreakPrompt(body);
        emotion = 'supportive';
        break;
      case 'content_question':
        prompt = generateContentQuestionPrompt(body);
        emotion = 'supportive';
        break;
      case 'content_explain':
        prompt = generateContentExplainPrompt(body);
        emotion = 'encouraging';
        break;
      case 'content_examples':
        prompt = generateContentExamplesPrompt(body);
        emotion = 'excited';
        break;
      case 'content_quiz':
        prompt = generateContentQuizPrompt(body);
        emotion = 'celebratory';
        break;
      case 'content_summary':
        prompt = generateContentSummaryPrompt(body);
        emotion = 'supportive';
        break;
      case 'content_relate':
        prompt = generateContentRelatePrompt(body);
        emotion = 'encouraging';
        break;
      case 'content_deepen':
        prompt = generateContentDeepenPrompt(body);
        emotion = 'concerned';
        break;
      case 'help':
        prompt = `Generate helpful study advice for: "${userMessage || 'general study help'}"
Be specific, actionable, and encouraging. Under 120 words.`;
        emotion = 'concerned';
        break;
      default:
        prompt = `Generate a friendly study buddy response to: "${userMessage || 'hello'}"`;
        emotion = 'encouraging';
    }

    console.log('💬 Generated prompt for type:', type);
    const message = await callGeminiForStudyBuddy(prompt);
    console.log('✅ Received message from Gemini, length:', message.length);

    const response: StudyBuddyResponse = {
      success: true,
      message,
      emotion,
      suggestions: type === 'help' ? [
        'Break down complex topics into smaller parts',
        'Use active recall techniques',
        'Take regular breaks using the Pomodoro method',
        'Explain concepts in your own words'
      ] : undefined
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('💥 Study Buddy API Error:', error);

    // Return fallback response with error details
    const fallbackResponse: StudyBuddyResponse = {
      success: true,
      message: getFallbackResponse('response'),
      emotion: 'encouraging',
      error: error instanceof Error ? error.message : 'Unknown error'
    };

    return NextResponse.json(fallbackResponse, { status: 200 });
  }
}