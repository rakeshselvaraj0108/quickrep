// Test Gemini API connectivity
const API_KEY = 'AIzaSyDtHY7D6qPZNn5N_7tgFDP_n0kh5lK_cf0';
const MODEL = 'models/gemini-2.5-flash';

async function testGeminiAPI() {
  console.log('🧪 Testing Gemini API...\n');
  
  try {
    console.log('📝 API Key Format:', API_KEY.slice(0, 10) + '...');
    console.log('🔧 Model:', MODEL);
    console.log('🌐 Endpoint: https://generativelanguage.googleapis.com/v1beta/\n');
    
    const prompt = 'Say hello in a friendly way for a study buddy. Keep it under 20 words.';
    
    console.log('📤 Sending request...');
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${MODEL}:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 100,
          },
        }),
      }
    );

    console.log(`📡 Response Status: ${response.status} ${response.statusText}\n`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API ERROR:');
      console.error(errorText);
      return;
    }

    const data = await response.json();
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error('❌ Empty response from API');
      console.error('Response structure:', JSON.stringify(data, null, 2));
      return;
    }

    const result = data.candidates[0].content.parts[0].text;
    console.log('✅ SUCCESS! Gemini Response:');
    console.log(`"${result}"\n`);
    console.log('🎉 Gemini API is working correctly!');

  } catch (error) {
    console.error('💥 Network Error:', error.message);
    if (error.cause) {
      console.error('📋 Cause:', error.cause);
    }
  }
}

testGeminiAPI();
