import { NextRequest, NextResponse } from 'next/server';

// Real YouTube video info fetching using oEmbed API
async function getVideoInfo(videoId: string) {
  try {
    // Use YouTube oEmbed API - free, no API key required
    const response = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    );
    
    if (!response.ok) {
      throw new Error('Video not found or unavailable');
    }
    
    const data = await response.json();
    
    return {
      videoId,
      title: data.title || 'Educational Video',
      thumbnail: data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      duration: 'Video',
      author: data.author_name || 'Unknown'
    };
  } catch (error) {
    console.error('Error fetching video info:', error);
    return {
      videoId,
      title: 'Educational Video Lecture',
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      duration: 'Video',
      author: 'YouTube'
    };
  }
}

// Real transcript extraction from YouTube
async function getVideoTranscript(videoId: string): Promise<string> {
  try {
    // Fetch the YouTube watch page
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error('Could not access video page');
    }
    
    const html = await response.text();
    
    // Extract captions data from YouTube page
    // YouTube embeds caption data in the page HTML
    const captionTracksMatch = html.match(/"captionTracks":\s*\[(.*?)\]/);
    
    if (!captionTracksMatch) {
      // Try alternative: extract from ytInitialPlayerResponse
      const playerResponseMatch = html.match(/var ytInitialPlayerResponse = ({.+?});/);
      if (playerResponseMatch) {
        try {
          const playerResponse = JSON.parse(playerResponseMatch[1]);
          const captionTracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
          
          if (captionTracks && captionTracks.length > 0) {
            // Get the first available caption track (usually English)
            const captionUrl = captionTracks[0].baseUrl;
            return await fetchCaptionContent(captionUrl);
          }
        } catch (e) {
          console.error('Error parsing player response:', e);
        }
      }
      throw new Error('No captions available for this video');
    }
    
    // Parse caption tracks
    const captionTracksJson = `[${captionTracksMatch[1]}]`;
    const captionTracks = JSON.parse(captionTracksJson);
    
    if (captionTracks.length === 0) {
      throw new Error('No caption tracks found');
    }
    
    // Prefer English captions, fall back to first available
    const englishTrack = captionTracks.find((track: any) => 
      track.languageCode === 'en' || track.languageCode?.startsWith('en')
    ) || captionTracks[0];
    
    const captionUrl = englishTrack.baseUrl;
    return await fetchCaptionContent(captionUrl);
    
  } catch (error) {
    console.error('Transcript extraction error:', error);
    throw error;
  }
}

// Fetch and parse caption XML content
async function fetchCaptionContent(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Could not fetch captions');
    }
    
    const xml = await response.text();
    
    // Parse XML and extract text
    // YouTube captions are in XML format with <text> tags
    const textMatches = xml.matchAll(/<text[^>]*>([^<]+)<\/text>/g);
    const texts: string[] = [];
    
    for (const match of textMatches) {
      // Decode HTML entities
      let text = match[1]
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\n/g, ' ')
        .trim();
      
      if (text) {
        texts.push(text);
      }
    }
    
    if (texts.length === 0) {
      throw new Error('No text found in captions');
    }
    
    return texts.join(' ');
  } catch (error) {
    console.error('Error fetching caption content:', error);
    throw error;
  }
}

async function analyzeVideoContent(videoId: string, transcript: string, videoTitle: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = 'gemini-2.0-flash-exp';

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  // Truncate transcript to fit within token limits (keep first 25000 chars for more context)
  const truncatedTranscript = transcript.substring(0, 25000);
  const wordCount = truncatedTranscript.split(/\s+/).length;
  const estimatedDuration = Math.ceil(wordCount / 150); // ~150 words per minute

  const prompt = `You are an expert educational content analyzer with STRICT accuracy requirements. Analyze this REAL YouTube video transcript.

📺 VIDEO: ${videoTitle}
📝 TRANSCRIPT (${wordCount} words, ~${estimatedDuration} min):

${truncatedTranscript}

🎯 CRITICAL RULES - READ CAREFULLY:
1. ONLY extract information that ACTUALLY appears in the transcript above
2. DO NOT generate generic or placeholder content
3. FIND REAL timestamps by analyzing topic transitions
4. EXTRACT ACTUAL formulas, equations, or technical expressions if mentioned
5. IDENTIFY REAL definitions and technical terms from the transcript
6. Create detailed notes using REAL content flow from the video

JSON OUTPUT REQUIREMENTS:

{
  "summary": "Write 6-8 sentences using ACTUAL content from transcript. Describe what was REALLY discussed, specific topics covered, actual examples given, real conclusions made. BE SPECIFIC - mention actual concepts, names, numbers from the transcript.",
  
  "keyPoints": [
    {"timestamp": "00:45", "point": "Real topic/concept from beginning of transcript"},
    {"timestamp": "03:30", "point": "Actual explanation or point made in transcript"},
    {"timestamp": "06:15", "point": "Specific example or case study from transcript"},
    {"timestamp": "09:00", "point": "Technical detail or formula mentioned in transcript"},
    {"timestamp": "12:30", "point": "Real application or comparison from transcript"},
    {"timestamp": "15:45", "point": "Actual conclusion or summary from transcript"}
  ],
  
  "notes": "# Complete Study Notes: ${videoTitle}\\n\\n## Overview\\n[3-4 sentences about what this video ACTUALLY covers based on transcript]\\n\\n## Core Concepts Explained\\n\\n### [Real Concept 1 Name from Transcript]\\n- [Actual detail explained in video]\\n- [Real example or clarification given]\\n- [Specific information mentioned]\\n\\n### [Real Concept 2 Name from Transcript]\\n- [Actual detail explained in video]\\n- [Real example or clarification given]\\n- [Specific information mentioned]\\n\\n### [Real Concept 3 Name from Transcript]\\n- [Actual detail explained in video]\\n- [Real example or clarification given]\\n\\n## Key Points & Details\\n\\n1. **[Real Topic from Video]**\\n   - [Specific detail from transcript]\\n   - [Actual point made]\\n\\n2. **[Real Topic from Video]**\\n   - [Specific detail from transcript]\\n   - [Actual point made]\\n\\n## Examples & Demonstrations\\n- **[Real Example 1]**: [Actual description from video]\\n- **[Real Example 2]**: [Actual description from video]\\n\\n## Important Terminology\\n[List actual terms defined in video]\\n\\n## Practical Applications\\n[Real applications discussed in video]\\n\\n## Summary & Takeaways\\n- [Real takeaway 1 from video conclusion]\\n- [Real takeaway 2 from video conclusion]\\n- [Real takeaway 3 from video conclusion]",
  
  "formulas": ["List EVERY mathematical formula, equation, chemical formula, algorithm, code snippet, or technical expression ACTUALLY SPOKEN/SHOWN in the video. Format: 'E = mc²', 'F = ma', 'ax² + bx + c = 0'. If NONE mentioned, return []"],
  
  "definitions": [
    {"term": "[Actual Technical Term 1 from video]", "definition": "[Exact definition/explanation given in video]"},
    {"term": "[Actual Technical Term 2 from video]", "definition": "[Exact definition/explanation given in video]"},
    {"term": "[Actual Technical Term 3 from video]", "definition": "[Exact definition/explanation given in video]"}
  ]
}

⚠️ ABSOLUTE REQUIREMENTS:
- Generate 12-18 keyPoints with REAL content from different parts of transcript
- Timestamps MUST be chronological and realistic for video duration
- Notes MUST be 600+ words, comprehensive, using REAL transcript information
- Extract EVERY formula/equation mentioned - be thorough
- Extract 5-15 definitions of technical terms ACTUALLY defined in video
- If no formulas mentioned, return []
- If no clear definitions, extract key terms with context from transcript
- Summary must capture SPECIFIC content, not generic descriptions
- DO NOT make up information - ONLY use what's in the transcript
- Return ONLY valid JSON with proper escaping

ANALYZE NOW:`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 8192,
            topP: 0.95,
            topK: 40,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Gemini API Error:', errorData);
      throw new Error(`AI analysis failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid AI response structure');
    }
    
    const result = data.candidates[0].content.parts[0].text;
    console.log('Raw AI Response:', result.substring(0, 500));
    
    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = result;
    
    // Remove markdown code blocks if present
    const codeBlockMatch = result.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1].trim();
    }
    
    // Find JSON object
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Could not find JSON in response:', result);
      throw new Error('AI response format invalid');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    // Validate required fields
    if (!parsed.summary || !parsed.keyPoints || !parsed.notes) {
      throw new Error('AI response missing required fields');
    }
    
    return parsed;
  } catch (error) {
    console.error('AI Analysis Error:', error);
    // Create SMART fallback from REAL transcript content
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 40);
    const paragraphs = transcript.split(/\n\n+/).filter(p => p.trim().length > 100);
    
    // Extract potential formulas (look for mathematical expressions)
    const formulaPatterns = [
      /([A-Z])\s*=\s*([^.]+)/g,
      /\b([a-z]²|[a-z]³|√[a-z]|∑|∫|π|θ|α|β|γ|Δ)\b/g,
      /\d+\s*[+\-×÷]\s*\d+\s*=\s*\d+/g
    ];
    const extractedFormulas: string[] = [];
    formulaPatterns.forEach(pattern => {
      const matches = transcript.matchAll(pattern);
      for (const match of matches) {
        if (match[0].length < 100) extractedFormulas.push(match[0].trim());
      }
    });
    
    // Extract definitions (look for "is", "are", "means", "refers to" patterns)
    const definitionPattern = /([A-Z][a-z]+(?:\s+[A-Z]?[a-z]+)*)\s+(?:is|are|means?|refers? to|defined as)\s+([^.!?]{20,150})/g;
    const extractedDefs: Array<{term: string, definition: string}> = [];
    const defMatches = transcript.matchAll(definitionPattern);
    for (const match of defMatches) {
      if (extractedDefs.length < 8) {
        extractedDefs.push({
          term: match[1].trim(),
          definition: match[2].trim()
        });
      }
    }
    
    // Generate intelligent keyPoints from sentence flow
    const contentChunks = sentences.slice(0, 20);
    const keyPoints = contentChunks.slice(0, 12).map((sentence, idx) => {
      const minutes = Math.floor((idx * estimatedDuration) / 12);
      const seconds = ((idx * estimatedDuration * 60) / 12) % 60;
      return {
        timestamp: `${String(minutes).padStart(2, '0')}:${String(Math.floor(seconds)).padStart(2, '0')}`,
        point: sentence.trim().substring(0, 180)
      };
    });
    
    // Create comprehensive notes from actual transcript
    const notesContent = `# ${videoTitle}

## Video Overview
${paragraphs.slice(0, 2).join('\n\n').substring(0, 400)}

## Main Topics Covered

### Topic Analysis
${contentChunks.slice(0, 5).map((s, i) => `${i + 1}. ${s.trim()}`).join('\n')}

## Detailed Content

### Section 1: Introduction
${contentChunks.slice(0, 3).map(s => `- ${s.trim()}`).join('\n')}

### Section 2: Core Concepts  
${contentChunks.slice(3, 6).map(s => `- ${s.trim()}`).join('\n')}

### Section 3: Key Points
${contentChunks.slice(6, 9).map(s => `- ${s.trim()}`).join('\n')}

### Section 4: Applications & Examples
${contentChunks.slice(9, 12).map(s => `- ${s.trim()}`).join('\n')}

## Summary
${contentChunks.slice(0, 3).join(' ').substring(0, 300)}

## Study Recommendations
- Watch the video completely to understand full context
- Take notes on key concepts mentioned
- Review the material multiple times
- Practice with any examples shown`;
    
    return {
      summary: `${contentChunks.slice(0, 4).join(' ').substring(0, 500)}. This video provides educational content covering multiple aspects of the topic with detailed explanations and examples.`,
      keyPoints,
      notes: notesContent,
      formulas: extractedFormulas.slice(0, 10),
      definitions: extractedDefs.length > 0 ? extractedDefs : contentChunks.slice(0, 5).map((sentence, idx) => ({
        term: sentence.split(/\s+/).slice(0, 3).join(' '),
        definition: sentence.trim().substring(0, 200)
      }))
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { videoId } = await request.json();

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    // Validate video ID format
    if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return NextResponse.json(
        { error: 'Invalid video ID format' },
        { status: 400 }
      );
    }

    console.log('🎥 Processing video:', videoId);

    // Get video information (with real API)
    console.log('📺 Fetching video info...');
    const videoInfo = await getVideoInfo(videoId);
    console.log('✅ Got video info:', videoInfo.title);

    // Get transcript (with fallback)
    let transcript = '';
    let transcriptAvailable = false;
    
    try {
      console.log('📝 Extracting transcript...');
      transcript = await getVideoTranscript(videoId);
      transcriptAvailable = true;
      console.log(`✅ Got transcript (${transcript.length} characters)`);
    } catch (error) {
      console.warn('⚠️ Transcript not available:', error instanceof Error ? error.message : 'Unknown error');
      // Use video title and basic structure as fallback
      transcript = `Video Title: ${videoInfo.title}. This is an educational video lecture. The video covers important concepts and provides detailed explanations. Students should watch the full video to understand all topics discussed. Key learning points will be covered throughout the presentation.`;
    }

    // Analyze content with AI
    console.log('🤖 Analyzing with AI...');
    const analysis = await analyzeVideoContent(videoId, transcript, videoInfo.title);
    console.log('✅ Analysis complete');

    // Combine all data
    const result = {
      ...videoInfo,
      ...analysis,
      transcriptAvailable
    };

    console.log('🎉 Video processing successful');
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('❌ Video processing error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to process video';
    const statusCode = errorMessage.includes('not found') ? 404 : 500;
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: statusCode }
    );
  }
}
