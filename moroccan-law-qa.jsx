import React, { useState, useRef, useEffect } from "react";
import DarijaPhoneticMatcher from "./src/darijaPhoneticMatcher.js";

const BASE = import.meta.env.VITE_API_URL || "";
const API_URL = `${BASE}/api/moroccan-law-qa`;
const ANALYZE_URL = `${BASE}/api/analyze-document`;
const EXTRACT_URL = `${BASE}/api/extract-with-llm`;
const EXPLAIN_URL = `${BASE}/api/explain-concept`;
const TRANSCRIBE_URL = `${BASE}/api/transcribe`;
const RATE_URL = `${BASE}/api/rate`;

/* ─── Translations ─── */
const UI = {
  ar: {
    title: "عدالة",
    brand: "adalaapp",
    subtitle: "اطرح سؤالك القانوني واحصل على إجابة دقيقة مستندة إلى التشريع المغربي",
    placeholder: "اكتب سؤالك هنا...",
    send: "إرسال",
    thinking: "جاري التحليل...",
    disclaimer: "هذه المعلومات للتوعية القانونية العامة ولا تُغني عن استشارة محامٍ مختص.",
    govDisclaimer: "⚠️ هذا التطبيق أداة مساعدة للتوعية القانونية فقط، وليس له أي صلة بالحكومة المغربية أو أي جهة رسمية أو جهة قضائية. المعلومات المقدمة لا تُعدّ استشارة قانونية رسمية.",
    quickTitle: "اختر سؤالاً للبدء",
    domainsTitle: "التخصصات",
    chatTab: "محادثة",
    docTab: "تحليل الوثائق",
    learnTab: "تعلم القانون",
    learnTitle: "فهم المفاهيم القانونية",
    learnDesc: "اختر مفهوماً قانونياً واحصل على شرح مبسط ومفصّل بأمثلة مغربية",
    learnProfile: "ملفك الدراسي",
    learnLevelLabel: "مستوى الفهم",
    learnStyleLabel: "أسلوب الشرح",
    learnBgLabel: "خلفيتك",
    learnBtnLabel: "اشرح لي هذا المفهوم",
    learnCustomLabel: "أو اكتب مفهوماً آخر",
    learnCustomPlaceholder: "مثال: عقد الشركة، دعوى مدنية...",
    learnReset: "شرح مفهوم جديد",
    learnExplaining: "جاري إعداد الشرح...",
    learnLevels: { beginner: "مبتدئ", intermediate: "متوسط", advanced: "متقدم" },
    learnStyles: { simple: "بسيط جداً", detailed: "مع تفاصيل", technical: "تقني" },
    learnBgs: { nonlawyer: "غير متخصص", business: "صاحب عمل", student: "طالب", parent: "ولي أمر" },
    learnConceptsTitle: "مفاهيم شائعة",
    uploadTitle: "تحليل الوثائق القانونية",
    uploadDesc: "قم برفع وثيقة قانونية (PDF أو صورة) للحصول على تحليل قانوني مفصل",
    dropHint: "اسحب الملف هنا أو انقر للاختيار",
    supported: "PDF · JPG · PNG",
    extracting: "جاري استخراج النص...",
    analyzing: "جاري التحليل القانوني...",
    extractedTitle: "النص المستخرج",
    analysisTitle: "التحليل القانوني",
    reset: "تحليل وثيقة جديدة",
    ocrError: "فشل في استخراج النص من الصورة",
    pdfError: "فشل في قراءة ملف PDF",
    analyzeError: "فشل في التحليل",
    noText: "لم يتم استخراج أي نص من الوثيقة",
    copy: "نسخ",
    copied: "تم النسخ ✓",
    exportPdf: "تصدير PDF",
    clearChat: "مسح المحادثة",
    intelligenceTitle: "تحليل ذكي",
    docTypeLabel: "نوع الوثيقة",
    entitiesTitle: "الكيانات المستخرجة",
    risksTitle: "المخاطر القانونية",
    datesLabel: "التواريخ",
    amountsLabel: "المبالغ",
    articlesLabel: "المواد القانونية",
    partiesLabel: "الأطراف",
    noRisks: "لم يتم رصد مخاطر واضحة",
    caseNumberLabel: "رقم الملف",
    judgeLabel: "القاضي",
    defendantLabel: "المتهم",
    chargesLabel: "التهم",
    verdictLabel: "منطوق الحكم",
    docTypes: {
      marriage: "عقد الزواج", divorce: "وثيقة الطلاق", custody: "وثيقة الحضانة",
      will: "وصية", lease: "عقد الكراء", purchase: "عقد البيع",
      complaint: "شكوى / مذكرة", inheritance: "وثيقة الإرث", general: "وثيقة قانونية عامة",
      court_report: "محضر / حكم قضائي", criminal_case: "قضية جنائية / جنحة",
    },
    sentenceTab: "تقدير العقوبة",
    sentenceTitle: "مُقدِّر العقوبة الجنائية",
    sentenceDesc: "اختر نوع الجريمة والظروف للحصول على تقدير العقوبة المحتملة وفق القانون المغربي",
    sentenceCrimeLabel: "نوع الجريمة",
    sentenceAggLabel: "ظروف مشددة",
    sentenceMitLabel: "ظروف مخففة",
    sentenceBtn: "تقدير العقوبة",
    sentenceBaseRange: "النطاق الأساسي",
    sentenceAdjRange: "النطاق المعدَّل",
    sentenceArticles: "المواد القانونية",
    sentenceMultiplier: "معامل التعديل",
    sentencePrison: "السجن",
    sentenceFine: "الغرامة",
    sentenceReset: "تقدير جديد",
    sentenceCrimes: { sports_violence: "عنف الملاعب", theft: "سرقة بسيطة", aggravated_theft: "سرقة موصوفة", assault: "ضرب وجرح", assault_weapon: "اعتداء بأداة", rape: "اغتصاب / اعتداء جنسي", fraud: "نصب واحتيال", drug_possession: "حيازة مخدرات", drug_trafficking: "الاتجار بالمخدرات", trafficking: "الاتجار بالبشر", terrorism: "الإرهاب", bribery: "رشوة وفساد" },
    sentenceAggFactors: { weapon_use: "استخدام السلاح", gang: "عصابة / إجرام منظم", multiple_victims: "ضحايا متعددون", repeat_offender: "سوابق جنائية", premeditated: "تخطيط مسبق", leader_role: "دور قائد/محرض", vulnerable_victim: "الضحية قاصر أو ضعيف" },
    sentenceMitFactors: { first_offense: "لا سوابق", young_age: "سن صغير (أقل من 25)", cooperation: "تعاون مع الشرطة", remorse: "ندم حقيقي", restitution: "تعويض الضحية" },
    deadlineTab: "المواعيد القانونية",
    deadlineTitle: "حاسبة المواعيد القانونية",
    deadlineDesc: "أدخل تاريخ الحدث ونوع القضية لحساب جميع المواعيد القانونية اللاحقة",
    deadlineDateLabel: "تاريخ الحدث",
    deadlineCaseLabel: "نوع القضية",
    deadlineBtn: "احسب المواعيد",
    deadlineNext: "الموعد القادم",
    deadlineDaysLeft: "يوم متبق",
    deadlineUrgent: "عاجل",
    deadlinePassed: "مضى",
    deadlineReset: "حساب جديد",
    deadlineStatute: "المرجع القانوني",
    deadlineCases: { criminal_appeal: "استئناف جنائي", cassation: "طعن بالنقض", divorce: "طلاق", custody: "حضانة", inheritance: "تركة / إرث", civil_case: "دعوى مدنية", rental_dispute: "نزاع الكراء" },
    deadlineSteps: { fileAppeal: "تقديم طعن", hearing: "جلسة الاستئناف", decision: "صدور القرار", fileCassation: "تقديم طعن بالنقض", review: "مراجعة محكمة النقض", judgment: "صدور الحكم النهائي", summons: "استدعاء الطرف الآخر", reconciliation: "محاولة الإصلاح", register: "تسجيل لدى الحالة المدنية", deliberation: "مداولة القاضي", registerDeath: "تسجيل رسم الوفاة", fileClaim: "تقديم مطالبة الإرث", distribution: "توزيع التركة", notice: "إشعار الإخلاء", execute: "تنفيذ الحكم" },
    voiceListen: "انقر للتحدث",
    voiceStop: "إيقاف",
    voicePermissionDenied: "يجب السماح بالوصول إلى الميكروفون من إعدادات المتصفح",
    voiceNoSpeech: "لم يتم رصد أي كلام، جرب مرة أخرى",
    voiceNetwork: "خطأ في الشبكة — تأكد من اتصال الإنترنت",
    voiceAudioCapture: "تعذر الوصول إلى الميكروفون — تأكد أنه غير مستخدم من تطبيق آخر",
    voiceErrorMsg: "خطأ في التعرف على الصوت، جرب مرة أخرى",
    voiceTranscribing: "جاري تحويل الصوت...",
    voiceTapToStop: "انقر للتوقف",
    followUpTitle: "أسئلة متعلقة",
    bookmarkSave: "حفظ",
    bookmarkSaved: "محفوظ ✓",
    bookmarksTitle: "المحفوظات",
    bookmarksEmpty: "لا توجد إجابات محفوظة بعد",
    bookmarkRemove: "حذف",
    bookmarksClose: "إغلاق",
    ratingPrompt: "هل هذا الجواب مفيد؟",
    ratingThanks: "شكراً لتقييمك!",
    shareWhatsApp: "واتساب",
    shareCopy: "نسخ",
    shareCopied: "تم النسخ ✓",
    ttsRead: "استمع",
    ttsStop: "إيقاف",
    darkMode: "ليلي",
    lightMode: "نهاري",
    docAskTitle: "اسأل عن الوثيقة",
    docAskPlaceholder: "اسأل سؤالاً عن هذه الوثيقة...",
    docAskBtn: "سؤال",
    docAskClear: "إلغاء الوثيقة",
    docAskThinking: "جاري تحليل الوثيقة...",
    docAskResult: "إجابة السؤال",
  },
  fr: {
    title: "adalaapp",
    brand: "adalaapp",
    subtitle: "Posez votre question et obtenez une réponse précise basée sur la législation marocaine",
    placeholder: "Écrivez votre question...",
    send: "Envoyer",
    thinking: "Analyse en cours...",
    disclaimer: "Informations à titre éducatif uniquement — consultez un avocat pour un conseil personnalisé.",
    govDisclaimer: "⚠️ Cette application est un outil d'aide à la sensibilisation juridique uniquement. Elle n'a aucun lien avec le gouvernement marocain, aucune autorité officielle ou institution judiciaire. Les informations fournies ne constituent pas un avis juridique officiel.",
    quickTitle: "Commencez par une question",
    domainsTitle: "Spécialisations",
    chatTab: "Chat",
    docTab: "Analyse de Documents",
    learnTab: "Apprendre",
    learnTitle: "Comprendre les Concepts Juridiques",
    learnDesc: "Choisissez un concept et obtenez une explication simple avec des exemples marocains",
    learnProfile: "Votre profil",
    learnLevelLabel: "Niveau",
    learnStyleLabel: "Style",
    learnBgLabel: "Profil",
    learnBtnLabel: "Expliquez-moi ce concept",
    learnCustomLabel: "Ou tapez un concept",
    learnCustomPlaceholder: "Ex\u00a0: contrat de société, action civile...",
    learnReset: "Expliquer un autre concept",
    learnExplaining: "Préparation de l'explication...",
    learnLevels: { beginner: "Débutant", intermediate: "Intermédiaire", advanced: "Avancé" },
    learnStyles: { simple: "Très simple", detailed: "Avec détails", technical: "Technique" },
    learnBgs: { nonlawyer: "Non-spécialiste", business: "Chef d'entreprise", student: "Étudiant", parent: "Parent" },
    learnConceptsTitle: "Concepts populaires",
    uploadTitle: "Analyse de Documents Juridiques",
    uploadDesc: "Téléchargez un document juridique (PDF ou image) pour obtenir une analyse détaillée",
    dropHint: "Glissez le fichier ici ou cliquez pour choisir",
    supported: "PDF · JPG · PNG",
    extracting: "Extraction du texte...",
    analyzing: "Analyse juridique en cours...",
    extractedTitle: "Texte Extrait",
    analysisTitle: "Analyse Juridique",
    reset: "Analyser un nouveau document",
    ocrError: "Échec de l'extraction du texte de l'image",
    pdfError: "Échec de la lecture du PDF",
    analyzeError: "Échec de l'analyse",
    noText: "Aucun texte extrait du document",
    copy: "Copier",
    copied: "Copié ✓",
    exportPdf: "Exporter PDF",
    clearChat: "Effacer",
    intelligenceTitle: "Analyse Intelligente",
    docTypeLabel: "Type de document",
    entitiesTitle: "Entités extraites",
    risksTitle: "Risques juridiques",
    datesLabel: "Dates",
    amountsLabel: "Montants",
    articlesLabel: "Articles de loi",
    partiesLabel: "Parties",
    noRisks: "Aucun risque apparent détecté",
    caseNumberLabel: "N° de dossier",
    judgeLabel: "Juge",
    defendantLabel: "Prévenu",
    chargesLabel: "Chefs d'inculpation",
    verdictLabel: "Dispositif",
    docTypes: {
      marriage: "Contrat de mariage", divorce: "Acte de divorce", custody: "Acte de garde",
      will: "Testament", lease: "Contrat de bail", purchase: "Contrat de vente",
      complaint: "Plainte / Mémoire", inheritance: "Acte de succession", general: "Document juridique général",
      court_report: "Procès-verbal / Jugement", criminal_case: "Affaire pénale / Correctionnelle",
    },
    sentenceTab: "Estimation de peine",
    sentenceTitle: "Estimateur de Peine Pénale",
    sentenceDesc: "Choisissez le type d'infraction et les circonstances pour estimer la peine selon le droit marocain",
    sentenceCrimeLabel: "Type d'infraction",
    sentenceAggLabel: "Circonstances aggravantes",
    sentenceMitLabel: "Circonstances atténuantes",
    sentenceBtn: "Estimer la peine",
    sentenceBaseRange: "Fourchette de base",
    sentenceAdjRange: "Fourchette ajustée",
    sentenceArticles: "Articles de loi",
    sentenceMultiplier: "Coefficient d'ajustement",
    sentencePrison: "Prison",
    sentenceFine: "Amende",
    sentenceReset: "Nouvelle estimation",
    sentenceCrimes: { sports_violence: "Violence dans les stades", theft: "Vol simple", aggravated_theft: "Vol aggravé", assault: "Coups et blessures", assault_weapon: "Agression avec arme", rape: "Viol / Agression sexuelle", fraud: "Escroquerie", drug_possession: "Possession de stupéfiants", drug_trafficking: "Trafic de stupéfiants", trafficking: "Traite d'êtres humains", terrorism: "Terrorisme", bribery: "Corruption" },
    sentenceAggFactors: { weapon_use: "Utilisation d'une arme", gang: "Gang / Crime organisé", multiple_victims: "Victimes multiples", repeat_offender: "Récidive", premeditated: "Préméditation", leader_role: "Rôle de meneur", vulnerable_victim: "Victime vulnérable" },
    sentenceMitFactors: { first_offense: "Casier vierge", young_age: "Jeune âge (< 25 ans)", cooperation: "Coopération avec la police", remorse: "Remords sincère", restitution: "Dédommagement de la victime" },
    deadlineTab: "Délais légaux",
    deadlineTitle: "Calculateur de Délais Légaux",
    deadlineDesc: "Entrez la date de l'événement et le type d'affaire pour calculer tous les délais légaux",
    deadlineDateLabel: "Date de l'événement",
    deadlineCaseLabel: "Type d'affaire",
    deadlineBtn: "Calculer les délais",
    deadlineNext: "Prochain délai",
    deadlineDaysLeft: "jours restants",
    deadlineUrgent: "Urgent",
    deadlinePassed: "Dépassé",
    deadlineReset: "Nouveau calcul",
    deadlineStatute: "Référence légale",
    deadlineCases: { criminal_appeal: "Appel pénal", cassation: "Pourvoi en cassation", divorce: "Divorce", custody: "Garde d'enfant", inheritance: "Succession", civil_case: "Affaire civile", rental_dispute: "Litige locatif" },
    deadlineSteps: { fileAppeal: "Dépôt de l'appel", hearing: "Audience d'appel", decision: "Rendu de décision", fileCassation: "Dépôt du pourvoi", review: "Examen par la Cour", judgment: "Arrêt définitif", summons: "Convocation de l'autre partie", reconciliation: "Tentative de réconciliation", register: "Enregistrement à l'état civil", deliberation: "Délibération du juge", registerDeath: "Enregistrement du décès", fileClaim: "Demande de succession", distribution: "Partage de succession", notice: "Préavis d'expulsion", execute: "Exécution du jugement" },
    voiceListen: "Parlez maintenant",
    voiceStop: "Arrêter",
    voicePermissionDenied: "Autorisez l'accès au microphone dans les paramètres du navigateur",
    voiceNoSpeech: "Aucune parole détectée, réessayez",
    voiceNetwork: "Erreur réseau — vérifiez votre connexion Internet",
    voiceAudioCapture: "Microphone inaccessible — vérifiez qu'il n'est pas utilisé par une autre application",
    voiceErrorMsg: "Erreur de reconnaissance vocale, réessayez",
    voiceTranscribing: "Transcription en cours...",
    voiceTapToStop: "Cliquez pour arrêter",
    followUpTitle: "Questions connexes",
    bookmarkSave: "Sauv.",
    bookmarkSaved: "Sauvegardé ✓",
    bookmarksTitle: "Favoris",
    bookmarksEmpty: "Aucune réponse sauvegardée",
    bookmarkRemove: "Suppr.",
    bookmarksClose: "Fermer",
    ratingPrompt: "Cette réponse vous a-t-elle aidé ?",
    ratingThanks: "Merci pour votre avis !",
    shareWhatsApp: "WhatsApp",
    shareCopy: "Copier",
    shareCopied: "Copié ✓",
    ttsRead: "Écouter",
    ttsStop: "Stop",
    darkMode: "Sombre",
    lightMode: "Clair",
    docAskTitle: "Questions sur le document",
    docAskPlaceholder: "Posez une question sur ce document...",
    docAskBtn: "Demander",
    docAskClear: "Effacer le document",
    docAskThinking: "Analyse du document...",
    docAskResult: "Réponse",
  },
  en: {
    title: "adalaapp",
    brand: "adalaapp",
    subtitle: "Ask your question and get a precise answer grounded in Moroccan legislation",
    placeholder: "Write your question...",
    send: "Send",
    thinking: "Analyzing...",
    disclaimer: "For educational purposes only — consult a licensed attorney for case-specific advice.",
    govDisclaimer: "⚠️ This app is an independent legal awareness tool only. It has no affiliation with the Moroccan government, any official authority, or judicial institution. Nothing here constitutes official legal advice.",
    quickTitle: "Start with a question",
    domainsTitle: "Specializations",
    chatTab: "Chat",
    docTab: "Document Analysis",
    learnTab: "Learn Law",
    learnTitle: "Understand Legal Concepts",
    learnDesc: "Pick a concept and get a plain-language explanation with real Moroccan examples",
    learnProfile: "Your profile",
    learnLevelLabel: "Level",
    learnStyleLabel: "Style",
    learnBgLabel: "Background",
    learnBtnLabel: "Explain this concept to me",
    learnCustomLabel: "Or type a concept",
    learnCustomPlaceholder: "e.g. company contract, civil claim...",
    learnReset: "Explain another concept",
    learnExplaining: "Preparing explanation...",
    learnLevels: { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" },
    learnStyles: { simple: "Very simple", detailed: "Some detail", technical: "Technical" },
    learnBgs: { nonlawyer: "Non-lawyer", business: "Business owner", student: "Student", parent: "Parent" },
    learnConceptsTitle: "Popular concepts",
    uploadTitle: "Legal Document Analysis",
    uploadDesc: "Upload a legal document (PDF or image) to get a detailed legal analysis",
    dropHint: "Drag file here or click to choose",
    supported: "PDF · JPG · PNG",
    extracting: "Extracting text...",
    analyzing: "Running legal analysis...",
    extractedTitle: "Extracted Text",
    analysisTitle: "Legal Analysis",
    reset: "Analyze new document",
    ocrError: "Failed to extract text from image",
    pdfError: "Failed to read PDF file",
    analyzeError: "Analysis failed",
    noText: "No text was extracted from the document",
    copy: "Copy",
    copied: "Copied ✓",
    exportPdf: "Export PDF",
    clearChat: "Clear chat",
    intelligenceTitle: "Smart Analysis",
    docTypeLabel: "Document type",
    entitiesTitle: "Extracted entities",
    risksTitle: "Legal risks",
    datesLabel: "Dates",
    amountsLabel: "Amounts",
    articlesLabel: "Legal articles",
    partiesLabel: "Parties",
    noRisks: "No apparent risks detected",
    caseNumberLabel: "Case Number",
    judgeLabel: "Judge",
    defendantLabel: "Defendant",
    chargesLabel: "Charges",
    verdictLabel: "Verdict",
    docTypes: {
      marriage: "Marriage contract", divorce: "Divorce document", custody: "Custody document",
      will: "Will / Testament", lease: "Lease agreement", purchase: "Sale contract",
      complaint: "Complaint / Brief", inheritance: "Inheritance document", general: "General legal document",
      court_report: "Court Report / Judgment", criminal_case: "Criminal / Misdemeanor Case",
    },
    sentenceTab: "Sentence Estimator",
    sentenceTitle: "Criminal Sentence Estimator",
    sentenceDesc: "Select the offense type and circumstances to estimate the likely sentence under Moroccan law",
    sentenceCrimeLabel: "Offense type",
    sentenceAggLabel: "Aggravating factors",
    sentenceMitLabel: "Mitigating factors",
    sentenceBtn: "Estimate sentence",
    sentenceBaseRange: "Base range",
    sentenceAdjRange: "Adjusted range",
    sentenceArticles: "Legal articles",
    sentenceMultiplier: "Adjustment factor",
    sentencePrison: "Prison",
    sentenceFine: "Fine",
    sentenceReset: "New estimate",
    sentenceCrimes: { sports_violence: "Sports violence / Rioting", theft: "Simple theft", aggravated_theft: "Aggravated theft", assault: "Assault & Battery", assault_weapon: "Assault with weapon", rape: "Rape / Sexual assault", fraud: "Fraud / Swindling", drug_possession: "Drug possession", drug_trafficking: "Drug trafficking", trafficking: "Human trafficking", terrorism: "Terrorism", bribery: "Bribery / Corruption" },
    sentenceAggFactors: { weapon_use: "Weapon use", gang: "Gang / Organized crime", multiple_victims: "Multiple victims", repeat_offender: "Prior convictions", premeditated: "Premeditation", leader_role: "Leader / instigator role", vulnerable_victim: "Vulnerable victim (minor)" },
    sentenceMitFactors: { first_offense: "No prior record", young_age: "Young age (under 25)", cooperation: "Cooperated with police", remorse: "Genuine remorse", restitution: "Compensated victim" },
    deadlineTab: "Legal Deadlines",
    deadlineTitle: "Legal Deadline Calculator",
    deadlineDesc: "Enter the event date and case type to calculate all subsequent legal deadlines",
    deadlineDateLabel: "Event date",
    deadlineCaseLabel: "Case type",
    deadlineBtn: "Calculate deadlines",
    deadlineNext: "Next deadline",
    deadlineDaysLeft: "days remaining",
    deadlineUrgent: "Urgent",
    deadlinePassed: "Passed",
    deadlineReset: "New calculation",
    deadlineStatute: "Legal reference",
    deadlineCases: { criminal_appeal: "Criminal appeal", cassation: "Cassation appeal", divorce: "Divorce", custody: "Child custody", inheritance: "Inheritance / Estate", civil_case: "Civil case", rental_dispute: "Rental dispute" },
    deadlineSteps: { fileAppeal: "File appeal", hearing: "Appeal hearing", decision: "Decision issued", fileCassation: "File cassation", review: "Court review", judgment: "Final judgment", summons: "Summon other party", reconciliation: "Reconciliation attempt", register: "Register with civil status", deliberation: "Judge deliberation", registerDeath: "Register death certificate", fileClaim: "File inheritance claim", distribution: "Estate distribution", notice: "Eviction notice", execute: "Execute judgment" },
    voiceListen: "Click to speak",
    voiceStop: "Stop",
    voicePermissionDenied: "Allow microphone access in browser settings",
    voiceNoSpeech: "No speech detected, please try again",
    voiceNetwork: "Network error — check your internet connection",
    voiceAudioCapture: "Microphone unavailable — check it's not used by another app",
    voiceErrorMsg: "Speech recognition error, please try again",
    voiceTranscribing: "Transcribing audio...",
    voiceTapToStop: "Click to stop",
    followUpTitle: "Related questions",
    bookmarkSave: "Save",
    bookmarkSaved: "Saved ✓",
    bookmarksTitle: "Saved Answers",
    bookmarksEmpty: "No saved answers yet",
    bookmarkRemove: "Remove",
    bookmarksClose: "Close",
    ratingPrompt: "Was this helpful?",
    ratingThanks: "Thanks for your feedback!",
    shareWhatsApp: "WhatsApp",
    shareCopy: "Copy",
    shareCopied: "Copied ✓",
    ttsRead: "Listen",
    ttsStop: "Stop",
    darkMode: "Dark",
    lightMode: "Light",
    docAskTitle: "Ask about document",
    docAskPlaceholder: "Ask a question about this document...",
    docAskBtn: "Ask",
    docAskClear: "Clear document",
    docAskThinking: "Analyzing document...",
    docAskResult: "Answer",
  },
  dar: {
    title: "عدالة",
    brand: "adalaapp",
    subtitle: "سقسي سؤالك القانوني وتجيب جواب واضح من القانون المغربي",
    placeholder: "كتب سؤالك هنا...",
    send: "بعث",
    thinking: "راه كنشتغل...",
    disclaimer: "هاد المعلومات للتوعية القانونية فقط — خاصك تستشير محامي متخصص.",
    govDisclaimer: "⚠️ هاد التطبيق مجرد أداة للمساعدة في التوعية القانونية، وما عندوش أي علاقة بالحكومة المغربية ولا بأي جهة رسمية أو قضائية. المعلومات لي كتلقاو هنا ماشي استشارة قانونية رسمية.",
    quickTitle: "اختار سؤال تبدأ بيه",
    domainsTitle: "التخصصات",
    chatTab: "المحادثة",
    docTab: "تحليل الوثائق",
    learnTab: "تعلم القانون",
    learnTitle: "فهم المفاهيم القانونية",
    learnDesc: "اختار مفهوم قانوني وتجيب شرح مبسط بأمثلة مغربية",
    learnProfile: "ملفك",
    learnLevelLabel: "مستوى الفهم",
    learnStyleLabel: "أسلوب الشرح",
    learnBgLabel: "خلفيتك",
    learnBtnLabel: "شرح ليا هاد المفهوم",
    learnCustomLabel: "أو كتب مفهوم آخر",
    learnCustomPlaceholder: "مثال: عقد الشركة، دعوى مدنية...",
    learnReset: "شرح مفهوم جديد",
    learnExplaining: "راه كنهيئ الشرح...",
    learnLevels: { beginner: "مبتدئ", intermediate: "متوسط", advanced: "متقدم" },
    learnStyles: { simple: "بسيط بزاف", detailed: "مع التفاصيل", technical: "تقني" },
    learnBgs: { nonlawyer: "ماشي متخصص", business: "صاحب خدمة", student: "طالب", parent: "ولي أمر" },
    learnConceptsTitle: "مفاهيم مشهورة",
    uploadTitle: "تحليل الوثائق القانونية",
    uploadDesc: "رفع وثيقة قانونية (PDF أو صورة) وتجيب تحليل قانوني",
    dropHint: "جر الملف هنا أو نقر للاختيار",
    supported: "PDF · JPG · PNG",
    extracting: "راه كنستخرج النص...",
    analyzing: "راه كنحلل قانونياً...",
    extractedTitle: "النص المستخرج",
    analysisTitle: "التحليل القانوني",
    reset: "تحليل وثيقة جديدة",
    ocrError: "ما قدرش يستخرج النص من الصورة",
    pdfError: "ما قدرش يقرأ ملف PDF",
    analyzeError: "التحليل ما خدمش",
    noText: "ما استخرجش أي نص من الوثيقة",
    copy: "نسخ",
    copied: "نسخ تمام ✓",
    exportPdf: "تصدير PDF",
    clearChat: "مسح المحادثة",
    intelligenceTitle: "تحليل ذكي",
    docTypeLabel: "نوع الوثيقة",
    entitiesTitle: "العناصر المستخرجة",
    risksTitle: "المخاطر القانونية",
    datesLabel: "التواريخ",
    amountsLabel: "المبالغ",
    articlesLabel: "المواد القانونية",
    partiesLabel: "الأطراف",
    noRisks: "ما رصدناش مخاطر واضحة",
    caseNumberLabel: "رقم الملف",
    judgeLabel: "القاضي",
    defendantLabel: "المتهم",
    chargesLabel: "التهم",
    verdictLabel: "منطوق الحكم",
    docTypes: {
      marriage: "عقد الزواج", divorce: "وثيقة الطلاق", custody: "وثيقة الحضانة",
      will: "الوصية", lease: "عقد الكراء", purchase: "عقد البيع",
      complaint: "شكوى / مذكرة", inheritance: "وثيقة الإرث", general: "وثيقة قانونية عامة",
      court_report: "محضر / حكم", criminal_case: "قضية جنحة / جناية",
    },
    sentenceTab: "تقدير العقوبة",
    sentenceTitle: "المقدِّر ديال العقوبة",
    sentenceDesc: "اختار نوع الجريمة والظروف وتجيب تقدير العقوبة حسب القانون المغربي",
    sentenceCrimeLabel: "نوع الجريمة",
    sentenceAggLabel: "الظروف المشددة",
    sentenceMitLabel: "الظروف المخففة",
    sentenceBtn: "قدر العقوبة",
    sentenceBaseRange: "النطاق الأساسي",
    sentenceAdjRange: "النطاق المعدَّل",
    sentenceArticles: "المواد القانونية",
    sentenceMultiplier: "معامل التعديل",
    sentencePrison: "السجن",
    sentenceFine: "التغريمة",
    sentenceReset: "تقدير جديد",
    sentenceCrimes: { sports_violence: "الشغب ديال الملاعب", theft: "سرقة بسيطة", aggravated_theft: "سرقة موصوفة", assault: "الضرب والجرح", assault_weapon: "اعتداء بسلاح", rape: "اغتصاب / اعتداء جنسي", fraud: "النصب والاحتيال", drug_possession: "حيازة المخدرات", drug_trafficking: "بيع المخدرات", trafficking: "الاتجار بالبشر", terrorism: "الإرهاب", bribery: "الرشوة والفساد" },
    sentenceAggFactors: { weapon_use: "استعمال سلاح", gang: "عصابة / تنظيم إجرامي", multiple_victims: "ضحايا متعددين", repeat_offender: "سوابق جنائية", premeditated: "تخطيط مسبق", leader_role: "دور القائد / المحرض", vulnerable_victim: "الضحية قاصر أو ضعيف" },
    sentenceMitFactors: { first_offense: "بلا سوابق", young_age: "السن صغير (أقل من 25)", cooperation: "تعاون مع البوليس", remorse: "ندم حقيقي", restitution: "تعويض الضحية" },
    deadlineTab: "المواعيد القانونية",
    deadlineTitle: "حاسبة المواعيد القانونية",
    deadlineDesc: "دخل تاريخ الحدث ونوع القضية وتجيب جميع المواعيد القانونية",
    deadlineDateLabel: "تاريخ الحدث",
    deadlineCaseLabel: "نوع القضية",
    deadlineBtn: "احسب المواعيد",
    deadlineNext: "الموعد الجاي",
    deadlineDaysLeft: "يوم باقي",
    deadlineUrgent: "عاجل",
    deadlinePassed: "فات وقتو",
    deadlineReset: "حساب جديد",
    deadlineStatute: "المرجع القانوني",
    deadlineCases: { criminal_appeal: "استئناف جنائي", cassation: "طعن بالنقض", divorce: "الطلاق", custody: "الحضانة", inheritance: "التركة / الإرث", civil_case: "دعوى مدنية", rental_dispute: "نزاع الكراء" },
    deadlineSteps: { fileAppeal: "تقديم الطعن", hearing: "جلسة الاستئناف", decision: "صدور القرار", fileCassation: "تقديم طعن بالنقض", review: "مراجعة محكمة النقض", judgment: "الحكم النهائي", summons: "استدعاء الطرف الآخر", reconciliation: "محاولة الإصلاح", register: "تسجيل الحالة المدنية", deliberation: "مداولة القاضي", registerDeath: "تسجيل شهادة الوفاة", fileClaim: "تقديم مطالبة الإرث", distribution: "توزيع التركة", notice: "إشعار الإخلاء", execute: "تنفيذ الحكم" },
    voiceListen: "نقر باش تتكلم",
    voiceStop: "قف",
    voicePermissionDenied: "خاصك تسمح للمتصفح يوصل للميكروفون",
    voiceNoSpeech: "ما سمعناش أي كلام، جرب مرة أخرى",
    voiceNetwork: "مشكلة في النيت — تحقق من الاتصال",
    voiceAudioCapture: "ما قدرش يوصل للميكروفون — تحقق أنه ماشي مستعمل",
    voiceErrorMsg: "مشكلة في التعرف على الصوت، جرب مرة أخرى",
    voiceTranscribing: "راه كيترجم الصوت...",
    voiceTapToStop: "نقر باش تقف",
    followUpTitle: "أسئلة مرتبطة",
    bookmarkSave: "حفظ",
    bookmarkSaved: "محفوظ ✓",
    bookmarksTitle: "المحفوظات",
    bookmarksEmpty: "ما كاين شي محفوظ بعد",
    bookmarkRemove: "مسح",
    bookmarksClose: "غلق",
    ratingPrompt: "واش هاد الجواب مفيد؟",
    ratingThanks: "شكراً على التقييم!",
    shareWhatsApp: "واتساب",
    shareCopy: "نسخ",
    shareCopied: "نسخت ✓",
    ttsRead: "تسمع",
    ttsStop: "وقف",
    darkMode: "ليلي",
    lightMode: "نهاري",
    docAskTitle: "سقسي على الوثيقة",
    docAskPlaceholder: "سقسي سؤال على هاد الوثيقة...",
    docAskBtn: "سؤال",
    docAskClear: "إلغاء الوثيقة",
    docAskThinking: "راه كيحلل الوثيقة...",
    docAskResult: "الجواب",
  },
};

const quickQuestions = {
  ar: [
    "ما هو السن القانوني للزواج في المغرب؟",
    "كيف تتم إجراءات الطلاق؟",
    "ما هي عقوبة السرقة في القانون المغربي؟",
    "كيف يتم تقسيم الإرث؟",
    "ما هي شروط عقد الكراء؟",
    "ما هي حقوق الحضانة بعد الطلاق؟",
  ],
  fr: [
    "Quel est l'âge légal du mariage au Maroc ?",
    "Comment se déroule la procédure de divorce ?",
    "Quelle est la peine pour le vol ?",
    "Comment se fait le partage de l'héritage ?",
    "Quelles sont les conditions du bail ?",
    "Quels sont les droits de garde après divorce ?",
  ],
  en: [
    "What is the legal marriage age in Morocco?",
    "How does the divorce procedure work?",
    "What is the penalty for theft?",
    "How is inheritance divided?",
    "What are the conditions for a lease?",
    "What are custody rights after divorce?",
  ],
  dar: [
    "شنو السن القانوني للزواج فالمغرب؟",
    "كيفاش كتمشي إجراءات الطلاق؟",
    "شنو عقوبة السرقة فالقانون المغربي؟",
    "كيفاش كيتقسم الإرث؟",
    "شنو شروط عقد الكراء؟",
    "شنو حقوق الحضانة بعد الطلاق؟",
  ],
};

const legalDomains = {
  ar: [
    { title: "مدونة الأسرة", desc: "الزواج · الطلاق · الحضانة · الإرث" },
    { title: "القانون الجنائي", desc: "الجرائم · العقوبات · الإجراءات" },
    { title: "المسطرة الجنائية", desc: "التحقيق · المحاكمة · الطعون" },
    { title: "الالتزامات والعقود", desc: "العقود · الكراء · التعويضات" },
  ],
  fr: [
    { title: "Code de la Famille", desc: "Mariage · Divorce · Garde · Héritage" },
    { title: "Code Pénal", desc: "Infractions · Peines · Procédures" },
    { title: "Procédure Pénale", desc: "Enquête · Procès · Recours" },
    { title: "Obligations & Contrats", desc: "Contrats · Bail · Dommages" },
  ],
  en: [
    { title: "Family Code", desc: "Marriage · Divorce · Custody · Inheritance" },
    { title: "Penal Code", desc: "Offenses · Penalties · Procedures" },
    { title: "Criminal Procedure", desc: "Investigation · Trial · Appeals" },
    { title: "Obligations & Contracts", desc: "Contracts · Leases · Damages" },
  ],
  dar: [
    { title: "مدونة الأسرة", desc: "الزواج · الطلاق · الحضانة · الإرث" },
    { title: "القانون الجنائي", desc: "الجرائم · العقوبات · الإجراءات" },
    { title: "المسطرة الجنائية", desc: "التحقيق · المحاكمة · الطعون" },
    { title: "الالتزامات والعقود", desc: "العقود · الكراء · التعويضات" },
  ],
};

/* ─── Legal Concepts Catalogue ─── */
const learnConcepts = {
  ar: [
    { id: "limitation",          label: "التقادم",                sub: "م. 50 م.ج — 10 سنوات (جناية) · 3 سنوات (جنحة)" },
    { id: "custody",             label: "الحضانة",                sub: "م. 163–171 مدونة الأسرة — الأم أولاً" },
    { id: "mahr",                label: "الصداق / المهر",         sub: "م. 26–29 مدونة الأسرة — حق خالص للزوجة" },
    { id: "alimony",             label: "النفقة",                 sub: "م. 168–190 مدونة الأسرة — تشمل السكن والتعليم" },
    { id: "inheritance",         label: "الإرث والتركة",          sub: "م. 276–332 مدونة الأسرة — أحكام مالكية" },
    { id: "lease",               label: "عقد الكراء",             sub: "م. 505 ق.م · ق. 67-12 للسكن — حماية المكتري" },
    { id: "presumption",         label: "قرينة البراءة",          sub: "م. 87 الدستور — أساس التقاضي الجنائي" },
    { id: "divorce",             label: "الطلاق والتطليق",        sub: "م. 77–94 مدونة الأسرة — 3 أنواع" },
    { id: "force_majeure",       label: "القوة القاهرة",          sub: "م. 264 ق.ع — إعفاء من المسؤولية التعاقدية" },
    { id: "sports_violence",     label: "العنف في الملاعب",       sub: "م. 306-1 إلى 306-4 ق.ج — سجن + غرامة" },
    { id: "power_of_attorney",   label: "الوكالة القانونية",      sub: "م. 879+ ق.ع — التفويض بالتصرف القانوني" },
    { id: "garde_a_vue",         label: "التوقيف للنظر",          sub: "م. 114–115 م.ج — 24 ساعة قابلة للتمديد" },
  ],
  fr: [
    { id: "limitation",          label: "Prescription",           sub: "Art. 50 CPP — 10 ans (crime) · 3 ans (délit)" },
    { id: "custody",             label: "Garde d'enfants",        sub: "Art. 163–171 Moudawana — mère en priorité" },
    { id: "mahr",                label: "Douaire (Sadaq)",        sub: "Art. 26–29 Moudawana — droit exclusif de la femme" },
    { id: "alimony",             label: "Pension alimentaire",    sub: "Art. 168–190 Moudawana — logement + scolarité inclus" },
    { id: "inheritance",         label: "Succession / Héritage",  sub: "Art. 276–332 Moudawana — règles malikites" },
    { id: "lease",               label: "Contrat de bail",        sub: "Art. 505 C.Civ · Loi 67-12 — protection locataire" },
    { id: "presumption",         label: "Présomption d'innocence",sub: "Art. 87 Constitution — fondement pénal" },
    { id: "divorce",             label: "Divorce / Répudiation",  sub: "Art. 77–94 Moudawana — 3 formes juridiques" },
    { id: "force_majeure",       label: "Force majeure",          sub: "Art. 264 DOC — exonération contractuelle" },
    { id: "sports_violence",     label: "Violence dans les stades",sub: "Art. 306-1 à 306-4 CP — prison + amende" },
    { id: "power_of_attorney",   label: "Procuration",            sub: "Art. 879+ DOC — délégation d'actes juridiques" },
    { id: "garde_a_vue",         label: "Garde à vue",            sub: "Art. 114–115 CPP — 24h renouvelables" },
  ],
  en: [
    { id: "limitation",          label: "Statute of Limitations", sub: "Art. 50 CCP — 10 yrs (felony) · 3 yrs (misdemeanor)" },
    { id: "custody",             label: "Child Custody",          sub: "Arts. 163–171 Moudawana — mother has priority" },
    { id: "mahr",                label: "Dower / Mahr",           sub: "Arts. 26–29 Moudawana — wife's exclusive right" },
    { id: "alimony",             label: "Alimony / Nafaqa",       sub: "Arts. 168–190 Moudawana — includes housing & education" },
    { id: "inheritance",         label: "Inheritance & Estate",   sub: "Arts. 276–332 Moudawana — Maliki Islamic shares" },
    { id: "lease",               label: "Lease / Rental Contract",sub: "Art. 505 C.Civ · Law 67-12 — tenant protections" },
    { id: "presumption",         label: "Presumption of Innocence",sub: "Art. 87 Constitution — foundation of criminal justice" },
    { id: "divorce",             label: "Divorce & Repudiation",  sub: "Arts. 77–94 Moudawana — 3 legal forms" },
    { id: "force_majeure",       label: "Force Majeure",          sub: "Art. 264 DOC — exemption from contractual liability" },
    { id: "sports_violence",     label: "Sports Violence / Rioting",sub: "Arts. 306-1 to 306-4 Penal Code — prison + fine" },
    { id: "power_of_attorney",   label: "Power of Attorney",      sub: "Art. 879+ DOC — delegating legal authority" },
    { id: "garde_a_vue",         label: "Police Custody / Detention",sub: "Arts. 114–115 CCP — 24h, renewable up to 96h" },
  ],
  dar: [
    { id: "limitation",          label: "التقادم",                sub: "م. 50 م.ج — 10 سنين (جناية) · 3 سنين (جنحة)" },
    { id: "custody",             label: "الحضانة",                sub: "م. 163–171 مدونة الأسرة — الأم أولاً" },
    { id: "mahr",                label: "الصداق / المهر",         sub: "م. 26–29 مدونة الأسرة — حق المرأة وحدها" },
    { id: "alimony",             label: "النفقة",                 sub: "م. 168–190 مدونة الأسرة — كتشمل السكن والتعليم" },
    { id: "inheritance",         label: "الإرث والتركة",          sub: "م. 276–332 مدونة الأسرة — أحكام مالكية" },
    { id: "lease",               label: "عقد الكراء",             sub: "م. 505 ق.م · ق. 67-12 — حماية المكتري" },
    { id: "presumption",         label: "قرينة البراءة",          sub: "م. 87 الدستور — أساس التقاضي الجنائي" },
    { id: "divorce",             label: "الطلاق والتطليق",        sub: "م. 77–94 مدونة الأسرة — 3 أنواع" },
    { id: "force_majeure",       label: "القوة القاهرة",          sub: "م. 264 ق.ع — إعفاء من المسؤولية التعاقدية" },
    { id: "sports_violence",     label: "الشغب ديال الملاعب",     sub: "م. 306-1 إلى 306-4 ق.ج — سجن وغرامة" },
    { id: "power_of_attorney",   label: "الوكالة القانونية",      sub: "م. 879+ ق.ع — التفويض بالتصرف القانوني" },
    { id: "garde_a_vue",         label: "التوقيف للنظر",          sub: "م. 114–115 م.ج — 24 ساعة قابلة للتمديد" },
  ],
};

/* ─── CSS keyframes ─── */
const styleId = "mlq-styles";
if (typeof document !== "undefined" && !document.getElementById(styleId)) {
  const s = document.createElement("style");
  s.id = styleId;
  s.textContent = `
    :root {
      --p-bg:#1a1510; --p-bgCard:#231e17; --p-bgInput:#2a241c; --p-bgHover:#2f2820;
      --p-gold:#c8a45e; --p-goldMuted:#a08346; --p-goldLight:#e0c97a;
      --p-text:#e8e0d4; --p-textMid:#b5a999; --p-textDim:#8a7e72;
      --p-border:#35302a; --p-borderLight:#4a4238;
      --sp-1:4px; --sp-2:8px; --sp-3:12px; --sp-4:16px; --sp-5:20px;
      --sp-6:24px; --sp-8:32px; --sp-12:48px;
      --easing:cubic-bezier(0.4,0,0.2,1); --spring:cubic-bezier(0.22,1,0.36,1);
    }
    @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
    @keyframes slideInUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    @keyframes msgIn { from{opacity:0;transform:translateY(10px) scale(0.98)} to{opacity:1;transform:translateY(0) scale(1)} }
    @keyframes dots { 0%,80%,100%{opacity:.3} 40%{opacity:1} }
    @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
    @keyframes pulseGold { 0%,100%{box-shadow:0 0 0 0 #c8a45e00} 50%{box-shadow:0 0 0 4px #c8a45e20} }
    @keyframes scaleIn { from{opacity:0;transform:scale(0.94)} to{opacity:1;transform:scale(1)} }
    @media(prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;transition-duration:.01ms!important}}
    ::placeholder{color:#8a7e72!important;opacity:1!important}
    input::-webkit-input-placeholder{color:#8a7e72!important}
    input::-moz-placeholder{color:#8a7e72!important}
    *::-webkit-scrollbar{width:5px}
    *::-webkit-scrollbar-track{background:transparent}
    *::-webkit-scrollbar-thumb{background:#3d352c;border-radius:8px}
    *::-webkit-scrollbar-thumb:hover{background:#5a4f43}
    .msg-action-btn{transition:background 150ms,color 150ms,border-color 150ms}
    .msg-action-btn:hover{color:#c8a45e!important;border-color:#c8a45e50!important}
    .hide-scrollbar::-webkit-scrollbar{display:none}
    .hide-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
    .tab-panel{animation:slideInUp 240ms var(--spring) both}
    .btn-press{transition:transform 120ms var(--easing),background 200ms var(--easing),color 200ms var(--easing),box-shadow 200ms var(--easing)}
    .btn-press:active{transform:scale(0.96)!important}
    .btn-primary{transition:all 250ms var(--easing)}
    .btn-primary:active{transform:scale(0.97)}
    .btn-primary:hover:not(:disabled){box-shadow:0 0 0 2px #c8a45e25,0 2px 12px #c8a45e18}
    .card{transition:box-shadow 200ms var(--easing),border-color 200ms var(--easing),background 200ms var(--easing)}
    .card:hover{box-shadow:0 6px 28px #0008,0 1px 4px #c8a45e10!important}
    .skeleton-line{
      background:linear-gradient(90deg,#2a241c 25%,#35302a 50%,#2a241c 75%);
      background-size:200% 100%;
      animation:shimmer 1.4s ease infinite;
      border-radius:5px;
    }
    .msg-bubble{transition:border-color 200ms var(--easing),box-shadow 200ms var(--easing)}
    .msg-bubble:hover{box-shadow:0 2px 16px #0005}
    .input-field{transition:border-color 200ms var(--easing),box-shadow 200ms var(--easing)}
    .input-field:focus{border-color:#a08346!important;box-shadow:0 0 0 3px #c8a45e14,inset 0 1px 0 #c8a45e08!important}
    /* ── Light mode overrides ── */
    :root[data-theme="light"] {
      --p-bg:#f7f3ee; --p-bgCard:#ffffff; --p-bgInput:#ede8e0; --p-bgHover:#e4dfd6;
      --p-text:#1a1510; --p-textMid:#4a4238; --p-textDim:#6b5e52;
      --p-border:#d5cdc2; --p-borderLight:#c8bfb5;
    }
    :root[data-theme="light"] .skeleton-line{
      background:linear-gradient(90deg,#ede8e0 25%,#d5cdc2 50%,#ede8e0 75%);
      background-size:200% 100%;
    }
    /* ── Bookmarks drawer ── */
    .bm-drawer{position:fixed;top:0;right:0;width:340px;max-width:92vw;height:100%;z-index:1200;
      background:var(--p-bgCard);border-left:1px solid var(--p-border);
      display:flex;flex-direction:column;transform:translateX(100%);
      transition:transform 280ms cubic-bezier(0.22,1,0.36,1);}
    .bm-drawer.open{transform:translateX(0);}
    .bm-overlay{position:fixed;inset:0;z-index:1199;background:#0007;
      opacity:0;pointer-events:none;transition:opacity 280ms;}
    .bm-overlay.open{opacity:1;pointer-events:all;}
  `;
  document.head.appendChild(s);
}

/* ─── Design tokens ─── */
const DARK_P = {
  bg: "#1a1510",
  bgCard: "#231e17",
  bgInput: "#2a241c",
  bgHover: "#2f2820",
  gold: "#c8a45e",
  goldMuted: "#a08346",
  goldLight: "#e0c97a",
  text: "#e8e0d4",
  textMid: "#b5a999",
  textDim: "#8a7e72",
  border: "#35302a",
  borderLight: "#4a4238",
  userBubble: "#2c2518",
  aiBubble: "#211c15",
};
const LIGHT_P = {
  bg: "#f7f3ee",
  bgCard: "#ffffff",
  bgInput: "#ede8e0",
  bgHover: "#e4dfd6",
  gold: "#9a6f2e",
  goldMuted: "#7a5520",
  goldLight: "#b88a3a",
  text: "#1a1510",
  textMid: "#4a4238",
  textDim: "#6b5e52",
  border: "#d5cdc2",
  borderLight: "#c8bfb5",
  userBubble: "#f0ebe0",
  aiBubble: "#fdfaf6",
};
const E = "cubic-bezier(0.4,0,0.2,1)";
const F = '"Josefin Sans",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';
const FA = '"Cairo",-apple-system,BlinkMacSystemFont,sans-serif';



export default function MoroccanLawQA() {
  const [language, setLanguage] = useState("ar");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("chat"); // "chat" | "doc" | "learn"
  const [docState, setDocState] = useState("idle"); // "idle" | "extracting" | "analyzing" | "done"
  const [extractedText, setExtractedText] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [fileName, setFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [docIntelligence, setDocIntelligence] = useState(null);
  // Learn mode state
  const [learnConcept, setLearnConcept] = useState("");    // selected concept id or custom text
  const [learnCustom, setLearnCustom] = useState("");       // free-text input
  const [learnLevel, setLearnLevel] = useState("beginner");
  const [learnStyle, setLearnStyle] = useState("simple");
  const [learnBg, setLearnBg] = useState("nonlawyer");
  const [learnResult, setLearnResult] = useState("");
  const [learnLoading, setLearnLoading] = useState(false);
  // Voice input
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscribing, setVoiceTranscribing] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  // Darija NLP
  const darijaMatcherRef = useRef(null);
  const darijaRecogRef = useRef(null);
  const darijaStandardRef = useRef("");
  const darijaIntentRef = useRef("");
  useEffect(() => { darijaMatcherRef.current = new DarijaPhoneticMatcher(); }, []);
  // Follow-up suggestions
  const [followUps, setFollowUps] = useState([]);
  // Sentence estimator
  const [sentenceCrime, setSentenceCrime] = useState("");
  const [sentenceAgg, setSentenceAgg] = useState([]);
  const [sentenceMit, setSentenceMit] = useState([]);
  const [sentenceResult, setSentenceResult] = useState(null);
  // Deadline calculator
  const [deadlineDate, setDeadlineDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [deadlineCaseType, setDeadlineCaseType] = useState("");
  const [deadlineResult, setDeadlineResult] = useState(null);
  const endRef = useRef(null);
  const fileRef = useRef(null);

  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 640 : false);
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  // ── New feature state ──
  const [theme, setTheme] = useState(() => localStorage.getItem("adala_theme") || "dark");
  const [bookmarks, setBookmarks] = useState(() => {
    try { return JSON.parse(localStorage.getItem("adala_bookmarks") || "[]"); } catch { return []; }
  });
  const [ratings, setRatings] = useState({});
  const [speakingId, setSpeakingId] = useState(null);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [docChatInput, setDocChatInput] = useState("");
  const [docChatLoading, setDocChatLoading] = useState(false);
  const [docChatMessages, setDocChatMessages] = useState([]);
  const [copiedShareId, setCopiedShareId] = useState(null);

  const rtl = language === "ar" || language === "dar";
  const t = UI[language];
  const ff = rtl ? FA : F;

  // Safe fetch helper — always returns parsed JSON; throws with readable message on non-JSON responses
  async function safeJson(res) {
    const text = await res.text();
    try { return JSON.parse(text); }
    catch { throw new Error(text.slice(0, 200) || `HTTP ${res.status}`); }
  }

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const saved = localStorage.getItem("mlq_chat");
    if (saved) { try { setMessages(JSON.parse(saved)); } catch {} }
  }, []);

  useEffect(() => {
    localStorage.setItem("mlq_chat", JSON.stringify(messages));
  }, [messages]);

  // ── Theme ──
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("adala_theme", theme);
  }, [theme]);

  function toggleTheme() { setTheme(t => t === "dark" ? "light" : "dark"); }
  const P = theme === "dark" ? DARK_P : LIGHT_P;

  // ── Bookmarks ──
  function saveBookmark(msgIdx) {
    const answer = messages[msgIdx];
    const question = messages[msgIdx - 1];
    if (!answer) return;
    const entry = { id: Date.now(), answer: answer.content, question: question?.content || "", lang: language };
    const next = [entry, ...bookmarks].slice(0, 50);
    setBookmarks(next);
    localStorage.setItem("adala_bookmarks", JSON.stringify(next));
  }
  function removeBookmark(id) {
    const next = bookmarks.filter(b => b.id !== id);
    setBookmarks(next);
    localStorage.setItem("adala_bookmarks", JSON.stringify(next));
  }
  function isBookmarked(msgIdx) {
    const answer = messages[msgIdx];
    if (!answer) return false;
    return bookmarks.some(b => b.answer === answer.content);
  }

  // ── Ratings ──
  async function handleRate(msgIdx, rating) {
    if (ratings[msgIdx]) return;
    setRatings(r => ({ ...r, [msgIdx]: rating }));
    const question = messages[msgIdx - 1]?.content || "";
    const answer = messages[msgIdx]?.content || "";
    try {
      await fetch(RATE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, question, answer: answer.slice(0, 500), language }),
      });
    } catch {}
  }

  // ── TTS ──
  function speakText(text, id) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    if (speakingId === id) { setSpeakingId(null); return; }

    const doSpeak = (voices) => {
      const utt = new SpeechSynthesisUtterance(text);
      if (language === "fr") {
        const v = voices.find(x => x.lang === "fr-FR")
          || voices.find(x => x.lang === "fr-CA")
          || voices.find(x => x.lang.startsWith("fr")) || null;
        if (v) { utt.voice = v; utt.lang = v.lang; } else { utt.lang = "fr-FR"; }
      } else if (language === "en") {
        const v = voices.find(x => x.lang === "en-US")
          || voices.find(x => x.lang.startsWith("en")) || null;
        if (v) { utt.voice = v; utt.lang = v.lang; } else { utt.lang = "en-US"; }
      } else {
        // Arabic / Darija — try all available Arabic locales
        const v = voices.find(x => x.lang === "ar-MA")
          || voices.find(x => x.lang === "ar-SA")
          || voices.find(x => x.lang === "ar-EG")
          || voices.find(x => x.lang === "ar-DZ")
          || voices.find(x => x.lang.startsWith("ar")) || null;
        if (v) { utt.voice = v; utt.lang = v.lang; } else { utt.lang = "ar-SA"; }
      }
      utt.rate = 0.95;
      utt.onend = () => setSpeakingId(null);
      utt.onerror = () => setSpeakingId(null);
      setSpeakingId(id);
      window.speechSynthesis.speak(utt);
    };

    // getVoices() is async on first call — wait for voiceschanged if list is empty
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      doSpeak(voices);
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null;
        doSpeak(window.speechSynthesis.getVoices());
      };
    }
  }

  // ── Share ──
  function shareWhatsApp(question, answer) {
    const text = encodeURIComponent(`سؤال: ${question}\n\nالجواب: ${answer.slice(0, 300)}...\n\n— adalaapp`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  }
  function copyShare(text, id) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedShareId(id);
      setTimeout(() => setCopiedShareId(null), 2000);
    }).catch(() => {});
  }

  // ── Doc Q&A ──
  async function sendDocQuestion(question) {
    if (!question.trim() || docChatLoading) return;
    const q = question.trim();
    setDocChatInput("");
    setDocChatMessages(prev => [...prev, { role: "user", content: q }]);
    setDocChatLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: q }],
          language,
          documentText: extractedText,
        }),
      });
      const d = await safeJson(res);
      const answer = d.content || d.answer || d.choices?.[0]?.message?.content || "";
      setDocChatMessages(prev => [...prev, { role: "assistant", content: answer }]);
    } catch (e) {
      setDocChatMessages(prev => [...prev, { role: "assistant", content: `Error: ${e.message}` }]);
    } finally {
      setDocChatLoading(false);
    }
  }

  async function send(text) {
    const c = (text || input).trim();
    if (!c || loading) return;
    setFollowUps([]);
    setInput("");
    const userMsg = { role: "user", content: c };
    const next = [...messages, userMsg];
    setMessages(next);
    setLoading(true);
    try {
      // Detect intent for Darija before clearing the ref
      if (language === "dar" && darijaMatcherRef.current) {
        darijaIntentRef.current = darijaMatcherRef.current.identifyIntent(c);
      }
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next,
          language,
          ...(language === "dar" && darijaStandardRef.current ? { standardArabic: darijaStandardRef.current } : {}),
          ...(language === "dar" && darijaIntentRef.current ? { darijaIntent: darijaIntentRef.current } : {}),
        }),
      });
      darijaStandardRef.current = "";
      darijaIntentRef.current = "";
      const d = await safeJson(res);
      const reply = d.content || "No response received.";
      setMessages((p) => [...p, { role: "assistant", content: reply }]);
      if (Array.isArray(d.suggestions) && d.suggestions.length) {
        setFollowUps(d.suggestions.slice(0, 3));
      }
    } catch {
      setMessages((p) => [...p, { role: "assistant", content: "Connection error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  const chat = messages.length > 0;

  /* ── Legal Concept Explainer ── */
  async function explainConcept() {
    const conceptText = learnCustom.trim() || learnConcept;
    if (!conceptText || learnLoading) return;
    setLearnResult("");
    setLearnLoading(true);
    try {
      const res = await fetch(EXPLAIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept: conceptText,
          language,
          level: learnLevel,
          style: learnStyle,
          background: learnBg,
        }),
      });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data.error || "Explanation failed");
      setLearnResult(data.explanation);
    } catch (err) {
      setLearnResult(err.message || "Error generating explanation.");
    } finally {
      setLearnLoading(false);
    }
  }

  /* ── Voice Input (MediaRecorder + Groq Whisper; Web Speech for Darija) ── */
  function startVoice() {
    if (language === "dar") { startDarijaVoice(); return; }
    if (!navigator.mediaDevices?.getUserMedia) return;
    setVoiceError("");
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        audioChunksRef.current = [];
        const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/ogg";
        const recorder = new MediaRecorder(stream, { mimeType });
        recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
        recorder.onstop = () => {
          stream.getTracks().forEach((tr) => tr.stop());
          const blob = new Blob(audioChunksRef.current, { type: mimeType });
          const reader = new FileReader();
          reader.onload = async () => {
            const base64 = reader.result.split(",")[1];
            setVoiceTranscribing(true);
            try {
              const res = await fetch(TRANSCRIBE_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ audio: base64, language, mimeType: mimeType.split(";")[0] }),
              });
              const d = await safeJson(res);
              if (!res.ok) throw new Error(d.error || "Transcription failed");
              if (d.transcript) setInput((prev) => prev ? prev + " " + d.transcript : d.transcript);
            } catch (err) {
              setVoiceError(err.message);
            } finally {
              setVoiceTranscribing(false);
            }
          };
          reader.readAsDataURL(blob);
        };
        mediaRecorderRef.current = recorder;
        recorder.start();
        setIsListening(true);
      })
      .catch(() => setVoiceError(t.voicePermissionDenied));
  }
  function stopVoice() {
    if (language === "dar") {
      darijaRecogRef.current?.stop();
      setIsListening(false);
      return;
    }
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsListening(false);
  }

  function startDarijaVoice() {
    setVoiceError("");
    darijaStandardRef.current = "";
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      // Fallback: use Groq transcription
      startVoiceGroq();
      return;
    }
    const recognition = new SR();
    recognition.lang = "ar-MA";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const matcher = darijaMatcherRef.current;
      if (matcher) {
        const matched = matcher.findClosestMatch(transcript);
        const converted = matcher.convertToStandardArabic(transcript);
        darijaStandardRef.current = converted;
        // Use matched phrase if high-confidence, else raw transcript
        const finalText = matched || transcript;
        setInput(prev => prev ? prev + " " + finalText : finalText);
      } else {
        setInput(prev => prev ? prev + " " + transcript : transcript);
      }
      setIsListening(false);
    };
    recognition.onerror = (event) => {
      const errMap = {
        "not-allowed": t.voicePermissionDenied,
        "no-speech": t.voiceNoSpeech,
        "network": t.voiceNetwork,
        "audio-capture": t.voiceAudioCapture,
      };
      setVoiceError(errMap[event.error] || t.voiceErrorMsg);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    darijaRecogRef.current = recognition;
    recognition.start();
  }

  function startVoiceGroq() {
    if (!navigator.mediaDevices?.getUserMedia) return;
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        audioChunksRef.current = [];
        const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/ogg";
        const recorder = new MediaRecorder(stream, { mimeType });
        recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
        recorder.onstop = () => {
          stream.getTracks().forEach((tr) => tr.stop());
          const blob = new Blob(audioChunksRef.current, { type: mimeType });
          const reader = new FileReader();
          reader.onload = async () => {
            const base64 = reader.result.split(",")[1];
            setVoiceTranscribing(true);
            try {
              const res = await fetch(TRANSCRIBE_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ audio: base64, language, mimeType: mimeType.split(";")[0] }),
              });
              const d = await safeJson(res);
              if (!res.ok) throw new Error(d.error || "Transcription failed");
              if (d.transcript) {
                const matcher = darijaMatcherRef.current;
                if (matcher) {
                  darijaStandardRef.current = matcher.convertToStandardArabic(d.transcript);
                }
                setInput((prev) => prev ? prev + " " + d.transcript : d.transcript);
              }
            } catch (err) {
              setVoiceError(err.message);
            } finally {
              setVoiceTranscribing(false);
            }
          };
          reader.readAsDataURL(blob);
        };
        mediaRecorderRef.current = recorder;
        recorder.start();
        setIsListening(true);
      })
      .catch(() => setVoiceError(t.voicePermissionDenied));
  }

  /* ── Sentence Range Estimator ── */
  function estimateSentence() {
    const BASE = {
      sports_violence:  { articles: "306-1 à 306-4",    minM: 6,   maxM: 24,  minF: 5000,   maxF: 20000 },
      theft:            { articles: "467-468",           minM: 1,   maxM: 24,  minF: 100,    maxF: 2000 },
      aggravated_theft: { articles: "468-469",           minM: 24,  maxM: 120, minF: 200,    maxF: 5000 },
      assault:          { articles: "393-395",           minM: 1,   maxM: 36,  minF: 200,    maxF: 10000 },
      assault_weapon:   { articles: "398",               minM: 36,  maxM: 72,  minF: 1000,   maxF: 20000 },
      rape:             { articles: "475-476",           minM: 60,  maxM: 360, minF: 5000,   maxF: 50000 },
      fraud:            { articles: "450, 234-235",      minM: 6,   maxM: 36,  minF: 250,    maxF: 5000 },
      drug_possession:  { articles: "209",               minM: 1,   maxM: 12,  minF: 500,    maxF: 5000 },
      drug_trafficking: { articles: "210-212",           minM: 24,  maxM: 240, minF: 5000,   maxF: 1000000 },
      trafficking:      { articles: "448-10 à 448-14",  minM: 12,  maxM: 60,  minF: 5000,   maxF: 50000 },
      terrorism:        { articles: "218-1 à 218-5",    minM: 120, maxM: 360, minF: 50000,  maxF: 500000 },
      bribery:          { articles: "248-250",           minM: 60,  maxM: 120, minF: 10000,  maxF: 100000 },
    };
    const AGG = { weapon_use: 2.0, gang: 1.5, multiple_victims: 1.75, repeat_offender: 1.5, premeditated: 2.0, leader_role: 1.75, vulnerable_victim: 2.0 };
    const MIT = { first_offense: 0.5, young_age: 0.65, cooperation: 0.7, remorse: 0.75, restitution: 0.8 };
    const b = BASE[sentenceCrime];
    if (!b) return;
    let sm = 1, fm = 1;
    sentenceAgg.forEach(k => { if (AGG[k]) { sm *= AGG[k]; fm *= AGG[k]; } });
    sentenceMit.forEach(k => { if (MIT[k]) { sm *= MIT[k]; fm *= MIT[k]; } });
    sm = Math.max(0.3, Math.min(3, sm));
    fm = Math.max(0.3, Math.min(3, fm));
    const yr = (language === "ar" || language === "dar") ? "سنوات" : language === "fr" ? "ans" : "years";
    const mo = (language === "ar" || language === "dar") ? "أشهر" : language === "fr" ? "mois" : "months";
    const fmt = (n) => n >= 12 ? `${Math.round(n / 12)} ${yr}` : `${Math.round(n)} ${mo}`;
    setSentenceResult({
      articles: b.articles,
      base: { prison: `${fmt(b.minM)} – ${fmt(b.maxM)}`, fine: `${b.minF.toLocaleString()}–${b.maxF.toLocaleString()} DH` },
      adjusted: { prison: `${fmt(b.minM * sm)} – ${fmt(b.maxM * sm)}`, fine: `${Math.round(b.minF * fm).toLocaleString()}–${Math.round(b.maxF * fm).toLocaleString()} DH` },
      multiplier: sm.toFixed(2),
      aggApplied: [...sentenceAgg],
      mitApplied: [...sentenceMit],
    });
  }

  /* ── Legal Deadline Calculator ── */
  function calcDeadlines() {
    const CASES = {
      criminal_appeal: { steps: [{ days: 10, key: "fileAppeal" }, { days: 90, key: "hearing" }, { days: 30, key: "decision" }], statute: "CPP Art. 415" },
      cassation:       { steps: [{ days: 10, key: "fileCassation" }, { days: 180, key: "review" }, { days: 30, key: "judgment" }], statute: "CPP Art. 427" },
      divorce:         { steps: [{ days: 30, key: "summons" }, { days: 14, key: "reconciliation" }, { days: 10, key: "register" }], statute: "Moudawana Art. 82" },
      custody:         { steps: [{ days: 30, key: "hearing" }, { days: 30, key: "deliberation" }, { days: 10, key: "register" }], statute: "Moudawana Art. 166" },
      inheritance:     { steps: [{ days: 15, key: "registerDeath" }, { days: 90, key: "fileClaim" }, { days: 180, key: "distribution" }], statute: "Moudawana Art. 276" },
      civil_case:      { steps: [{ days: 30, key: "summons" }, { days: 60, key: "hearing" }, { days: 180, key: "judgment" }], statute: "CPC" },
      rental_dispute:  { steps: [{ days: 30, key: "notice" }, { days: 30, key: "hearing" }, { days: 15, key: "execute" }], statute: "Loi 67-12" },
    };
    const c = CASES[deadlineCaseType];
    if (!c) return;
    const today = new Date();
    let cur = new Date(deadlineDate);
    const locale = (language === "ar" || language === "dar") ? "ar-MA" : language === "fr" ? "fr-FR" : "en-GB";
    const steps = c.steps.map((s, i) => {
      cur = new Date(cur);
      cur.setDate(cur.getDate() + s.days);
      const diff = Math.ceil((cur - today) / 86400000);
      return { step: i + 1, dayKey: s.key, days: s.days, date: cur.toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" }), daysLeft: diff, passed: diff < 0, urgent: diff >= 0 && diff <= 7 };
    });
    setDeadlineResult({ caseName: deadlineCaseType, statute: c.statute, steps, next: steps.find(s => !s.passed) || null });
  }

  /* ── Contract Drafting ── */
  /* ── Document processing ── */
  function getTesseractLang() {
    return (language === "ar" || language === "dar") ? "ara" : language === "fr" ? "fra" : "eng";
  }

  async function ocrFromImage(imageSource) {
    const Tesseract = window.Tesseract;
    if (!Tesseract) throw new Error("Tesseract.js not loaded");
    const worker = await Tesseract.createWorker(getTesseractLang());
    const { data: { text } } = await worker.recognize(imageSource);
    await worker.terminate();
    return text.trim();
  }

  async function renderPdfPageToImage(pdf, pageNum) {
    const page = await pdf.getPage(pageNum);
    const scale = 2;
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    await page.render({ canvasContext: ctx, viewport }).promise;
    return canvas.toDataURL("image/png");
  }

  async function extractPdfText(file) {
    const pdfjsLib = window.pdfjsLib;
    if (!pdfjsLib) throw new Error("PDF.js not loaded");
    pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    /* Try text extraction first */
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item) => item.str).join(" ") + "\n";
    }
    if (text.trim()) return text.trim();

    /* Scanned PDF fallback: render pages to images → OCR */
    let ocrText = "";
    const maxPages = Math.min(pdf.numPages, 5);
    for (let i = 1; i <= maxPages; i++) {
      const imgData = await renderPdfPageToImage(pdf, i);
      const pageText = await ocrFromImage(imgData);
      ocrText += pageText + "\n";
    }
    return ocrText.trim();
  }

  async function extractImageText(file) {
    return ocrFromImage(file);
  }

  async function analyzeText(text, docType) {
    const res = await fetch(ANALYZE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text.slice(0, 8000), language, docType }),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data.error || "Analysis failed");
    return data.analysis;
  }

  async function extractWithLLM(text) {
    const res = await fetch(EXTRACT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text.slice(0, 6000), language }),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data.error || "LLM extraction failed");
    return data;
  }

  /* ─── Doc intelligence helpers ─── */
  function extractDocEntities(text, docType) {
    const dateRx = /\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}|\d{1,2}\s+(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre|يناير|فبراير|مارس|أبريل|ماي|يونيو|يوليوز|غشت|شتنبر|أكتوبر|نونبر|دجنبر|January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})\b/gi;
    const amountRx = /\b\d[\d\s,.]*(?:درهم|DH|MAD|€|EUR|\$|USD|ريال|دينار)\b|\b(?:مبلغ|montant|amount|sum)\s+(?:de\s+|of\s+)?\d[\d\s,.]*/gi;
    const articleRx = /\b(?:article|المادة|الفصل|الفقرة|Art\.?)\s*\d+(?:\s*(?:bis|ter|quater|مكرر|مكررة))?\b/gi;
    const unique = (arr) => [...new Set(arr.map((s) => s.trim()).filter(Boolean))];

    const base = {
      dates: unique(text.match(dateRx) || []).slice(0, 8),
      amounts: unique(text.match(amountRx) || []).slice(0, 6),
      articles: unique(text.match(articleRx) || []).slice(0, 10),
    };

    if (docType === "court_report" || docType === "criminal_case") {
      // Extract court-specific entities
      const caseNumRx = /(?:الدعوى\s*رقم|ملف\s*رقم|case\s*(?:number|no\.?)|dossier\s*n[o°]?\.?)\s*[:：]?\s*([\w\/\-]+)/gi;
      const judgeRx = /(?:القاضي|السيد القاضي|judge|М\.?|juge)\s*[:：]?\s*([^\n،,]{3,40})/gi;
      const defendantRx = /(?:المتهم|المتهمون|defendant|l'inculpé|le prévenu)\s*[:：]?\s*([^\n،,]{3,50})/gi;
      const verdictRx = /(?:حكمت المحكمة|قضت\s*بـ?|الحكم\s*[:：]|صدر الحكم|verdict\s*[:：]|jugement\s*[:：])\s*([^\n]{5,120})/gi;
      const chargesRx = /(?:تهمة|بتهمة|التهم|charges?\s*[:：]?|chef[s]?\s*d['']?inculpation)\s*[:：]?\s*([^\n،,]{5,80})/gi;

      return {
        ...base,
        caseNumbers: unique([...text.matchAll(caseNumRx)].map((m) => m[1])).slice(0, 3),
        judges: unique([...text.matchAll(judgeRx)].map((m) => m[1])).slice(0, 3),
        defendants: unique([...text.matchAll(defendantRx)].map((m) => m[1])).slice(0, 4),
        verdicts: unique([...text.matchAll(verdictRx)].map((m) => m[1])).slice(0, 3),
        charges: unique([...text.matchAll(chargesRx)].map((m) => m[1])).slice(0, 5),
      };
    }

    if (docType === "marriage") {
      const partyRx = /\b(?:الزوج|الزوجة|المكري|المكتري|le demandeur|le défendeur|la partie|plaintiff|defendant|party|the buyer|the seller|البائع|المشتري)\b/gi;
      return {
        ...base,
        parties: unique(text.match(partyRx) || []).slice(0, 6),
      };
    }

    // Default: include generic party extraction
    const partyRx = /\b(?:المدعي|المدعى عليه|الطرف الأول|الطرف الثاني|le demandeur|le défendeur|la partie|plaintiff|defendant|party|the buyer|the seller|البائع|المشتري|المكري|المكتري)\b/gi;
    return {
      ...base,
      parties: unique(text.match(partyRx) || []).slice(0, 6),
    };
  }

  function classifyDoc(text) {
    const t2 = text.toLowerCase();

    // Each type has positive indicators (score +1 each) and negative indicators (score -2 each).
    // The type with the highest adjusted score above the minimum threshold wins.
    const TYPES = {
      court_report: {
        positive: [
          "محكمة", "court", "جلسة", "session", "قضاء", "judicial", "حكم", "judgment",
          "القاضي", "judge", "المحكمة", "المتهم", "الدفاع", "النيابة العامة",
          "محضر", "دعوى", "حكم صادر", "verdict", "صدر الحكم", "حكمت المحكمة",
          "قضت بـ", "المدعى عليه", "السيد القاضي",
        ],
        negative: ["عريس", "عروس", "مهر", "صداق", "خطوبة", "dower", "dot"],
        minScore: 3,
      },
      criminal_case: {
        positive: [
          "جنحة", "misdemeanor", "جناية", "felony", "جريمة", "crime", "متهم", "defendant",
          "تهمة", "charge", "إدانة", "conviction", "حبس", "prison", "عقوبة", "penalty",
          "شرطة", "police", "نيابة", "prosecution", "شغب", "rioting", "عنف", "violence",
          "اعتداء", "assault", "إجرامي", "criminal",
        ],
        negative: ["عريس", "عروس", "مهر", "صداق", "dower", "dot", "عقد الزواج"],
        minScore: 3,
      },
      marriage: {
        positive: [
          "عقد الزواج", "مهر", "ولي", "contrat de mariage", "dot", "mariage", "marriage contract",
          "wedding", "صداق", "عريس", "عروس", "الزوج", "الزوجة", "خاتبة",
        ],
        negative: [
          "محكمة", "court", "قضاء", "judicial", "حكم", "judgment",
          "شغب", "rioting", "عنف", "violence", "جنحة", "misdemeanor",
          "متهم", "defendant", "نيابة", "prosecution",
        ],
        minScore: 2,
      },
      divorce: {
        positive: ["طلاق", "تطليق", "خلع", "divorce", "dissolution du mariage", "talaq"],
        negative: [],
        minScore: 1,
      },
      custody: {
        positive: ["حضانة", "مسكن الحضانة", "garde", "custody", "كفالة"],
        negative: [],
        minScore: 1,
      },
      will: {
        positive: ["وصية", "الموصى", "الموصى له", "testament", "légataire", "will", "testator"],
        negative: [],
        minScore: 1,
      },
      lease: {
        positive: ["كراء", "مكري", "مكتري", "bail", "loyer", "locataire", "lease", "rental", "rent"],
        negative: [],
        minScore: 1,
      },
      purchase: {
        positive: ["بيع", "مشتري", "بائع", "ثمن", "vente", "acheteur", "vendeur", "sale", "purchase", "buyer"],
        negative: [],
        minScore: 1,
      },
      complaint: {
        positive: ["شكوى", "مذكرة", "plainte", "inculpé", "complaint", "accused"],
        negative: [],
        minScore: 1,
      },
      inheritance: {
        positive: ["تركة", "وارث", "إرث", "succession", "héritier", "héritage", "inheritance", "heir"],
        negative: [],
        minScore: 1,
      },
    };

    let best = "general";
    let bestScore = 0;

    for (const [type, { positive, negative, minScore }] of Object.entries(TYPES)) {
      const pos = positive.filter((w) => t2.includes(w)).length;
      const neg = negative.filter((w) => t2.includes(w)).length;
      const score = pos - neg * 2;
      if (score >= minScore && score > bestScore) {
        bestScore = score;
        best = type;
      }
    }

    return best;
  }

  function detectRisks(text, docType, lang) {
    const t2 = text.toLowerCase();
    const risks = [];
    const add = (level, msgAr, msgFr, msgEn) =>
      risks.push({ level, msg: lang === "ar" ? msgAr : lang === "fr" ? msgFr : msgEn });

    const isCourtDoc = docType === "court_report" || docType === "criminal_case";
    const isMarriageDoc = docType === "marriage";

    // ── Court / Criminal document checks ──────────────────────────────────
    if (isCourtDoc) {
      if (!/استئناف|recours|appel|appeal/i.test(t2))
        add("medium",
          "لا توجد إشارة إلى إجراءات الطعن أو الاستئناف",
          "Aucune mention des voies de recours ou d'appel",
          "No mention of appeal or recourse procedures");

      if (!/تنفيذ|exécution|enforcement|execution/i.test(t2))
        add("medium",
          "لا توجد تفاصيل حول آليات تنفيذ الحكم",
          "Aucun détail sur les modalités d'exécution du jugement",
          "No details on judgment enforcement mechanisms");

      const hasVerdict = /حكمت المحكمة|قضت|الحكم|verdict|jugement/i.test(t2);
      if (!hasVerdict)
        add("high",
          "لم يُرصد منطوق الحكم بوضوح في الوثيقة",
          "Le dispositif du jugement n'est pas clairement détecté",
          "Verdict/judgment disposition not clearly detected");

      if (!/متهم|defendant|inculpé|prévenu/i.test(t2))
        add("high",
          "لم تُحدَّد هوية المتهم أو المتهمين بوضوح",
          "L'identité du/des prévenus n'est pas clairement établie",
          "Defendant identity not clearly identified");

      if (!/تاريخ|\bdate\b|\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/i.test(t2))
        add("medium",
          "لا يوجد تاريخ محدد في الوثيقة",
          "Aucune date précise identifiée",
          "No specific date found in the document");

      return risks;
    }

    // ── Universal checks (non-court documents) ────────────────────────────
    if (!/توقيع|signature|signed/i.test(t2))
      add("high",
        "لم يُرصد توقيع في الوثيقة",
        "Aucune signature détectée dans le document",
        "No signature detected in the document");

    if (!/تاريخ|\bdate\b|\bدالة\b|\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/i.test(t2))
      add("medium",
        "لا يوجد تاريخ محدد",
        "Aucune date précise identifiée",
        "No specific date found");

    if (!/شاهد|شهود|témoin|witness/i.test(t2) && ["marriage", "will", "purchase"].includes(docType))
      add("medium",
        "لم يُذكر شاهد في وثيقة تستوجبه",
        "Aucun témoin mentionné pour un acte qui en requiert",
        "No witness mentioned for a document that requires one");

    // ── Marriage contract checks (ONLY if classified as marriage) ─────────
    if (isMarriageDoc) {
      if (!/مهر|صداق|dot|dower/i.test(t2))
        add("high",
          "لم يُذكر المهر في عقد الزواج",
          "La dot n'est pas mentionnée dans le contrat de mariage",
          "Marriage contract missing dower/mahr clause");
    }

    // ── Divorce-specific ──────────────────────────────────────────────────
    if (docType === "divorce" && !/نفقة|pension alimentaire|alimony/i.test(t2))
      add("medium",
        "لا توجد إشارة لنفقة أو حضانة",
        "Pas de mention de pension alimentaire ou de garde",
        "No mention of alimony or custody terms");

    // ── Lease-specific ────────────────────────────────────────────────────
    if (docType === "lease" && !/مدة|durée|term|period/i.test(t2))
      add("medium",
        "لم تُحدَّد مدة الكراء",
        "La durée du bail n'est pas précisée",
        "Lease duration not specified");

    // ── Will-specific ─────────────────────────────────────────────────────
    if (docType === "will" && !/وارث|شاهد|notaire|état civil/i.test(t2))
      add("high",
        "الوصية قد تفتقر إلى شروط قانونية أساسية",
        "Le testament pourrait manquer de conditions légales essentielles",
        "Will may lack essential legal requirements");

    return risks;
  }

  async function handleFile(file) {
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    const isPdf = ext === "pdf";
    const isImage = ["jpg", "jpeg", "png", "webp"].includes(ext);
    if (!isPdf && !isImage) return;

    setFileName(file.name);
    setExtractedText("");
    setAnalysis("");
    setDocState("extracting");

    try {
      let text = "";
      if (isPdf) {
        text = await extractPdfText(file);
      } else {
        text = await extractImageText(file);
      }

      if (!text.trim()) {
        setDocState("idle");
        setExtractedText(t.noText);
        return;
      }

      setExtractedText(text);
      setDocState("analyzing");

      // Rule-based type for backend prose prompt context (fast, no API call)
      const ruleDocType = classifyDoc(text);

      // Prose analysis and LLM structured extraction run in parallel
      const [proseResult, llmResult] = await Promise.allSettled([
        analyzeText(text, ruleDocType),
        extractWithLLM(text),
      ]);

      if (proseResult.status === "fulfilled") setAnalysis(proseResult.value);

      // Prefer LLM extraction; fall back to rule-based if it fails or is unavailable
      let docType, entities, llmConfidence = null;
      if (llmResult.status === "fulfilled" && llmResult.value?.docType) {
        docType = llmResult.value.docType;
        entities = llmResult.value.entities;
        llmConfidence = typeof llmResult.value.confidence === "number"
          ? llmResult.value.confidence : null;
      } else {
        docType = ruleDocType;
        entities = extractDocEntities(text, docType);
      }

      const risks = detectRisks(text, docType, language);
      setDocIntelligence({ docType, entities, risks, llmConfidence });
      setDocState("done");
    } catch (err) {
      setDocState("idle");
      setExtractedText(err.message || t.analyzeError);
    }
  }

  function resetDoc() {
    setDocState("idle");
    setExtractedText("");
    setAnalysis("");
    setFileName("");
    setDocIntelligence(null);
  }

  function copyToClipboard(text, id) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    });
  }

  async function buildPdfDownload(sections, filename) {
    const { jsPDF } = window.jspdf;
    const hasArabic = sections.some((s) => s.text && /[\u0600-\u06FF]/.test(s.text));
    const fontFamily = hasArabic ? "Cairo, Arial, sans-serif" : "'Josefin Sans', Arial, sans-serif";
    const dir = hasArabic ? "rtl" : "ltr";
    const base = `direction:${dir};unicode-bidi:embed;font-variant-ligatures:none;`;
    const esc = (t) => t ? t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br> ") : "";

    let inner = "";
    for (const { text, type } of sections) {
      if (!text && type !== "gap") continue;
      const s = esc(text);
      if (type === "title")
        inner += `<div style="${base}font-size:16px;font-weight:700;color:#7a5c2a;border-bottom:2px solid #c8a45e;padding-bottom:8px;margin:0 0 14px;line-height:1.5">${s}</div>`;
      else if (type === "h2")
        inner += `<div style="${base}font-size:11px;font-weight:700;color:#9a7c4a;margin:16px 0 5px;line-height:1.4">${s}</div>`;
      else if (type === "meta")
        inner += `<div style="${base}font-size:9px;color:#aaa;margin:2px 0;line-height:1.4">${s}</div>`;
      else if (type === "user")
        inner += `<div style="${base}border-${hasArabic ? "right" : "left"}:3px solid #c8a45e;padding:6px ${hasArabic ? "12px 6px 4px" : "4px 6px 12px"};color:#6a4a2a;margin:6px 0;line-height:1.8;word-break:break-word;white-space:normal">${s}</div>`;
      else if (type === "ai" || type === "box")
        inner += `<div style="${base}margin:6px 0;line-height:1.8;word-break:break-word;white-space:normal;color:#1a1510">${s}</div>`;
      else if (type === "gap")
        inner += `<div style="height:12px"></div>`;
    }

    const wrap = document.createElement("div");
    wrap.style.cssText = "position:fixed;top:0;left:-900px;width:794px;padding:50px 60px;background:#fff;box-sizing:border-box;opacity:1;pointer-events:none;";
    wrap.innerHTML = `<div style="font-family:${fontFamily};font-size:12px;line-height:1.7;color:#1a1510;direction:${dir};text-align:${hasArabic ? "right" : "left"};word-spacing:normal">${inner}</div>`;
    document.body.appendChild(wrap);

    // Explicitly load the fonts used and give the browser time to apply them
    const fname = hasArabic ? "Cairo" : "Josefin Sans";
    await Promise.allSettled([
      document.fonts.load(`400 14px "${fname}"`),
      document.fonts.load(`700 14px "${fname}"`),
    ]);
    await document.fonts.ready;
    await new Promise((r) => setTimeout(r, 300));

    try {
      const canvas = await window.html2canvas(wrap, {
        scale: 2, useCORS: true, backgroundColor: "#ffffff", width: 794, windowWidth: 794,
      });

      const A4_W = 210, A4_H = 297;
      const pageHpx = Math.round((A4_H / A4_W) * canvas.width);
      const canvasCtx = canvas.getContext("2d");
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

      let sliceY = 0, page = 0;
      while (sliceY < canvas.height) {
        let endY = Math.min(sliceY + pageHpx, canvas.height);
        // Find nearest blank row above the cut to avoid slicing through text
        if (endY < canvas.height) {
          for (let scanY = endY; scanY > endY - 100 && scanY > sliceY + 20; scanY--) {
            const row = canvasCtx.getImageData(0, scanY, canvas.width, 1).data;
            let blank = true;
            for (let p = 0; p < row.length; p += 4) {
              if (row[p] < 248) { blank = false; break; }
            }
            if (blank) { endY = scanY; break; }
          }
        }
        const sliceH = endY - sliceY;
        const pc = document.createElement("canvas");
        pc.width = canvas.width; pc.height = pageHpx;
        const ctx = pc.getContext("2d");
        ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, pc.width, pc.height);
        ctx.drawImage(canvas, 0, sliceY, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
        if (page > 0) pdf.addPage();
        pdf.addImage(pc.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, A4_W, A4_H);
        sliceY = endY; page++;
      }
      pdf.save(filename);
    } finally {
      document.body.removeChild(wrap);
    }
  }

  async function exportChatPdf() {
    const pairs = [];
    for (let i = 0; i < messages.length; i++) {
      if (messages[i].role === "user") {
        const ans = messages[i + 1]?.role === "assistant" ? messages[i + 1] : null;
        pairs.push({ q: messages[i].content, a: ans?.content || null });
        if (ans) i++;
      }
    }
    const sections = [
      { text: `${t.title} — ${t.brand}`, type: "title" },
      { text: new Date().toLocaleDateString(), type: "meta" },
      { text: t.chatTab, type: "h2" },
      { text: "", type: "gap" },
      ...pairs.flatMap((p, idx) => [
        { text: `${(language === "ar" || language === "dar") ? "السؤال" : language === "fr" ? "Question" : "Question"} ${idx + 1}`, type: "h2" },
        { text: p.q, type: "user" },
        { text: (language === "ar" || language === "dar") ? "الجواب" : language === "fr" ? "Réponse" : "Answer", type: "h2" },
        { text: p.a || "—", type: "ai" },
        { text: "", type: "gap" },
      ]),
      { text: t.disclaimer, type: "meta" },
    ];
    await buildPdfDownload(sections, "moroccan-law-chat.pdf");
  }

  async function exportAnalysisPdf() {
    const sections = [
      { text: `${t.analysisTitle} — ${t.brand}`, type: "title" },
      { text: `${fileName} · ${new Date().toLocaleDateString()}`, type: "meta" },
      { text: t.extractedTitle, type: "h2" },
      { text: extractedText, type: "box" },
      { text: t.analysisTitle, type: "h2" },
      { text: analysis, type: "box" },
      { text: "", type: "gap" },
      { text: t.disclaimer, type: "meta" },
    ];
    await buildPdfDownload(sections, "moroccan-law-analysis.pdf");
  }

  async function downloadMsgPdf(content, idx) {
    const prevUser = messages[idx - 1]?.role === "user" ? messages[idx - 1].content : null;
    const qLabel = (language === "ar" || language === "dar") ? "السؤال" : language === "fr" ? "Question" : "Question";
    const aLabel = (language === "ar" || language === "dar") ? "الجواب" : language === "fr" ? "Réponse" : "Answer";
    const sections = [
      { text: t.brand, type: "title" },
      { text: new Date().toLocaleDateString(), type: "meta" },
      { text: "", type: "gap" },
      ...(prevUser ? [{ text: qLabel, type: "h2" }, { text: prevUser, type: "user" }] : []),
      { text: aLabel, type: "h2" },
      { text: content, type: "ai" },
      { text: "", type: "gap" },
      { text: t.disclaimer, type: "meta" },
    ];
    await buildPdfDownload(sections, `response-${idx + 1}.pdf`);
  }

  function clearChatHistory() {
    setMessages([]);
    localStorage.removeItem("mlq_chat");
  }

  /* ── Source highlight component ── */
  function HighlightedText({ text, reference }) {
    if (!reference || !text) return <span style={{ whiteSpace: "pre-wrap" }}>{text}</span>;
    const stopwords = new Set(["that", "this", "with", "from", "dans", "avec", "pour", "هذا", "التي", "على", "عند", "بما", "which", "have", "been", "will", "they", "their", "there", "also", "more", "when", "were"]);
    const rawWords = reference.toLowerCase().match(/[\u0600-\u06FFa-zA-Z]{4,}/g) || [];
    const keywords = [...new Set(rawWords.filter((w) => !stopwords.has(w)))].slice(0, 50);
    if (keywords.length === 0) return <span style={{ whiteSpace: "pre-wrap" }}>{text}</span>;
    const pattern = new RegExp(`(${keywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
    const parts = text.split(pattern);
    return (
      <span style={{ whiteSpace: "pre-wrap" }}>
        {parts.map((part, i) =>
          i % 2 === 1
            ? <mark key={i} style={{ background: `${P.gold}28`, color: P.goldLight, borderRadius: 2, padding: "0 1px" }}>{part}</mark>
            : part
        )}
      </span>
    );
  }

  /* ── SVG Icons ── */
  const SendIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: rtl ? "scaleX(-1)" : "none" }}>
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );

  const AdalaLogo = () => (
    <img src="/img/logo.png" alt="adalaapp logo" width="36" height="36" style={{ borderRadius: 8, objectFit: "contain", display: "block", background: "transparent" }} />
  );

  return (
    <div style={{ minHeight: "100vh", background: P.bg, color: P.text, fontFamily: ff, direction: rtl ? "rtl" : "ltr", display: "flex", flexDirection: "column" }}>

      {/* ── Government Disclaimer Banner ── */}
      <div style={{
        background: P.bg,
        borderBottom: `1px solid ${P.gold}40`,
        padding: isMobile ? "8px 14px" : "10px 32px",
        textAlign: "center",
        fontSize: isMobile ? 11 : 12,
        color: P.gold,
        lineHeight: 1.5,
        fontFamily: ff,
      }}>
        {t.govDisclaimer}
      </div>

      {/* ── Header ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 20,
        display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "stretch" : "center", justifyContent: "space-between",
        padding: isMobile ? "10px 12px 8px" : "14px 32px",
        gap: isMobile ? 10 : 0,
        background: theme === "dark" ? "rgba(26,21,16,0.94)" : `${P.bg}f0`, backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
        borderBottom: `1px solid ${P.gold}20`,
        boxShadow: theme === "dark" ? `0 4px 24px #0008, 0 1px 0 #c8a45e12` : `0 2px 12px ${P.border}80`,
      }}>
        {/* Top row: logo + language */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <AdalaLogo />
            <span style={{ fontSize: isMobile ? 15 : 18, fontWeight: 600, color: P.gold, letterSpacing: "0.3px", fontFamily: '"Inter", sans-serif' }}>
              Adala App{" "}<span style={{ fontFamily: FA, fontWeight: 500, fontSize: isMobile ? 14 : 17 }}>- عدالة</span>
            </span>
          </div>
          <div style={{ display: "flex", gap: 4, alignItems: "center", marginLeft: isMobile ? 0 : 24, marginRight: rtl ? 24 : 0 }}>
            {[
              { c: "dar", l: "دارجة" },
              { c: "ar", l: "ع" },
              { c: "fr", l: "FR" },
              { c: "en", l: "EN" },
            ].map(({ c, l }) => {
              const on = language === c;
              return (
                <button key={c} onClick={() => { setLanguage(c); setMessages([]); setInput(""); }}
                  style={{
                    padding: isMobile ? "5px 10px" : "6px 14px", fontSize: isMobile ? 11 : 12, fontWeight: 600, fontFamily: (c === "ar" || c === "dar") ? FA : F,
                    background: on ? P.gold : "transparent",
                    color: on ? P.bg : P.textDim,
                    border: on ? "none" : `1px solid ${P.border}`,
                    borderRadius: 20, cursor: "pointer",
                    transition: `all 250ms ${E}`,
                    letterSpacing: c === "ar" ? 0 : "0.5px",
                  }}
                  onMouseEnter={(e) => { if (!on) { e.currentTarget.style.borderColor = P.goldMuted; e.currentTarget.style.color = P.gold; } }}
                  onMouseLeave={(e) => { if (!on) { e.currentTarget.style.borderColor = P.border; e.currentTarget.style.color = P.textDim; } }}
                >{l}</button>
              );
            })}
            {/* ── Dark/Light toggle ── */}
            <button onClick={toggleTheme} title={theme === "dark" ? t.lightMode : t.darkMode}
              style={{ padding: isMobile ? "5px 8px" : "6px 10px", fontSize: 14, background: "transparent", color: P.textDim,
                border: `1px solid ${P.border}`, borderRadius: 20, cursor: "pointer", transition: `all 250ms ${E}`, lineHeight: 1 }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = P.goldMuted; e.currentTarget.style.color = P.gold; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = P.border; e.currentTarget.style.color = P.textDim; }}
            >{theme === "dark"
                ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{display:"block"}}><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{display:"block"}}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              }</button>
            {/* ── Bookmarks button ── */}
            <button onClick={() => setShowBookmarks(true)} title={t.bookmarksTitle}
              style={{ padding: isMobile ? "5px 8px" : "6px 10px", fontSize: 14, background: "transparent", color: bookmarks.length ? P.gold : P.textDim,
                border: `1px solid ${bookmarks.length ? P.goldMuted : P.border}`, borderRadius: 20, cursor: "pointer", transition: `all 250ms ${E}`,
                position: "relative", lineHeight: 1 }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = P.goldMuted; e.currentTarget.style.color = P.gold; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = bookmarks.length ? P.goldMuted : P.border; e.currentTarget.style.color = bookmarks.length ? P.gold : P.textDim; }}
            ><svg width="15" height="15" viewBox="0 0 24 24" fill={bookmarks.length ? P.gold : "none"} stroke="currentColor" strokeWidth="2" style={{display:"block"}}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>{bookmarks.length > 0 && <span style={{ fontSize: 10, position: "absolute", top: -4, right: -4, background: P.gold, color: P.bg, borderRadius: 10, padding: "1px 4px", fontWeight: 700 }}>{bookmarks.length}</span>}</button>
          </div>
        </div>
        {/* Mode toggle – scrollable on mobile */}
        <div className="hide-scrollbar" style={{ display: "flex", gap: 4, background: P.bgInput, borderRadius: 10, padding: 3, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          {[
            { m: "chat",     l: t.chatTab },
            { m: "doc",      l: t.docTab },
            { m: "learn",    l: t.learnTab },
            { m: "sentence", l: t.sentenceTab },
            { m: "deadline", l: t.deadlineTab },
          ].map(({ m, l }) => {
            const on = mode === m;
            return (
              <button key={m} onClick={() => setMode(m)}
                style={{
                  padding: isMobile ? "6px 12px" : "6px 16px", fontSize: isMobile ? 11 : 12, fontWeight: 600, fontFamily: ff,
                  background: on ? P.gold : "transparent",
                  color: on ? P.bg : P.textDim,
                  border: "none", borderRadius: 8, cursor: "pointer",
                  transition: `all 250ms ${E}`,
                  whiteSpace: "nowrap", flexShrink: 0,
                }}
              >{l}</button>
            );
          })}
        </div>
      </header>

      {/* ── Content ── */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", maxWidth: 760, width: "100%", margin: "0 auto", padding: isMobile ? "0 10px" : "0 20px", position: "relative" }}>

        {mode === "doc" ? (
          /* ── Document Analysis View ── */
          <div key="doc" className="tab-panel" style={{ flex: 1, display: "flex", flexDirection: "column", padding: isMobile ? "20px 0 20px" : "40px 0 40px" }}>
            {docState === "idle" && !extractedText ? (
              /* Upload area */
              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                <div style={{ textAlign: "center", marginBottom: 40 }}>
                  <div style={{
                    width: 56, height: 56, margin: "0 auto 24px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: `linear-gradient(135deg, ${P.gold}18, ${P.gold}08)`,
                    border: `1px solid ${P.gold}30`,
                    borderRadius: 14,
                  }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={P.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
                    </svg>
                  </div>
                  <h2 style={{ fontSize: isMobile ? (rtl ? 20 : 22) : (rtl ? 26 : 28), fontWeight: 700, margin: "0 0 10px", color: P.text, fontFamily: ff }}>{t.uploadTitle}</h2>
                  <p style={{ fontSize: isMobile ? 12 : 14, color: P.textMid, maxWidth: 440, margin: "0 auto", lineHeight: 1.65 }}>{t.uploadDesc}</p>
                </div>

                <div
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
                  style={{
                    width: "100%", maxWidth: 480,
                    padding: isMobile ? "32px 16px" : "48px 32px",
                    border: `2px dashed ${dragOver ? P.gold : P.border}`,
                    borderRadius: 16,
                    background: dragOver ? `${P.gold}08` : P.bgCard,
                    cursor: "pointer",
                    transition: `all 250ms ${E}`,
                    textAlign: "center",
                  }}
                  onMouseEnter={(e) => { if (!dragOver) { e.currentTarget.style.borderColor = P.goldMuted; e.currentTarget.style.background = P.bgHover; } }}
                  onMouseLeave={(e) => { if (!dragOver) { e.currentTarget.style.borderColor = P.border; e.currentTarget.style.background = P.bgCard; } }}
                >
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={P.textDim} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 16 }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <p style={{ fontSize: 14, color: P.textMid, margin: "0 0 6px" }}>{t.dropHint}</p>
                  <p style={{ fontSize: 12, color: P.textDim, margin: 0 }}>{t.supported}</p>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    style={{ display: "none" }}
                    onChange={(e) => handleFile(e.target.files[0])}
                  />
                </div>
              </div>
            ) : (
              /* Processing / Results */
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {/* File name badge */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: P.bgCard, border: `1px solid ${P.border}`, borderRadius: 10 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={P.gold} strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <span style={{ fontSize: 13, color: P.text, fontFamily: ff }}>{fileName}</span>
                  {docState === "done" && (
                    <button onClick={resetDoc} style={{
                      marginInlineStart: "auto", padding: "4px 12px", fontSize: 11, fontWeight: 600,
                      background: "transparent", color: P.gold, border: `1px solid ${P.gold}40`,
                      borderRadius: 6, cursor: "pointer", fontFamily: ff,
                    }}>{t.reset}</button>
                  )}
                </div>

                {/* Loading states */}
                {(docState === "extracting" || docState === "analyzing") && (
                  <div style={{
                    padding: "28px 32px",
                    background: P.bgCard, border: `1px solid ${P.border}`, borderRadius: 12,
                    boxShadow: `0 4px 24px #0006`,
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
                    animation: `scaleIn 250ms cubic-bezier(0.22,1,0.36,1) both`,
                  }}>
                    <div style={{ display: "inline-flex", gap: 6 }}>
                      {[0, 1, 2].map((d) => (
                        <span key={d} style={{ width: 8, height: 8, borderRadius: "50%", background: P.gold, animation: `dots 1.4s infinite ${d * 0.2}s` }} />
                      ))}
                    </div>
                    <p style={{ fontSize: 14, color: P.textMid, margin: 0 }}>
                      {docState === "extracting" ? t.extracting : t.analyzing}
                    </p>
                    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
                      <div className="skeleton-line" style={{ height: 11, width: "78%" }} />
                      <div className="skeleton-line" style={{ height: 11, width: "55%" }} />
                      <div className="skeleton-line" style={{ height: 11, width: "68%" }} />
                    </div>
                  </div>
                )}

                {/* Extracted text */}
                {extractedText && (
                  <div style={{
                    background: P.bgCard, border: `1px solid ${P.border}`, borderRadius: 12,
                    overflow: "hidden",
                  }}>
                    <div style={{ padding: "12px 16px", borderBottom: `1px solid ${P.border}`, display: "flex", alignItems: "center", gap: 8 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={P.gold} strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                      <span style={{ fontSize: 13, fontWeight: 600, color: P.gold }}>{t.extractedTitle}</span>
                      <button onClick={() => copyToClipboard(extractedText, "extracted")} style={{ marginInlineStart: "auto", padding: "3px 10px", fontSize: 11, fontWeight: 600, fontFamily: ff, background: "transparent", color: copiedId === "extracted" ? P.gold : P.textDim, border: `1px solid ${copiedId === "extracted" ? P.gold + "40" : P.border}`, borderRadius: 6, cursor: "pointer", transition: `all 200ms ${E}` }}>{copiedId === "extracted" ? t.copied : t.copy}</button>
                    </div>
                    <div style={{
                      padding: 16, maxHeight: 200, overflowY: "auto",
                      fontSize: 13, lineHeight: 1.7, color: P.textMid,
                      fontFamily: ff,
                      direction: rtl ? "rtl" : "ltr",
                    }}><HighlightedText text={extractedText} reference={analysis} /></div>
                  </div>
                )}

                {/* Analysis result */}
                {analysis && (
                  <div className="card" style={{
                    background: P.bgCard, border: `1px solid ${P.gold}30`, borderRadius: 12,
                    overflow: "hidden",
                    animation: `slideInUp 300ms cubic-bezier(0.22,1,0.36,1) forwards`,
                    boxShadow: `0 6px 32px #0007, 0 1px 4px #c8a45e10`,
                  }}>
                    <div style={{ padding: "12px 16px", borderBottom: `1px solid ${P.gold}25`, display: "flex", alignItems: "center", gap: 8 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={P.gold} strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                      <span style={{ fontSize: 13, fontWeight: 600, color: P.gold }}>{t.analysisTitle}</span>
                      <div style={{ marginInlineStart: "auto", display: "flex", gap: 6 }}>
                        <button onClick={() => copyToClipboard(analysis, "analysis")} style={{ padding: "3px 10px", fontSize: 11, fontWeight: 600, fontFamily: ff, background: "transparent", color: copiedId === "analysis" ? P.gold : P.textDim, border: `1px solid ${copiedId === "analysis" ? P.gold + "40" : P.border}`, borderRadius: 6, cursor: "pointer", transition: `all 200ms ${E}` }}>{copiedId === "analysis" ? t.copied : t.copy}</button>
                        <button onClick={exportAnalysisPdf} style={{ padding: "3px 10px", fontSize: 11, fontWeight: 600, fontFamily: ff, background: `${P.gold}18`, color: P.gold, border: `1px solid ${P.gold}40`, borderRadius: 6, cursor: "pointer", transition: `all 200ms ${E}` }}>{t.exportPdf}</button>
                      </div>
                    </div>
                    <div style={{
                      padding: 20,
                      fontSize: 14, lineHeight: 1.85, color: P.textMid,
                      whiteSpace: "pre-wrap", fontFamily: ff,
                      direction: rtl ? "rtl" : "ltr",
                    }}>{analysis}</div>
                  </div>
                )}

                {/* Intelligence card */}
                {docIntelligence && (
                  <div style={{
                    background: P.bgCard, border: `1px solid ${P.gold}25`, borderRadius: 12,
                    overflow: "hidden", animation: `fadeUp 400ms ${E} forwards`,
                  }}>
                    {/* Header */}
                    <div style={{ padding: "12px 16px", borderBottom: `1px solid ${P.gold}20`, display: "flex", alignItems: "center", gap: 8 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={P.gold} strokeWidth="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      <span style={{ fontSize: 13, fontWeight: 600, color: P.gold }}>{t.intelligenceTitle}</span>
                      <div style={{ marginInlineStart: "auto", display: "flex", alignItems: "center", gap: 6 }}>
                        {docIntelligence.llmConfidence != null && (
                          <span style={{ fontSize: 10, fontWeight: 700, background: "#7eb8e018", color: "#7eb8e0", border: "1px solid #7eb8e040", borderRadius: 20, padding: "2px 8px", letterSpacing: "0.02em" }}>
                            LLM · {docIntelligence.llmConfidence}%
                          </span>
                        )}
                        <span style={{ fontSize: 11, fontWeight: 600, background: `${P.gold}18`, color: P.gold, border: `1px solid ${P.gold}35`, borderRadius: 20, padding: "2px 10px" }}>
                          {t.docTypes[docIntelligence.docType] || docIntelligence.docType}
                        </span>
                      </div>
                    </div>

                    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16, direction: rtl ? "rtl" : "ltr" }}>
                      {/* Entities grid */}
                      {(() => {
                        const ent = docIntelligence.entities;
                        const { dates = [], amounts = [], articles = [], parties = [],
                                caseNumbers = [], judges = [], defendants = [],
                                verdicts = [], charges = [] } = ent;
                        const isCourtDoc = docIntelligence.docType === "court_report" || docIntelligence.docType === "criminal_case";
                        const hasEntities = dates.length || amounts.length || articles.length ||
                          parties.length || caseNumbers.length || judges.length ||
                          defendants.length || verdicts.length || charges.length;
                        if (!hasEntities) return null;
                        const chip = (items, label, color) => items && items.length ? (
                          <div key={label} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: P.textDim, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                              {items.map((v, i) => (
                                <span key={i} style={{ fontSize: 12, padding: "2px 9px", background: `${color}14`, color, border: `1px solid ${color}30`, borderRadius: 20 }}>{v}</span>
                              ))}
                            </div>
                          </div>
                        ) : null;
                        return (
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: P.textMid, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                              {t.entitiesTitle}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                              {chip(dates, t.datesLabel, "#7eb8e0")}
                              {isCourtDoc ? (
                                <>
                                  {chip(caseNumbers, t.caseNumberLabel, "#e0a87e")}
                                  {chip(judges,      t.judgeLabel,      "#a87ee0")}
                                  {chip(defendants,  t.defendantLabel,  "#e07e7e")}
                                  {chip(charges,     t.chargesLabel,    "#e0d07e")}
                                  {chip(verdicts,    t.verdictLabel,    "#7ee0c8")}
                                </>
                              ) : (
                                <>
                                  {chip(amounts, t.amountsLabel, "#7ed8a0")}
                                  {chip(articles, t.articlesLabel, P.gold)}
                                  {chip(parties, t.partiesLabel, "#c87eb8")}
                                </>
                              )}
                              {isCourtDoc && chip(articles, t.articlesLabel, P.gold)}
                              {isCourtDoc && chip(amounts, t.amountsLabel, "#7ed8a0")}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Risks */}
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: P.textMid, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                          {t.risksTitle}
                        </div>
                        {docIntelligence.risks.length === 0 ? (
                          <div style={{ fontSize: 13, color: "#7ed8a0", display: "flex", alignItems: "center", gap: 6 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                            {t.noRisks}
                          </div>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                            {docIntelligence.risks.map((r, i) => {
                              const high = r.level === "high";
                              const col = high ? "#e07e7e" : "#e0c97a";
                              return (
                                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: P.textMid, background: `${col}0c`, border: `1px solid ${col}25`, borderRadius: 8, padding: "8px 12px" }}>
                                  <svg style={{ flexShrink: 0, marginTop: 2 }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                  <span>{r.msg}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Ask about Document ── */}
                {docState === "done" && extractedText && (
                  <div style={{ background: P.bgCard, border: `1px solid ${P.gold}30`, borderRadius: 12, overflow: "hidden", animation: `fadeUp 380ms ${E} forwards` }}>
                    <div style={{ padding: "12px 16px", borderBottom: `1px solid ${P.gold}20`, display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: P.gold, display:"flex", alignItems:"center", gap:6 }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>{t.docAskTitle}</span>
                    </div>
                    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10, direction: rtl ? "rtl" : "ltr" }}>
                      {/* Message thread */}
                      {docChatMessages.length > 0 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 280, overflowY: "auto", paddingBottom: 4 }}>
                          {docChatMessages.map((m, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? (rtl ? "flex-start" : "flex-end") : (rtl ? "flex-end" : "flex-start") }}>
                              <div style={{
                                padding: "8px 12px", borderRadius: 10, maxWidth: "85%",
                                background: m.role === "user" ? `${P.gold}18` : P.bgInput,
                                color: m.role === "user" ? P.text : P.textMid,
                                border: `1px solid ${m.role === "user" ? P.gold + "30" : P.border}`,
                                fontSize: 13, fontFamily: ff, lineHeight: 1.55,
                              }}>{m.content}</div>
                            </div>
                          ))}
                          {docChatLoading && (
                            <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "4px 8px", color: P.gold, fontSize: 12, fontFamily: ff }}>
                              <span>{t.docAskThinking}</span>
                              {[0,1,2].map(d => <span key={d} style={{ width: 4, height: 4, borderRadius: "50%", background: P.gold, animation: `dots 1.4s infinite ${d*0.2}s` }} />)}
                            </div>
                          )}
                        </div>
                      )}
                      {/* Input row */}
                      <div style={{ display: "flex", gap: 8 }}>
                        <input
                          value={docChatInput}
                          onChange={e => setDocChatInput(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendDocQuestion(docChatInput); } }}
                          placeholder={t.docAskPlaceholder}
                          disabled={docChatLoading}
                          style={{
                            flex: 1, padding: "8px 12px", fontSize: 13, fontFamily: ff,
                            background: P.bgInput, color: P.text, border: `1px solid ${P.border}`,
                            borderRadius: 8, outline: "none", direction: rtl ? "rtl" : "ltr",
                          }}
                        />
                        <button onClick={() => sendDocQuestion(docChatInput)} disabled={docChatLoading || !docChatInput.trim()}
                          style={{
                            padding: "8px 16px", fontSize: 13, fontWeight: 600, fontFamily: ff,
                            background: P.gold, color: P.bg, border: "none", borderRadius: 8,
                            cursor: docChatLoading || !docChatInput.trim() ? "not-allowed" : "pointer",
                            opacity: docChatLoading || !docChatInput.trim() ? 0.5 : 1,
                          }}
                        >{t.docAskBtn}</button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Idle with error text */}
                {docState === "idle" && extractedText && !analysis && (
                  <div style={{ padding: 20, textAlign: "center", color: P.textDim, fontSize: 13 }}>
                    {extractedText}
                    <div style={{ marginTop: 16 }}>
                      <button onClick={resetDoc} style={{
                        padding: "8px 20px", fontSize: 13, fontWeight: 600,
                        background: P.gold, color: P.bg, border: "none",
                        borderRadius: 8, cursor: "pointer", fontFamily: ff,
                      }}>{t.reset}</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : mode === "sentence" ? (
          /* ── Sentence Estimator View ── */
          <div key="sentence" className="tab-panel" style={{ flex: 1, display: "flex", flexDirection: "column", padding: isMobile ? "20px 0 40px" : "40px 0 60px" }}>
            {sentenceResult ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: P.bgCard, border: `1px solid ${P.border}`, borderRadius: 10 }}>
                  <span style={{ fontSize: 13, color: P.text, fontFamily: ff, flex: 1 }}>{t.sentenceCrimes[sentenceCrime]}</span>
                  <button onClick={() => setSentenceResult(null)} style={{ padding: "4px 12px", fontSize: 11, fontWeight: 600, background: "transparent", color: P.gold, border: `1px solid ${P.gold}40`, borderRadius: 6, cursor: "pointer", fontFamily: ff }}>{t.sentenceReset}</button>
                </div>
                <div style={{ background: P.bgCard, border: `1px solid ${P.border}`, borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: P.textDim, textTransform: "uppercase", letterSpacing: "0.07em" }}>{t.sentenceBaseRange}</span>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 140, padding: "12px 16px", background: P.bg, borderRadius: 10, border: `1px solid ${P.border}` }}>
                      <div style={{ fontSize: 11, color: P.textDim, marginBottom: 4 }}>{t.sentencePrison}</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: P.gold, fontFamily: ff }}>{sentenceResult.base.prison}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 140, padding: "12px 16px", background: P.bg, borderRadius: 10, border: `1px solid ${P.border}` }}>
                      <div style={{ fontSize: 11, color: P.textDim, marginBottom: 4 }}>{t.sentenceFine}</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: P.gold, fontFamily: ff }}>{sentenceResult.base.fine}</div>
                    </div>
                  </div>
                </div>
                <div style={{ background: P.bgCard, border: `1px solid ${P.gold}40`, borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: P.gold, textTransform: "uppercase", letterSpacing: "0.07em" }}>{t.sentenceAdjRange}</span>
                    <span style={{ fontSize: 11, color: P.textDim }}>{t.sentenceMultiplier}: ×{sentenceResult.multiplier}</span>
                  </div>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 140, padding: "12px 16px", background: `${P.gold}10`, borderRadius: 10, border: `1px solid ${P.gold}30` }}>
                      <div style={{ fontSize: 11, color: P.textDim, marginBottom: 4 }}>{t.sentencePrison}</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: P.gold, fontFamily: ff }}>{sentenceResult.adjusted.prison}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 140, padding: "12px 16px", background: `${P.gold}10`, borderRadius: 10, border: `1px solid ${P.gold}30` }}>
                      <div style={{ fontSize: 11, color: P.textDim, marginBottom: 4 }}>{t.sentenceFine}</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: P.gold, fontFamily: ff }}>{sentenceResult.adjusted.fine}</div>
                    </div>
                  </div>
                </div>
                <div style={{ background: P.bgCard, border: `1px solid ${P.border}`, borderRadius: 12, padding: "14px 20px" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: P.textDim, textTransform: "uppercase", letterSpacing: "0.07em" }}>{t.sentenceArticles}: </span>
                  <span style={{ fontSize: 13, color: P.textMid, fontFamily: ff }}>{sentenceResult.articles}</span>
                </div>
                {(sentenceResult.aggApplied.length > 0 || sentenceResult.mitApplied.length > 0) && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {sentenceResult.aggApplied.map(k => <span key={k} style={{ padding: "4px 12px", fontSize: 11, background: "#e0707018", color: "#e07070", border: "1px solid #e0707030", borderRadius: 20, fontFamily: ff }}>{t.sentenceAggFactors[k]}</span>)}
                    {sentenceResult.mitApplied.map(k => <span key={k} style={{ padding: "4px 12px", fontSize: 11, background: `${P.gold}15`, color: P.gold, border: `1px solid ${P.gold}30`, borderRadius: 20, fontFamily: ff }}>{t.sentenceMitFactors[k]}</span>)}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ width: 52, height: 52, margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(135deg,${P.gold}18,${P.gold}08)`, border: `1px solid ${P.gold}30`, borderRadius: 14 }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={P.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  </div>
                  <h2 style={{ fontSize: isMobile ? (rtl ? 18 : 20) : (rtl ? 22 : 24), fontWeight: 700, margin: "0 0 8px", color: P.text, fontFamily: ff }}>{t.sentenceTitle}</h2>
                  <p style={{ fontSize: isMobile ? 12 : 14, color: P.textMid, maxWidth: 440, margin: "0 auto", lineHeight: 1.65 }}>{t.sentenceDesc}</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: P.textDim, textTransform: "uppercase", letterSpacing: "0.07em" }}>{t.sentenceCrimeLabel}</span>
                  <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill,minmax(${isMobile ? 130 : 160}px,1fr))`, gap: 8 }}>
                    {Object.entries(t.sentenceCrimes).map(([k, v]) => {
                      const active = sentenceCrime === k;
                      return (
                        <button key={k} onClick={() => setSentenceCrime(k)}
                          style={{ padding: "10px 14px", background: active ? `${P.gold}18` : P.bgCard, border: `1px solid ${active ? P.gold + "60" : P.border}`, borderRadius: 10, cursor: "pointer", fontFamily: ff, fontSize: 12, color: active ? P.gold : P.textMid, textAlign: rtl ? "right" : "left", transition: `all 200ms ${E}` }}
                          onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = P.goldMuted; e.currentTarget.style.background = P.bgHover; } }}
                          onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = P.border; e.currentTarget.style.background = P.bgCard; } }}
                        >{v}</button>
                      );
                    })}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: P.textDim, textTransform: "uppercase", letterSpacing: "0.07em" }}>{t.sentenceAggLabel}</span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {Object.entries(t.sentenceAggFactors).map(([k, v]) => {
                      const active = sentenceAgg.includes(k);
                      return (
                        <button key={k} onClick={() => setSentenceAgg(prev => active ? prev.filter(x => x !== k) : [...prev, k])}
                          style={{ padding: "6px 14px", fontSize: 12, fontWeight: 600, fontFamily: ff, background: active ? "#e0707018" : "transparent", color: active ? "#e07070" : P.textDim, border: `1px solid ${active ? "#e0707050" : P.border}`, borderRadius: 20, cursor: "pointer", transition: `all 200ms ${E}` }}
                        >{v}</button>
                      );
                    })}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: P.textDim, textTransform: "uppercase", letterSpacing: "0.07em" }}>{t.sentenceMitLabel}</span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {Object.entries(t.sentenceMitFactors).map(([k, v]) => {
                      const active = sentenceMit.includes(k);
                      return (
                        <button key={k} onClick={() => setSentenceMit(prev => active ? prev.filter(x => x !== k) : [...prev, k])}
                          style={{ padding: "6px 14px", fontSize: 12, fontWeight: 600, fontFamily: ff, background: active ? `${P.gold}18` : "transparent", color: active ? P.gold : P.textDim, border: `1px solid ${active ? P.gold + "50" : P.border}`, borderRadius: 20, cursor: "pointer", transition: `all 200ms ${E}` }}
                        >{v}</button>
                      );
                    })}
                  </div>
                </div>
                <button onClick={estimateSentence} disabled={!sentenceCrime}
                  className="btn-primary"
                  style={{ width: "100%", height: 50, fontSize: 14, fontWeight: 700, fontFamily: ff, background: sentenceCrime ? P.gold : P.bgHover, color: sentenceCrime ? P.bg : P.textDim, border: "none", borderRadius: 12, cursor: sentenceCrime ? "pointer" : "not-allowed", boxShadow: sentenceCrime ? `0 4px 20px #c8a45e30` : "none" }}
                >{t.sentenceBtn}</button>
              </div>
            )}
          </div>
        ) : mode === "deadline" ? (
          /* ── Legal Deadline Calculator View ── */
          <div key="deadline" className="tab-panel" style={{ flex: 1, display: "flex", flexDirection: "column", padding: isMobile ? "20px 0 40px" : "40px 0 60px" }}>
            {deadlineResult ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: P.bgCard, border: `1px solid ${P.border}`, borderRadius: 10 }}>
                  <span style={{ fontSize: 13, color: P.text, fontFamily: ff, flex: 1 }}>{t.deadlineCases[deadlineResult.caseName]}</span>
                  <span style={{ fontSize: 11, color: P.textDim, marginInlineEnd: 8 }}>{deadlineResult.statute}</span>
                  <button onClick={() => setDeadlineResult(null)} style={{ padding: "4px 12px", fontSize: 11, fontWeight: 600, background: "transparent", color: P.gold, border: `1px solid ${P.gold}40`, borderRadius: 6, cursor: "pointer", fontFamily: ff }}>{t.deadlineReset}</button>
                </div>
                {deadlineResult.next && (
                  <div style={{ padding: "14px 20px", background: `${P.gold}12`, border: `1px solid ${P.gold}40`, borderRadius: 12, display: "flex", alignItems: "center", gap: 12 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={P.gold} strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <div>
                      <div style={{ fontSize: 11, color: P.gold, marginBottom: 2 }}>{t.deadlineNext}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: P.text, fontFamily: ff }}>{t.deadlineSteps[deadlineResult.next.dayKey]} — {deadlineResult.next.date}</div>
                      <div style={{ fontSize: 12, color: P.gold }}>{deadlineResult.next.daysLeft} {t.deadlineDaysLeft}</div>
                    </div>
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {deadlineResult.steps.map((s, i) => (
                    <div key={i} style={{ padding: "14px 16px", background: P.bgCard, border: `1px solid ${s.urgent ? P.gold + "50" : P.border}`, borderRadius: 10, display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: s.passed ? P.bgHover : `${P.gold}15`, border: `1px solid ${s.passed ? P.border : P.gold + "40"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: s.passed ? P.textDim : P.gold }}>{i + 1}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: s.passed ? P.textDim : P.text, fontFamily: ff }}>{t.deadlineSteps[s.dayKey]}</div>
                        <div style={{ fontSize: 12, color: P.textDim, marginTop: 2 }}>{s.date}</div>
                      </div>
                      <div>
                        {s.passed
                          ? <span style={{ fontSize: 11, color: P.textDim, padding: "3px 10px", border: `1px solid ${P.border}`, borderRadius: 20 }}>{t.deadlinePassed}</span>
                          : s.urgent
                          ? <span style={{ fontSize: 11, color: P.gold, padding: "3px 10px", background: `${P.gold}15`, border: `1px solid ${P.gold}40`, borderRadius: 20 }}>{t.deadlineUrgent}</span>
                          : <span style={{ fontSize: 11, color: P.textDim }}>{s.daysLeft} {t.deadlineDaysLeft}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ width: 52, height: 52, margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(135deg,${P.gold}18,${P.gold}08)`, border: `1px solid ${P.gold}30`, borderRadius: 14 }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={P.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  </div>
                  <h2 style={{ fontSize: isMobile ? (rtl ? 18 : 20) : (rtl ? 22 : 24), fontWeight: 700, margin: "0 0 8px", color: P.text, fontFamily: ff }}>{t.deadlineTitle}</h2>
                  <p style={{ fontSize: isMobile ? 12 : 14, color: P.textMid, maxWidth: 440, margin: "0 auto", lineHeight: 1.65 }}>{t.deadlineDesc}</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: P.textDim, textTransform: "uppercase", letterSpacing: "0.07em" }}>{t.deadlineDateLabel}</span>
                  <input type="date" value={deadlineDate} onChange={e => setDeadlineDate(e.target.value)}
                    style={{ height: 44, padding: "0 14px", fontSize: 13, fontFamily: ff, color: P.text, background: P.bgInput, border: `1px solid ${P.border}`, borderRadius: 10, outline: "none", width: "100%", boxSizing: "border-box", colorScheme: "dark" }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: P.textDim, textTransform: "uppercase", letterSpacing: "0.07em" }}>{t.deadlineCaseLabel}</span>
                  <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill,minmax(${isMobile ? 140 : 180}px,1fr))`, gap: 8 }}>
                    {Object.entries(t.deadlineCases).map(([k, v]) => {
                      const active = deadlineCaseType === k;
                      return (
                        <button key={k} onClick={() => setDeadlineCaseType(k)}
                          style={{ padding: "10px 14px", background: active ? `${P.gold}18` : P.bgCard, border: `1px solid ${active ? P.gold + "60" : P.border}`, borderRadius: 10, cursor: "pointer", fontFamily: ff, fontSize: 12, color: active ? P.gold : P.textMid, textAlign: rtl ? "right" : "left", transition: `all 200ms ${E}` }}
                          onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = P.goldMuted; e.currentTarget.style.background = P.bgHover; } }}
                          onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = P.border; e.currentTarget.style.background = P.bgCard; } }}
                        >{v}</button>
                      );
                    })}
                  </div>
                </div>
                <button onClick={calcDeadlines} disabled={!deadlineCaseType}
                  className="btn-primary"
                  style={{ width: "100%", height: 50, fontSize: 14, fontWeight: 700, fontFamily: ff, background: deadlineCaseType ? P.gold : P.bgHover, color: deadlineCaseType ? P.bg : P.textDim, border: "none", borderRadius: 12, cursor: deadlineCaseType ? "pointer" : "not-allowed", boxShadow: deadlineCaseType ? `0 4px 20px #c8a45e30` : "none" }}
                >{t.deadlineBtn}</button>
              </div>
            )}
          </div>
        ) : mode === "learn" ? (
          /* ── Legal Concepts Learn View ── */
          <div key="learn" className="tab-panel" style={{ flex: 1, display: "flex", flexDirection: "column", padding: isMobile ? "20px 0 40px" : "40px 0 60px" }}>
            {learnResult ? (
              /* ── Result ── */
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: P.bgCard, border: `1px solid ${P.border}`, borderRadius: 10 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={P.gold} strokeWidth="1.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                  <span style={{ fontSize: 13, color: P.text, fontFamily: ff, flex: 1 }}>{learnCustom.trim() || learnConcepts[language].find(c => c.id === learnConcept)?.label || learnConcept}</span>
                  <button onClick={() => { setLearnResult(""); setLearnCustom(""); setLearnConcept(""); }} style={{ padding: "4px 12px", fontSize: 11, fontWeight: 600, background: "transparent", color: P.gold, border: `1px solid ${P.gold}40`, borderRadius: 6, cursor: "pointer", fontFamily: ff }}>{t.learnReset}</button>
                </div>
                <div className="card" style={{ background: P.bgCard, border: `1px solid ${P.gold}30`, borderRadius: 12, overflow: "hidden", animation: `slideInUp 300ms cubic-bezier(0.22,1,0.36,1) forwards`, boxShadow: `0 6px 32px #0007, 0 1px 4px #c8a45e10` }}>
                  <div style={{ padding: "12px 16px", borderBottom: `1px solid ${P.gold}25`, display: "flex", alignItems: "center", gap: 8 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={P.gold} strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    <span style={{ fontSize: 13, fontWeight: 600, color: P.gold }}>{t.learnTitle}</span>
                    <div style={{ marginInlineStart: "auto", display: "flex", gap: 6 }}>
                      <button onClick={() => copyToClipboard(learnResult, "learn")} style={{ padding: "3px 10px", fontSize: 11, fontWeight: 600, fontFamily: ff, background: "transparent", color: copiedId === "learn" ? P.gold : P.textDim, border: `1px solid ${copiedId === "learn" ? P.gold + "40" : P.border}`, borderRadius: 6, cursor: "pointer", transition: `all 200ms ${E}` }}>{copiedId === "learn" ? t.copied : t.copy}</button>
                    </div>
                  </div>
                  <div style={{ padding: 20, fontSize: 14, lineHeight: 1.9, color: P.textMid, whiteSpace: "pre-wrap", fontFamily: ff, direction: rtl ? "rtl" : "ltr" }}>{learnResult}</div>
                </div>
              </div>
            ) : (
              /* ── Picker ── */
              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                {/* Hero */}
                <div style={{ textAlign: "center" }}>
                  <div style={{ width: 52, height: 52, margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(135deg,${P.gold}18,${P.gold}08)`, border: `1px solid ${P.gold}30`, borderRadius: 14 }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={P.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                  </div>
                  <h2 style={{ fontSize: isMobile ? (rtl ? 20 : 22) : (rtl ? 24 : 26), fontWeight: 700, margin: "0 0 8px", color: P.text, fontFamily: ff }}>{t.learnTitle}</h2>
                  <p style={{ fontSize: isMobile ? 12 : 14, color: P.textMid, maxWidth: 440, margin: "0 auto", lineHeight: 1.65 }}>{t.learnDesc}</p>
                </div>

                {/* Profile selectors */}
                <div style={{ background: P.bgCard, border: `1px solid ${P.border}`, borderRadius: 12, padding: isMobile ? "12px 12px" : "16px 20px", display: "flex", flexWrap: "wrap", gap: isMobile ? 14 : 20 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: P.textDim, textTransform: "uppercase", letterSpacing: "0.07em", width: "100%" }}>{t.learnProfile}</span>
                  {[
                    { label: t.learnLevelLabel, key: "level", state: learnLevel, set: setLearnLevel, opts: Object.entries(t.learnLevels) },
                    { label: t.learnStyleLabel, key: "style", state: learnStyle, set: setLearnStyle, opts: Object.entries(t.learnStyles) },
                    { label: t.learnBgLabel,    key: "bg",    state: learnBg,    set: setLearnBg,    opts: Object.entries(t.learnBgs) },
                  ].map(({ label, state, set, opts }) => (
                    <div key={label} style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 120 }}>
                      <span style={{ fontSize: 11, color: P.textDim }}>{label}</span>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {opts.map(([k, v]) => {
                          const active = state === k;
                          return (
                            <button key={k} onClick={() => set(k)} style={{ padding: "4px 12px", fontSize: 11, fontWeight: 600, fontFamily: ff, background: active ? P.gold : "transparent", color: active ? P.bg : P.textDim, border: `1px solid ${active ? P.gold : P.border}`, borderRadius: 20, cursor: "pointer", transition: `all 200ms ${E}` }}>{v}</button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Concept grid */}
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: P.textDim, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>{t.learnConceptsTitle}</p>
                  <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill,minmax(${isMobile ? 140 : 200}px,1fr))`, gap: 8 }}>
                    {learnConcepts[language].map((c) => {
                      const active = learnConcept === c.id && !learnCustom.trim();
                      return (
                        <button key={c.id} onClick={() => { setLearnConcept(c.id); setLearnCustom(""); }}
                          style={{ padding: "12px 14px", background: active ? `${P.gold}18` : P.bgCard, border: `1px solid ${active ? P.gold + "60" : P.border}`, borderRadius: 10, cursor: "pointer", textAlign: rtl ? "right" : "left", transition: `all 200ms ${E}`, fontFamily: ff }}
                          onMouseEnter={(e) => { if (!active) { e.currentTarget.style.borderColor = P.goldMuted; e.currentTarget.style.background = P.bgHover; } }}
                          onMouseLeave={(e) => { if (!active) { e.currentTarget.style.borderColor = P.border; e.currentTarget.style.background = P.bgCard; } }}
                        >
                          <div style={{ fontSize: 13, fontWeight: 600, color: active ? P.gold : P.text, marginBottom: 3 }}>{c.label}</div>
                          <div style={{ fontSize: 11, color: P.textDim }}>{c.sub}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom concept input */}
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: P.textDim, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>{t.learnCustomLabel}</p>
                  <input
                    type="text" value={learnCustom}
                    onChange={(e) => { setLearnCustom(e.target.value); if (e.target.value) setLearnConcept(""); }}
                    placeholder={t.learnCustomPlaceholder}
                    className="input-field"
                    style={{ width: "100%", height: 44, padding: "0 14px", fontSize: 13, fontFamily: ff, color: P.text, background: P.bgInput, border: `1px solid ${P.border}`, borderRadius: 10, outline: "none", boxSizing: "border-box", direction: rtl ? "rtl" : "ltr" }}
                    onKeyDown={(e) => { if (e.key === "Enter") explainConcept(); }}
                  />
                </div>

                {/* Explain button */}
                <button onClick={explainConcept} disabled={learnLoading || (!learnConcept && !learnCustom.trim())}
                  className="btn-primary"
                  style={{ width: "100%", height: 50, fontSize: 14, fontWeight: 700, fontFamily: ff, background: (learnLoading || (!learnConcept && !learnCustom.trim())) ? P.bgHover : P.gold, color: (learnLoading || (!learnConcept && !learnCustom.trim())) ? P.textDim : P.bg, border: "none", borderRadius: 12, cursor: (learnLoading || (!learnConcept && !learnCustom.trim())) ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: (!learnLoading && (learnConcept || learnCustom.trim())) ? `0 4px 20px #c8a45e30` : "none" }}>
                  {learnLoading ? (
                    <>
                      <div style={{ display: "flex", gap: 4 }}>{[0,1,2].map(d => <span key={d} style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", animation: `dots 1.4s infinite ${d*0.2}s` }} />)}</div>
                      <span>{t.learnExplaining}</span>
                    </>
                  ) : t.learnBtnLabel}
                </button>
              </div>
            )}
          </div>
        ) : !chat ? (
          /* ── Welcome ── */
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: isMobile ? "30px 0 20px" : "60px 0 40px", animation: `fadeUp 500ms ${E} forwards` }}>

            {/* Hero */}
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <div style={{
                width: 60, height: 60, margin: "0 auto 24px",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: `linear-gradient(135deg, ${P.gold}22, ${P.gold}0a)`,
                border: `1px solid ${P.gold}40`,
                borderRadius: 16,
                boxShadow: `0 4px 24px #c8a45e18, 0 0 0 1px #c8a45e08`,
              }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={P.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3v18M3 7l3-4 3 4M15 7l3-4 3 4" /><path d="M3 7c0 3 3 5 3 5s3-2 3-5M15 7c0 3 3 5 3 5s3-2 3-5" />
                </svg>
              </div>
              <h1 style={{ fontSize: isMobile ? (rtl ? 24 : 26) : (rtl ? 32 : 36), fontWeight: 700, margin: "0 0 10px", color: P.text, fontFamily: ff, letterSpacing: rtl ? 0 : "-0.5px", lineHeight: 1.2 }}>{t.title}</h1>
              <p style={{ fontSize: isMobile ? 13 : 15, color: P.textMid, maxWidth: 440, margin: "0 auto", lineHeight: 1.65 }}>{t.subtitle}</p>
            </div>

            {/* Domains – horizontal pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: isMobile ? 6 : 8, justifyContent: "center", marginBottom: isMobile ? 24 : 40 }}>
              {legalDomains[language].map((d, i) => (
                <div key={i} className="card" style={{
                  padding: isMobile ? "8px 12px" : "10px 18px",
                  background: P.bgCard,
                  border: `1px solid ${P.border}`,
                  borderRadius: 10,
                  cursor: "default",
                  animation: `fadeUp 320ms cubic-bezier(0.22,1,0.36,1) forwards`,
                  animationDelay: `${80 + i * 60}ms`,
                  opacity: 0,
                  boxShadow: `0 2px 12px #0004`,
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = P.goldMuted; e.currentTarget.style.background = P.bgHover; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = P.border; e.currentTarget.style.background = P.bgCard; }}
                >
                  <div style={{ fontSize: isMobile ? 12 : 13, fontWeight: 600, color: P.text, marginBottom: 2 }}>{d.title}</div>
                  <div style={{ fontSize: isMobile ? 10 : 11, color: P.textDim }}>{d.desc}</div>
                </div>
              ))}
            </div>

            {/* Quick questions */}
            <div style={{ maxWidth: 520, margin: "0 auto", width: "100%" }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: P.textDim, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 14, textAlign: "center" }}>{t.quickTitle}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {quickQuestions[language].map((q, i) => (
                  <button key={i} onClick={() => send(q)}
                    className="btn-press card"
                    style={{
                      padding: isMobile ? "10px 14px" : "13px 18px",
                      background: P.bgCard,
                      border: `1px solid ${P.border}`,
                      borderRadius: 10,
                      color: P.textMid,
                      fontSize: 13.5,
                      fontFamily: ff,
                      textAlign: rtl ? "right" : "left",
                      cursor: "pointer",
                      animation: `fadeUp 320ms cubic-bezier(0.22,1,0.36,1) forwards`,
                      animationDelay: `${160 + i * 45}ms`,
                      opacity: 0,
                      lineHeight: 1.5,
                      boxShadow: `0 2px 10px #0003`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = P.goldMuted;
                      e.currentTarget.style.color = P.goldLight;
                      e.currentTarget.style.background = P.bgHover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = P.border;
                      e.currentTarget.style.color = P.textMid;
                      e.currentTarget.style.background = P.bgCard;
                    }}
                  >{q}</button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ── Messages ── */
          <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "16px 0 120px" : "24px 0 140px", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: rtl ? "flex-start" : "flex-end", gap: 6, marginBottom: 4, flexShrink: 0 }}>
              {messages.some((m) => m.role === "assistant") && !loading && (
                <button onClick={exportChatPdf} style={{ padding: "5px 12px", fontSize: 11, fontWeight: 600, fontFamily: ff, background: `${P.gold}18`, color: P.gold, border: `1px solid ${P.gold}40`, borderRadius: 8, cursor: "pointer" }}>{t.exportPdf}</button>
              )}
              <button onClick={clearChatHistory}
                style={{ padding: "5px 12px", fontSize: 11, fontWeight: 600, fontFamily: ff, background: "transparent", color: P.textDim, border: `1px solid ${P.border}`, borderRadius: 8, cursor: "pointer" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#e07070"; e.currentTarget.style.borderColor = "#e0707040"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = P.textDim; e.currentTarget.style.borderColor = P.border; }}
              >{t.clearChat}</button>
            </div>
            {messages.map((m, i) => {
              const u = m.role === "user";
              return (
                <div key={i} className="msg-wrapper" style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: u ? (rtl ? "flex-start" : "flex-end") : (rtl ? "flex-end" : "flex-start"),
                  animation: `msgIn 300ms cubic-bezier(0.22,1,0.36,1) both`,
                  animationDelay: `${Math.min(i, 3) * 30}ms`,
                  gap: 3,
                }}>
                  <div className="msg-bubble" style={{
                    maxWidth: u ? "80%" : "92%",
                    padding: "12px 16px",
                    borderRadius: u ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    ...(rtl && { borderRadius: u ? "16px 16px 16px 4px" : "16px 16px 4px 16px" }),
                    fontSize: 14,
                    lineHeight: 1.75,
                    fontFamily: ff,
                    whiteSpace: "pre-wrap",
                    background: u ? P.userBubble : P.aiBubble,
                    color: u ? P.text : P.textMid,
                    border: `1px solid ${u ? P.borderLight : P.border}`,
                    boxShadow: `0 2px 12px #0003`,
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = u ? P.goldMuted : P.borderLight; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = u ? P.borderLight : P.border; }}
                  >{m.content}</div>
                  {!u && (
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                      {/* Copy */}
                      <button className="msg-action-btn" onClick={() => copyToClipboard(m.content, `msg-${i}`)}
                        style={{
                          padding: "3px 10px", fontSize: 10.5, fontWeight: 600, fontFamily: ff,
                          background: copiedId === `msg-${i}` ? `${P.gold}20` : P.bgInput,
                          color: copiedId === `msg-${i}` ? P.gold : P.textDim,
                          border: `1px solid ${copiedId === `msg-${i}` ? P.gold + "50" : P.border}`,
                          borderRadius: 6, cursor: "pointer",
                        }}
                      >{copiedId === `msg-${i}` ? t.copied : t.copy}</button>
                      {/* Export PDF */}
                      <button className="msg-action-btn" onClick={() => downloadMsgPdf(m.content, i)}
                        style={{
                          padding: "3px 10px", fontSize: 10.5, fontWeight: 600, fontFamily: ff,
                          background: P.bgInput, color: P.textDim,
                          border: `1px solid ${P.border}`,
                          borderRadius: 6, cursor: "pointer",
                        }}
                      >{t.exportPdf}</button>
                      {/* Bookmark */}
                      <button className="msg-action-btn" onClick={() => saveBookmark(i)}
                        style={{
                          padding: "3px 8px", fontSize: 10.5, fontWeight: 600, fontFamily: ff,
                          background: isBookmarked(i) ? `${P.gold}20` : P.bgInput,
                          color: isBookmarked(i) ? P.gold : P.textDim,
                          border: `1px solid ${isBookmarked(i) ? P.gold + "50" : P.border}`,
                          borderRadius: 6, cursor: "pointer",
                        }}
                      >{isBookmarked(i) ? t.bookmarkSaved : t.bookmarkSave}</button>
                      {/* TTS */}
                      <button className="msg-action-btn" onClick={() => speakText(m.content, `msg-${i}`)}
                        style={{
                          padding: "3px 8px", fontSize: 10.5, fontWeight: 600, fontFamily: ff,
                          background: speakingId === `msg-${i}` ? `${P.gold}20` : P.bgInput,
                          color: speakingId === `msg-${i}` ? P.gold : P.textDim,
                          border: `1px solid ${speakingId === `msg-${i}` ? P.gold + "50" : P.border}`,
                          borderRadius: 6, cursor: "pointer",
                        }}
                      ><span style={{display:"flex",alignItems:"center",gap:3}}>{speakingId === `msg-${i}`
                          ? <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>{t.ttsStop}</>
                          : <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>{t.ttsRead}</>
                        }</span></button>
                      {/* Rating */}
                      {ratings[i] ? (
                        <span style={{ padding: "3px 8px", fontSize: 10.5, color: P.gold, fontFamily: ff }}>{t.ratingThanks}</span>
                      ) : (
                        <>
                          <button className="msg-action-btn" onClick={() => handleRate(i, "up")}
                            style={{ padding: "4px 8px", fontSize: 11, background: P.bgInput, color: P.textDim, border: `1px solid ${P.border}`, borderRadius: 6, cursor: "pointer", display:"flex", alignItems:"center" }}
                          ><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg></button>
                          <button className="msg-action-btn" onClick={() => handleRate(i, "down")}
                            style={{ padding: "4px 8px", fontSize: 11, background: P.bgInput, color: P.textDim, border: `1px solid ${P.border}`, borderRadius: 6, cursor: "pointer", display:"flex", alignItems:"center" }}
                          ><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/><path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg></button>
                        </>
                      )}
                      {/* WhatsApp share */}
                      <button className="msg-action-btn" onClick={() => shareWhatsApp(messages[i-1]?.content || "", m.content)}
                        style={{ padding: "3px 8px", fontSize: 11, background: P.bgInput, color: P.textDim, border: `1px solid ${P.border}`, borderRadius: 6, cursor: "pointer" }}
                        title={t.shareWhatsApp}
                      ><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.555 4.116 1.524 5.847L0 24l6.335-1.509A11.932 11.932 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.882a9.875 9.875 0 0 1-5.031-1.371l-.361-.214-3.741.981.998-3.648-.235-.374A9.861 9.861 0 0 1 2.118 12C2.118 6.53 6.53 2.118 12 2.118c5.471 0 9.882 4.412 9.882 9.882 0 5.471-4.411 9.882-9.882 9.882z"/></svg></button>
                    </div>
                  )}
                </div>
              );
            })}
            {loading && (
              <div style={{ display: "flex", justifyContent: rtl ? "flex-end" : "flex-start", animation: `msgIn 260ms ${E} forwards` }}>
                <div style={{ padding: "14px 18px", borderRadius: 16, background: P.aiBubble, border: `1px solid ${P.border}`, display: "flex", flexDirection: "column", gap: 10, minWidth: 200, maxWidth: 300 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 12, color: P.gold }}>{t.thinking}</span>
                    <span style={{ display: "inline-flex", gap: 3 }}>
                      {[0, 1, 2].map((d) => (
                        <span key={d} style={{ width: 4, height: 4, borderRadius: "50%", background: P.gold, animation: `dots 1.4s infinite ${d * 0.2}s` }} />
                      ))}
                    </span>
                  </div>
                  <div className="skeleton-line" style={{ height: 11, width: "82%" }} />
                  <div className="skeleton-line" style={{ height: 11, width: "62%" }} />
                  <div className="skeleton-line" style={{ height: 11, width: "75%" }} />
                </div>
              </div>
            )}
            {followUps.length > 0 && !loading && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "8px 0 4px", animation: `fadeUp 300ms ${E} forwards` }}>
                <span style={{ fontSize: 11, color: P.textDim, width: "100%", marginBottom: 2, fontFamily: ff }}>{t.followUpTitle}</span>
                {followUps.map((q, i) => (
                  <button key={i} onClick={() => { setFollowUps([]); send(q); }}
                    style={{ padding: "7px 14px", fontSize: 12, fontFamily: ff, background: "transparent", color: P.textMid, border: `1px solid ${P.border}`, borderRadius: 20, cursor: "pointer", transition: `all 200ms ${E}`, textAlign: rtl ? "right" : "left" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = P.goldMuted; e.currentTarget.style.color = P.gold; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = P.border; e.currentTarget.style.color = P.textMid; }}
                  >{q}</button>
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>
        )}
      </main>

      {/* ── Input bar (chat mode only) ── */}
      {mode === "chat" && (
      <div style={{
        position: chat ? "fixed" : "sticky", bottom: 0, left: 0, right: 0, zIndex: 20,
        padding: isMobile ? "8px 10px 12px" : "12px 20px 20px",
        background: `linear-gradient(to top, ${P.bg} 70%, transparent)`,
      }}>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", gap: isMobile ? 6 : 10, alignItems: "center" }}>
          <input
            type="text" value={input}
            onChange={(e) => { setInput(e.target.value); if (voiceError) setVoiceError(""); }}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={t.placeholder}
            disabled={loading}
            className="input-field"
            style={{
              flex: 1, height: isMobile ? 42 : 48, padding: isMobile ? "0 12px" : "0 18px",
              fontSize: isMobile ? 13 : 14, fontFamily: ff,
              color: P.text,
              background: P.bgInput,
              border: `1px solid ${P.border}`,
              borderRadius: 12, outline: "none",
              direction: rtl ? "rtl" : "ltr",
            }}
          />
          {navigator.mediaDevices && (
            <button
              onClick={voiceTranscribing ? undefined : isListening ? stopVoice : startVoice}
              title={voiceTranscribing ? t.voiceTranscribing : isListening ? t.voiceTapToStop : t.voiceListen}
              style={{
                width: isMobile ? 38 : 44, height: isMobile ? 38 : 44, borderRadius: 10,
                border: `1px solid ${isListening ? P.gold + "60" : voiceTranscribing ? P.gold + "40" : P.border}`,
                background: isListening ? `${P.gold}18` : voiceTranscribing ? `${P.gold}10` : "transparent",
                color: isListening ? P.gold : voiceTranscribing ? P.goldMuted : P.textDim,
                cursor: voiceTranscribing ? "default" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: `all 200ms ${E}`, flexShrink: 0,
              }}>
              {voiceTranscribing
                ? <span style={{ display: "inline-flex", gap: 3 }}>
                    {[0, 1, 2].map((d) => (
                      <span key={d} style={{
                        width: 4, height: 4, borderRadius: "50%", background: "currentColor",
                        animation: `dots 1.2s infinite ${d * 0.2}s`,
                      }} />
                    ))}
                  </span>
                : isListening
                ? <svg width="16" height="16" viewBox="0 0 24 24" fill={P.gold}><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>}
            </button>
          )}
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            className="btn-press"
            style={{
              width: isMobile ? 38 : 44, height: isMobile ? 38 : 44,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: loading || !input.trim() ? P.bgInput : P.gold,
              color: loading || !input.trim() ? P.textDim : P.bg,
              border: "none", borderRadius: 12,
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              flexShrink: 0,
              boxShadow: !loading && input.trim() ? `0 2px 10px #c8a45e28` : "none",
            }}
            onMouseEnter={(e) => { if (!loading && input.trim()) { e.currentTarget.style.background = P.goldLight; e.currentTarget.style.boxShadow = `0 4px 16px #c8a45e40`; } }}
            onMouseLeave={(e) => { if (!loading && input.trim()) { e.currentTarget.style.background = P.gold; e.currentTarget.style.boxShadow = `0 2px 10px #c8a45e28`; } }}
          ><SendIcon /></button>
        </div>
        <p style={{ maxWidth: 760, margin: "10px auto 0", fontSize: 11, color: P.textDim, textAlign: "center", lineHeight: 1.4 }}>{t.disclaimer}</p>
        {voiceError && (
          <p style={{ maxWidth: 760, margin: "6px auto 0", fontSize: 12, color: "#e07070", textAlign: "center", fontFamily: ff }}>{voiceError}</p>
        )}
      </div>
      )}

      {/* ── Bookmarks overlay + drawer ── */}
      <div className={`bm-overlay${showBookmarks ? " open" : ""}`} onClick={() => setShowBookmarks(false)} />
      <div className={`bm-drawer${showBookmarks ? " open" : ""}`} dir={rtl ? "rtl" : "ltr"}>
        <div style={{ padding: "18px 20px 14px", borderBottom: `1px solid ${P.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: ff, fontWeight: 700, fontSize: 15, color: P.text }}>{t.bookmarksTitle}</span>
          <button onClick={() => setShowBookmarks(false)} style={{ background: "none", border: "none", color: P.textDim, cursor: "pointer", fontSize: 18 }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
          {bookmarks.length === 0 ? (
            <p style={{ color: P.textDim, fontFamily: ff, fontSize: 13, textAlign: "center", marginTop: 40 }}>{t.bookmarksEmpty}</p>
          ) : bookmarks.map((bm) => (
            <div key={bm.id} style={{ background: P.bgInput, border: `1px solid ${P.border}`, borderRadius: 10, padding: "12px 14px" }}>
              {bm.question && <p style={{ fontFamily: ff, fontSize: 11, color: P.textDim, margin: "0 0 6px", borderBottom: `1px solid ${P.border}`, paddingBottom: 6 }}>❓ {bm.question.slice(0, 120)}{bm.question.length > 120 ? "…" : ""}</p>}
              <p style={{ fontFamily: ff, fontSize: 12, color: P.text, margin: "0 0 8px", lineHeight: 1.5 }}>{bm.answer.slice(0, 300)}{bm.answer.length > 300 ? "…" : ""}</p>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => { navigator.clipboard.writeText(bm.answer); }}
                  style={{ padding: "3px 10px", fontSize: 11, fontFamily: ff, background: "transparent", color: P.textDim, border: `1px solid ${P.border}`, borderRadius: 6, cursor: "pointer" }}
                >{t.shareCopy}</button>
                <button onClick={() => removeBookmark(bm.id)}
                  style={{ padding: "3px 10px", fontSize: 11, fontFamily: ff, background: "transparent", color: "#e07070", border: "1px solid #e0707040", borderRadius: 6, cursor: "pointer" }}
                >{t.bookmarkRemove}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

