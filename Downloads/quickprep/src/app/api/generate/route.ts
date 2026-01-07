import { NextRequest, NextResponse } from 'next/server';
import { GenerateRequest, GenerateResponse, Flashcard, Quiz, MindMap, MindMapNode } from '../../../types/ai';
import { buildPrompt } from '../../../utils/prompts';
import { withAuth } from '@/lib/authMiddleware';
import db from '@/lib/sqlite';
import { v4 as uuidv4 } from 'uuid';

async function callGemini(prompt: string, retries = 3): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  let model = process.env.GEMINI_MODEL || 'models/gemini-2.0-flash';
  // Ensure model has 'models/' prefix
  if (!model.startsWith('models/')) {
    model = `models/${model}`;
  }
  
  if (!apiKey) {
    throw new Error('❌ GEMINI_API_KEY missing in .env.local. Get from https://aistudio.google.com/');
  }
  
  console.log('🌐 Calling Gemini with key:', apiKey.slice(0, 10) + '... (attempt 1/' + retries + ')');

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
      
      // Retry on 503 Service Unavailable with exponential backoff
      if (response.status === 503 && retries > 1) {
        const waitTime = (4 - retries) * 2000; // 2s, 4s, 6s
        console.warn(`⏱️ Gemini overloaded (503), retrying in ${waitTime/1000}s... (${retries - 1} retries left)`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return callGemini(prompt, retries - 1);
      }
      
      if (errorText.includes('quota') || response.status === 429) {
        throw new Error('⏱️ API quota exceeded. Free tier allows 20 requests/day. Wait 24 hours or upgrade at https://aistudio.google.com/');
      }
      if (response.status === 503) {
        throw new Error('⏱️ Gemini API is temporarily overloaded. Please wait 30 seconds and try again.');
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
  const baseMessage = `⚠️ AI Service Temporarily Unavailable\n\n` +
    `The Google Gemini API is currently experiencing high load or quota limits.\n\n` +
    `✅ Quick Solutions:\n` +
    `1. 🔄 Refresh and try again in 30 seconds\n` +
    `2. 🔑 Check your API quota: https://aistudio.google.com/app/apikey\n` +
    `3. 💳 Upgrade plan for unlimited requests\n` +
    `4. ⏰ Free tier resets every 24 hours\n\n` +
    `📝 Note: Fallback content is generated locally while we reconnect.\n\n`;

  if (mode === 'study-plan') {
    return baseMessage + 
      `📅 MANUAL 7-DAY STUDY SCHEDULE\n` +
      `Day 1: Review & Organize (3 hours)\n` +
      `Day 2-3: Deep Learning (6 hours)\n` +
      `Day 4-5: Practice Problems (6 hours)\n` +
      `Day 6: Review & Mock Test (3 hours)\n` +
      `Day 7: Final Review (2 hours)\n\n` +
      `Note: Real AI-generated study plan will appear once API recovers.`;
  }

  if (mode === 'flashcards') {
    return baseMessage +
      `📇 Try creating flashcards manually:\n` +
      `- Front: Key concept\n` +
      `- Back: Definition/explanation\n\n` +
      `Real AI-generated flashcards will appear once API recovers.`;
  }

  if (mode === 'quiz') {
    return baseMessage +
      `❓ Try creating quiz questions manually:\n` +
      `- Test your understanding\n` +
      `- Multiple choice or short answer\n\n` +
      `Real AI-generated quiz will appear once API recovers.`;
  }

  return baseMessage + `Generated content will appear once the API recovers.`;
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
        
        let parsed = JSON.parse(cleanedJSON);
        console.log('✅ JSON parsed successfully');
        
        // If top-level has mindmap property, use it; otherwise treat as mindmap data
        if (!parsed.mindmap && parsed.nodes) {
          parsed = { mindmap: parsed };
        }
        
        // Helper function to transform nodes recursively
        const transformNodes = (nodes: any[]): any[] => {
          return nodes.map((node, index) => {
            // Support both 'label' and 'text' fields
            const label = node.label || node.text || node.title || `Node ${index + 1}`;
            return {
              id: node.id || `node-${Date.now()}-${Math.random()}`,
              label: String(label).substring(0, 100),
              description: String(node.description || node.content || '').substring(0, 200),
              icon: node.icon || 'default',
              children: node.children && Array.isArray(node.children) && node.children.length > 0
                ? transformNodes(node.children) 
                : []
            };
          });
        };
        
        if (parsed.mindmap && parsed.mindmap.nodes && Array.isArray(parsed.mindmap.nodes) && parsed.mindmap.nodes.length > 0) {
          console.log('🌳 Found', parsed.mindmap.nodes.length, 'root nodes');
          response.mindmap = {
            title: String(parsed.mindmap.title || 'Study Mind Map').substring(0, 100),
            central: String(parsed.mindmap.central || parsed.mindmap.title || 'Main Topic').substring(0, 100),
            nodes: transformNodes(parsed.mindmap.nodes)
          };
          console.log('🎉 Successfully created mindmap with', response.mindmap.nodes.length, 'branches');
        } else {
          console.warn('⚠️ No valid mindmap nodes found');
          throw new Error('Invalid mindmap structure');
        }
      } catch (parseError) {
        console.error('❌ Failed to parse mindmap JSON:', parseError);
        console.error('📝 Raw response preview:', aiResult.substring(0, 500));
        
        // Create a COMPREHENSIVE fallback mindmap from the content
        const lines = aiResult.split('\n').filter(l => l.trim().length > 10);
        const sentences = aiResult.split(/[.!?]+/).filter(s => s.trim().length > 15);
        
        // Extract key topics from the notes
        const topics = body.content
          .split(/[\n.!?]+/)
          .filter(s => s.trim().length > 10)
          .slice(0, 20);
        
        // Create structured fallback with actual content
        const createFallbackBranch = (topic: string, index: number): MindMapNode => {
          const words = topic.trim().split(' ');
          const label = words.slice(0, 5).join(' ');
          const description = words.slice(0, 15).join(' ');
          
          return {
            id: `branch${index + 1}`,
            label: label || `Concept ${index + 1}`,
            description: description || topic.substring(0, 100),
            icon: ['concept', 'definition', 'example', 'process', 'important'][index % 5],
            children: [] as MindMapNode[]
          };
        };
        
        response.mindmap = {
          title: 'Study Mind Map',
          central: topics[0]?.substring(0, 50) || 'Main Topic',
          nodes: topics.slice(1, 8).map((topic, idx) => {
            const mainBranch = createFallbackBranch(topic, idx);
            
            // Add 2-3 children to each main branch
            const childTopics = topics.slice(8 + (idx * 3), 8 + (idx * 3) + 3);
            mainBranch.children = childTopics.map((childTopic, childIdx) => ({
              id: `branch${idx + 1}-${childIdx + 1}`,
              label: childTopic.split(' ').slice(0, 4).join(' ') || `Detail ${childIdx + 1}`,
              description: childTopic.substring(0, 80),
              icon: ['definition', 'example', 'tip'][childIdx % 3],
              children: []
            }));
            
            return mainBranch;
          })
        };
        
        console.log('✅ Created ENHANCED fallback mindmap with', response.mindmap.nodes.length, 'main branches and nested children');
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

        // Trigger achievement check asynchronously (don't wait for it)
        fetch(`${req.headers.get('origin') || 'http://localhost:3000'}/api/achievements`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: decoded.userId,
            action: 'content_generated',
            data: { mode: body.mode, timestamp: now },
          }),
        }).catch(err => console.error('Failed to update achievements:', err));
      } catch (statError) {
        console.error('Failed to record stats:', statError);
        // Don't fail the request if stats recording fails
      }
    } else {
      // For guest users, trigger achievement check with guest ID
      const guestId = 'guest';
      try {
        const duration = Date.now() - startTime;
        const id = uuidv4();
        const now = new Date().toISOString();
        
        db.prepare(
          `INSERT INTO user_stats (id, user_id, mode, success, duration_ms, created_at)
           VALUES (?, ?, ?, ?, ?, ?)`
        ).run(id, guestId, body.mode, success ? 1 : 0, duration, now);

        // Trigger achievement check for guest
        fetch(`${req.headers.get('origin') || 'http://localhost:3000'}/api/achievements`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: guestId,
            action: 'content_generated',
            data: { mode: body.mode, timestamp: now },
          }),
        }).catch(err => console.error('Failed to update achievements:', err));
      } catch (statError) {
        console.error('Failed to record guest stats:', statError);
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
