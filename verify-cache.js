#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════
 * VERIFY CACHED ANSWERS - SHOW WHAT'S STORED
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * Run: node verify-cache.js
 */

import { SUGGESTED_QUESTIONS } from './adala-greeting-cache.js';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m'
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

console.log('\n' + '═'.repeat(70));
log('ADALA CACHE VERIFICATION - WHAT\'S STORED', 'cyan');
console.log('═'.repeat(70));

for (const lang of Object.keys(SUGGESTED_QUESTIONS)) {
  const questions = SUGGESTED_QUESTIONS[lang];
  
  log(`\n🌍 LANGUAGE: ${lang.toUpperCase()}`, 'blue');
  log(`   Stored: ${questions.length} questions`, 'green');
  
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const answerPreview = q.cached_answer.substring(0, 80).replace(/\n/g, ' ');
    
    log(`\n   [${i + 1}] Q: ${q.question.substring(0, 60)}`, 'yellow');
    log(`       Domain: ${q.domain} | Confidence: ${(q.confidence * 100).toFixed(0)}%`, 'cyan');
    log(`       Answer (${q.cached_answer.length} chars): ${answerPreview}...`, 'green');
  }
}

// Summary
console.log('\n' + '═'.repeat(70));
log('CACHE SUMMARY', 'cyan');
console.log('═'.repeat(70));

let totalQ = 0;
let totalChars = 0;

for (const lang of Object.keys(SUGGESTED_QUESTIONS)) {
  const questions = SUGGESTED_QUESTIONS[lang];
  const charCount = questions.reduce((sum, q) => sum + q.cached_answer.length, 0);
  
  totalQ += questions.length;
  totalChars += charCount;
  
  log(`📚 ${lang.toUpperCase()}: ${questions.length} questions, ${charCount} characters cached`, 'green');
}

log(`\n💾 TOTAL: ${totalQ} questions, ${totalChars} characters (${(totalChars / 1024).toFixed(1)} KB)`, 'cyan');
log(`\n✅ All cached answers are ready to serve instantly with ZERO API calls!`, 'green');

// Test coverage
console.log('\n' + '═'.repeat(70));
log('LANGUAGE COVERAGE', 'cyan');
console.log('═'.repeat(70));

const langNames = {
  ar: '🇸🇦 Arabic (Modern Standard)',
  darija: '🇲🇦 Moroccan Darija',
  fr: '🇫🇷 French',
  en: '🇬🇧 English'
};

for (const [lang, name] of Object.entries(langNames)) {
  const count = SUGGESTED_QUESTIONS[lang]?.length || 0;
  log(`   ${name}: ${count}/6 questions cached`, count === 6 ? 'green' : 'yellow');
}

console.log('\n' + '═'.repeat(70) + '\n');
