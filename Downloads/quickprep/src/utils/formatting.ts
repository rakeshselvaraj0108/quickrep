import { GenerationMode } from '../types/ai';

/**
 * Basic formatting hook for AI output.
 * For now, this is a passthrough with a tiny mode-based heading.
 * You can enhance later (Markdown parsing, etc.).
 */
export function formatResult(raw: string, mode: GenerationMode): string {
  const cleaned = raw.trim();
  if (!cleaned.length) return '';

  const headerMap: Record<GenerationMode, string> = {
    summary: 'Summary',
    questions: 'Practice Questions',
    plan: 'Study Plan',
    flashcards: 'Flashcards',
    quiz: 'Quiz',
    mindmap: 'Mind Map',
  };

  const heading = headerMap[mode];

  // Simple decoration to give structure without needing a parser.
  return `=== ${heading} ===\n\n${cleaned}`;
}
