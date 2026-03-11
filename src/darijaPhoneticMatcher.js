// Darija Phonetic Matcher — local NLP layer for Moroccan Arabic dialect

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

// Darija → Standard Arabic word map
const DARIJA_TO_STANDARD = {
  'شنو': 'ما', 'شنوا': 'ما', 'اشنو': 'ما', 'آشنو': 'ما', 'أشنو': 'ما',
  'شحال': 'كم',
  'دايرة': 'تريد', 'دايرتي': 'تريدين',
  'كيفاش': 'كيف',
  'فاش': 'أين',
  'واش': 'هل',
  'علاش': 'لماذا',
  'ديالي': 'لي', 'ديالك': 'لك', 'ديالنا': 'لنا', 'ديالهم': 'لهم',
  'نسجن': 'أسجن', 'نرفع': 'أرفع', 'نروح': 'أذهب', 'نقول': 'أقول',
  'نطاعن': 'أطعن', 'نقدر': 'أستطيع', 'نستأنف': 'أستأنف',
  'واهاش': 'ماذا', 'باش': 'لكي',
  'بقاو': 'بقوا', 'راه': 'الآن', 'كاين': 'يوجد', 'ما فيهاش': 'لا يوجد',
  'مشي': 'لا', 'خايف': 'خائف', 'خاوف': 'خائف', 'مخموم': 'قلق',
  'نادم': 'نادم', 'متأسف': 'آسف', 'محتاج': 'محتاج',
  'تمام': 'حسن', 'ولا': 'أو', 'بلاكيفك': 'على ما يرام',
  'ديرت': 'فعلت', 'خلاص': 'انتهى', 'ميرسي': 'شكراً', 'شكران': 'شكراً',
  'بالبركة': 'بالتوفيق', 'بزاف': 'كثيراً', 'شوية': 'قليلاً',
  'دابا': 'الآن', 'البوليس': 'الشرطة', 'غادي': 'سيذهب',
  'عندي': 'عندي', 'عندك': 'عندك', 'ماعنديش': 'ليس عندي',
  'كتسجن': 'تسجن', 'كتدفع': 'تدفع', 'كتمشي': 'تذهب',
  'واه': 'نعم', 'أيه': 'نعم', 'لالا': 'لا',
};

const INTENT_KEYWORDS = {
  sentence_question: ['شحال دايرة نسجن', 'شحال السنوات', 'شنو العقوبة', 'شحال الحكم', 'كم سنة'],
  crime_question: ['شنو الجنحة', 'شنو التهمة', 'شنو المادة', 'شنو الجريمة'],
  deadline_question: ['شحال ديال الأيام', 'شحال الوقت', 'فاش الموعد', 'شحال من يوم'],
  legal_process: ['كيفاش نرفع دعوى', 'شنو المراحل', 'فاش من نروح', 'كيفاش نبدا'],
  appeal_question: ['واش عندي حق نطاعن', 'واش نقدر نستأنف', 'شنو الاستئناف', 'نقدر نطعن'],
  family_law: ['واش الطلاق', 'شنو الصداق', 'من الحضانة', 'شنو المهر', 'الزواج'],
  greeting: ['السلام عليكم', 'آشنو أخبار', 'كيفاش جايك', 'لباس'],
};

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
  identifyIntent(darijaText) {
    const t = darijaText || '';
    for (const [intent, phrases] of Object.entries(INTENT_KEYWORDS)) {
      if (phrases.some(p => t.includes(p))) return intent;
    }
    // Pattern-based fallback
    for (const { pattern, type } of darijaPatterns) {
      if (pattern.test(t)) return type;
    }
    return 'general_question';
  }
}

export default DarijaPhoneticMatcher;
