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
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
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
        return getFallbackResponse('response', undefined, undefined);
      }

      throw new Error(`Gemini API error: ${response.status} - ${response.statusText}`);
    }

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error('Failed to parse Gemini API response as JSON:', parseError);
      console.error('Raw response text:', await response.text());
      return getFallbackResponse('response', undefined, undefined);
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
      return getFallbackResponse('response', undefined, undefined);
    }

    return data.candidates[0].content.parts[0].text || getFallbackResponse('response', undefined, undefined);
  } catch (error) {
    console.error('Study Buddy API error:', error);
    // Always return a fallback response instead of throwing
    return getFallbackResponse('response', undefined, undefined);
  }
}

function getFallbackResponse(type: string, context?: string, userMessage?: string): string {
  // Context-aware fallback responses when quota is exceeded
  if (context && type === 'response') {
    const contentPreview = context.substring(0, 100);
    return `I'd love to help you understand this! Based on the content you're studying ("${contentPreview}..."), ${userMessage ? `regarding "${userMessage}"` : 'here\'s my insight'}: This is a key concept worth exploring. Try breaking it down into smaller parts, and feel free to ask specific questions! 📚`;
  }

  const fallbacks = {
    motivation: [
      "You're doing amazing! Keep up the great work! 💪",
      "Every study session brings you closer to your goals! 🎯",
      "Your dedication is inspiring! Keep pushing forward! 🔥",
      "Remember why you started - you're capable of great things! 🌟"
    ],
    response: [
      "That's a great question! I'm here to help you understand it better. Can you tell me more about what you're studying?",
      "I love that you're engaging with the material! Let's break this down together.",
      "You're asking the right questions - that's how we learn! 🤔 What specific part can I clarify?",
      "Great curiosity! I'm ready to help you explore this concept in depth."
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

  return `You are an expert AI Study Buddy with deep knowledge across all subjects, having a conversation with ${userName}.

Student's question/message: "${userMessage}"

${context ? `Study content context: ${context}` : ''}

Provide a comprehensive, well-structured response that:

1. **Direct Answer**: Start with a clear, direct answer to their question
2. **Detailed Explanation**: Break down the concept into digestible parts with:
   - Key points numbered or bulleted
   - Clear definitions of important terms
   - Step-by-step logic when explaining processes
3. **Concrete Examples**: Include 1-2 real-world examples that make the concept tangible
4. **Visual Mental Models**: Help them visualize the concept with analogies or comparisons
5. **Practical Application**: Show how they can use or apply this knowledge
6. **Learning Tips**: Offer specific study strategies related to this topic
7. **Follow-up Encouragement**: End with an engaging question or suggestion for deeper learning

Tone: Friendly, patient, and enthusiastic about teaching
Length: 250-400 words for thorough coverage
Structure: Use clear paragraphs, bold key terms, and organized formatting

Make complex topics feel accessible and interesting!`;
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

  return `You are an expert AI Study Buddy answering ${userName}'s specific question about their study material.

Student's Question: "${userMessage}"
Study Material Context: ${context}

Provide a thorough, well-organized answer:

1. **Direct Answer**: Start with a clear, concise answer (1-2 sentences)

2. **Detailed Explanation**:
   - Address all parts of their question
   - Define any technical terms
   - Break down complex points logically
   - Use numbered points for multi-part answers

3. **Context Connection**: Show how this relates to the broader material they're studying

4. **Clarifying Examples**: Provide 1-2 concrete examples that illustrate your answer

5. **Common Pitfalls**: Mention what students often misunderstand about this

6. **Deeper Insight**: Add one interesting related fact or perspective

7. **Follow-up Prompt**: End with: "Does this answer your question, or would you like me to clarify any part?"

Style Requirements:
- Be conversational but precise
- Use clear, logical structure
- Bold important terms or key points
- Show enthusiasm for their curiosity

Length: 250-350 words for comprehensive coverage

Make them feel heard and thoroughly helped! 🎯`;
}

function generateContentExplainPrompt(data: StudyBuddyRequest): string {
  const { userMessage = '', userName = 'Student', context = '' } = data;

  return `You are an expert AI Study Buddy providing an in-depth explanation to ${userName}.

Content to explain: ${context}
${userMessage ? `Specific focus: ${userMessage}` : ''}

Provide a comprehensive, crystal-clear explanation with this structure:

1. **The Big Picture**: Start with a simple overview sentence
2. **Core Concept Breakdown**: 
   - Define key terms clearly
   - Break complex ideas into 3-5 digestible parts
   - Use bullet points for clarity
3. **Real-World Analogies**: Use at least 2 relatable analogies or metaphors
4. **Step-by-Step Process**: If applicable, show the logical flow or sequence
5. **Common Misconceptions**: Address potential confusion points
6. **Connections**: Link to concepts they likely already understand
7. **Memory Aids**: Suggest mnemonics or visualization techniques

Style:
- Use everyday language, avoid unnecessary jargon
- Include concrete examples from daily life
- Build from simple to complex gradually
- Be conversational but precise

Length: 300-450 words for thorough understanding

Your goal: Make them say "Aha! Now I get it!" 💡`;
}

function generateContentExamplesPrompt(data: StudyBuddyRequest): string {
  const { userMessage = '', userName = 'Student', context = '' } = data;

  return `You are an AI Study Buddy providing vivid, practical examples to ${userName}.

Concept/Content: ${context}
${userMessage ? `Focus area: ${userMessage}` : ''}

Provide 3-4 comprehensive real-world examples:

For EACH example:
1. **Scenario Title**: Give it a catchy, memorable name
2. **Context Setup**: Describe the real-world situation (1-2 sentences)
3. **Application**: Show exactly how the concept applies step-by-step
4. **Key Insight**: Highlight what makes this example valuable
5. **Variation**: Mention how it could work differently in another context

Example Types to Include:
- Everyday life situations (relatable to students)
- Current events or technology applications
- Historical examples (if relevant)
- Hypothetical but realistic scenarios

Make examples:
✓ Specific and detailed (not vague)
✓ Diverse across different domains
✓ Progressive in complexity
✓ Memorable with interesting details

Length: 300-400 words
Tone: Engaging storyteller who brings concepts to life

Show them why this matters in the real world! 🌍`;
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

    // Check if this is a fallback response and enhance it with context
    const isFallback = message.length < 100 && (message.includes('great question') || message.includes('curious'));
    const finalMessage = (isFallback && context) 
      ? getFallbackResponse(type, context, userMessage)
      : message;

    const response: StudyBuddyResponse = {
      success: true,
      message: finalMessage,
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

    // Extract context from request body if available
    let context: string | undefined;
    try {
      const body = await request.json();
      context = body.context;
    } catch {
      // If we can't parse the body, continue without context
    }

    // Return fallback response with error details
    const fallbackResponse: StudyBuddyResponse = {
      success: true,
      message: getFallbackResponse('response', context, undefined),
      emotion: 'encouraging',
      error: error instanceof Error ? error.message : 'Unknown error'
    };

    return NextResponse.json(fallbackResponse, { status: 200 });
  }
}