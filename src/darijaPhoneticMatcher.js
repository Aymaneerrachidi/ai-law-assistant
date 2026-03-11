// Darija Phonetic Matcher — local NLP layer for Moroccan Arabic dialect
// Enhanced with Ultimate Darija Legal System (500+ word database + smart intent classifier)

import completeDarijaArabicDatabase from './ultimateDarijaArabicDatabase.js';

export const extendedDarijaDatabase = {
  // Legal terminology
  'الجنحة': ['الجنحة', 'الجنايات', 'الجرم', 'الجريمة'],
  'السجن': ['السجن', 'الحبس', 'السنة', 'السنوات'],
  'المحكمة': ['المحكمة', 'القاضي', 'الحكم', 'العدل'],
  'المحامي': ['المحامي', 'الوكيل', 'المدافع'],
  'الشهود': ['الشهود', 'الشاهد', 'البينة'],
  'الأدلة': ['الأدلة', 'الدليل', 'الحجة'],
  'الحكم': ['الحكم', 'القرار', 'الحكومة'],
  'الاستئناف': ['الاستئناف', 'الطعن', 'النقض'],
  'العقوبة': ['العقوبة', 'العذاب', 'الجزاء'],
  'الغرامة': ['الغرامة', 'التغريمة', 'المبلغ'],
  // Crime types
  'السرقة': ['السرقة', 'نسرق', 'سرق'],
  'الضرب': ['الضرب', 'ضرب', 'نضرب'],
  'الشغب': ['الشغب', 'الشغيب', 'شغيب'],
  'الاغتصاب': ['الاغتصاب', 'الهتك', 'الاعتداء'],
  'الاحتيال': ['الاحتيال', 'خدع', 'الخديعة'],
  'المخدرات': ['المخدرات', 'الحشيش', 'الدواء'],
  'القتل': ['القتل', 'الموت', 'الضرب المميت'],
  // Procedural
  'الشرطة': ['الشرطة', 'البوليس', 'الأمن'],
  'المجلس': ['المجلس', 'الجلسة', 'القضية'],
  'الحضور': ['الحضور', 'الغياب', 'التوكيل'],
  'الإفراج': ['الإفراج', 'التحرير', 'الخروج'],
  'الحبس': ['الحبس', 'الحبس الاحتياطي', 'الاعتقال'],
  // Family law
  'الزواج': ['الزواج', 'الفراش', 'الزوج', 'العروسة'],
  'الطلاق': ['الطلاق', 'الفراق', 'الترك'],
  'الصداق': ['الصداق', 'المهر', 'الدية'],
  'الحضانة': ['الحضانة', 'الولاد', 'الأطفال'],
  'النفقة': ['النفقة', 'الإعالة', 'التغذية'],
  'الإرث': ['الإرث', 'الميراث', 'التركة'],
  'الخلع': ['الخلع', 'الفسخ', 'الانفصال'],
  // Greetings / common phrases
  'السلام عليكم': ['السلام عليكم', 'السلام عليك', 'السلام', 'سلام'],
  'شنو الجنحة': ['شنو الجنحة', 'شنو الجناية', 'شنوا الجنحة', 'شنو جنحتي'],
  'شحال دايرة نسجن': ['شحال دايرة نسجن', 'شحال دايرة السجن', 'شحال كتسجن', 'شحال السنوات'],
  'واش عندي حق نطاعن': ['واش عندي حق نطاعن', 'واش كاين استئناف', 'واش نقدر نطعن', 'نقدر نستأنف'],
  'كيفاش نرفع دعوى': ['كيفاش نرفع دعوى', 'كيفاش نروح نقول', 'فاش من نروح', 'شنو المراحل'],
};

export const darijaPatterns = [
  { pattern: /^شنو\s+/, type: 'what_question' },
  { pattern: /^شحال\s+/, type: 'how_many_question' },
  { pattern: /^كيفاش\s+/, type: 'how_question' },
  { pattern: /^فاش\s+/, type: 'where_question' },
  { pattern: /^علاش\s+/, type: 'why_question' },
  { pattern: /^واش\s+/, type: 'yes_no_question' },
  { pattern: /^أشنو\s+|^آشنو\s+/, type: 'what_question' },
  { pattern: /نرفع|نقول|نروح|نجيب/, type: 'action_request' },
  { pattern: /دايرة|محتاج|بحاجة/, type: 'need_request' },
  { pattern: /^(لا|مشي|ماشي|ما)/, type: 'negation' },
];

// Darija → Standard Arabic word map (extended with comprehensive vocabulary)
const DARIJA_TO_STANDARD = {
  // Question words
  'شنو': 'ما', 'شنوا': 'ما', 'اشنو': 'ما', 'آشنو': 'ما', 'أشنو': 'ما',
  'شاش': 'ما', 'كيشنو': 'ما',
  'شحال': 'كم', 'چ7ال': 'كم',
  'دايرة': 'تريد', 'دايرتي': 'تريدين', 'دايرين': 'يريدون',
  'كيفاش': 'كيف', 'كايفاش': 'كيف',
  'فاش': 'أين/متى', 'فاشين': 'متى',
  'فين': 'أين', 'فيناش': 'أين', 'فينهو': 'أين هو',
  'واش': 'هل', 'واچ': 'هل',
  'علاش': 'لماذا', '3لاش': 'لماذا', 'الياش': 'لماذا',
  'وقتاش': 'متى', 'فوقاش': 'متى',
  'كايين': 'يوجد', 'كاينة': 'توجد', 'كاين': 'يوجد',
  'ما كايش': 'لا يوجد', 'ما كايين': 'لا يوجد', 'كاينش': 'لا يوجد',
  // Pronouns / possessives
  'ديالي': 'لي', 'ديالك': 'لك', 'ديالنا': 'لنا', 'ديالهم': 'لهم',
  'ديالو': 'له', 'ديالها': 'لها',
  'عندي': 'عندي', 'عندك': 'عندك', '3ندي': 'عندي',
  'ماعنديش': 'ليس عندي', 'ماعندكش': 'ليس عندك',
  // Legal verbs
  'نسجن': 'أسجن', 'نرفع': 'أرفع', 'نروح': 'أذهب', 'نقول': 'أقول',
  'نطاعن': 'أطعن', 'نقدر': 'أستطيع', 'نستأنف': 'أستأنف',
  'نشكي': 'أشكو', 'نرفع دعوى': 'أرفع دعوى', 'نتقاضى': 'أتقاضى',
  'نبلغ': 'أبلغ', 'نمشي': 'أذهب', 'نسلم': 'أسلّم',
  // Conjugated legal verbs
  'كتسجن': 'تسجن', 'كتدفع': 'تدفع', 'كتمشي': 'تذهب',
  'كيسجن': 'يسجن', 'كيدفع': 'يدفع',
  // Common verbs
  'مشى': 'ذهب', 'جاب': 'أحضر', 'خرج': 'خرج', 'رجع': 'عاد',
  'راح': 'ذهب', 'شاف': 'رأى', 'لقى': 'وجد', 'قال': 'قال',
  'قلت': 'قلت', 'سمع': 'سمع', 'فكر': 'فكّر', 'نسا': 'نسي',
  'خدم': 'عمل', 'سرق': 'سرق', 'ضرب': 'ضرب', 'دفع': 'دفع',
  'وقع': 'وقّع', 'شرا': 'اشترى', 'باع': 'باع', 'قرر': 'قرّر',
  'بغى': 'أراد', 'بغيت': 'أردت', 'درت': 'فعلت', 'دير': 'افعل',
  // Modals / obligation
  'خاص': 'يجب', 'خاصك': 'يجب عليك', 'خاصني': 'يجب علي', 'خاصنا': 'يجب علينا',
  'لازم': 'يجب', 'لابد': 'لا بد', 'دروري': 'ضروري', 'مجبور': 'مضطر',
  // Time
  'دابا': 'الآن', 'راه': 'الآن', 'غادي': 'سيكون',
  'غدا': 'غداً', 'اليوما': 'اليوم', 'البارح': 'أمس', 'مازال': 'لا يزال',
  // Negation
  'مشي': 'لا/غير', 'ماشي': 'لا/غير', 'والو': 'لا شيء', 'بلا': 'بدون',
  'ما فيهاش': 'لا يوجد', 'ما كايين والو': 'لا يوجد شيء',
  // People
  'راجل': 'رجل', 'مرا': 'امرأة', 'دري': 'ولد', 'بنتي': 'ابنتي',
  'خويا': 'أخي', 'ختي': 'أختي', 'أمي': 'أمي', 'أبا': 'أبي',
  'البوليس': 'الشرطة', 'بوليسي': 'شرطي', 'وكيل': 'محامي',
  // Places
  'حانوت': 'متجر', 'دار': 'منزل', 'دوار': 'قرية', 'قدام': 'أمام',
  // Misc
  'خايف': 'خائف', 'خاوف': 'خائف', 'مخموم': 'قلق', 'نادم': 'نادم',
  'محتاج': 'محتاج', 'تمام': 'حسن', 'ولا': 'أو', 'بس': 'فقط/لكن',
  'بلاكيفك': 'على ما يرام', 'ديرت': 'فعلت', 'خلاص': 'انتهى',
  'ميرسي': 'شكراً', 'شكران': 'شكراً', 'بالبركة': 'بالتوفيق',
  'بزاف': 'كثيراً', 'شوية': 'قليلاً', 'تشويا': 'قليلاً',
  'واه': 'نعم', 'أيه': 'نعم', 'لالا': 'لا', 'لاه': 'لا',
  'واخا': 'حسناً', 'يالا': 'هيا', 'بركة': 'كافٍ',
  'واهاش': 'ماذا', 'باش': 'لكي', 'بقاو': 'بقوا',
  'كيشنو': 'ما', 'إلا': 'إذا', 'حسب': 'وفقاً',
  'جوج': 'اثنان', 'تلاتة': 'ثلاثة', 'ربعة': 'أربعة', 'خمسة': 'خمسة',
  'الحمة': 'المحكمة', 'القايد': 'القانون', 'الحاكم': 'القاضي',
  'المعاملة': 'القضية', 'الدينة': 'الحكم', 'القبضة': 'الاعتقال',
};

// ─── Advanced Intent Classifier ──────────────────────────────────────────────
// Scores each intent using keyword lists from the Ultimate Darija Legal System

const INTENT_SCORING = {
  sentence_prediction: {
    keywords: ['شحال', 'عقوبة', 'سجن', 'نسجن', 'سنة', 'سنوات', 'حكم', 'جزاء', 'دايرة نسجن', 'شحال السجن', 'شنو العقوبة', 'شحال الحكم', 'كم سنة', 'غرامة'],
    weight: 3,
  },
  deadline: {
    keywords: ['وقتاش', 'فاش', 'يوم', 'أيام', 'موعد', 'استئناف', 'مدة', 'شحال ديال الأيام', 'شحال الوقت', 'فاش الموعد', 'من تاريخ', 'تاريخ'],
    weight: 3,
  },
  crime_identification: {
    keywords: ['جنحة', 'جناية', 'جريمة', 'تهمة', 'مادة', 'شنو الجنحة', 'شنو التهمة', 'شنو المادة', 'شنو الجريمة', 'كيفاش نعرف', 'واش جناية'],
    weight: 3,
  },
  family_law: {
    keywords: ['زواج', 'طلاق', 'هدية', 'صداق', 'مهر', 'نفقة', 'حضانة', 'زوجة', 'راجل', 'مرا', 'خلع', 'ميراث', 'إرث', 'الولاد', 'الأطفال', 'مدونة الأسرة'],
    weight: 4,
  },
  procedure: {
    keywords: ['كيفاش', 'ندير', 'نمشي', 'نرفع', 'فاش', 'فين', 'مكان', 'كيفاش نرفع دعوى', 'شنو المراحل', 'فاش من نروح', 'كيفاش نبدا', 'المحكمة', 'الخطوات'],
    weight: 3,
  },
  rights: {
    keywords: ['حق', 'حقوق', 'خاص', 'دروري', 'حماية', 'هماية', 'واش عندي حق', 'حقي', 'يحمي', 'قانون يحمي'],
    weight: 3,
  },
  appeal: {
    keywords: ['استئناف', 'طعن', 'نقض', 'نطاعن', 'نستأنف', 'واش عندي حق نطاعن', 'واش نقدر نستأنف', 'نقدر نطعن'],
    weight: 4,
  },
};

// Legacy keywords kept for backward compat
const INTENT_KEYWORDS = {
  sentence_question: ['شحال دايرة نسجن', 'شحال السنوات', 'شنو العقوبة', 'شحال الحكم', 'كم سنة'],
  crime_question: ['شنو الجنحة', 'شنو التهمة', 'شنو المادة', 'شنو الجريمة'],
  deadline_question: ['شحال ديال الأيام', 'شحال الوقت', 'فاش الموعد', 'شحال من يوم'],
  legal_process: ['كيفاش نرفع دعوى', 'شنو المراحل', 'فاش من نروح', 'كيفاش نبدا'],
  appeal_question: ['واش عندي حق نطاعن', 'واش نقدر نستأنف', 'شنو الاستئناف', 'نقدر نطعن'],
  family_law: ['واش الطلاق', 'شنو الصداق', 'من الحضانة', 'شنو المهر', 'الزواج'],
  greeting: ['السلام عليكم', 'آشنو أخبار', 'كيفاش جايك', 'لباس'],
};

// Smart intent classifier using the comprehensive scoring system
export function classifyDarijaIntent(darijaInput) {
  const input = (darijaInput || '');
  const scores = {};

  for (const [intent, { keywords, weight }] of Object.entries(INTENT_SCORING)) {
    scores[intent] = 0;
    for (const kw of keywords) {
      if (input.includes(kw)) scores[intent] += weight;
    }
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const topIntent = sorted[0][1] > 0 ? sorted[0][0] : 'general';
  return { intent: topIntent, confidence: sorted[0][1], allScores: scores };
}

// Validate if LLM response actually contains Darija phrases
export function validateDarijaQuality(response) {
  const indicators = ['شنو', 'شحال', 'كيفاش', 'واش', 'فاش', 'ديال', 'غادي', 'بحاله',
    'المادة', 'العقوبة', 'القاضي', 'الحكم', 'الملف', 'لازم', 'خلاص', 'دابا', 'بزاف'];
  const matched = indicators.filter(ind => response.includes(ind)).length;
  const score = matched / indicators.length;
  return {
    isDarija: matched > 0,
    darijanessScore: Math.round(score * 100),
    quality: score > 0.5 ? 'high' : score > 0.2 ? 'medium' : 'low',
  };
}

class DarijaPhoneticMatcher {
  // Levenshtein edit distance
  _editDistance(s1, s2) {
    const costs = [];
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) { costs[j] = j; }
        else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1[i - 1] !== s2[j - 1]) newValue = Math.min(newValue, lastValue, costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  }

  _similarity(a, b) {
    const longer = a.length > b.length ? a : b;
    const shorter = a.length > b.length ? b : a;
    if (longer.length === 0) return 1.0;
    return (longer.length - this._editDistance(longer, shorter)) / longer.length;
  }

  // Find closest phrase from the database (fuzzy match, threshold 0.6)
  findClosestMatch(input) {
    const clean = (input || '').replace(/\s+/g, ' ').trim();
    if (extendedDarijaDatabase[clean]) return clean;

    let bestKey = null, bestScore = 0;
    for (const [key, variations] of Object.entries(extendedDarijaDatabase)) {
      for (const v of variations) {
        const score = this._similarity(clean, v);
        if (score > bestScore) { bestScore = score; bestKey = key; }
      }
    }
    return bestScore > 0.6 ? bestKey : null;
  }

  // Convert Darija words to Standard Arabic equivalents (word-by-word)
  convertToStandardArabic(darijaText) {
    let text = darijaText || '';
    for (const [darija, standard] of Object.entries(DARIJA_TO_STANDARD)) {
      // Use word-boundary-like matching (spaces or start/end)
      const escaped = darija.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      text = text.replace(new RegExp(`(?<![\\u0600-\\u06FF])${escaped}(?![\\u0600-\\u06FF])`, 'g'), standard);
    }
    return text;
  }

  // Detect the dominant intent from Darija text
  // Uses the advanced scoring classifier first, falls back to legacy keyword + pattern matching
  identifyIntent(darijaText) {
    const t = darijaText || '';

    // Advanced scorer (from Ultimate Darija Legal System)
    const { intent, confidence } = classifyDarijaIntent(t);
    if (confidence > 0) return intent;

    // Legacy keyword fallback
    for (const [legacyIntent, phrases] of Object.entries(INTENT_KEYWORDS)) {
      if (phrases.some(p => t.includes(p))) return legacyIntent;
    }
    // Pattern-based fallback
    for (const { pattern, type } of darijaPatterns) {
      if (pattern.test(t)) return type;
    }
    return 'general';
  }

  // Returns full classification result {intent, confidence, allScores}
  classifyIntent(darijaText) {
    return classifyDarijaIntent(darijaText || '');
  }
}

export default DarijaPhoneticMatcher;
