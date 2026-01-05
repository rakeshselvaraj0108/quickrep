export type GenerationMode = "summary" | "questions" | "plan" | "flashcards" | "quiz" | "mindmap";

export interface GenerateRequest {
  content: string;
  mode: GenerationMode;
}

export interface GenerateResponse {
  result: string;
  flashcards?: Flashcard[];
  quiz?: Quiz;
  mindmap?: MindMap;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
  lastReviewed?: Date;
  nextReview?: Date;
  reviewCount: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  totalQuestions: number;
  timeLimit?: number; // in minutes
}

export interface MindMapNode {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  children: MindMapNode[];
}

export interface MindMap {
  title: string;
  central: string;
  nodes: MindMapNode[];
}

export interface StudySession {
  id: string;
  type: 'flashcards' | 'quiz';
  content: Flashcard[] | Quiz;
  startTime: Date;
  endTime?: Date;
  score?: number;
  completed: boolean;
}

// Web Speech API global declarations
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }

  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onresult: ((this: SpeechRecognition, ev: any) => any) | null;
    onerror: ((this: SpeechRecognition, ev: any) => any) | null;
    onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  }

  var SpeechRecognition: {
    prototype: SpeechRecognition;
    new(): SpeechRecognition;
  };
}
