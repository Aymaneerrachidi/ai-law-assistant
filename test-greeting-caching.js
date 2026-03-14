#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════
 * TEST SUITE FOR ADALA GREETING & CACHING SYSTEM
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * Run: node test-greeting-caching.js
 */

import {
  isGreeting,
  getGreetingResponse,
  getSuggestedQuestion,
  getAllSuggestedQuestions,
  GREETINGS,
  SUGGESTED_QUESTIONS
} from './adala-greeting-cache.js';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

function test(name, fn) {
  try {
    fn();
    log(`✅ PASS: ${name}`, 'green');
    return true;
  } catch (error) {
    log(`❌ FAIL: ${name}`, 'red');
    log(`   Error: ${error.message}`, 'red');
    return false;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

// ═══════════════════════════════════════════════════════════════════════
// TEST SUITE
// ═══════════════════════════════════════════════════════════════════════

let passed = 0;
let failed = 0;

log('\n' + '='.repeat(70), 'cyan');
log('ADALA GREETING & CACHING TEST SUITE', 'cyan');
log('='.repeat(70), 'cyan');

// ─── GREETING DETECTION TESTS ───────────────────────────────────────────

log('\n[1] GREETING DETECTION TESTS', 'blue');

if (test('Detect Arabic greeting', () => {
  assert(isGreeting('السلام عليكم', 'ar'), 'Should detect Arabic greeting');
})) passed++; else failed++;

if (test('Detect Darija greeting', () => {
  assert(isGreeting('السلام', 'darija'), 'Should detect Darija greeting');
})) passed++; else failed++;

if (test('Detect French greeting', () => {
  assert(isGreeting('bonjour', 'fr'), 'Should detect French greeting');
})) passed++; else failed++;

if (test('Detect English greeting', () => {
  assert(isGreeting('hello', 'en'), 'Should detect English greeting');
})) passed++; else failed++;

if (test('Detect gratitude - Arabic', () => {
  assert(isGreeting('شكراً', 'ar'), 'Should detect Arabic thank you');
})) passed++; else failed++;

if (test('Detect gratitude - French', () => {
  assert(isGreeting('merci', 'fr'), 'Should detect French thank you');
})) passed++; else failed++;

if (test('Reject non-greeting - Arabic', () => {
  assert(!isGreeting('ما هو القانون', 'ar'), 'Should not detect legal question as greeting');
})) passed++; else failed++;

if (test('Reject non-greeting - English', () => {
  assert(!isGreeting('What is the law', 'en'), 'Should not detect English legal question as greeting');
})) passed++; else failed++;

// ─── GREETING RESPONSE TESTS ───────────────────────────────────────────

log('\n[2] GREETING RESPONSE TESTS', 'blue');

if (test('Get Arabic greeting response', () => {
  const reply = getGreetingResponse('ar');
  assert(reply && reply.length > 0, 'Should return non-empty Arabic response');
  assert(reply.includes('السلام'), 'Response should contain سلام');
})) passed++; else failed++;

if (test('Get French greeting response', () => {
  const reply = getGreetingResponse('fr');
  assert(reply && reply.length > 0, 'Should return non-empty French response');
  assert(reply.includes('Adala'), 'Response should mention Adala');
})) passed++; else failed++;

if (test('Get English greeting response', () => {
  const reply = getGreetingResponse('en');
  assert(reply && reply.length > 0, 'Should return non-empty English response');
  assert(reply.includes('Adala'), 'Response should mention Adala');
})) passed++; else failed++;

if (test('Get Darija greeting response', () => {
  const reply = getGreetingResponse('darija');
  assert(reply && reply.length > 0, 'Should return non-empty Darija response');
})) passed++; else failed++;

// ─── SUGGESTED QUESTIONS TESTS ───────────────────────────────────────────

log('\n[3] SUGGESTED QUESTIONS TESTS', 'blue');

if (test('Get all Arabic suggestions', () => {
  const suggestions = getAllSuggestedQuestions('ar');
  assert(Array.isArray(suggestions), 'Should return an array');
  assert(suggestions.length > 0, 'Should have at least one suggestion');
  assert(suggestions[0].question, 'Each suggestion should have a question');
  assert(suggestions[0].domain, 'Each suggestion should have a domain');
  assert(suggestions[0].cached_answer, 'Each suggestion should have cached_answer');
})) passed++; else failed++;

if (test('Get all French suggestions', () => {
  const suggestions = getAllSuggestedQuestions('fr');
  assert(suggestions.length > 0, 'French should have suggestions');
})) passed++; else failed++;

if (test('Get all English suggestions', () => {
  const suggestions = getAllSuggestedQuestions('en');
  assert(suggestions.length > 0, 'English should have suggestions');
})) passed++; else failed++;

if (test('Get all Darija suggestions', () => {
  const suggestions = getAllSuggestedQuestions('darija');
  assert(suggestions.length > 0, 'Darija should have suggestions');
})) passed++; else failed++;

if (test('All suggestions have required fields', () => {
  const suggestions = getAllSuggestedQuestions('ar');
  for (const s of suggestions) {
    assert(s.question, 'Missing question');
    assert(s.domain, 'Missing domain');
    assert(s.cached_answer, 'Missing cached_answer');
    assert(typeof s.confidence === 'number', 'Confidence should be a number');
  }
})) passed++; else failed++;

// ─── CACHED ANSWER RETRIEVAL TESTS ───────────────────────────────────────

log('\n[4] CACHED ANSWER RETRIEVAL TESTS', 'blue');

if (test('Get Arabic marriage age cached answer', () => {
  const cached = getSuggestedQuestion('ar', 'ما هو السن القانوني للزواج في المغرب؟');
  assert(cached !== null, 'Should find cached answer');
  assert(cached.domain === 'family', 'Should be family domain');
  assert(cached.cached_answer.includes('18'), 'Answer should mention age 18');
})) passed++; else failed++;

if (test('Get French divorce cached answer', () => {
  const cached = getSuggestedQuestion('fr', 'Comment se déroulent les procédures de divorce?');
  assert(cached !== null, 'Should find cached answer');
  assert(cached.domain === 'family', 'Should be family domain');
})) passed++; else failed++;

if (test('Get English theft penalty cached answer', () => {
  const cached = getSuggestedQuestion('en', 'What is the punishment for theft in Moroccan law?');
  assert(cached !== null, 'Should find cached answer');
  assert(cached.domain === 'penal', 'Should be penal domain');
  assert(cached.cached_answer.includes('month'), 'Answer should mention months');
})) passed++; else failed++;

if (test('Return null for non-cached question', () => {
  const cached = getSuggestedQuestion('ar', 'سؤال غير موجود في الكاش');
  assert(cached === null, 'Should return null for non-cached question');
})) passed++; else failed++;

// ─── LANGUAGE COVERAGE TESTS ───────────────────────────────────────────

log('\n[5] LANGUAGE COVERAGE TESTS', 'blue');

if (test('Arabic has greetings', () => {
  assert(GREETINGS.ar && Object.keys(GREETINGS.ar).length > 0, 'Arabic should have greeting categories');
})) passed++; else failed++;

if (test('Darija has greetings', () => {
  assert(GREETINGS.darija && Object.keys(GREETINGS.darija).length > 0, 'Darija should have greeting categories');
})) passed++; else failed++;

if (test('French has greetings', () => {
  assert(GREETINGS.fr && Object.keys(GREETINGS.fr).length > 0, 'French should have greeting categories');
})) passed++; else failed++;

if (test('English has greetings', () => {
  assert(GREETINGS.en && Object.keys(GREETINGS.en).length > 0, 'English should have greeting categories');
})) passed++; else failed++;

if (test('All languages have suggested questions', () => {
  for (const lang of ['ar', 'darija', 'fr', 'en']) {
    const suggestions = SUGGESTED_QUESTIONS[lang];
    assert(Array.isArray(suggestions) && suggestions.length > 0,
      `Language ${lang} should have suggested questions`);
  }
})) passed++; else failed++;

// ─── EDGE CASE TESTS ───────────────────────────────────────────────────

log('\n[6] EDGE CASE TESTS', 'blue');

if (test('Case-insensitive greeting detection', () => {
  assert(isGreeting('HELLO', 'en'), 'Should detect uppercase greeting');
  assert(isGreeting('Hello', 'en'), 'Should detect mixed-case greeting');
  assert(isGreeting('hello', 'en'), 'Should detect lowercase greeting');
})) passed++; else failed++;

if (test('Whitespace-trimmed greeting detection', () => {
  assert(isGreeting('  hello  ', 'en'), 'Should detect greeting with whitespace');
})) passed++; else failed++;

if (test('Unknown language defaults safely', () => {
  const reply = getGreetingResponse('xx');
  assert(reply !== undefined, 'Should return a response for unknown language');
})) passed++; else failed++;

if (test('Empty question returns null for cache', () => {
  const cached = getSuggestedQuestion('ar', '');
  assert(cached === null, 'Empty question should not find cache');
})) passed++; else failed++;

// ═══════════════════════════════════════════════════════════════════════
// SUMMARY
// ═══════════════════════════════════════════════════════════════════════

log('\n' + '='.repeat(70), 'cyan');
log('TEST SUMMARY', 'cyan');
log('='.repeat(70), 'cyan');

const total = passed + failed;
const percentage = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;

log(`\n✅ Passed: ${passed}/${total}`, 'green');
log(`❌ Failed: ${failed}/${total}`, failed > 0 ? 'red' : 'green');
log(`📊 Success Rate: ${percentage}%\n`, percentage >= 100 ? 'green' : percentage >= 80 ? 'yellow' : 'red');

// ─── STATISTICS ───────────────────────────────────────────────────────

log('FEATURE STATISTICS', 'blue');

const totalGreetings = Object.values(GREETINGS).reduce((sum, lang) => sum + Object.values(lang).reduce((s, cat) => s + (cat.patterns?.length || 0), 0), 0);
log(`📝 Total greeting patterns: ${totalGreetings}`);

const totalSuggestions = Object.values(SUGGESTED_QUESTIONS).reduce((sum, lang) => sum + lang.length, 0);
log(`💾 Total cached Q&A pairs: ${totalSuggestions}`);

log(`🌍 Languages supported: ${Object.keys(GREETINGS).length}`);

// ─── COST BENEFITS ───────────────────────────────────────────────────

log('\nESTIMATED COST BENEFITS', 'blue');
log(`💰 Typical greeting % of questions: 15%`);
log(`💰 Typical cached % of questions: 20%`);
log(`💰 Total zero-cost interactions: ~35%`);
log(`💰 API calls reduction: 35% fewer calls`);
log(`💰 Monthly savings (1000 q/mo): 350 API calls saved = $X reduction`);

// ─── EXIT CODE ───────────────────────────────────────────────────────

process.exit(failed > 0 ? 1 : 0);
