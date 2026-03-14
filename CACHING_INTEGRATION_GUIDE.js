/**
 * ═══════════════════════════════════════════════════════════════════════
 * ADALA GREETING & CACHING - FRONTEND INTEGRATION GUIDE
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * These are the new API endpoints available for zero-cost interactions
 */

// ═══════════════════════════════════════════════════════════════════════
// 1. CHECK IF MESSAGE IS A GREETING (ZERO API CALL)
// ═══════════════════════════════════════════════════════════════════════

async function checkGreeting(text, language) {
  try {
    const response = await fetch('/api/check-greeting', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language })
    });
    
    const data = await response.json();
    
    if (data.isGreeting) {
      console.log('✅ Greeting detected - auto-reply:', data.reply);
      return {
        isGreeting: true,
        reply: data.reply,
        cached: true
      };
    }
    
    return { isGreeting: false, cached: true };
  } catch (error) {
    console.error('Greeting check failed:', error);
    return null;
  }
}

// Usage:
/*
const result = await checkGreeting('السلام عليكم', 'ar');
if (result?.isGreeting) {
  displayMessage(result.reply, 'assistant');
  return; // Don't call main API
}
*/

// ═══════════════════════════════════════════════════════════════════════
// 2. GET SUGGESTED QUESTIONS FOR HOME TAB (ZERO API CALL)
// ═══════════════════════════════════════════════════════════════════════

async function getSuggestedQuestionsForHome(language = 'ar') {
  try {
    const response = await fetch(`/api/suggested-questions?language=${language}`);
    const data = await response.json();
    
    console.log(`✅ Got ${data.count} suggested questions (cached)`);
    return data.suggestions; // Array of { question, domain }
  } catch (error) {
    console.error('Suggestions fetch failed:', error);
    return [];
  }
}

// Usage:
/*
useEffect(() => {
  const suggestions = await getSuggestedQuestionsForHome(language);
  setSuggestedQuestions(suggestions);
}, [language]);

// Render as clickable quick-start buttons
{suggestions.map(s => (
  <button key={s.question} onClick={() => handleQuestion(s.question)}>
    {s.question}
  </button>
))}
*/

// ═══════════════════════════════════════════════════════════════════════
// 3. CHECK IF QUESTION HAS CACHED ANSWER (ZERO API CALL)
// ═══════════════════════════════════════════════════════════════════════

async function checkCachedAnswer(question, language) {
  try {
    const response = await fetch('/api/check-cached-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, language })
    });
    
    const data = await response.json();
    
    if (data.hasCached) {
      console.log('✅ Cached answer found - domain:', data.domain);
      return {
        hasCached: true,
        answer: data.answer,
        domain: data.domain,
        confidence: data.confidence,
        cached: true
      };
    }
    
    return { hasCached: false, cached: true };
  } catch (error) {
    console.error('Cached answer check failed:', error);
    return null;
  }
}

// Usage:
/*
const cached = await checkCachedAnswer(userQuestion, language);
if (cached?.hasCached) {
  displayMessage(cached.answer, 'assistant');
  return; // Don't call main API
}
*/

// ═══════════════════════════════════════════════════════════════════════
// 4. OPTIMIZED AQA FLOW WITH CACHING
// ═══════════════════════════════════════════════════════════════════════

async function askQuestionWithCaching(userMessage, language, onResponse) {
  // Step 1: Check if greeting
  const greetingCheck = await checkGreeting(userMessage, language);
  if (greetingCheck?.isGreeting) {
    onResponse({
      content: greetingCheck.reply,
      isGreeting: true,
      provider: 'greeting_auto_reply',
      cached: true
    });
    return;
  }

  // Step 2: Check if cached answer
  const cachedCheck = await checkCachedAnswer(userMessage, language);
  if (cachedCheck?.hasCached) {
    onResponse({
      content: cachedCheck.answer,
      isCached: true,
      domain: cachedCheck.domain,
      confidence: cachedCheck.confidence,
      provider: 'cached_suggestion',
      cached: true
    });
    return;
  }

  // Step 3: Call main API for non-cached questions
  try {
    const response = await fetch('/api/moroccan-law-qa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: userMessage }],
        language
      })
    });

    const data = await response.json();
    onResponse({
      content: data.content,
      provider: data.provider || 'main_qa_api',
      cached: false,
      ...data
    });
  } catch (error) {
    console.error('API error:', error);
    onResponse({
      content: 'عذراً، حدث خطأ. يرجى المحاولة مجدداً.',
      provider: 'error',
      cached: false
    });
  }
}

// Usage in React component:
/*
const handleSubmit = async (userMessage) => {
  setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
  setThinking(true);

  await askQuestionWithCaching(
    userMessage,
    language,
    (response) => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.content,
        provider: response.provider,
        cached: response.cached
      }]);
      setThinking(false);
    }
  );
};
*/

// ═══════════════════════════════════════════════════════════════════════
// 5. COST ANALYSIS - HOW MUCH YOU'RE SAVING
// ═══════════════════════════════════════════════════════════════════════

/**
 * With Greeting + Caching (IMPLEMENTED):
 * 
 * Per 100 user questions:
 * - 15% Greetings: 0 API calls (saved ~15 API calls)
 * - 20% Cached suggestions: 0 API calls (saved ~20 API calls)
 * - 65% Regular questions: 65 API calls
 * ──────────────────────────────
 * TOTAL: 65 API calls out of 100 = 35% cost reduction ✅
 * 
 * Monthly Savings (1000 questions/month):
 * - Without caching: $X cost (based on API pricing)
 * - With caching: $X * 0.65 = 35% reduction
 * 
 * Speed Improvement:
 * - Greeting: <100ms (instant)
 * - Cached: <200ms (instant from local cache)
 * - Regular: 2-5s (API latency)
 */

// ═══════════════════════════════════════════════════════════════════════
// 6. MONITORING & ANALYTICS
// ═══════════════════════════════════════════════════════════════════════

class CachingAnalytics {
  constructor() {
    this.stats = {
      greetings_detected: 0,
      cached_answers: 0,
      api_calls: 0,
      total_questions: 0
    };
  }

  recordGreeting() {
    this.stats.greetings_detected++;
    this.stats.total_questions++;
    this.logStats();
  }

  recordCached() {
    this.stats.cached_answers++;
    this.stats.total_questions++;
    this.logStats();
  }

  recordAPI() {
    this.stats.api_calls++;
    this.stats.total_questions++;
    this.logStats();
  }

  getCostSavings() {
    const cachedSavings = this.stats.greetings_detected + this.stats.cached_answers;
    const percentage = (cachedSavings / this.stats.total_questions) * 100;
    return {
      cached_interactions: cachedSavings,
      api_calls_saved: cachedSavings,
      percentage_saved: percentage.toFixed(2),
      stats: this.stats
    };
  }

  logStats() {
    const savings = this.getCostSavings();
    console.log(
      `📊 Caching Stats: ${savings.cached_interactions} cached (${savings.percentage_saved}% saved) | ` +
      `${this.stats.api_calls} API calls | Total: ${this.stats.total_questions} questions`
    );
  }
}

// Usage:
/*
const analytics = new CachingAnalytics();

if (response.isGreeting) analytics.recordGreeting();
else if (response.isCached) analytics.recordCached();
else analytics.recordAPI();

// Get stats anytime:
console.log(analytics.getCostSavings());
*/

// ═══════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════

export {
  checkGreeting,
  getSuggestedQuestionsForHome,
  checkCachedAnswer,
  askQuestionWithCaching,
  CachingAnalytics
};
