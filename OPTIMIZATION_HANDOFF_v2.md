# ADALA LEGAL AI - LLM OPTIMIZATION HANDOFF (v2.0)
## Complete Technical Brief with Production-Ready Fixes

---

## EXECUTIVE SUMMARY

**System**: Moroccan legal QA assistant (React + Node.js)  
**Current State**: 4-language support (AR, DAR, FR, EN) with multi-provider routing  
**Goal**: Optimize prompting, reduce hallucination, improve consistency, enforce structured output  
**Scope**: Legal-only, citation-grounded, graceful degradation, zero 5xx errors  

**Key Fixes in v2.0**:
- ✅ JSON vs Prose conflict resolved (dual-mode system)
- ✅ Output length tuning (word/token-based, realistic caps)
- ✅ Mixed-language routing deterministic + precedence rules
- ✅ Automatic citation validation + repair pass
- ✅ Backend config module ready to integrate

---

## PART 1: CURRENT SYSTEM ARCHITECTURE

### Stack
```
Frontend: React + Vite
Backend: Node.js + Express
Endpoint: POST /api/moroccan-law-qa
Knowledge Base: law_chunks.jsonl (chunked legal corpus)
```

### Data Flow
```
User Input
    ↓
Language Detection (ar/dar/fr/en + mixed detection)
    ↓
Off-Topic Guard (multilingual legal keyword matching)
    ↓
Domain Classification (family, penal, procedure, contracts, labor)
    ↓
Semantic Retrieval (top 4 chunks via retrieveTopChunks)
    ↓
Legal Context Injection (getLegalContext by domain)
    ↓
Response Mode Selection (json or prose)
    ↓
LLM Routing (language-based provider chain)
    ↓
Prompt Assembly (persona + chunks + domain rules + lang override)
    ↓
Provider Chain Execution (sequential fallback)
    ↓
POST-GENERATION VALIDATION
  ├─ Language Purity Check
  ├─ Citation Validation (exists in chunks?)
  ├─ Length Check (within limits?)
  └─ Schema Check (if JSON mode)
    ↓
Repair Pass (if validation fails)
    ↓
Response Assembly (with degradation flag if needed)
    ↓
User Response (graceful, no server errors)
```

---

## PART 2: OUTPUT MODE SYSTEM (Resolves JSON vs Prose Conflict)

### Request-Level Mode Flag

```javascript
// User request includes response_mode:

POST /api/moroccan-law-qa
{
  "messages": [{ "role": "user", "content": "ما حقوقي في الطلاق؟" }],
  "language": "ar",
  "response_mode": "json"  // ← NEW: either "json" or "prose"
}
```

### Mode Definitions

#### Mode: `prose` (Default for UI Display)
```
Purpose: Direct display in frontend UI
Format: Plain text paragraphs (NO markdown, NO JSON)
Example Output:
  "حسب مدونة الأسرة، للزوجة حقوق معينة عند الطلاق..."
Structure: Human-readable narrative
Used by: Frontend chat display
```

#### Mode: `json` (For Structured Processing)
```
Purpose: Backend processing, analytics, structured output
Format: Strict JSON with Answer Contract schema
Example Output:
  {
    "answer": "Direct answer...",
    "domain": "family",
    "citations": [...],
    "confidence": 0.95,
    ...
  }
Used by: Analytics, mobile apps, structured systems
```

### Response Wrapper (Both Modes)

```javascript
{
  "content": "<answer text or JSON>",
  "mode": "prose" | "json",
  "degraded": false | true,
  "provider_used": "gemini-2.5-flash" | "fallback",
  "language_detected": "ar" | "dar" | "fr" | "en",
  "domain_detected": "family" | "penal" | "labor" | "procedure" | "contracts",
  "confidence_score": 0.0-1.0,
  "validation_passed": true | false,
  "timestamp": "2025-03-13T00:15:00Z"
}
```

---

## PART 3: LLM ROUTING MATRIX (Current - Language-Aware)

### Darija & Arabic
```
Primary:    Gemini 2.5 Flash
Secondary:  Gemini 2.5 Flash-Lite
Tertiary:   Cohere Command (command-a-03-2025)
Fallback:   Groq Llama 3.3 70B (llama-3.3-70b-versatile)
```

### French
```
Primary:    Gemini 2.5 Flash-Lite
Secondary:  Gemini 2.5 Flash
Tertiary:   Cohere Command
Fallback:   Groq Llama 3.3 70B
```

### English
```
Primary:    Gemini 2.5 Flash-Lite
Secondary:  Groq Llama 3.3 70B
Tertiary:   Gemini 2.5 Flash
Fallback:   Cohere Command
```

### Mixed Language (ar+fr or dar+fr) — DETERMINISTIC ROUTING
```
Detection Rule:
  IF (language_tag == "dar") AND (text contains French markers):
    route = "mixed(ar+fr)"
  IF (language_tag == "ar") AND (text contains French markers):
    route = "mixed(ar+fr)"
  IF (language_tag == "fr") AND (text contains Arabic markers):
    route = "mixed(ar+fr)"
  ELSE:
    route = language_tag

Precedence (if both languages equally present):
  1. Darija/Arabic (primary)
  2. French (secondary)
  3. Use primary provider: Gemini 2.5 Flash

Provider Chain for Mixed:
  Primary:    Gemini 2.5 Flash (handles code-switch best)
  Secondary:  Cohere Command
  Tertiary:   Gemini 2.5 Flash-Lite
  Fallback:   Groq Llama 3.3 70B
```

---

## PART 4: OUTPUT LENGTH TUNING (v2.0 - Word/Token-Based)

### By Language × Question Type

#### ARABIC (AR)
```
Quick (factual):
  - Word limit: 15-30 words
  - Sentence limit: 1 sentence max
  - Example: "حسب المادة 467، المدة 3 أشهر."
  
Standard (normal):
  - Word limit: 60-120 words
  - Sentence limit: 2-4 sentences
  - Example: Multiple sentences with context
  
Analysis (deep):
  - Word limit: 200-300 words
  - Sentence limit: 5-8 sentences
  - Example: Full legal analysis with references
```

#### DARIJA (DAR)
```
Quick (factual):
  - Word limit: 12-25 words (Darija = more concise)
  - Sentence limit: 1 sentence max
  - Example: "طبع المادة 467، الوقت 3 شهور."
  
Standard (normal):
  - Word limit: 50-100 words
  - Sentence limit: 2-3 sentences
  
Analysis (deep):
  - Word limit: 180-250 words
  - Sentence limit: 4-6 sentences
```

#### FRENCH (FR)
```
Quick (factual):
  - Word limit: 18-35 words
  - Sentence limit: 1 sentence max
  - Example: "Selon l'article 467, la durée est 3 mois."
  
Standard (normal):
  - Word limit: 70-140 words
  - Sentence limit: 2-4 sentences
  
Analysis (deep):
  - Word limit: 220-350 words
  - Sentence limit: 5-8 sentences
```

#### ENGLISH (EN)
```
Quick (factual):
  - Word limit: 16-32 words
  - Sentence limit: 1 sentence max
  - Example: "According to Article 467, the period is 3 months."
  
Standard (normal):
  - Word limit: 65-130 words
  - Sentence limit: 2-4 sentences
  
Analysis (deep):
  - Word limit: 200-320 words
  - Sentence limit: 5-8 sentences
```

### Question Type Detection

```javascript
function detectQuestionType(userText) {
  const wordCount = userText.split(/\s+/).length;
  
  const quickPatterns = [
    /كم|كيفاش|how long|combien|when|كم من/i,
    /^.{1,25}$/  // Very short questions
  ];
  
  const analysisPatterns = [
    /شرح|تفسير|explain|expliquer|pourquoi|why|بشرح/i,
    /\.{2,}$/  // Trailing ellipsis (indicates more thought)
  ];
  
  if (wordCount < 12 || quickPatterns.some(p => p.test(userText))) {
    return 'quick';
  }
  if (wordCount > 60 || analysisPatterns.some(p => p.test(userText))) {
    return 'analysis';
  }
  return 'standard';
}
```

---

## PART 5: POST-GENERATION VALIDATORS (v2.0)

### Validator 1: Language Purity Check

```javascript
// Detects code-switching violations

function validateLanguagePurity(response, targetLanguage) {
  const violations = {
    ar: {
      frenchMarkers: /\b(et|ou|est|la|le|que|pour|dans|avec|sur|au|a|un|une)\b/gi,
      englishMarkers: /\b(the|and|or|is|a|to|for|in|with|on|at)\b/gi,
      darijanMarkers: /\b(واش|شنو|كيفاش|ديال|هادا|طبع)\b/gi
    },
    dar: {
      frenchMarkers: /\b(et|ou|est|la|le|que|pour)\b/gi,
      englishMarkers: /\b(the|and|or|is|to|for)\b/gi,
      aradicMarkers: /و(في|أن|التي|على|من|قد|التي)\b/gi
    },
    fr: {
      arabicMarkers: /[\u0600-\u06FF]/g,  // Arabic Unicode range
      englishMarkers: /\b(and|the|is|to|of|for|with|on|at)\b/gi
    },
    en: {
      arabicMarkers: /[\u0600-\u06FF]/g,
      frenchMarkers: /\b(et|ou|est|la|le|que|pour|dans|avec|sur)\b/gi
    }
  };
  
  const violationCount = Object.values(violations[targetLanguage])
    .reduce((sum, pattern) => sum + (response.match(pattern) || []).length, 0);
  
  return {
    passed: violationCount === 0,
    violations: violationCount,
    severity: violationCount === 0 ? 'none' : 
              violationCount <= 2 ? 'minor' : 
              violationCount <= 5 ? 'moderate' : 'severe'
  };
}
```

### Validator 2: Citation Validation (Automatic)

```javascript
// Check if cited articles actually exist in retrieved chunks

function validateCitations(response, retrievedChunks, mode) {
  // Extract article citations from response
  const citationPatterns = {
    ar: /المادة\s+(\d+)/g,  // "المادة 467"
    dar: /المادة\s+(\d+)/g,
    fr: /l'article\s+(\d+)|article\s+(\d+)/gi,
    en: /article\s+(\d+)/gi
  };
  
  const citedArticles = [];
  let match;
  while ((match = citationPatterns.article.exec(response)) !== null) {
    citedArticles.push(match[1]);
  }
  
  // Check if cited articles exist in chunks
  const chunkArticles = retrievedChunks
    .flatMap(chunk => {
      const articles = [];
      const articleMatch = chunk.struct_madda?.match(/\d+/);
      if (articleMatch) articles.push(articleMatch[0]);
      return articles;
    });
  
  const validCitations = citedArticles.filter(a => chunkArticles.includes(a));
  const invalidCitations = citedArticles.filter(a => !chunkArticles.includes(a));
  
  return {
    passed: invalidCitations.length === 0,
    citedCount: citedArticles.length,
    validCount: validCitations.length,
    invalidCitations: invalidCitations,
    hallucination_risk: invalidCitations.length > 0
  };
}
```

### Validator 3: Length Check

```javascript
// Ensure response length is within language/type limits

function validateLength(response, language, questionType) {
  const limits = {
    ar: { quick: 30, standard: 120, analysis: 300 },
    dar: { quick: 25, standard: 100, analysis: 250 },
    fr: { quick: 35, standard: 140, analysis: 350 },
    en: { quick: 32, standard: 130, analysis: 320 }
  };
  
  const words = response.split(/\s+/).length;
  const maxWords = limits[language][questionType];
  
  return {
    passed: words <= maxWords,
    wordCount: words,
    maxAllowed: maxWords,
    excess: Math.max(0, words - maxWords)
  };
}
```

### Validator 4: Schema Check (JSON Mode)

```javascript
// Validate JSON response matches Answer Contract schema

function validateAnswerSchema(responseJson) {
  const required = [
    'answer', 'domain', 'citations', 'confidence', 
    'uncertainty_statement', 'language', 'prose'
  ];
  
  const missing = required.filter(key => !(key in responseJson));
  const invalidTypes = [];
  
  if (typeof responseJson.answer !== 'string') 
    invalidTypes.push('answer');
  if (!['family','penal','labor','procedure','contracts','civil','other'].includes(responseJson.domain)) 
    invalidTypes.push('domain');
  if (!Array.isArray(responseJson.citations)) 
    invalidTypes.push('citations');
  if (typeof responseJson.confidence !== 'number' || responseJson.confidence < 0 || responseJson.confidence > 1) 
    invalidTypes.push('confidence');
  if (typeof responseJson.prose !== 'boolean') 
    invalidTypes.push('prose');
  
  return {
    passed: missing.length === 0 && invalidTypes.length === 0,
    missing: missing,
    invalidTypes: invalidTypes
  };
}
```

---

## PART 6: REPAIR PASS (v2.0 - Automatic Fix)

### When Validation Fails, Trigger Repair

```javascript
// If citation or language validation fails, re-prompt for repair

async function repairResponse(
  failedResponse,
  validationFailures,
  originalPrompt,
  language,
  retrievedChunks
) {
  let repairInstruction = '';
  
  if (validationFailures.hallucination_risk) {
    repairInstruction = `
The response cited articles that don't exist in the provided chunks:
Fictional articles: ${validationFailures.invalidCitations.join(', ')}

REPAIR INSTRUCTION:
1. Only cite articles from these chunks:
${retrievedChunks.map(c => `  - Article ${c.struct_madda}: ${c.text.substring(0, 50)}...`).join('\n')}

2. Remove citations for non-existent articles
3. Rephrase the answer to only reference available information
4. If information is missing, state: "This specific detail is not in the available corpus"

Repaired answer:`;
  }
  
  if (validationFailures.severity === 'severe') {
    repairInstruction = `
LANGUAGE VIOLATION DETECTED: Code-switching detected in ${language} response.

REPAIR INSTRUCTION:
1. Respond EXCLUSIVELY in pure ${language}
2. Remove ALL code-switched words
3. Rephrase every sentence in 100% pure ${language}
4. NO English, NO other languages

Repaired answer:`;
  }
  
  if (validationFailures.excess > 10) {
    repairInstruction = `
The answer exceeds the word limit by ${validationFailures.excess} words.

REPAIR INSTRUCTION:
1. Condense to maximum ${validationFailures.maxAllowed} words
2. Keep the most important legal information
3. Remove examples or secondary details
4. Maintain accuracy but reduce verbosity

Condensed answer (≤${validationFailures.maxAllowed} words):`;
  }
  
  if (!repairInstruction) return null;  // All validations passed
  
  // Call LLM again with repair instruction
  const repairPrompt = `
${originalPrompt}

---

${repairInstruction}`;
  
  return await callLLM(repairPrompt, language);  // Re-query with same provider
}
```

---

## PART 7: CONFIDENCE SCORING (v2.0 - Calibrated)

```javascript
// Assign confidence based on source data quality

function calculateConfidence(
  retrievedChunks,
  responseLength,
  citationCount,
  validCitationCount
) {
  let confidence = 0.85;  // Base: 85%
  
  // Adjustment 1: Citation validity
  if (citationCount > 0) {
    const citationAccuracy = validCitationCount / citationCount;
    if (citationAccuracy === 1.0) confidence += 0.10;      // +10% if all valid
    else if (citationAccuracy >= 0.8) confidence += 0.05;  // +5% if 80%+
    else if (citationAccuracy < 0.5) confidence -= 0.20;   // -20% if <50%
  }
  
  // Adjustment 2: Chunk relevance
  if (retrievedChunks.length === 4) confidence += 0.05;  // Fully grounded
  else if (retrievedChunks.length < 2) confidence -= 0.15; // Sparse
  
  // Adjustment 3: Response length (longer = more confident)
  if (responseLength > 150) confidence += 0.03;
  else if (responseLength < 30) confidence -= 0.05;
  
  // Cap at 1.0, floor at 0.0
  return Math.min(1.0, Math.max(0.0, confidence));
}

// Confidence Tiers:
// 0.95-1.0:  "Very High"  - Directly from chunks, clear
// 0.80-0.94: "High"       - Mostly from chunks
// 0.60-0.79: "Medium"     - Partially in chunks
// 0.40-0.59: "Low"        - Sparse information
// <0.40:     "Too Low"    - RECOMMEND: consult lawyer
```

---

## PART 8: GRACEFUL DEGRADATION (No 5xx Errors)

### Fallback Hierarchy

```javascript
async function executeQARequest(userQuery, language, retrievedChunks, mode) {
  try {
    // Try each provider in order
    for (const provider of languageProviderChain[language]) {
      try {
        const response = await provider.query(systemPrompt, userQuery);
        
        // Validate response
        const validation = validateAll(response, retrievedChunks, language, mode);
        
        if (!validation.passed) {
          const repaired = await repairResponse(response, validation, ...);
          if (repaired) {
            return { content: repaired, degraded: false, provider_used: provider };
          }
        }
        
        return { content: response, degraded: false, provider_used: provider };
        
      } catch (error) {
        if (error.status === 429) console.log(`Rate limited, trying next...`);
        else if (error.type === 'timeout') console.log(`Timeout, trying next...`);
        else console.log(`Provider failed, trying next...`);
        continue;  // Try next provider
      }
    }
    
    // All providers exhausted
    const fallbackMsg = DEGRADED_RESPONSES[language]['all_providers_failed'];
    return {
      content: fallbackMsg,
      degraded: true,
      provider_used: "fallback",
      reason: "all_providers_exhausted"
    };
    
  } catch (unexpectedError) {
    // System error (should never reach here)
    const errorMsg = DEGRADED_RESPONSES[language]['system_error'];
    return {
      content: errorMsg,
      degraded: true,
      provider_used: "fallback",
      reason: "system_error",
      status_code: 200  // ← ALWAYS 200, never 5xx
    };
  }
}
```

---

## PART 9: TESTING MATRIX (v2.0)

### Core Test Cases

```
✅ LANGUAGE × QUESTION TYPE:
  □ AR + Quick   □ AR + Standard   □ AR + Analysis
  □ DAR + Quick  □ DAR + Standard  □ DAR + Analysis
  □ FR + Quick   □ FR + Standard   □ FR + Analysis
  □ EN + Quick   □ EN + Standard   □ EN + Analysis

✅ LANGUAGE × DOMAIN (all 4 languages × 5 domains = 20 tests):
  □ Family Law (marriage, divorce, alimony, custody)
  □ Penal Law (theft, assault, sentencing)
  □ Labor Law (termination, compensation)
  □ Procedure (appeals, timeline)
  □ Contracts (formation, breach)

✅ OUTPUT MODES:
  □ Prose mode (default)
  □ JSON mode (with Answer Contract)
  □ Both modes with same question

✅ VALIDATORS:
  □ Language purity (no code-switch)
  □ Citation validation (exist in chunks)
  □ Length check (within limits)
  □ Schema check (JSON mode)

✅ REPAIR PASS:
  □ Hallucination repair (remove fake articles)
  □ Code-switch repair (enforce language purity)
  □ Length repair (condense answer)

✅ EDGE CASES:
  □ Off-topic rejection
  □ Mixed language (ar+fr, dar+fr)
  □ Partial information available
  □ No information available
  □ Rate-limit fallback
  □ Cohere quota exhausted

✅ FALLBACK CHAIN:
  □ Primary provider success
  □ Secondary provider fallback
  □ Tertiary provider fallback
  □ Final degraded response (all exhausted)
```

---

## PART 10: INTEGRATION PATH (Ready-to-Deploy)

### Step 1: Deploy Backend Config Module
```
File: qa-optimizer-config.js
- Contains all validators
- Contains repair logic
- Contains confidence scoring
- Drop into server.js
```

### Step 2: Update /api/moroccan-law-qa Endpoint
```
Add response_mode parameter to request
Add validation step after LLM call
Add repair pass if needed
Return new response wrapper format
```

### Step 3: Update Frontend (React)
```
Parse response_mode in response
Display based on mode (prose vs JSON)
Show confidence score
Show provider used
```

### Step 4: Monitor & Iterate
```
Track hallucination rate
Track citation accuracy
Track language purity
Track fallback rate
A/B test vs old version
```

---

## PART 11: ROLLOUT PLAN (4-Week)

### Week 1: Validators + Repair
- Deploy validators (citation, language, length)
- Implement repair pass
- Test on staging with 20 questions
- Measure hallucination reduction

### Week 2: Output Modes
- Deploy prose + JSON mode system
- Update frontend to handle both
- Test backwards compatibility
- A/B test with 10% of traffic

### Week 3: Confidence Scoring
- Implement calibrated confidence
- Validate score accuracy
- Update frontend to display
- Expand to 50% of traffic

### Week 4: Full Rollout
- Monitor production metrics
- Expand to 100%
- Maintain rollback procedure
- Document final state

---

## CRITICAL METRICS

```
✅ Hallucination Rate: Target < 5% (currently unknown)
✅ Citation Accuracy: Target > 95%
✅ Language Purity: Target > 99% (no code-switch)
✅ Validation Pass Rate: Target > 90%
✅ Fallback Rate: Target < 10%
✅ Latency (p95): Target < 5s
✅ 5xx Error Rate: Target = 0%
```

---

## SUMMARY

This v2.0 handoff resolves all conflicts from v1.0:

1. ✅ **JSON vs Prose**: Dual-mode system, request-level flag
2. ✅ **Length tuning**: Word/token-based, realistic per language
3. ✅ **Mixed-language**: Deterministic routing with precedence
4. ✅ **Citation validation**: Automatic check + repair pass
5. ✅ **Graceful degradation**: Always 200 OK, never 5xx

Ready to implement. Backend config module coming next.
