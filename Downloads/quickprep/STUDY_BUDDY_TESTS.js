/**
 * Study Buddy Backend Integration - Quick Test
 * 
 * This file demonstrates how to test the AI Study Buddy backend integration
 * Copy these examples into your browser console or test files
 */

// ============================================================================
// QUICK START EXAMPLES
// ============================================================================

/**
 * 1. Test the health check endpoint
 */
async function testHealthCheck() {
  try {
    const response = await fetch('/api/studybuddy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'health_check' })
    });
    const data = await response.json();
    console.log('✅ Health Check:', data);
    return data;
  } catch (error) {
    console.error('❌ Health Check Failed:', error);
  }
}

/**
 * 2. Test welcome message
 */
async function testWelcomeMessage() {
  try {
    const response = await fetch('/api/studybuddy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'welcome',
        userName: 'TestStudent',
        studyStreak: 7,
        totalStudyTime: 300,
        completedTasks: 15
      })
    });
    const data = await response.json();
    console.log('🎉 Welcome Message:', data.message);
    return data;
  } catch (error) {
    console.error('❌ Welcome Test Failed:', error);
  }
}

/**
 * 3. Test study buddy response
 */
async function testBuddyResponse(userQuestion = 'How can I improve my memory?') {
  try {
    const response = await fetch('/api/studybuddy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'response',
        userMessage: userQuestion,
        userName: 'TestStudent',
        context: 'Studying neuroscience and memory concepts'
      })
    });
    const data = await response.json();
    console.log('💬 Buddy Response:', data.message);
    return data;
  } catch (error) {
    console.error('❌ Response Test Failed:', error);
  }
}

/**
 * 4. Test motivation message
 */
async function testMotivation() {
  try {
    const response = await fetch('/api/studybuddy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'motivation',
        userName: 'TestStudent',
        studyStreak: 14,
        totalStudyTime: 600,
        completedTasks: 25,
        currentMood: 'tired'
      })
    });
    const data = await response.json();
    console.log('🚀 Motivation:', data.message);
    return data;
  } catch (error) {
    console.error('❌ Motivation Test Failed:', error);
  }
}

/**
 * 5. Test content explanation
 */
async function testContentExplanation(topic = 'photosynthesis') {
  try {
    const response = await fetch('/api/studybuddy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'content_explain',
        userMessage: `Explain ${topic} in simpler terms`,
        userName: 'TestStudent',
        context: `Complex notes about ${topic}...`
      })
    });
    const data = await response.json();
    console.log('📚 Explanation:', data.message);
    return data;
  } catch (error) {
    console.error('❌ Explanation Test Failed:', error);
  }
}

/**
 * 6. Test quiz generation
 */
async function testQuizGeneration() {
  try {
    const response = await fetch('/api/studybuddy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'content_quiz',
        userMessage: 'Create a quiz for this content',
        userName: 'TestStudent',
        context: 'Study notes about photosynthesis and cellular respiration...'
      })
    });
    const data = await response.json();
    console.log('🎯 Quiz:', data.message);
    return data;
  } catch (error) {
    console.error('❌ Quiz Test Failed:', error);
  }
}

/**
 * 7. Test break suggestion
 */
async function testBreakSuggestion() {
  try {
    const response = await fetch('/api/studybuddy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'break',
        userName: 'TestStudent',
        totalStudyTime: 180,
        currentMood: 'focused'
      })
    });
    const data = await response.json();
    console.log('☕ Break Suggestion:', data.message);
    return data;
  } catch (error) {
    console.error('❌ Break Test Failed:', error);
  }
}

/**
 * 8. Test all request types sequentially
 */
async function runFullTest() {
  console.log('🧪 Starting Full Backend Integration Test...\n');
  
  console.log('1️⃣ Testing Health Check...');
  await testHealthCheck();
  
  console.log('\n2️⃣ Testing Welcome Message...');
  await testWelcomeMessage();
  
  console.log('\n3️⃣ Testing Buddy Response...');
  await testBuddyResponse('What are the best study techniques?');
  
  console.log('\n4️⃣ Testing Motivation...');
  await testMotivation();
  
  console.log('\n5️⃣ Testing Content Explanation...');
  await testContentExplanation('quantum mechanics');
  
  console.log('\n6️⃣ Testing Quiz Generation...');
  await testQuizGeneration();
  
  console.log('\n7️⃣ Testing Break Suggestion...');
  await testBreakSuggestion();
  
  console.log('\n✅ Full test completed!');
}

// ============================================================================
// USING THE API CLIENT (from apiClient.ts)
// ============================================================================

/**
 * Alternative approach using the API client
 * Import at the top: import { sendStudyBuddyMessage } from '@/lib/apiClient';
 */

async function testWithApiClient() {
  // Example 1: Send a simple message
  try {
    const response = await sendStudyBuddyMessage({
      type: 'response',
      userMessage: 'How do I organize my notes?',
      userName: 'John',
      context: 'Studying for exams'
    });
    console.log('Response:', response.message);
    console.log('Emotion:', response.emotion);
  } catch (error) {
    console.error('Error:', error);
  }

  // Example 2: Get motivation
  try {
    const response = await sendStudyBuddyMessage({
      type: 'motivation',
      userName: 'Jane',
      studyStreak: 10,
      currentMood: 'overwhelmed'
    });
    console.log('Motivation:', response.message);
  } catch (error) {
    console.error('Error:', error);
  }

  // Example 3: Generate study hints
  try {
    const response = await sendStudyBuddyMessage({
      type: 'help',
      userMessage: 'I\'m stuck on this topic',
      userName: 'Bob'
    });
    console.log('Help:', response.message);
    console.log('Suggestions:', response.suggestions);
  } catch (error) {
    console.error('Error:', error);
  }
}

// ============================================================================
// DEBUGGING HELPERS
// ============================================================================

/**
 * Log request/response pairs for debugging
 */
async function debugRequest(requestType, payload = {}) {
  console.group(`🔍 Debugging: ${requestType}`);
  console.log('Request Payload:', {
    type: requestType,
    ...payload
  });
  
  try {
    const response = await fetch('/api/studybuddy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: requestType, ...payload })
    });
    
    console.log('Response Status:', response.status);
    const data = await response.json();
    console.log('Response Data:', data);
    console.groupEnd();
    return data;
  } catch (error) {
    console.error('Error:', error);
    console.groupEnd();
  }
}

/**
 * Check backend connectivity
 */
async function checkBackendConnectivity() {
  try {
    const start = performance.now();
    const response = await fetch('/api/studybuddy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'health_check' })
    });
    const end = performance.now();
    
    const data = await response.json();
    console.log('✅ Backend Connected!');
    console.log(`Response Time: ${(end - start).toFixed(2)}ms`);
    console.log('Status:', data.status);
    console.log('Version:', data.version);
    return true;
  } catch (error) {
    console.error('❌ Backend Connection Failed:', error);
    return false;
  }
}

// ============================================================================
// USAGE IN BROWSER CONSOLE
// ============================================================================

/*
To use these functions, open your browser's Developer Console (F12) and run:

1. Test health check:
   testHealthCheck()

2. Test welcome:
   testWelcomeMessage()

3. Test buddy response:
   testBuddyResponse("What's the best way to study?")

4. Test motivation:
   testMotivation()

5. Run all tests:
   runFullTest()

6. Check backend:
   checkBackendConnectivity()

7. Debug a specific request:
   debugRequest('response', { userMessage: 'Hello!', userName: 'Test' })

To use the API client approach in your code:
   import { sendStudyBuddyMessage } from '@/lib/apiClient';
   const response = await sendStudyBuddyMessage({ type: 'welcome', userName: 'John' });
*/

// ============================================================================
// EXPORT FOR MODULE USAGE
// ============================================================================

export {
  testHealthCheck,
  testWelcomeMessage,
  testBuddyResponse,
  testMotivation,
  testContentExplanation,
  testQuizGeneration,
  testBreakSuggestion,
  runFullTest,
  testWithApiClient,
  debugRequest,
  checkBackendConnectivity
};
