#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════
 * GENERATE COMPREHENSIVE CACHED Q&A ANSWERS FOR ALL LANGUAGES
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * This script:
 * 1. Takes the 6 suggested questions
 * 2. Translates to all 4 languages
 * 3. Gets detailed LLM answers for each
 * 4. Updates adala-greeting-cache.js with comprehensive cached answers
 * 
 * Run: node generate-cached-answers.js
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_BASE = 'http://localhost:8787';
const CACHE_FILE = path.join(__dirname, 'adala-greeting-cache.js');

const QUESTIONS = {
  ar: [
    'ما هو السن القانوني للزواج في المغرب؟',
    'كيف تتم إجراءات الطلاق؟',
    'ما هي عقوبة السرقة في القانون المغربي؟',
    'كيف يتم تقسيم الإرث؟',
    'ما هي شروط عقد الكراء؟',
    'ما هي حقوق الحضانة بعد الطلاق؟'
  ],
  darija: [
    'شنو السن القانوني للزواج في المغرب؟',
    'كيفاش تتم إجراءات الطلاق؟',
    'شحال دايرة نسجن في السرقة؟',
    'كيفاش يتم تقسيم الإرث؟',
    'شنو شروط عقد الكراء؟',
    'شنو حقوق الحضانة بعد الطلاق؟'
  ],
  fr: [
    'Quel est l\'âge légal du mariage au Maroc?',
    'Comment se déroulent les procédures de divorce?',
    'Quelle est la peine pour vol au Maroc?',
    'Comment s\'effectue le partage de l\'héritage?',
    'Quelles sont les conditions d\'un contrat de location?',
    'Quels sont les droits de garde après le divorce?'
  ],
  en: [
    'What is the legal age of marriage in Morocco?',
    'How do divorce procedures work in Morocco?',
    'What is the punishment for theft in Moroccan law?',
    'How is inheritance divided in Morocco?',
    'What are the conditions of a rental contract?',
    'What are the custody rights after divorce in Morocco?'
  ]
};

const DOMAINS = [
  'family',
  'family',
  'penal',
  'family',
  'contracts',
  'family'
];

async function getAnswerFromAPI(question, language) {
  try {
    console.log(`  ⏳ Getting answer for: ${question.substring(0, 50)}...`);
    
    const response = await fetch(`${API_BASE}/api/moroccan-law-qa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: question }],
        language: language
      })
    });

    if (!response.ok) {
      console.error(`  ❌ API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    if (data.content) {
      console.log(`  ✅ Got answer (${data.content.length} chars)`);
      return data.content;
    }

    return null;
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
    return null;
  }
}

async function generateAllAnswers() {
  console.log('═'.repeat(70));
  console.log('GENERATING COMPREHENSIVE CACHED Q&A ANSWERS');
  console.log('═'.repeat(70));
  
  const allAnswers = {
    ar: [],
    darija: [],
    fr: [],
    en: []
  };

  // Generate answers for each language
  for (const lang of Object.keys(QUESTIONS)) {
    console.log(`\n🌍 LANGUAGE: ${lang.toUpperCase()}`);
    console.log('─'.repeat(70));

    const questions = QUESTIONS[lang];
    const answers = [];

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const domain = DOMAINS[i];

      console.log(`\n[${i + 1}/${questions.length}] ${question}`);
      
      const answer = await getAnswerFromAPI(question, lang);
      
      if (answer) {
        answers.push({
          question,
          domain,
          cached_answer: answer,
          confidence: 0.95
        });
      } else {
        console.log(`  ⚠️  Using fallback answer`);
        answers.push({
          question,
          domain,
          cached_answer: `[Fallback] السؤال: ${question}`,
          confidence: 0.7
        });
      }

      // Rate limiting - wait between API calls
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    allAnswers[lang] = answers;
  }

  return allAnswers;
}

async function updateCacheFile(allAnswers) {
  console.log('\n' + '═'.repeat(70));
  console.log('UPDATING CACHE FILE');
  console.log('═'.repeat(70));

  try {
    let fileContent = fs.readFileSync(CACHE_FILE, 'utf8');

    // For each language, update the SUGGESTED_QUESTIONS section
    for (const lang of Object.keys(allAnswers)) {
      console.log(`\n📝 Updating ${lang} suggested questions...`);

      const answers = allAnswers[lang];
      
      // Create the JavaScript object string for this language
      const questionsArray = answers.map(q => `    {
      question: '${q.question.replace(/'/g, "\\'")}',
      domain: '${q.domain}',
      cached_answer: \`${q.cached_answer.replace(/`/g, '\\`')}\`,
      confidence: ${q.confidence}
    }`).join(',\n');

      // Find and replace the language section
      const langRegex = new RegExp(
        `(  ${lang}: \\[)[\\s\\S]*?(\\],?)\\s*(  [a-z]+:|\\};)`,
        'g'
      );

      // Check if we can find the pattern
      const match = fileContent.match(new RegExp(`${lang}: \\[`, 'g'));
      if (!match) {
        console.log(`  ⚠️  Could not find ${lang} section in cache file`);
        continue;
      }

      // Replace the section
      const replacement = `  ${lang}: [\n${questionsArray}\n  ],`;
      fileContent = fileContent.replace(
        new RegExp(`  ${lang}: \\[[\\s\\S]*?  \\],`, 'g'),
        replacement
      );

      console.log(`  ✅ Updated ${lang} (${answers.length} questions)`);
    }

    // Write updated file
    fs.writeFileSync(CACHE_FILE, fileContent, 'utf8');
    console.log('\n✅ Cache file updated successfully!');
    console.log(`📁 File: ${CACHE_FILE}`);
  } catch (error) {
    console.error(`\n❌ Error updating cache file: ${error.message}`);
    throw error;
  }
}

async function main() {
  console.log('\n🚀 STARTING CACHED ANSWER GENERATION\n');

  try {
    // Step 1: Generate answers from API
    const allAnswers = await generateAllAnswers();

    // Step 2: Update cache file
    await updateCacheFile(allAnswers);

    // Summary
    console.log('\n' + '═'.repeat(70));
    console.log('GENERATION COMPLETE! ✅');
    console.log('═'.repeat(70));

    let totalQuestions = 0;
    for (const lang of Object.keys(allAnswers)) {
      const count = allAnswers[lang].length;
      totalQuestions += count;
      console.log(`📚 ${lang.toUpperCase()}: ${count} questions cached`);
    }

    console.log(`\n💾 Total cached Q&A pairs: ${totalQuestions}`);
    console.log('💰 API calls eliminated forever: ');
    console.log(`   - Per month (1000 users): ~${totalQuestions * 10} API calls saved`);
    console.log(`   - Estimated monthly savings: $${(totalQuestions * 10 * 0.001).toFixed(2)}`);

    console.log('\n✨ Next: Restart the server to use updated cache');
    console.log('   > npm run start:proxy\n');

  } catch (error) {
    console.error('\n❌ GENERATION FAILED');
    console.error(error);
    process.exit(1);
  }
}

main();
