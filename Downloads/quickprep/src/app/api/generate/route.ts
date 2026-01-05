import { NextRequest, NextResponse } from 'next/server';
import { GenerateRequest, GenerateResponse, Flashcard, Quiz, MindMap } from '../../../types/ai';
import { buildPrompt } from '../../../utils/prompts';
import { withAuth } from '@/lib/authMiddleware';
import db from '@/lib/sqlite';
import { v4 as uuidv4 } from 'uuid';

async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'models/gemini-2.5-flash';
  
  if (!apiKey) {
    throw new Error('❌ GEMINI_API_KEY missing in .env.local. Get from https://aistudio.google.com/');
  }
  
  console.log('🌐 Calling Gemini with key:', apiKey.slice(0, 10) + '...');

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
            topK: 50,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
        }),
        signal: AbortSignal.timeout(60000)
      }
    );

    console.log('📡 Gemini response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Gemini error response:', errorText);
      
      if (errorText.includes('API key not valid')) {
        throw new Error('❌ Invalid Gemini API key. Get new one from https://aistudio.google.com/');
      }
      if (errorText.includes('quota') || response.status === 429) {
        throw new Error('⏱️ API quota exceeded. Wait a moment and retry.');
      }
      throw new Error(`❌ Gemini API: ${response.status} - ${errorText.slice(0, 100)}`);
    }

    const data = await response.json();
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error('❌ Unexpected Gemini response:', data);
      throw new Error('❌ Gemini returned empty response. Try shorter notes.');
    }

    const result = data.candidates[0].content.parts[0].text.trim();
    console.log('✅ Gemini success, length:', result.length);
    
    return result;
  } catch (error) {
    console.error('💥 callGemini full error:', error);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('⏰ Gemini timeout. Try shorter notes.');
      }
      throw error;
    }
    throw new Error('💥 Network error calling Gemini API');
  }
}

function getFallbackResponse(prompt: string, mode: string): string {
  const content = prompt.slice(0, 100);
  return `📝 Fallback ${mode} for "${content}...\n\n` +
    `- UI works perfectly!\n` +
    `- Real Gemini will replace this once API key is fixed.\n` +
    `- Check server logs (terminal) for exact error.\n\n` +
    `💡 Next: Fix GEMINI_API_KEY in .env.local`;
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const decoded = withAuth(req);
  
  try {
    const body = (await req.json()) as GenerateRequest;
    console.log('📥 API received:', { contentLength: body.content?.length, mode: body.mode });

    if (!body?.content?.trim()) {
      return NextResponse.json({ error: 'Notes content required.' }, { status: 400 });
    }
    if (!body.mode) {
      return NextResponse.json({ error: 'Mode required.' }, { status: 400 });
    }

    const prompt = buildPrompt(body.content, body.mode);
    let aiResult: string;
    let success = true;

    try {
      aiResult = await callGemini(prompt);
    } catch (geminiError) {
      console.warn('⚠️ Gemini failed, using fallback:', geminiError);
      aiResult = getFallbackResponse(prompt, body.mode);
      success = false;
    }

    let response: GenerateResponse = { result: aiResult };

    // Helper function to extract JSON from markdown code blocks
    const extractJSON = (text: string): string => {
      // Remove markdown code block markers
      let cleaned = text
        .replace(/^```(?:json)?\s*\n?/i, '') // Remove opening ```json or ```
        .replace(/\n?```\s*$/i, ''); // Remove closing ```
      
      // Try to find JSON object if wrapped in other text
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return jsonMatch[0];
      }
      return cleaned;
    };

    // Parse structured responses for new modes
    if (body.mode === 'flashcards') {
      try {
        console.log('🎴 Attempting to parse flashcards...');
        const cleanedJSON = extractJSON(aiResult);
        console.log('📄 Cleaned JSON length:', cleanedJSON.length);
        
        const parsed = JSON.parse(cleanedJSON);
        console.log('✅ JSON parsed successfully');
        
        if (parsed.flashcards && Array.isArray(parsed.flashcards) && parsed.flashcards.length > 0) {
          console.log('📚 Found', parsed.flashcards.length, 'flashcards');
          response.flashcards = parsed.flashcards.map((card: any, index: number) => {
            // Validate and clean card data
            const front = String(card.front || '').trim().substring(0, 500);
            const back = String(card.back || '').trim().substring(0, 1000);
            const difficulty = ['easy', 'medium', 'hard'].includes(String(card.difficulty || '').toLowerCase()) 
              ? String(card.difficulty).toLowerCase() 
              : 'medium';
            
            if (!front || !back) {
              console.warn(`⚠️ Skipping card ${index}: missing front or back`);
              return null;
            }
            
            return {
              id: `flashcard-${Date.now()}-${index}`,
              front,
              back,
              difficulty: difficulty as 'easy' | 'medium' | 'hard',
              reviewCount: 0
            };
          }).filter((card: any): card is any => card !== null);
          
          if ((response.flashcards || []).length === 0) {
            throw new Error('No valid flashcards after filtering');
          }
          console.log('🎉 Successfully created', (response.flashcards || []).length, 'flashcards');
        } else {
          console.warn('⚠️ No flashcards array found or empty in response');
          throw new Error('Invalid flashcards format: missing or empty flashcards array');
        }
      } catch (parseError) {
        console.error('❌ Failed to parse flashcards JSON:', parseError);
        console.error('📝 Raw response preview:', aiResult.substring(0, 500));
        // Create fallback flashcards from text if JSON parsing fails
        const lines = aiResult.split('\n').filter(l => l.trim().length > 0);
        if (lines.length > 0) {
          response.flashcards = [
            {
              id: 'fallback-1',
              front: '❌ JSON Parsing Error',
              back: `The API returned text instead of valid JSON. Please try again with simpler notes. Raw response starts with: ${aiResult.substring(0, 200)}...`,
              difficulty: 'hard',
              reviewCount: 0
            }
          ];
          console.log('📋 Using fallback flashcard to show error');
        }
      }
    } else if (body.mode === 'quiz') {
      try {
        const cleanedJSON = extractJSON(aiResult);
        const parsed = JSON.parse(cleanedJSON);
        if (parsed.quiz && parsed.quiz.questions && Array.isArray(parsed.quiz.questions)) {
          response.quiz = {
            id: `quiz-${Date.now()}`,
            title: parsed.quiz.title || 'Generated Quiz',
            questions: parsed.quiz.questions.map((q: any, index: number) => ({
              id: `question-${Date.now()}-${index}`,
              question: q.question || '',
              options: q.options || [],
              correctAnswer: q.correctAnswer || 0,
              explanation: q.explanation || '',
              difficulty: q.difficulty || 'medium'
            })),
            totalQuestions: parsed.quiz.questions.length
          };
        }
      } catch (parseError) {
        console.warn('Failed to parse quiz JSON:', parseError);
        // Keep the string result as fallback
      }
    } else if (body.mode === 'mindmap') {
      try {
        console.log('🗺️ Attempting to parse mindmap...');
        const cleanedJSON = extractJSON(aiResult);
        console.log('📄 Cleaned JSON length:', cleanedJSON.length);
        
        const parsed = JSON.parse(cleanedJSON);
        console.log('✅ JSON parsed successfully');
        
        // Helper function to transform nodes recursively
        const transformNodes = (nodes: any[]): any[] => {
          return nodes.map((node, index) => {
            // Support both 'label' and 'text' fields
            const label = node.label || node.text || `Node ${index + 1}`;
            return {
              id: node.id || `node-${Date.now()}-${index}`,
              label: label,
              description: node.description || '',
              icon: node.icon || 'default',
              children: node.children && Array.isArray(node.children) 
                ? transformNodes(node.children) 
                : []
            };
          });
        };
        
        if (parsed.mindmap && parsed.mindmap.nodes && Array.isArray(parsed.mindmap.nodes)) {
          console.log('🌳 Found', parsed.mindmap.nodes.length, 'root nodes');
          response.mindmap = {
            title: parsed.mindmap.title || 'Study Mind Map',
            central: parsed.mindmap.central || parsed.mindmap.title || 'Main Topic',
            nodes: transformNodes(parsed.mindmap.nodes)
          };
          console.log('🎉 Successfully created mindmap with', response.mindmap.nodes.length, 'branches');
        } else {
          console.warn('⚠️ No mindmap nodes array found');
          throw new Error('Invalid mindmap format');
        }
      } catch (parseError) {
        console.error('❌ Failed to parse mindmap JSON:', parseError);
        console.error('📝 Raw response preview:', aiResult.substring(0, 500));
        // Create fallback mindmap
        response.mindmap = {
          title: 'Mind Map',
          central: 'Topic',
          nodes: [{
            id: 'error-1',
            label: '❌ Parsing Error',
            description: 'Failed to parse AI response. Please try again.',
            icon: 'warning',
            children: []
          }]
        };
      }
    }

    console.log('📤 API success');
    
    // Record stats if user is authenticated
    if (decoded) {
      try {
        const duration = Date.now() - startTime;
        const id = uuidv4();
        const now = new Date().toISOString();
        
        db.prepare(
          `INSERT INTO user_stats (id, user_id, mode, success, duration_ms, created_at)
           VALUES (?, ?, ?, ?, ?, ?)`
        ).run(id, decoded.userId, body.mode, success ? 1 : 0, duration, now);
      } catch (statError) {
        console.error('Failed to record stats:', statError);
        // Don't fail the request if stats recording fails
      }
    }
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('💥 API route error:', error);
    return NextResponse.json(
      { error: 'Server error. Check terminal logs.' },
      { status: 500 }
    );
  }
}
