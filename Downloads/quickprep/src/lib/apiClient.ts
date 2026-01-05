import { GenerateRequest, GenerateResponse } from '../types/ai';

const API_ENDPOINT = '/api/generate';
const STUDY_BUDDY_ENDPOINT = '/api/studybuddy';

export async function generateContent(
  payload: GenerateRequest
): Promise<GenerateResponse> {
  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as {
      error?: string;
    };
    throw new Error(data.error || 'Failed to generate content.');
  }

  const data = (await response.json()) as GenerateResponse;
  return data;
}

export interface StudyBuddyRequestPayload {
  type: 'motivation' | 'response' | 'welcome' | 'break' | 'help' | 'content_question' | 'content_explain' | 'content_examples' | 'content_quiz' | 'content_summary' | 'content_relate' | 'content_deepen' | 'health_check';
  userMessage?: string;
  userName?: string;
  studyStreak?: number;
  totalStudyTime?: number;
  completedTasks?: number;
  currentMood?: string;
  context?: string;
  mode?: string;
}

export interface StudyBuddyResponsePayload {
  message: string;
  emotion?: 'excited' | 'encouraging' | 'concerned' | 'supportive' | 'celebratory';
  suggestions?: string[];
  success?: boolean;
  error?: string;
}

export async function sendStudyBuddyMessage(
  payload: StudyBuddyRequestPayload
): Promise<StudyBuddyResponsePayload> {
  try {
    const response = await fetch(STUDY_BUDDY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
      };
      throw new Error(errorData.error || errorData.message || 'Failed to connect with Study Buddy.');
    }

    const data = (await response.json()) as StudyBuddyResponsePayload;
    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Network error with Study Buddy';
    console.error('Study Buddy API error:', errorMessage);
    throw error;
  }
}
