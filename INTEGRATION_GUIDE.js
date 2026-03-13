/**
 * INTEGRATION GUIDE: Wiring qa-optimizer-config.js into server.js
 * 
 * Copy-paste examples showing exactly where and how to integrate the validators
 * into your existing /api/moroccan-law-qa endpoint.
 */

// ═══════════════════════════════════════════════════════════════════════
// STEP 1: IMPORT AT TOP OF server.js
// ═══════════════════════════════════════════════════════════════════════

/*
Add these lines to the top of server.js (after other requires):

const {
  validateAll,
  detectQuestionType,
  detectMixedLanguage,
  calculateConfidence,
  buildRepairInstruction,
  buildResponseWrapper,
  DEGRADED_RESPONSES
} = require('./qa-optimizer-config');
*/

// ═══════════════════════════════════════════════════════════════════════
// STEP 2: UPDATE /api/moroccan-law-qa ENDPOINT
// ═══════════════════════════════════════════════════════════════════════

/*
BEFORE (existing code in server.js):

app.post("/api/moroccan-law-qa", async (req, res) => {
  const { messages, language } = req.body;
  const userQuery = messages[messages.length - 1].content;
  
  try {
    // ... existing code ...
    
    // Call LLM provider
    const response = await tryGemini(...) || await tryCohere(...) || ...;
    
    // Return response
    res.json({ content: response, degraded: false });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

---

AFTER (with optimization):

app.post("/api/moroccan-law-qa", async (req, res) => {
  const { messages, language, response_mode } = req.body;  // ← NEW: response_mode param
  const userQuery = messages[messages.length - 1].content;
  const mode = response_mode || 'prose';  // ← Default to prose
  
  try {
    // Step 1: Language detection + mixed-language routing
    const mixedDetection = detectMixedLanguage(userQuery, language, userQuery);
    const routeLanguage = mixedDetection.route;
    console.log(`[QA] Language detected: ${language}, Route: ${routeLanguage}`);
    
    // Step 2: Question type detection (for length tuning)
    const questionType = detectQuestionType(userQuery);
    console.log(`[QA] Question type: ${questionType}`);
    
    // Step 3: Existing retrieval + domain classification
    const topChunks = retrieveTopChunks(userQuery, 4);
    const domain = classifyDomain(userQuery);
    const legalContext = getLegalContext(domain, userQuery);
    
    // Step 4: Check off-topic
    if (!isLegalQuestion(userQuery, language)) {
      const fallbackMsg = DEGRADED_RESPONSES[language]['off_topic'];
      return res.json(buildResponseWrapper(
        fallbackMsg,
        mode,
        true,
        'fallback',
        language,
        'other',
        0.0,
        { passed: false, severity: 'severe' }
      ));
    }
    
    // Step 5: Build system prompt
    const systemPrompt = buildSystemPrompt(language, topChunks, domain, legalContext);
    
    // Step 6: Call LLM with validation + repair loop
    let llmResponse = null;
    let providerUsed = null;
    let attemptCount = 0;
    const maxAttempts = 2;  // Try provider twice (original + repair)
    
    while (attemptCount < maxAttempts && !llmResponse) {
      attemptCount++;
      
      try {
        // Try provider chain for this route
        const providerChain = getProviderChain(routeLanguage);
        
        for (const provider of providerChain) {
          try {
            llmResponse = await provider.query(systemPrompt, userQuery, mode);
            providerUsed = provider.name;
            console.log(`[QA] Provider succeeded: ${provider.name}`);
            break;  // Exit provider loop if successful
          } catch (error) {
            console.log(`[QA] Provider ${provider.name} failed: ${error.message}`);
            continue;  // Try next provider
          }
        }
        
        // If no provider succeeded, use fallback
        if (!llmResponse) {
          const fallbackMsg = DEGRADED_RESPONSES[language]['all_providers_failed'];
          return res.json(buildResponseWrapper(
            fallbackMsg,
            mode,
            true,
            'fallback',
            language,
            domain,
            0.0,
            { passed: false, severity: 'moderate' }
          ));
        }
        
      } catch (error) {
        if (attemptCount === maxAttempts) throw error;
      }
      
      // Step 7: Validate response
      if (attemptCount === 1) {
        const validation = validateAll(
          llmResponse,
          topChunks,
          language,
          questionType,
          mode
        );
        
        console.log(`[QA] Validation result:`, validation);
        
        if (!validation.passed && validation.shouldRepair) {
          // Need repair: build repair instruction and retry
          const repairInstruction = buildRepairInstruction(
            validation.validations,
            topChunks,
            language,
            questionType
          );
          
          const repairPrompt = `${systemPrompt}\n\n${repairInstruction}`;
          
          console.log(`[QA] Triggering repair pass...`);
          
          // Try to repair (one more time)
          try {
            llmResponse = await provider.query(repairPrompt, userQuery, mode);
            console.log(`[QA] Repair successful`);
          } catch (error) {
            console.log(`[QA] Repair failed: ${error.message}`);
            // Fall through to return degraded response
          }
        }
      }
    }
    
    // Step 8: Final validation + response assembly
    const finalValidation = validateAll(
      llmResponse,
      topChunks,
      language,
      questionType,
      mode
    );
    
    const confidence = calculateConfidence(
      topChunks,
      llmResponse.length,
      finalValidation.validations.citations
    );
    
    // Step 9: Return response with wrapper
    return res.json(buildResponseWrapper(
      llmResponse,
      mode,
      false,
      providerUsed,
      language,
      domain,
      confidence,
      finalValidation
    ));
    
  } catch (error) {
    console.error(`[QA] Unexpected error:`, error);
    const fallbackMsg = DEGRADED_RESPONSES[language || 'en']['system_error'];
    return res.json(buildResponseWrapper(
      fallbackMsg,
      mode,
      true,
      'fallback',
      language || 'en',
      'other',
      0.0,
      { passed: false, severity: 'severe' }
    ));
  }
});
*/

// ═══════════════════════════════════════════════════════════════════════
// STEP 3: ADD PROVIDER CHAIN HELPER (if not already present)
// ═══════════════════════════════════════════════════════════════════════

/*
Add this helper function to server.js:

function getProviderChain(route) {
  const chains = {
    // Darija/Arabic → Strong models first
    'ar': [
      { name: 'gemini-2.5-flash', query: (p, q, m) => tryGemini('gemini-2.5-flash', p, q, m) },
      { name: 'gemini-2.5-flash-lite', query: (p, q, m) => tryGemini('gemini-2.5-flash-lite', p, q, m) },
      { name: 'cohere', query: (p, q, m) => tryCohere(p, q, m) },
      { name: 'groq', query: (p, q, m) => tryGroq(p, q, m) }
    ],
    'dar': [
      { name: 'gemini-2.5-flash', query: (p, q, m) => tryGemini('gemini-2.5-flash', p, q, m) },
      { name: 'gemini-2.5-flash-lite', query: (p, q, m) => tryGemini('gemini-2.5-flash-lite', p, q, m) },
      { name: 'cohere', query: (p, q, m) => tryCohere(p, q, m) },
      { name: 'groq', query: (p, q, m) => tryGroq(p, q, m) }
    ],
    
    // French → Lite first (efficient)
    'fr': [
      { name: 'gemini-2.5-flash-lite', query: (p, q, m) => tryGemini('gemini-2.5-flash-lite', p, q, m) },
      { name: 'gemini-2.5-flash', query: (p, q, m) => tryGemini('gemini-2.5-flash', p, q, m) },
      { name: 'cohere', query: (p, q, m) => tryCohere(p, q, m) },
      { name: 'groq', query: (p, q, m) => tryGroq(p, q, m) }
    ],
    
    // English → Lite first
    'en': [
      { name: 'gemini-2.5-flash-lite', query: (p, q, m) => tryGemini('gemini-2.5-flash-lite', p, q, m) },
      { name: 'groq', query: (p, q, m) => tryGroq(p, q, m) },
      { name: 'gemini-2.5-flash', query: (p, q, m) => tryGemini('gemini-2.5-flash', p, q, m) },
      { name: 'cohere', query: (p, q, m) => tryCohere(p, q, m) }
    ],
    
    // Mixed (AR+FR) → Strong model
    'mixed(ar+fr)': [
      { name: 'gemini-2.5-flash', query: (p, q, m) => tryGemini('gemini-2.5-flash', p, q, m) },
      { name: 'cohere', query: (p, q, m) => tryCohere(p, q, m) },
      { name: 'gemini-2.5-flash-lite', query: (p, q, m) => tryGemini('gemini-2.5-flash-lite', p, q, m) },
      { name: 'groq', query: (p, q, m) => tryGroq(p, q, m) }
    ]
  };
  
  return chains[route] || chains['en'];  // Default to EN chain
}
*/

// ═══════════════════════════════════════════════════════════════════════
// STEP 4: UPDATE FRONTEND (React Component) TO HANDLE NEW RESPONSE FORMAT
// ═══════════════════════════════════════════════════════════════════════

/*
In moroccan-law-qa.jsx, update the fetch call:

// BEFORE:
const response = await fetch('/api/moroccan-law-qa', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [{ role: 'user', content: userMessage }],
    language: detectedLanguage
  })
});
const data = await response.json();
setAnswer(data.content);

// AFTER:
const response = await fetch('/api/moroccan-law-qa', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [{ role: 'user', content: userMessage }],
    language: detectedLanguage,
    response_mode: 'prose'  // ← NEW
  })
});
const data = await response.json();

// Handle both old (string) and new (wrapper) formats
if (data.content) {
  setAnswer(data.content);
  setConfidence(data.confidence_score || null);
  setDegraded(data.degraded || false);
  setValidationPassed(data.validation_passed !== false);
} else {
  setAnswer(data);  // Fallback to old format
}
*/

// ═══════════════════════════════════════════════════════════════════════
// STEP 5: TESTING THE INTEGRATION
// ═══════════════════════════════════════════════════════════════════════

/*
Test with this curl command:

curl -X POST http://localhost:8787/api/moroccan-law-qa \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"ما هي عقوبة السرقة؟"}],"language":"ar","response_mode":"prose"}'

Expected response wrapper:
{
  "content": "حسب المادة 467 من القانون الجنائي...",
  "mode": "prose",
  "degraded": false,
  "provider_used": "gemini-2.5-flash",
  "language_detected": "ar",
  "domain_detected": "penal",
  "confidence_score": 0.95,
  "validation_passed": true,
  "validation_severity": "none",
  "timestamp": "2025-03-13T00:15:00.000Z"
}
*/

// ═══════════════════════════════════════════════════════════════════════
// STEP 6: MONITORING & METRICS TO TRACK
// ═══════════════════════════════════════════════════════════════════════

/*
Log this data for analytics:

function logQAMetrics(validationResult, confidence, providerUsed, language, domain, route) {
  const metrics = {
    timestamp: new Date().toISOString(),
    language: language,
    domain: domain,
    route: route,
    provider: providerUsed,
    validation_passed: validationResult.passed,
    validation_severity: validationResult.severity,
    confidence_score: confidence,
    language_purity_violations: validationResult.validations.languagePurity.violations || 0,
    citation_hallucination: validationResult.validations.citations.hallucination_risk || false,
    length_excess: validationResult.validations.length.excess || 0
  };
  
  console.log('[METRICS]', JSON.stringify(metrics));
  // Send to analytics service, log to file, etc.
}

Track these KPIs weekly:
- Hallucination rate (% of responses with invalid citations)
- Citation accuracy (% of citations that are valid)
- Language purity (% of responses with zero code-switch violations)
- Validation pass rate (% passing all validators)
- Fallback rate (% with degraded=true)
- Average confidence score
- Latency (p50, p95)
*/

// ═══════════════════════════════════════════════════════════════════════
// IMPLEMENTATION CHECKLIST
// ═══════════════════════════════════════════════════════════════════════

/*
Before going to production:

☐ Import qa-optimizer-config at top of server.js
☐ Add response_mode parameter to request parsing
☐ Implement mixed-language detection logic
☐ Wire validators into post-LLM response flow
☐ Test validation on 10-question set (all languages)
☐ Implement repair pass (retry with repair instruction)
☐ Add response wrapper for all cases
☐ Update frontend to parse new response format
☐ Test backwards compatibility (old clients still work)
☐ Add confidence score display to frontend
☐ Add metrics logging
☐ Test graceful degradation (all providers fail scenario)
☐ Verify zero 5xx errors in logs
☐ Deploy to staging and monitor for 24 hours
☐ Deploy to 10% production traffic
☐ Monitor for 48 hours
☐ Expand to 50% production
☐ Final validation then 100% rollout

Phase timeline: 2 weeks end-to-end
- Week 1: Integration + staging validation
- Week 2: Gradual production rollout
*/

module.exports = {
  integrationGuide: `
    See this file for step-by-step instructions on wiring
    qa-optimizer-config.js into your server.js endpoint.
    
    Key steps:
    1. Import the config module
    2. Update /api/moroccan-law-qa to add response_mode param
    3. Add mixed-language detection
    4. Call validateAll() after LLM response
    5. Implement repair pass if validation fails
    6. Wrap response with buildResponseWrapper()
    7. Update frontend to handle new response format
  `
};
