/**
 * QA OPTIMIZER CONFIG MODULE
 * 
 * Ready-to-integrate validators, repair logic, and response handling
 * Drop into server.js and wire to /api/moroccan-law-qa endpoint
 * 
 * Contains:
 * - Language purity validator
 * - Citation validator
 * - Length validator
 * - Schema validator
 * - Confidence calculator
 * - Repair pass logic
 * - Response wrapper
 */

// ═══════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════

const OUTPUT_LENGTH_LIMITS = {
  ar: { quick: 30, standard: 120, analysis: 300 },
  dar: { quick: 25, standard: 100, analysis: 250 },
  fr: { quick: 35, standard: 140, analysis: 350 },
  en: { quick: 32, standard: 130, analysis: 320 }
};

const MIXED_LANGUAGE_MARKERS = {
  ar: /\b(et|ou|est|la|le|que|pour|dans|avec|sur|au|a|un|une)\b/gi,
  dar: /\b(et|ou|est|la|le|que|pour)\b/gi,
  fr: /[\u0600-\u06FF]/g,  // Arabic Unicode
  en: /[\u0600-\u06FF]/g   // Arabic Unicode
};

const LANGUAGE_VIOLATION_PATTERNS = {
  ar: {
    french: /\b(et|ou|est|la|le|que|pour|dans|avec|sur|au|un|une)\b/gi,
    english: /\b(the|and|or|is|a|to|for|in|with|on|at)\b/gi,
    darija: /\b(واش|شنو|كيفاش|ديال|هادا|طبع)\b/gi
  },
  dar: {
    french: /\b(et|ou|est|la|le|que|pour)\b/gi,
    english: /\b(the|and|or|is|to|for)\b/gi,
    arabic: /و(في|أن|التي|على|من|قد)/gi
  },
  fr: {
    arabic: /[\u0600-\u06FF]/g,
    english: /\b(and|the|is|to|of|for|with|on|at)\b/gi
  },
  en: {
    arabic: /[\u0600-\u06FF]/g,
    french: /\b(et|ou|est|la|le|que|pour|dans|avec|sur)\b/gi
  }
};

const DEGRADED_RESPONSES = {
  ar: {
    all_providers_failed: "عذراً، النظام مشغول حالياً. يرجى إعادة المحاولة خلال قليل.",
    off_topic: "هذا السؤال لا يتعلق بالقانون. يرجى طرح سؤال قانوني متعلق بالقانون المغربي.",
    system_error: "حدث خطأ في النظام. يرجى محاولة البدء من جديد."
  },
  dar: {
    all_providers_failed: "عذراً، النظام مشغول. حاول مرة ثانية في شوية دقايق.",
    off_topic: "السؤال ما فيه علاقة بالقانون. شول سؤال قانوني ديال المغرب.",
    system_error: "حدث خطأ ما. حاول مرة ثانية."
  },
  fr: {
    all_providers_failed: "Désolé, le système est actuellement occupé. Veuillez réessayer dans quelques instants.",
    off_topic: "Cette question n'est pas liée au droit. Veuillez poser une question juridique.",
    system_error: "Une erreur système s'est produite. Veuillez réessayer."
  },
  en: {
    all_providers_failed: "Sorry, the system is currently busy. Please try again in a few moments.",
    off_topic: "This question is not related to law. Please ask a legal question.",
    system_error: "A system error occurred. Please try again."
  }
};

// ═══════════════════════════════════════════════════════════════════════
// HELPER: Detect Question Type
// ═══════════════════════════════════════════════════════════════════════

function detectQuestionType(userText) {
  const wordCount = userText.split(/\s+/).length;
  
  const quickPatterns = [
    /كم|كيفاش|how long|combien|when|كم من|how much|أين/i,
    /^.{1,25}$/  // Very short
  ];
  
  const analysisPatterns = [
    /شرح|تفسير|explain|expliquer|pourquoi|why|بشرح|analyze/i,
    /^.{100,}$/  // Very long
  ];
  
  if (wordCount < 12 || quickPatterns.some(p => p.test(userText))) {
    return 'quick';
  }
  if (wordCount > 60 || analysisPatterns.some(p => p.test(userText))) {
    return 'analysis';
  }
  return 'standard';
}

// ═══════════════════════════════════════════════════════════════════════
// VALIDATOR 1: Language Purity Check
// ═══════════════════════════════════════════════════════════════════════

function validateLanguagePurity(response, targetLanguage) {
  if (!LANGUAGE_VIOLATION_PATTERNS[targetLanguage]) {
    return { passed: true, violations: 0, severity: 'none' };
  }
  
  const patterns = LANGUAGE_VIOLATION_PATTERNS[targetLanguage];
  let violationCount = 0;
  
  Object.entries(patterns).forEach(([lang, pattern]) => {
    const matches = response.match(pattern) || [];
    violationCount += matches.length;
  });
  
  return {
    passed: violationCount === 0,
    violations: violationCount,
    severity: 
      violationCount === 0 ? 'none' : 
      violationCount <= 2 ? 'minor' : 
      violationCount <= 5 ? 'moderate' : 'severe',
    targetLanguage: targetLanguage
  };
}

// ═══════════════════════════════════════════════════════════════════════
// VALIDATOR 2: Citation Validation
// ═══════════════════════════════════════════════════════════════════════

function validateCitations(response, retrievedChunks, language) {
  // Extract article numbers from response
  const citationPatterns = {
    ar: /المادة\s+(\d+)/g,
    dar: /المادة\s+(\d+)/g,
    fr: /l'article\s+(\d+)|article\s+(\d+)/gi,
    en: /article\s+(\d+)/gi
  };
  
  const pattern = citationPatterns[language];
  if (!pattern) {
    return { passed: true, citedCount: 0, validCount: 0, invalidCitations: [] };
  }
  
  const citedArticles = [];
  let match;
  while ((match = pattern.exec(response)) !== null) {
    citedArticles.push(match[1]);
  }
  
  // Extract available articles from chunks
  const availableArticles = new Set();
  retrievedChunks.forEach(chunk => {
    if (chunk.struct_madda) {
      const articleMatch = chunk.struct_madda.match(/\d+/);
      if (articleMatch) availableArticles.add(articleMatch[0]);
    }
  });
  
  const validCitations = citedArticles.filter(a => availableArticles.has(a));
  const invalidCitations = citedArticles.filter(a => !availableArticles.has(a));
  
  return {
    passed: invalidCitations.length === 0,
    citedCount: citedArticles.length,
    validCount: validCitations.length,
    invalidCitations: invalidCitations,
    hallucination_risk: invalidCitations.length > 0,
    severity: 
      invalidCitations.length === 0 ? 'none' :
      invalidCitations.length <= 1 ? 'minor' : 'severe'
  };
}

// ═══════════════════════════════════════════════════════════════════════
// VALIDATOR 3: Length Check
// ═══════════════════════════════════════════════════════════════════════

function validateLength(response, language, questionType) {
  if (!OUTPUT_LENGTH_LIMITS[language]) {
    return { passed: true, wordCount: 0, maxAllowed: 1000, excess: 0 };
  }
  
  const words = response.split(/\s+/).filter(w => w.length > 0).length;
  const maxWords = OUTPUT_LENGTH_LIMITS[language][questionType] || 200;
  
  return {
    passed: words <= maxWords,
    wordCount: words,
    maxAllowed: maxWords,
    excess: Math.max(0, words - maxWords),
    severity:
      words <= maxWords ? 'none' :
      words <= maxWords * 1.2 ? 'minor' : 'moderate'
  };
}

// ═══════════════════════════════════════════════════════════════════════
// VALIDATOR 4: JSON Schema Check
// ═══════════════════════════════════════════════════════════════════════

function validateAnswerSchema(responseJson) {
  const required = [
    'answer', 'domain', 'citations', 'confidence', 
    'uncertainty_statement', 'language', 'prose'
  ];
  
  const missing = required.filter(key => !(key in responseJson));
  const invalidTypes = [];
  
  if (typeof responseJson.answer !== 'string') 
    invalidTypes.push({ field: 'answer', issue: 'not string' });
  if (!['family','penal','labor','procedure','contracts','civil','other'].includes(responseJson.domain)) 
    invalidTypes.push({ field: 'domain', issue: 'invalid value' });
  if (!Array.isArray(responseJson.citations)) 
    invalidTypes.push({ field: 'citations', issue: 'not array' });
  if (typeof responseJson.confidence !== 'number' || responseJson.confidence < 0 || responseJson.confidence > 1) 
    invalidTypes.push({ field: 'confidence', issue: 'invalid range' });
  if (typeof responseJson.prose !== 'boolean') 
    invalidTypes.push({ field: 'prose', issue: 'not boolean' });
  
  return {
    passed: missing.length === 0 && invalidTypes.length === 0,
    missing: missing,
    invalidTypes: invalidTypes,
    severity:
      missing.length === 0 && invalidTypes.length === 0 ? 'none' :
      missing.length + invalidTypes.length <= 2 ? 'minor' : 'moderate'
  };
}

// ═══════════════════════════════════════════════════════════════════════
// VALIDATE ALL (Run all validators)
// ═══════════════════════════════════════════════════════════════════════

function validateAll(response, retrievedChunks, language, questionType, mode) {
  const validations = {
    languagePurity: validateLanguagePurity(response, language),
    citations: validateCitations(response, retrievedChunks, language),
    length: validateLength(response, language, questionType)
  };
  
  if (mode === 'json') {
    try {
      const jsonObj = typeof response === 'string' ? JSON.parse(response) : response;
      validations.schema = validateAnswerSchema(jsonObj);
    } catch (e) {
      validations.schema = { 
        passed: false, 
        missing: [], 
        invalidTypes: ['JSON parsing failed'],
        severity: 'moderate'
      };
    }
  }
  
  const allPassed = Object.values(validations).every(v => v.passed !== false);
  const maxSeverity = Object.values(validations)
    .map(v => v.severity || 'none')
    .sort()
    .reverse()[0];
  
  return {
    passed: allPassed,
    validations: validations,
    severity: maxSeverity,
    shouldRepair: !allPassed && maxSeverity !== 'minor'
  };
}

// ═══════════════════════════════════════════════════════════════════════
// CONFIDENCE CALCULATOR
// ═══════════════════════════════════════════════════════════════════════

function calculateConfidence(retrievedChunks, responseLength, citationValidation) {
  let confidence = 0.80;  // Base: 80%
  
  // Adjustment 1: Chunk coverage
  if (retrievedChunks && retrievedChunks.length >= 3) {
    confidence += 0.10;  // +10% if well-grounded
  } else if (retrievedChunks && retrievedChunks.length < 2) {
    confidence -= 0.15;  // -15% if sparse
  }
  
  // Adjustment 2: Citation validity
  if (citationValidation && citationValidation.citedCount > 0) {
    const validity = citationValidation.validCount / citationValidation.citedCount;
    if (validity === 1.0) {
      confidence += 0.10;  // +10% if all valid
    } else if (validity >= 0.8) {
      confidence += 0.05;  // +5% if 80%+
    } else {
      confidence -= 0.20;  // -20% if <50%
    }
  } else if (citationValidation && citationValidation.citedCount === 0) {
    confidence -= 0.05;  // -5% if no citations
  }
  
  // Adjustment 3: Response length
  if (responseLength >= 80 && responseLength <= 300) {
    confidence += 0.05;  // +5% for balanced length
  } else if (responseLength > 400) {
    confidence -= 0.05;  // -5% if too long
  }
  
  // Cap at 1.0, floor at 0.2
  return Math.min(1.0, Math.max(0.2, confidence));
}

// ═══════════════════════════════════════════════════════════════════════
// REPAIR PASS (Auto-fix valuation failures)
// ═══════════════════════════════════════════════════════════════════════

function buildRepairInstruction(validations, retrievedChunks, language, questionType) {
  let instruction = '';
  
  // Hallucination repair
  if (validations.citations && validations.citations.hallucination_risk) {
    const fakeArticles = validations.citations.invalidCitations.join(', ');
    instruction += `

⚠️ HALLUCINATION DETECTED: Articles ${fakeArticles} don't exist in the provided chunks.

REPAIR REQUIRED:
1. Remove citations for these fictional articles: ${fakeArticles}
2. Only cite articles from the chunks provided:
${retrievedChunks.map(c => `   - Article ${c.struct_madda}: "${c.text.substring(0, 40)}..."`).join('\n')}
3. If information is missing, state: "This specific detail is not in the available corpus"
4. Rephrase to only reference available information

Corrected answer:`;
  }
  
  // Language purity repair
  if (validations.languagePurity && validations.languagePurity.severity === 'severe') {
    instruction += `

⚠️ CODE-SWITCHING VIOLATION: Response mixed ${language} with other languages.

REPAIR REQUIRED:
1. Respond EXCLUSIVELY in 100% pure ${language}
2. Remove ALL code-switched words from other languages
3. Rephrase every sentence in pure ${language}
4. NO English, NO French, NO Arabic (if ${language} is Darija), NO mixed text

Corrected answer (pure ${language}):`;
  }
  
  // Length repair
  if (validations.length && validations.length.excess > 10) {
    const maxWords = validations.length.maxAllowed;
    instruction += `

⚠️ LENGTH VIOLATION: Response exceeds limit by ${validations.length.excess} words (max: ${maxWords}).

REPAIR REQUIRED:
1. Condense answer to maximum ${maxWords} words
2. Keep the most important legal information
3. Remove examples, secondary details, or verbose explanations
4. Maintain accuracy but maximize conciseness

Condensed answer (≤${maxWords} words):`;
  }
  
  return instruction;
}

// ═══════════════════════════════════════════════════════════════════════
// RESPONSE WRAPPER
// ═══════════════════════════════════════════════════════════════════════

function buildResponseWrapper(
  content,
  mode,
  degraded,
  providerUsed,
  language,
  domain,
  confidence,
  validation
) {
  return {
    content: content,
    mode: mode || 'prose',
    degraded: degraded || false,
    provider_used: providerUsed,
    language_detected: language,
    domain_detected: domain,
    confidence_score: confidence || 0,
    validation_passed: validation ? validation.passed : true,
    validation_severity: validation ? validation.severity : 'none',
    timestamp: new Date().toISOString()
  };
}

// ═══════════════════════════════════════════════════════════════════════
// MIXED LANGUAGE DETECTOR (Deterministic)
// ═══════════════════════════════════════════════════════════════════════

function detectMixedLanguage(userText, detectedLanguage, text) {
  // If tag says AR/DAR but text has French
  if ((detectedLanguage === 'ar' || detectedLanguage === 'dar') && 
      /\b(et|ou|est|que|pour|avec|dans|sur|du|au|la|le)\b/i.test(text)) {
    return { isMixed: true, primaryLang: 'ar', secondaryLang: 'fr', route: 'mixed(ar+fr)' };
  }
  
  // If tag says French but text has Arabic
  if (detectedLanguage === 'fr' && /[\u0600-\u06FF]/.test(text)) {
    return { isMixed: true, primaryLang: 'ar', secondaryLang: 'fr', route: 'mixed(ar+fr)' };
  }
  
  // Not mixed
  return { isMixed: false, primaryLang: detectedLanguage, secondaryLang: null, route: detectedLanguage };
}

// ═══════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════

module.exports = {
  // Validators
  validateLanguagePurity,
  validateCitations,
  validateLength,
  validateAnswerSchema,
  validateAll,
  
  // Helpers
  detectQuestionType,
  detectMixedLanguage,
  calculateConfidence,
  buildRepairInstruction,
  buildResponseWrapper,
  
  // Constants
  OUTPUT_LENGTH_LIMITS,
  DEGRADED_RESPONSES,
  LANGUAGE_VIOLATION_PATTERNS,
  
  // Main entry point (optional, for convenience)
  qaOptimizerConfig: {
    validateLanguagePurity,
    validateCitations,
    validateLength,
    validateAnswerSchema,
    validateAll,
    detectQuestionType,
    detectMixedLanguage,
    calculateConfidence,
    buildRepairInstruction,
    buildResponseWrapper,
    OUTPUT_LENGTH_LIMITS,
    DEGRADED_RESPONSES,
    LANGUAGE_VIOLATION_PATTERNS
  }
};
