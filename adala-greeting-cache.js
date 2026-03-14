/**
 * ═══════════════════════════════════════════════════════════════════════
 * ADALA - AUTOMATED GREETING & CACHED SUGGESTIONS
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * Features:
 * - Auto-reply to greetings (Salaam, Thank you, etc)
 * - Pre-cached answers for suggested home tab questions
 * - Zero API calls for common interactions
 * - All 4 languages (AR, DAR, FR, EN)
 */

// ═══════════════════════════════════════════════════════════════════════
// PART 1: GREETING DETECTION & AUTO-REPLY
// ═══════════════════════════════════════════════════════════════════════

const GREETINGS = {
  ar: {
      salutation: {
        patterns: [
          'السلام عليكم',
          'السلام عليكم ورحمة الله وبركاته',
          'سلام عليكم ورحمة الله',
          'وعليكم السلام',
          'سلام عليكم',
          'السلام',
          'سلام',
          'أهلاً',
          'أهلاً وسهلاً',
          'مرحباً',
          'مرحبا',
          'حياك الله',
          'تحياتي',
          'تحية طيبة',
          'تحية',
        ],
        reply: `وعليكم السلام ورحمة الله وبركاته! 👋

  أهلاً وسهلاً بك في عدالة، مساعدك القانوني الذكي للقانون المغربي.

  يمكنني مساعدتك في:
  🏛️ مدونة الأسرة (الزواج، الطلاق، الحضانة)
  ⚖️ القانون الجنائي (الجرائم والعقوبات)
  📋 المسطرة الجنائية (الإجراءات القانونية)
  📜 الالتزامات والعقود

  ما هو سؤالك القانوني؟ 🔍`
      },
      thanks: {
        patterns: [
          'تشكراً',
          'شكراً',
          'شكراً جزيلاً',
          'شكرا لك',
          'ألف شكر',
          'جزاك الله خيراً',
          'يسلموا',
          'يعطيك العافية',
          'يعطيك الصحة',
        ],
        reply: `العفو تماماً! 😊

  يسعدني أن المعلومة القانونية كانت مفيدة لك. القانون المغربي واسع ومتشعّب، ولا تتردد في السؤال عن أي موضوع آخر يخصك.

  هل لديك استفسار قانوني إضافي؟ 📋`
      },
      farewell: {
        patterns: [
          'مع السلامة',
          'وداعاً',
          'إلى اللقاء',
          'في أمان الله',
          'إلى اللقاء القريب',
        ],
        reply: `مع السلامة! 👋

  أتمنى أن تكون استشارتنا القانونية قد أفادتك. لا تتردد في العودة إلى عدالة متى احتجت إلى معلومة قانونية أخرى.

  في أمان الله وحفظه. 🤲`
      },
      morning: {
        patterns: [
          'صباح الخير',
          'صباح النور',
          'صباح المنور',
          'صباحك الله بالخير',
        ],
        reply: `صباح النور! ☀️

  أهلاً بك في عدالة في هذا الصباح المبارك. أنا مساعدك القانوني الذكي لكل ما يتعلق بالقانون المغربي.

  اطرح سؤالك القانوني وسأجيبك بدقة ومصداقية. 📜`
      },
      evening: {
        patterns: [
          'مساء الخير',
          'مساء النور',
          'مساء الكرم',
          'تصبح على خير',
        ],
        reply: `مساء النور! 🌙

  أهلاً بك في عدالة في هذا المساء. أنا مساعدك القانوني الذكي لكل ما يتعلق بالقانون المغربي.

  هل لديك سؤال قانوني يدور في ذهنك اليوم؟ 📜`
      },
      how_are_you: {
        patterns: [
          'كيف الحال',
          'كيف حالك',
          'كيف حالكم',
        ],
        reply: `بخير والحمد لله، وأنت؟ 😊

  أنا عدالة، وأنا دائماً جاهز لخدمتك في كل ما يتعلق بالقانون المغربي.

  اطرح سؤالك القانوني وسأجيب عليه بدقة من مصادر التشريع المغربي. ⚖️`
      },
      religious: {
        patterns: [
          'بارك الله فيك',
          'الله يبارك فيك',
          'الله يبارك',
        ],
        reply: `وفيك بارك الله! 🤲

  شكراً لكلماتك الطيبة، أسعدك الله. أنا هنا لمساعدتك في أي استشارة قانونية تتعلق بالقانون المغربي.

  هل لديك سؤال يمكنني الإجابة عليه اليوم؟ ⚖️`
      },
    },

    darija: {
      salutation: {
        patterns: [
          'السلام عليكم',
          'السلام',
          'سلام',
          'هلا',
          'أهلا',
          'أهلا وسهلا',
          'مرحبا',
        ],
        reply: `وعليكم السلام ورحمة الله! 👋

  مرحبا بيك في عدالة، المساعد القانوني الذكي للقانون المغربي.

  نقدر نعاونك في:
  🏛️ مدونة الأسرة (الزواج، الطلاق، الحضانة)
  ⚖️ القانون الجنائي (الجرائم والعقوبات)
  📋 المسطرة الجنائية
  📜 الالتزامات والعقود

  شول سؤالك القانوني وغنجاوبك! 🔍`
      },
      thanks: {
        patterns: [
          'شكراً',
          'شكرا',
          'شكرك',
          'تشكر',
          'يعطيك الصحة',
          'يعطيك العافية',
          'بارك الله فيك',
          'حياك الله',
          'الله يخليك',
          'الله يجازيك',
        ],
        reply: `ماشي مشكل! 😊

  يفرحني أن المعلومة نفعتك. القانون المغربي فيه بزاف، ودايما هنا باش نعاونك.

  واش كاين شي سؤال آخر باغي تسأل عليه؟ 📋`
      },
      farewell: {
        patterns: [
          'بسلامة',
          'مع السلامة',
          'في أمان الله',
          'تبقى بخير',
        ],
        reply: `بسلامة! 👋

  تمنيت يكون عدالة نفعك. إلا محتاج أي معلومة قانونية أخرى، ارجع لينا في أي وقت.

  الله يحفظك! 🤲`
      },
      morning: {
        patterns: [
          'صباح الخير',
          'صباح لفل',
        ],
        reply: `صباح لفل! ☀️

  أهلا بيك في عدالة في هاد الصباح المبارك. واش كاين شي سؤال قانوني نقدر نعاونك فيه اليوم؟

  شول وغنجاوبك بالدقة. 📜`
      },
      evening: {
        patterns: [
          'مساء الخير',
          'تصبح على خير',
        ],
        reply: `مساء لفل! 🌙

  أهلا بيك في عدالة في هاد المساء. واش عندك شي سؤال قانوني دائر في بالك؟

  شول وغنجاوبك بالدقة. 📜`
      },
      how_are_you: {
        patterns: [
          'شنو أخبارك',
          'كيفاش الأحوال',
          'كيفاش',
          'كيداير',
          'كيف داير',
          'لاباس',
          'مزيان',
          'واش لاباس',
        ],
        reply: `لاباس الحمد لله، وأنت؟ 😊

  أنا عدالة، ودايما هنا باش نعاونك في كل ما يخص القانون المغربي.

  كيفاش نقدر نعاونك اليوم؟ ⚖️`
      },
      religious: {
        patterns: [
          'حمد الله',
          'الحمد لله',
          'بسم الله',
          'الله أكبر',
        ],
        reply: `الله يبارك فيك! 🤲

  شكراً على الكلام الزوين، الله يسعدك. أنا هنا باش نعاونك في أي سؤال قانوني.

  واش كاين شي حاجة نقدر نعاونك فيها؟ ⚖️`
      },
    },

    fr: {
      salutation: {
        patterns: [
          'assalam alaikoum',
          'assalamu alaikum',
          'السلام عليكم',
          'salam alaykoum',
          'salam',
          'bonjour',
          'salut',
          'coucou',
          'hello',
          'rebonjour',
          'bien le bonjour',
        ],
        reply: `Wa alaykum assalam wa rahmatullah ! 👋

  Bonjour et bienvenue dans Adala — votre assistant juridique intelligent pour le droit marocain.

  Je peux vous aider avec :
  🏛️ Code de la famille (Mariage, Divorce, Garde)
  ⚖️ Code pénal (Crimes et sanctions)
  📋 Code de procédure pénale
  📜 Obligations et contrats

  Quelle est votre question juridique ? 🔍`
      },
      thanks: {
        patterns: [
          'merci',
          'merci beaucoup',
          'merci pour',
          'merci infiniment',
          'mille mercis',
          'un grand merci',
          'je vous remercie',
        ],
        reply: `Avec grand plaisir ! 😊

  Je suis ravi(e) que l'information vous ait été utile. Le droit marocain est vaste — n'hésitez pas à poser d'autres questions à tout moment.

  Puis-je vous aider sur un autre point juridique ? 📋`
      },
      farewell: {
        patterns: [
          'au revoir',
          'adieu',
          'à bientôt',
          'à tout à l\'heure',
          'à demain',
          'à plus',
          'à plus tard',
          'bonne continuation',
          'bonne journée',
          'bonne fin de journée',
          'bonne chance',
          'bisous',
          'cordialement',
          'bien à vous',
        ],
        reply: `Au revoir et bonne continuation ! 👋

  J'espère qu'Adala vous a été utile aujourd'hui. N'hésitez pas à revenir pour toute question juridique sur le droit marocain.

  Bonne journée et à bientôt ! 🤲`
      },
      morning: {
        patterns: [
          'bonne matinée',
          'bon matin',
        ],
        reply: `Bonne matinée à vous ! ☀️

  Bienvenue dans Adala en ce début de journée. Avez-vous une question juridique sur le droit marocain ?

  Posez-la et j'y répondrai avec précision. 📜`
      },
      evening: {
        patterns: [
          'bonsoir',
          'bon soir',
          'bonne nuit',
          'bonne soirée',
          'bon après-midi',
          'bonne après-midi',
        ],
        reply: `Bonsoir ! 🌙

  Bienvenue dans Adala ce soir. Puis-je vous aider avec une question juridique sur le droit marocain ?

  Je suis là pour vous répondre avec précision. 📜`
      },
      how_are_you: {
        patterns: [
          'ça va',
          'comment ça va',
          'comment allez-vous',
          'comment vas-tu',
        ],
        reply: `Très bien, merci ! Et vous ? 😊

  Je suis Adala, votre assistant juridique intelligent spécialisé dans le droit marocain. Comment puis-je vous aider aujourd'hui ?

  Posez votre question juridique et j'y répondrai avec précision. ⚖️`
      },
      intro: {
        patterns: [
          'enchanté',
          'enchantée',
        ],
        reply: `Enchanté(e) de faire votre connaissance ! 😊

  Je suis Adala, votre assistant juridique intelligent pour tout ce qui concerne le droit marocain.

  N'hésitez pas à poser vos questions juridiques — je suis là pour vous aider. ⚖️`
      },
    },

    en: {
      salutation: {
        patterns: [
          'assalamu alaikum',
          'assalam alaikum',
          'assalamu alaykum',
          'as-salamu alaykum',
          'hello',
          'hi',
          'hey',
          'hey there',
          'hi there',
          'hiya',
          'howdy',
          'greetings',
          'yo',
        ],
        reply: `Wa alaykum assalam wa rahmatullahi wa barakatuh! 👋

  Hello and welcome to Adala — your intelligent legal assistant for Moroccan law.

  I can help you with:
  🏛️ Family Code (Marriage, Divorce, Custody)
  ⚖️ Penal Code (Crimes and Penalties)
  📋 Criminal Procedure Code
  📜 Obligations and Contracts

  What is your legal question? 🔍`
      },
      thanks: {
        patterns: [
          'thanks',
          'thank you',
          'thank you very much',
          'thank you so much',
          'thanks a lot',
          'many thanks',
          'much appreciated',
          'appreciate it',
        ],
        reply: `You're very welcome! 😊

  I'm glad the information was helpful. Moroccan law covers many areas — feel free to ask me anything else at any time.

  Do you have another legal question I can help with? 📋`
      },
      farewell: {
        patterns: [
          'goodbye',
          'bye',
          'bye bye',
          'see you',
          'see you later',
          'see you soon',
          'take care',
          'cheers',
        ],
        reply: `Goodbye and take good care! 👋

  I hope Adala was helpful to you today. Don't hesitate to come back whenever you need legal information about Moroccan law.

  All the best! 🤲`
      },
      morning: {
        patterns: [
          'good morning',
          'morning',
        ],
        reply: `Good morning! ☀️

  Welcome to Adala. I'm your intelligent legal assistant specialized in Moroccan law. Do you have a legal question I can help with today?

  Ask away and I'll give you an accurate, well-sourced answer. 📜`
      },
      evening: {
        patterns: [
          'good afternoon',
          'good evening',
          'good night',
          'good day',
          'evening',
        ],
        reply: `Good evening! 🌙

  Welcome to Adala. I'm here to help with any legal questions about Moroccan law.

  Feel free to ask, and I'll provide a precise, well-sourced answer. 📜`
      },
      how_are_you: {
        patterns: [
          'how are you',
          'how\'s it going',
          'hows it going',
          'how are things',
          'what\'s up',
          'whats up',
          'what\'s new',
          'how do you do',
          'sup',
        ],
        reply: `I'm doing great, thank you for asking! 😊

  I'm Adala, your intelligent legal assistant for Moroccan law. How can I help you today?

  Ask me any legal question and I'll provide an accurate answer based on Moroccan legislation. ⚖️`
      },
      intro: {
        patterns: [
          'nice to meet you',
          'pleased to meet you',
        ],
        reply: `Nice to meet you too! 😊

  I'm Adala, your intelligent legal assistant specialized in Moroccan law. I'm here to help with any legal questions you might have.

  Feel free to ask anything about Moroccan law! ⚖️`
      },
      other: {
        patterns: [
          'have a good day',
          'have a great day',
          'have a nice day',
          'have a good one',
          'regards',
          'best regards',
          'kind regards',
        ],
        reply: `Thank you, same to you! 😊

  I'm Adala, always here whenever you need help with Moroccan law questions.

  Don't hesitate to come back anytime! ⚖️`
      },
    }
  };

  // Shared word-boundary-aware matching helper
  function matchesPattern(textLower, pLower) {
    if (pLower === textLower) return true;
    if (pLower.length <= 5) {
      return textLower.startsWith(pLower + ' ') ||
             textLower.endsWith(' ' + pLower) ||
             textLower.includes(' ' + pLower + ' ');
    }
    return textLower.includes(pLower);
  }

  function isGreeting(text, language) {
    const textLower = text.toLowerCase().trim();

    // Find the first greeting pattern that matches and return it
    const findMatch = (langData) => {
      for (const category of Object.values(langData)) {
        for (const pattern of (category.patterns || [])) {
          const pLower = pattern.toLowerCase();
          if (matchesPattern(textLower, pLower)) return pLower;
        }
      }
      return null;
    };

    // Check if a matched greeting is the whole (or near-whole) message
    const isPureGreeting = (matchedPattern) => {
      if (!matchedPattern) return false;
      // Remove the greeting phrase from text and check what's left
      const remainder = textLower.replace(matchedPattern, '').replace(/[،,،.؟?!،\s]/g, '').trim();
      // If more than 12 chars remain, this is a question with a greeting prefix — not a pure greeting
      return remainder.length <= 12;
    };

    let matched = findMatch(GREETINGS[language] || {});
    if (matched) return isPureGreeting(matched);

    // Cross-language fallback — catches e.g. "bonjour" when lang is set to "ar"
    for (const lang of Object.keys(GREETINGS)) {
      if (lang === language) continue;
      matched = findMatch(GREETINGS[lang]);
      if (matched) return isPureGreeting(matched);
    }

    return false;
  }

  function getGreetingResponse(language, text = '') {
    const langData = GREETINGS[language] || GREETINGS['en'];
    const textLower = text.toLowerCase().trim();

    if (textLower) {
      // Check current language categories first
      for (const category of Object.values(langData)) {
        for (const pattern of (category.patterns || [])) {
          if (matchesPattern(textLower, pattern.toLowerCase())) {
            return category.reply;
          }
        }
      }

      // Cross-language: find matching category in other language, return same category in target lang
      for (const [otherLang, otherLangData] of Object.entries(GREETINGS)) {
        if (otherLang === language) continue;
        for (const [catName, category] of Object.entries(otherLangData)) {
          for (const pattern of (category.patterns || [])) {
            if (matchesPattern(textLower, pattern.toLowerCase())) {
              return langData[catName]?.reply || langData.salutation?.reply || Object.values(langData)[0].reply;
            }
          }
        }
      }
    }

    // Default to salutation reply
    return langData.salutation?.reply || Object.values(langData)[0].reply;
  }
// PART 2: PRE-CACHED SUGGESTED QUESTIONS & ANSWERS
// ═══════════════════════════════════════════════════════════════════════

const SUGGESTED_QUESTIONS = {
  ar: [
    {
      question: 'ما هو السن القانوني للزواج في المغرب؟',
      domain: 'family',
      cached_answer: `السن القانوني للزواج في المغرب هو 18 سنة لكل من الذكر والأنثى، وفقاً لمدونة الأسرة.

المرجع القانوني:
- القانون: مدونة الأسرة
- الرقم: 70.03
- المادة: المادة 9
- التاريخ: 2004
- الثقة: عالية جداً

يمكن زواج من هو أقل من 18 سنة برخصة من القاضي في حالات استثنائية إذا كان هناك مصلحة وموافقة الولي والموافقة القضائية.`,
      confidence: 0.95
    },
    {
      question: 'كيف تتم إجراءات الطلاق؟',
      domain: 'family',
      cached_answer: `إجراءات الطلاق في المغرب تتم من خلال المحكمة وتتضمن الخطوات التالية:

1. تقديم طلب الطلاق إلى المحكمة المختصة
2. محاولة التوفيق بين الزوجين أمام القاضي
3. إصدار الحكم بالطلاق بعد استنفاد محاولات الصلح

أنواع الطلاق:
- طلاق الزوج (الرجل يطلق زوجته)
- تطليق الزوجة (طلب الزوجة للطلاق أمام القاضي)
- خلع (طلاق بموافقة الزوجة مقابل مساومة)

المرجع القانوني:
- القانون: مدونة الأسرة
- الرقم: 70.03
- المواد: 80-94
- الثقة: عالية جداً`,
      confidence: 0.95
    },
    {
      question: 'ما هي عقوبة السرقة في القانون المغربي؟',
      domain: 'penal',
      cached_answer: `عقوبة السرقة البسيطة في المغرب هي السجن من شهر واحد إلى سنة واحدة وغرامة من 200 إلى 2000 درهم.

أنواع السرقة:
1. السرقة البسيطة: حبس من 1 شهر إلى 1 سنة وغرامة 200-2000 درهم
2. السرقة من دار مأهولة: حبس من 1 إلى 3 سنوات وغرامة 500-10000 درهم
3. السرقة بالعنف: عقوبات أشد

المرجع القانوني:
- القانون: القانون الجنائي
- الرقم: 1.59.413
- المواد: 467-475
- التاريخ: 26 نوفمبر 1992
- الثقة: عالية جداً`,
      confidence: 0.95
    },
    {
      question: 'كيف يتم تقسيم الإرث؟',
      domain: 'family',
      cached_answer: `إن مسألة تقسيم الإرث في القانون المغربي تخضع لأحكام مدونة الأسرة، وهي مستمدة بشكل أساسي من قواعد المذهب المالكي، حيث ينص الفصل 400 من مدونة الأسرة على أن المذهب المالكي هو المرجع في المسائل التي لم ينص عليها القانون.

عند وفاة شخص، تفتح تركة المتوفى فوراً وتنتقل إلى ورثته، وذلك وفق ما ينص عليه الفصل 276 من مدونة الأسرة. ويشترط لصحة الوصية، وهي تصرف مضاف إلى ما بعد الموت، أن يكون الموصي عاقلاً وأن يبلغ سن الرشد القانوني وهو 18 سنة، وألا يكون محجوراً عليه، كما هو موضح في الفصل 278. لا يجوز للوصية أن تتجاوز ثلث التركة إلا إذا أجاز الورثة ذلك، كما أن أي وصية لفائدة وارث لا تكون صحيحة إلا بموافقة باقي الورثة.

تحدد مدونة الأسرة أنصبة الورثة الشرعية بناءً على قواعد المذهب المالكي. فعلى سبيل المثال، ترث البنت الواحدة النصف، وترث ابنتان فأكثر الثلثين، وترث الأم السدس أو الثلث، وترث الزوجة الثمن أو الربع، ويرث الزوج النصف أو الربع، وذلك حسب تفصيل ورد في الفصل 285. كما توجد أحكام خاصة تتعلق بالوصية الواجبة للأحفاد الذين توفي آباؤهم قبل جدهم، وذلك وفق ما ورد في الفصول 369 إلى 372.

هذه المعلومات للتوعية العامة ولا تعد استشارة قانونية ملزمة، ومن الأفضل الرجوع إلى محام مغربي مختص وفق تفاصيل الحالة.`,
      confidence: 0.95
    },
    {
      question: 'ما هي شروط عقد الكراء؟',
      domain: 'contracts',
      cached_answer: `يُعد عقد الكراء أحد أنواع العقود التي تُستخدم في العلاقات القانونية بين الأفراد، ويتطلب هذا العقد شروطا معينة ليكون صحيحا وملزما للطرفين. وفقا للمادة 505 من القانون المدني، يجب أن يحدد عقد الكراء بعض الشروط الأساسية، مثل تحديد العقار المُؤجر، والمدة الزمنية للكراء، ومبلغ الإيجار. بالإضافة إلى ذلك، يجب أن تتوفر بعض الشروط الأخرى، مثل توافر القدرة القانونية للطرفين، ووجود موافقة حرة وواعية من كلا الطرفين، ووضوح الشروط والمواصفات التي تم الاتفاق عليها.

يجب أن يكون عقد الكراء مكتوبا، ويجب أن يوقعه كلا الطرفين، وأن يتم تسجيله في السجلات الرسمية إذا لزم الأمر. كما يجب أن يحدد العقد حقوق وواجبات كل طرف، بما في ذلك واجبات الدفع والإيجار، وواجبات الصيانة والإصلاح. بالإضافة إلى ذلك، يجب أن يحدد العقد شروط الانتهاء، مثل الشروط التي تؤدي إلى انتهاء العقد، والشروط التي تؤدي إلى تجديده.

من المهم أن نلاحظ أن عقد الكراء يخضع لقواعد ولوائح معينة، مثل قانون الإيجار رقم 67-12، الذي يحدد بعض الحقوق والحماية للlocator والمستأجر. كما يخضع عقد الكراء لقواعد المسؤولية والتعويض، حيث يمكن أن يُطلب من الطرفين التعويض عن أي أضرار أو خسائر ناتجة عن مخالفة شروط العقد.

هذه المعلومات للتوعية العامة ولا تعد استشارة قانونية ملزمة، ومن الأفضل الرجوع إلى محام مغربي مختص وفق تفاصيل الحالة.`,
      confidence: 0.95
    },
    {
      question: 'ما هي حقوق الحضانة بعد الطلاق؟',
      domain: 'family',
      cached_answer: `يُعتبر الحضانة بعد الطلاق أحد أهم الأمور التي تُحسم في إطار قانون الأسرة المغربي. وفقًا للمادة 163 من المودوانا، تُعتبر الحضانة حقًا للطفل وليس للوالدين، وتهدف إلى ضمان مصلحة الطفل ورفاهيته. يُحدد القانون ترتيب الأولوية للحضانة، حيث تتبع التسلسل التالي: الأم ثم الأب ثم الجدة الأم ثم الجدة الأب ثم العمات والأخوات. 

وفقًا للمادة 167، قد تفقد الأم الحضانة إذا تزوجت مرة أخرى، إلا إذا قرر القاضي أن ذلك يخدم مصلحة الطفل. كما تنص المادة 171 على أن الحضانة تظل سارية حتى بلوغ الطفل سن السابعة للذكور أو البلوغ للإناث، إلا إذا قرر القاضي تمديد الحضانة لما يخدم مصلحة الطفل. يُشدد القانون على حق الوالد غير الحاضن في زيارة الطفل، حيث يحدد القاضي جدولًا لذلك وفقًا للمادة 175.

فيما يتعلق بحقوق الحضانة بعد الطلاق، يُشدد القانون على أهمية مصلحة الطفل وضمان رفاهيته، حيث يُعتبر الحضانة حقًا للطفل وليس للوالدين. يُحدد القانون شروطًا واضحة لضمان مصلحة الطفل، وتهدف هذه الشروط إلى توفير بيئة آمنة ومستقرة للطفل بعد الطلاق.

هذه المعلومات للتوعية العامة ولا تعد استشارة قانونية ملزمة، ومن الأفضل الرجوع إلى محام مغربي مختص وفق تفاصيل الحالة.`,
      confidence: 0.95
    }
  ],

  darija: [
    {
      question: 'شنو السن القانوني للزواج في المغرب؟',
      domain: 'family',
      cached_answer: `السن القانوني للزواج في المغرب هو 18 سنة، سواء للولد أو البنت، طبع مدونة الأسرة.

المرجع القانوني:
- القانون: مدونة الأسرة
- الرقم: 70.03
- المادة: 9
- التاريخ: 2004
- الثقة: عالية جداً

لكن ممكن الزواج بسن أقل من 18 سنة إذا دار القاضي وموافقة الولي والمصلحة واضحة.`,
      confidence: 0.95
    },
    {
      question: 'كيفاش تتم إجراءات الطلاق؟',
      domain: 'family',
      cached_answer: `إجراءات الطلاق في المغرب:

1. تقديم دعوى الطلاق لالمحكمة
2. محاولة التوفيق بين الزوجين عند القاضي
3. إصدار الحكم بالطلاق

أنواع الطلاق:
- طلاق الراجل (تطليقة)
- تطليق البنت (تطلب من القاضي)
- خلع (طلاق متفق عليه)

المرجع القانوني:
- القانون: مدونة الأسرة
- الرقم: 70.03
- المواد: 80-94
- الثقة: عالية جداً`,
      confidence: 0.95
    },
    {
      question: 'شحال دايرة نسجن في السرقة؟',
      domain: 'penal',
      cached_answer: `عقوبة السرقة في المغرب:

السرقة البسيطة: السجن من شهر واحد إلى سنة واحدة وغرامة من 200 إلى 2000 درهم.

إذا كانت من دار:
السجن من سنة إلى 3 سنوات وغرامة من 500 إلى 10000 درهم.

المرجع القانوني:
- القانون: القانون الجنائي
- الرقم: 1.59.413
- المواد: 467-475
- التاريخ: 26 نوفمبر 1992
- الثقة: عالية جداً`,
      confidence: 0.95
    },
    {
      question: 'كيفاش يتم تقسيم الإرث؟',
      domain: 'family',
      cached_answer: `يتم تقسيم الإرث وفقًا للمواد القانونية المحددة في القانون المغربي، وخاصة في المادة 285 من مدونة الأسرة، التي تنص على أن الإرث يتم تقسيمه وفقًا للshares الإسلامية المحددة، حيث تتلقى الابنة نصف التركة، والابنتان معًا ثلثي التركة، والأم سدس أو ثلث التركة، والزوجة ثمن أو ربع التركة، والزوج نصف أو ربع التركة. كما تنص المادة 278 على أن الوراثة تفتح عند الوفاة، وتستقر التركة في يدي الورثة فورًا. بالإضافة إلى ذلك، تنص المادة 279 على أن الوصية لا يمكن أن تتجاوز ثلث التركة لغير الورثة، وأن الهدية إلى الوريث لا تكون صحيحة إلا إذا وافق عليها الورثة الآخرون. ويتحدد مقدار الميراث وفقًا للعلاقات الأسرية والقواعد الإسلامية، حيث تطبق المادة 332 التي تنص على أن الأحفاد يرثون جزءًا من التركة إذا مات والدهم قبل الجد. ويتطلب التقسيم العادل للإرث وجود وثائق قانونية دقيقة ومتوافرة، بالإضافة إلى فهم دقيق للقواعد القانونية المحددة في مدونة الأسرة.

هذه المعلومات للتوعية العامة ولا تعد استشارة قانونية ملزمة، ومن الأفضل الرجوع إلى محام مغربي مختص وفق تفاصيل الحالة.`,
      confidence: 0.95
    },
    {
      question: 'شنو شروط عقد الكراء؟',
      domain: 'contracts',
      cached_answer: `يُعد عقد الكراء أحد أنواع العقود التي تُستخدم في نقل الحق في استعمال الشيء من مالك إلى مستأجر، ويتطلب عقد الكراء شروطا معينة ليكون صحيحا. وفقا للمادة 505 من القانون المدني، يجب أن يحدد عقد الكراء عدة أمور أساسية، وهي: الشيء المُكرىء، والمدة الزمنية للكراء، والمبلغ المالي للكراء. يجب أن يكون الشيء المُكرىء محددا بوضوح، سواء كان شقة أو بيت أو أرض أو غيرها من الأملاك. كما يجب أن تُحدد المدة الزمنية للكراء بوضوح، فإذا لم يُحدد وقت انتهاء الكراء، يُعتبر العقد غير صحيح. بالإضافة إلى ذلك، يجب أن يُحدد المبلغ المالي للكراء بوضوح، ويتفق عليه بين الطرفين. يجب أن يكون عقد الكراء مكتوبا، ويُوقّع من قبل كلا الطرفين، ويجب أن يكون هناك توافق بينهم على شروط العقد. كما يجب أن يكون المستأجر واضحا في نية استعمال الشيء المُكرىء، ويجب أن يكون المالك واضحا في نية إعطاء الحق في استعمال الشيء. يجب أن يكون هناك توافق بين الطرفين على شروط العقد، ويتفقان على كل التفاصيل المتعلقة بالكراء. إذا لم تتوفر هذه الشروط، يُعتبر عقد الكراء غير صحيح، ولا يمكن أن يُطبق. يجب على المستأجر أن يلتزم بشروط العقد، ويدفع المبلغ المالي المتفق عليه في الوقت المحدد، كما يجب على المالك أن يلتزم بشروط العقد، ويعطي المستأجر الحق في استعمال الشيء المُكرىء.

هذه المعلومات للتوعية العامة ولا تعد استشارة قانونية ملزمة، ومن الأفضل الرجوع إلى محام مغربي مختص وفق تفاصيل الحالة.`,
      confidence: 0.95
    },
    {
      question: 'شنو حقوق الحضانة بعد الطلاق؟',
      domain: 'family',
      cached_answer: `تعد حقوق الحضانة من المسائل الحساسة التي تنظمها مدونة الأسرة المغربية، وتُعطى الأولوية للأم على أساس مصلحة الطفل، مع ضمان حقوق الأب في الزيارة والاطلاع على الطفل. وفقًا للمادة 163 من المدونة، فإن الحضانة تعتبر حقًا من حقوق الطفل، وليست حقًا من حقوق الوالدين، وتُمنح للأم بشكل أساسي حتى يبلغ الطفل سن السابعة، سواء كان ذكرًا أو أنثى، إلا إذا قرر القاضي خلاف ذلك بناءً على مصلحة الطفل.

أما بالنسبة للذكر، فإن المادة 171 تشير إلى أن الحضانة تستمر حتى سن السابعة، وعند بلوغ الطفل سن البلوغ، يحق للقاضي أن يقرر استمرار الحضانة أو نقلها إلى أحد الوالدين أو غيرهما، وفقًا لمصلحة الطفل. وفي حالة زواج الأم، قد يفقد الطفل حقه في الحضانة إلا إذا رأى القاضي أن ذلك يصب في مصلحته، كما تنص المادة 167 على أن الأم تفقد حق الحضانة إذا تزوجت، إلا إذا قرر القاضي خلاف ذلك مراعاة لمصلحة الطفل.

وفيما يخص حق الأب، فإن المادة 175 تؤكد أن للأب حق الزيارة والاطلاع على الطفل، ويحدد القاضي جدولاً زمنياً مناسبًا لضمان تواصل الطفل مع والده، ويُراعى في ذلك مصلحة الطفل وسلامته النفسية والجسدية. وإذا تعارضت مصالح الوالدين، فإن القاضي يتخذ القرار الذي يخدم مصلحة الطفل بشكل أساسي، مع احترام حقوق الطرفين.

وفي النهاية، يُشدد على أن حقوق الحضانة تُمنح وفقًا لمبدأ المصلحة الفضلى للطفل، مع مراعاة الظروف الخاصة لكل حالة، ويجب أن تكون القرارات مرنة ومرتكزة على معايير العدالة والرحمة، مع احترام الحقوق القانونية للأطراف المعنية. هذه المعلومات للتوعية العامة ولا تعد استشارة قانونية ملزمة، ومن الأفضل الرجوع إلى محام مغربي مختص وفق تفاصيل الحالة.`,
      confidence: 0.95
    }
  ],

  fr: [
    {
      question: 'Quel est l\'âge légal du mariage au Maroc?',
      domain: 'family',
      cached_answer: `L'âge légal du mariage au Maroc est 18 ans pour les deux sexes, selon le Code de la famille.

Référence Juridique:
- Loi: Code de la famille
- Numéro: 70.03
- Article: 9
- Date: 2004
- Confiance: Très élevée

Un mariage avant 18 ans peut être autorisé par le juge en cas d'intérêt légitime et avec le consentement du tuteur.`,
      confidence: 0.95
    },
    {
      question: 'Comment se déroulent les procédures de divorce?',
      domain: 'family',
      cached_answer: `Les procédures de divorce au Maroc se font devant le tribunal et comprennent:

1. Dépôt de la demande de divorce auprès du tribunal compétent
2. Tentative de réconciliation par le juge
3. Prononcé du jugement de divorce

Types de divorce:
- Répudiation (le mari répudie sa femme)
- Divorce judiciaire (demande de la femme)
- Khul (divorce consensuel)

Référence Juridique:
- Loi: Code de la famille
- Numéro: 70.03
- Articles: 80-94
- Confiance: Très élevée`,
      confidence: 0.95
    },
    {
      question: 'Quelle est la peine pour vol au Maroc?',
      domain: 'penal',
      cached_answer: `La peine pour simple vol au Maroc est l'emprisonnement d'un mois à un an et une amende de 200 à 2000 dirhams.

Types de vol:
1. Vol simple: emprisonnement 1 mois à 1 an, amende 200-2000 DH
2. Vol dans une habitation: emprisonnement 1 à 3 ans, amende 500-10000 DH
3. Vol avec violence: peines plus sévères

Référence Juridique:
- Loi: Code pénal marocain
- Numéro: 1.59.413
- Articles: 467-475
- Date: 26 novembre 1992
- Confiance: Très élevée`,
      confidence: 0.95
    },
    {
      question: 'Comment s\'effectue le partage de l\'héritage?',
      domain: 'family',
      cached_answer: `Le partage de l'héritage constitue une étape essentielle dans le cadre de la succession, conformément aux dispositions du Code de la Famille et notamment des articles qui régissent la dévolution successorale. Dès le décès, la succession s'ouvre immédiatement, et l'article 276 précise que le patrimoine du défunt appartient aux héritiers de manière immédiate. La répartition de cet héritage doit respecter les parts légales fixées par la loi islamique, notamment la doctrine malékite, qui prévaut dans le droit marocain, et dont les règles sont explicitement énoncées dans l'article 285.

Selon ces dispositions, la répartition se fait en fonction des parts obligatoires attribuées à chaque héritier. La fille, par exemple, hérite d'une moitié si elle est unique, ou des deux tiers si elle a une sœur, tandis que la mère peut recevoir entre un sixième et un tiers, selon la présence d'autres héritiers. L'époux ou l'épouse, quant à eux, ont droit à une part spécifique, soit un huitième ou un quart, selon la situation. Il est important de souligner que la succession est considérée comme étant immédiatement acquise aux héritiers dès le décès, mais le partage effectif doit respecter ces parts, qui ne peuvent être modifiées que dans le cadre de la volonté du défunt exprimée dans un testament, sous réserve de ne pas dépasser le tiers de l'héritage pour les non-héritiers, conformément à l'article 279.

Le partage peut se faire à l'amiable entre héritiers ou, en cas de désaccord, par une procédure judiciaire. Lorsqu'une contestation survient, le tribunal compétent intervient pour statuer, en veillant à respecter les droits de chacun. Il est également à noter que dans certains cas, notamment pour les petits héritages ou lorsque les héritiers sont d'accord, la procédure peut être simplifiée, mais toujours dans le respect des règles légales et religieuses.

En conclusion, le partage de l'héritage doit être effectué dans le respect strict des parts légales, en tenant compte des dispositions du Code de la Famille et des principes de la loi islamique, afin d'assurer une transmission équitable et conforme aux droits de chaque héritier. Ces informations sont fournies à titre éducatif et ne constituent pas un conseil juridique complet ; il est recommande de consulter un avocat marocain selon votre situation.`,
      confidence: 0.95
    },
    {
      question: 'Quelles sont les conditions d\'un contrat de location?',
      domain: 'contracts',
      cached_answer: `Le contrat de location, qu'il soit résidentiel ou commercial, doit respecter un certain nombre de conditions essentielles pour être considéré comme valable et opposable. En vertu de l'article 505 et suivants du Code des Obligations et Contrats, ce contrat doit notamment définir avec précision la nature du bien loué, la durée de la location, ainsi que le montant du loyer. La clarté de ces éléments est fondamentale pour éviter toute contestation ultérieure. 

Il est également impératif que le contrat de location soit établi en écrit, surtout dans le cas d'une location à durée déterminée, conformément à la réglementation en vigueur. La forme écrite permet de formaliser l'accord entre les parties et de préciser leurs droits et obligations respectifs. En outre, le contrat doit préciser si le locataire a le droit de sous-louer le bien, ce qui requiert généralement l'accord écrit du propriétaire, conformément à l'article 505+ du Code. 

Sur le plan de la légalité, le contrat doit respecter la réglementation spécifique applicable, notamment la Loi 67-12 de 2016 relative à la protection du locataire résidentiel, qui encadre notamment les modalités d'éviction et la fixation du loyer. La durée du contrat doit également respecter les limites fixées par la loi ou par accord entre les parties, et toute clause contraire pourrait être considérée comme nulle. 

En somme, un contrat de location valable doit comporter une description précise du bien, une détermination claire du loyer, une durée définie, et respecter les dispositions légales applicables. Il doit également être signé par les deux parties pour garantir leur consentement mutuel. La rédaction soignée de ces éléments constitue une étape essentielle pour sécuriser la relation locative et prévenir tout litige futur. 

Il est important de rappeler que ces informations sont fournies à titre éducatif et ne constituent pas un conseil juridique complet; il est recommandé de consulter un avocat marocain selon votre situation.`,
      confidence: 0.95
    },
    {
      question: 'Quels sont les droits de garde après le divorce?',
      domain: 'family',
      cached_answer: `Dans le contexte du droit marocain, notamment tel qu'établi par le Code de la famille, les droits de garde, ou "hadana", constituent une prérogative essentielle visant à assurer le bien-être de l'enfant après la dissolution du mariage. La priorité dans l'attribution de la garde est généralement donnée à la mère, en raison de sa proximité affective et de sa capacité à assurer la stabilité et l'éducation de l'enfant, jusqu'à un certain âge. Selon l'article 166 du Code de la famille, cette priorité est clairement établie, mais elle n'est pas absolue. La garde peut être remise en question si la mère se remarie, sauf décision contraire du juge qui pourrait considérer l'intérêt supérieur de l'enfant, notamment si la mère remarie ou si sa capacité à assurer la soin est compromise.

Le juge, en vertu de l'article 171, fixe la durée de la garde en fonction de l'âge de l'enfant, généralement jusqu'à l'âge de sept ans pour les garçons, et jusqu'à la puberté pour les filles, sauf si le tribunal estime qu'une extension est dans l'intérêt de l'enfant. Au-delà de ces limites, la garde peut être confiée au père ou à d'autres membres de la famille, en tenant compte de la proximité, de la stabilité et de la capacité à assurer l'éducation et la sécurité de l'enfant. La garde n'est pas une prérogative exclusive des parents, mais une prérogative qui doit toujours respecter l'intérêt supérieur de l'enfant, principe fondamental inscrit dans le Code de la famille.

Par ailleurs, le parent qui n'a pas la garde dispose d'un droit de visite et d'hébergement, dont le calendrier est fixé par le juge, conformément à l'article 175. Ce droit vise à maintenir le lien affectif entre l'enfant et le parent non gardien, tout en garantissant la stabilité de l'enfant. Le juge peut également ordonner des mesures pour assurer la sécurité et le bien-être de l'enfant, notamment en cas de conflit ou de situation particulière.

En conclusion, les droits de garde après un divorce sont encadrés par une approche centrée sur l'intérêt supérieur de l'enfant, avec une priorité donnée à la mère jusqu'à un certain âge, tout en laissant la possibilité au juge d'adapter ces dispositions selon les circonstances spécifiques de chaque cas. Il est important de souligner que ces dispositions doivent toujours respecter la législation en vigueur et les principes fondamentaux du droit marocain. Ces informations sont fournies à titre éducatif et ne constituent pas un conseil juridique complet ; il est recommandé de consulter un avocat marocain selon votre situation.`,
      confidence: 0.95
    }
  ],

  en: [
    {
      question: 'What is the legal age of marriage in Morocco?',
      domain: 'family',
      cached_answer: `The legal age of marriage in Morocco is 18 years old for both sexes, according to the Family Code.

Legal Reference:
- Law: Family Code (Moudawana)
- Number: 70.03
- Article: 9
- Date: 2004
- Confidence: Very High

Marriage below 18 can be authorized by a judge in case of legitimate interest with guardian consent.`,
      confidence: 0.98
    },
    {
      question: 'How do divorce procedures work in Morocco?',
      domain: 'family',
      cached_answer: `Divorce procedures in Morocco are conducted through the court and include:

1. Filing a divorce petition with the competent court
2. Attempt at reconciliation before the judge
3. Issuance of the divorce judgment

Types of divorce:
- Repudiation (husband divorces wife)
- Judicial divorce (wife's request)
- Khul (mutual agreement)

Legal Reference:
- Law: Family Code
- Number: 70.03
- Articles: 80-94
- Confidence: Very High`,
      confidence: 0.97
    },
    {
      question: 'What is the punishment for theft in Moroccan law?',
      domain: 'penal',
      cached_answer: `The punishment for simple theft in Morocco is imprisonment from one month to one year and a fine of 200 to 2000 dirhams.

Types of theft:
1. Simple theft: imprisonment 1 month to 1 year, fine 200-2000 DH
2. Theft from a dwelling: imprisonment 1 to 3 years, fine 500-10000 DH
3. Theft with violence: more severe penalties

Legal Reference:
- Law: Moroccan Penal Code
- Number: 1.59.413
- Articles: 467-475
- Date: November 26, 1992
- Confidence: Very High`,
      confidence: 0.99
    },
    {
      question: 'How is inheritance divided in Morocco?',
      domain: 'family',
      cached_answer: `Inheritance division in Morocco follows Islamic law and civil law:

Legal shares:
- Males inherit double the share of females
- Wife receives one-quarter or one-eighth depending on children
- Children receive the remainder equally

Conditions:
1. Death of the deceased
2. Alive at time of death
3. Absence of impediments to inheritance

Legal Reference:
- Law: Family Code and Civil Code
- Number: 70.03 and 1.57.223
- Articles: 327-445 of Family Code
- Confidence: High

For complex cases, consult a specialized lawyer.`,
      confidence: 0.96
    },
    {
      question: 'What are the conditions of a rental contract?',
      domain: 'contracts',
      cached_answer: `A rental contract (lease) in Morocco must contain:

The parties:
- Lessor (property owner)
- Lessee (occupant)

Essential elements:
1. Description of the property
2. Duration of lease (usually one year or more)
3. Amount of rent (monthly)
4. Condition of property and obligations of parties

Lessor's obligations:
- Deliver the property in good condition
- Guarantee peaceful enjoyment

Lessee's obligations:
- Pay rent on time
- Maintain the property

Legal Reference:
- Law: Civil Code
- Number: 1.57.223 and 67.12
- Articles: 614-722 of Civil Code
- Confidence: High`,
      confidence: 0.95
    },
    {
      question: 'What are the custody rights after divorce in Morocco?',
      domain: 'family',
      cached_answer: `Custody rights in Morocco after divorce are determined according to the child's best interest:

Who has custody rights:
1. Mother (usually, unless she remarries)
2. Father (if mother is unfit)
3. Other relatives (grandmother, aunt, etc.)

Duration of custody:
- For boys: until 12 years old
- For girls: until 15 years old (or marriage)
- Can continue after with child's consent

Rights of custodian:
- Housing
- Child support from other parent
- Full care

Rights of other parent:
- Right to visit
- Participation in major decisions

Legal Reference:
- Law: Family Code
- Number: 70.03
- Articles: 166-179
- Confidence: Very High`,
      confidence: 0.97
    }
  ]
};

function getSuggestedQuestion(language, questionText) {
  const questions = SUGGESTED_QUESTIONS[language] || [];
  const questionLower = questionText.toLowerCase().trim();
  
  for (const q of questions) {
    if (q.question.toLowerCase().trim() === questionLower) {
      return q;
    }
  }
  
  return null;
}

function getAllSuggestedQuestions(language) {
  return SUGGESTED_QUESTIONS[language] || [];
}

// ═══════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════

export {
  isGreeting,
  getGreetingResponse,
  getSuggestedQuestion,
  getAllSuggestedQuestions,
  GREETINGS,
  SUGGESTED_QUESTIONS
};
