import React, { useState, useRef, useEffect } from "react";

const API_URL = "http://localhost:8787/api/moroccan-law-qa";
const ANALYZE_URL = "http://localhost:8787/api/analyze-document";
const EXTRACT_URL = "http://localhost:8787/api/extract-with-llm";

/* ─── Translations ─── */
const UI = {
  ar: {
    title: "المساعد القانوني",
    brand: "القانون المغربي",
    subtitle: "اطرح سؤالك القانوني واحصل على إجابة دقيقة مستندة إلى التشريع المغربي",
    placeholder: "اكتب سؤالك هنا...",
    send: "إرسال",
    thinking: "جاري التحليل...",
    disclaimer: "هذه المعلومات للتوعية القانونية العامة ولا تُغني عن استشارة محامٍ مختص.",
    quickTitle: "اختر سؤالاً للبدء",
    domainsTitle: "التخصصات",
    chatTab: "محادثة",
    docTab: "تحليل الوثائق",
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
  },
  fr: {
    title: "Assistant Juridique",
    brand: "Droit Marocain",
    subtitle: "Posez votre question et obtenez une réponse précise basée sur la législation marocaine",
    placeholder: "Écrivez votre question...",
    send: "Envoyer",
    thinking: "Analyse en cours...",
    disclaimer: "Informations à titre éducatif uniquement — consultez un avocat pour un conseil personnalisé.",
    quickTitle: "Commencez par une question",
    domainsTitle: "Spécialisations",
    chatTab: "Chat",
    docTab: "Analyse de Documents",
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
  },
  en: {
    title: "Legal Assistant",
    brand: "Moroccan Law",
    subtitle: "Ask your question and get a precise answer grounded in Moroccan legislation",
    placeholder: "Write your question...",
    send: "Send",
    thinking: "Analyzing...",
    disclaimer: "For educational purposes only — consult a licensed attorney for case-specific advice.",
    quickTitle: "Start with a question",
    domainsTitle: "Specializations",
    chatTab: "Chat",
    docTab: "Document Analysis",
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
};

/* ─── CSS keyframes ─── */
const styleId = "mlq-styles";
if (typeof document !== "undefined" && !document.getElementById(styleId)) {
  const s = document.createElement("style");
  s.id = styleId;
  s.textContent = `
    @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
    @keyframes msgIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
    @keyframes dots { 0%,80%,100%{opacity:.3} 40%{opacity:1} }
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
  `;
  document.head.appendChild(s);
}

/* ─── Design tokens ─── */
const P = {
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
const E = "cubic-bezier(0.4,0,0.2,1)";
const F = '"Josefin Sans",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';
const FA = '"Cairo",-apple-system,BlinkMacSystemFont,sans-serif';

export default function MoroccanLawQA() {
  const [language, setLanguage] = useState("ar");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("chat"); // "chat" | "doc"
  const [docState, setDocState] = useState("idle"); // "idle" | "extracting" | "analyzing" | "done"
  const [extractedText, setExtractedText] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [fileName, setFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [docIntelligence, setDocIntelligence] = useState(null);
  const endRef = useRef(null);
  const fileRef = useRef(null);

  const rtl = language === "ar";
  const t = UI[language];
  const ff = rtl ? FA : F;

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

  async function send(text) {
    const c = (text || input).trim();
    if (!c || loading) return;
    setInput("");
    const userMsg = { role: "user", content: c };
    const next = [...messages, userMsg];
    setMessages(next);
    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, language }),
      });
      const d = await res.json();
      setMessages((p) => [...p, { role: "assistant", content: d.content || "No response received." }]);
    } catch {
      setMessages((p) => [...p, { role: "assistant", content: "Connection error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  const chat = messages.length > 0;

  /* ── Document processing ── */
  function getTesseractLang() {
    return language === "ar" ? "ara" : language === "fr" ? "fra" : "eng";
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
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Analysis failed");
    return data.analysis;
  }

  async function extractWithLLM(text) {
    const res = await fetch(EXTRACT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text.slice(0, 6000), language }),
    });
    const data = await res.json();
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
        { text: `${language === "ar" ? "السؤال" : language === "fr" ? "Question" : "Question"} ${idx + 1}`, type: "h2" },
        { text: p.q, type: "user" },
        { text: language === "ar" ? "الجواب" : language === "fr" ? "Réponse" : "Answer", type: "h2" },
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
    const qLabel = language === "ar" ? "السؤال" : language === "fr" ? "Question" : "Question";
    const aLabel = language === "ar" ? "الجواب" : language === "fr" ? "Réponse" : "Answer";
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

  const ScaleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={P.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18M3 7l3-4 3 4M15 7l3-4 3 4" /><path d="M3 7c0 3 3 5 3 5s3-2 3-5M15 7c0 3 3 5 3 5s3-2 3-5" />
    </svg>
  );

  return (
    <div style={{ minHeight: "100vh", background: P.bg, color: P.text, fontFamily: ff, direction: rtl ? "rtl" : "ltr", display: "flex", flexDirection: "column" }}>

      {/* ── Header ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 20,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 32px",
        background: "rgba(26,21,16,0.92)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
        borderBottom: `1px solid ${P.border}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ScaleIcon />
          <span style={{ fontSize: 17, fontWeight: 600, color: P.gold, letterSpacing: "0.3px" }}>{t.brand}</span>
        </div>
        {/* Mode toggle */}
        <div style={{ display: "flex", gap: 4, background: P.bgInput, borderRadius: 10, padding: 3 }}>
          {[
            { m: "chat", l: t.chatTab },
            { m: "doc", l: t.docTab },
          ].map(({ m, l }) => {
            const on = mode === m;
            return (
              <button key={m} onClick={() => setMode(m)}
                style={{
                  padding: "6px 16px", fontSize: 12, fontWeight: 600, fontFamily: ff,
                  background: on ? P.gold : "transparent",
                  color: on ? P.bg : P.textDim,
                  border: "none", borderRadius: 8, cursor: "pointer",
                  transition: `all 250ms ${E}`,
                  whiteSpace: "nowrap",
                }}
              >{l}</button>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {[
            { c: "ar", l: "ع" },
            { c: "fr", l: "FR" },
            { c: "en", l: "EN" },
          ].map(({ c, l }) => {
            const on = language === c;
            return (
              <button key={c} onClick={() => { setLanguage(c); setMessages([]); setInput(""); }}
                style={{
                  padding: "6px 14px", fontSize: 12, fontWeight: 600, fontFamily: c === "ar" ? FA : F,
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
        </div>
      </header>

      {/* ── Content ── */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", maxWidth: 760, width: "100%", margin: "0 auto", padding: "0 20px", position: "relative" }}>

        {mode === "doc" ? (
          /* ── Document Analysis View ── */
          <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "40px 0 40px", animation: `fadeUp 400ms ${E} forwards` }}>
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
                  <h2 style={{ fontSize: rtl ? 26 : 28, fontWeight: 700, margin: "0 0 10px", color: P.text, fontFamily: ff }}>{t.uploadTitle}</h2>
                  <p style={{ fontSize: 14, color: P.textMid, maxWidth: 440, margin: "0 auto", lineHeight: 1.65 }}>{t.uploadDesc}</p>
                </div>

                <div
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
                  style={{
                    width: "100%", maxWidth: 480,
                    padding: "48px 32px",
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
                    padding: "32px", textAlign: "center",
                    background: P.bgCard, border: `1px solid ${P.border}`, borderRadius: 12,
                  }}>
                    <div style={{ display: "inline-flex", gap: 6, marginBottom: 14 }}>
                      {[0, 1, 2].map((d) => (
                        <span key={d} style={{ width: 8, height: 8, borderRadius: "50%", background: P.gold, animation: `dots 1.4s infinite ${d * 0.2}s` }} />
                      ))}
                    </div>
                    <p style={{ fontSize: 14, color: P.textMid, margin: 0 }}>
                      {docState === "extracting" ? t.extracting : t.analyzing}
                    </p>
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
                  <div style={{
                    background: P.bgCard, border: `1px solid ${P.gold}30`, borderRadius: 12,
                    overflow: "hidden",
                    animation: `fadeUp 400ms ${E} forwards`,
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
        ) : !chat ? (
          /* ── Welcome ── */
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 0 40px", animation: `fadeUp 500ms ${E} forwards` }}>

            {/* Hero */}
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <div style={{
                width: 56, height: 56, margin: "0 auto 24px",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: `linear-gradient(135deg, ${P.gold}18, ${P.gold}08)`,
                border: `1px solid ${P.gold}30`,
                borderRadius: 14,
              }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={P.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3v18M3 7l3-4 3 4M15 7l3-4 3 4" /><path d="M3 7c0 3 3 5 3 5s3-2 3-5M15 7c0 3 3 5 3 5s3-2 3-5" />
                </svg>
              </div>
              <h1 style={{ fontSize: rtl ? 32 : 36, fontWeight: 700, margin: "0 0 10px", color: P.text, fontFamily: ff, letterSpacing: rtl ? 0 : "-0.5px", lineHeight: 1.2 }}>{t.title}</h1>
              <p style={{ fontSize: 15, color: P.textMid, maxWidth: 440, margin: "0 auto", lineHeight: 1.65 }}>{t.subtitle}</p>
            </div>

            {/* Domains – horizontal pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 40 }}>
              {legalDomains[language].map((d, i) => (
                <div key={i} style={{
                  padding: "10px 18px",
                  background: P.bgCard,
                  border: `1px solid ${P.border}`,
                  borderRadius: 10,
                  transition: `all 250ms ${E}`,
                  cursor: "default",
                  animation: `fadeUp 300ms ${E} forwards`,
                  animationDelay: `${80 + i * 60}ms`,
                  opacity: 0,
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = P.goldMuted; e.currentTarget.style.background = P.bgHover; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = P.border; e.currentTarget.style.background = P.bgCard; }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: P.text, marginBottom: 2 }}>{d.title}</div>
                  <div style={{ fontSize: 11, color: P.textDim }}>{d.desc}</div>
                </div>
              ))}
            </div>

            {/* Quick questions */}
            <div style={{ maxWidth: 520, margin: "0 auto", width: "100%" }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: P.textDim, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 14, textAlign: "center" }}>{t.quickTitle}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {quickQuestions[language].map((q, i) => (
                  <button key={i} onClick={() => send(q)}
                    style={{
                      padding: "13px 18px",
                      background: P.bgCard,
                      border: `1px solid ${P.border}`,
                      borderRadius: 10,
                      color: P.textMid,
                      fontSize: 13.5,
                      fontFamily: ff,
                      textAlign: rtl ? "right" : "left",
                      cursor: "pointer",
                      transition: `all 250ms ${E}`,
                      animation: `fadeUp 300ms ${E} forwards`,
                      animationDelay: `${160 + i * 40}ms`,
                      opacity: 0,
                      lineHeight: 1.5,
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
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 0 140px", display: "flex", flexDirection: "column", gap: 12 }}>
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
                  animation: `msgIn 250ms ${E} forwards`,
                  gap: 3,
                }}>
                  <div style={{
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
                    transition: `border-color 250ms ${E}`,
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = u ? P.goldMuted : P.borderLight; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = u ? P.borderLight : P.border; }}
                  >{m.content}</div>
                  {!u && (
                    <div style={{ display: "flex", gap: 5 }}>
                      <button className="msg-action-btn" onClick={() => copyToClipboard(m.content, `msg-${i}`)}
                        style={{
                          padding: "3px 10px", fontSize: 10.5, fontWeight: 600, fontFamily: ff,
                          background: copiedId === `msg-${i}` ? `${P.gold}20` : P.bgInput,
                          color: copiedId === `msg-${i}` ? P.gold : P.textDim,
                          border: `1px solid ${copiedId === `msg-${i}` ? P.gold + "50" : P.border}`,
                          borderRadius: 6, cursor: "pointer",
                        }}
                      >{copiedId === `msg-${i}` ? t.copied : t.copy}</button>
                      <button className="msg-action-btn" onClick={() => downloadMsgPdf(m.content, i)}
                        style={{
                          padding: "3px 10px", fontSize: 10.5, fontWeight: 600, fontFamily: ff,
                          background: P.bgInput, color: P.textDim,
                          border: `1px solid ${P.border}`,
                          borderRadius: 6, cursor: "pointer",
                        }}
                      >{t.exportPdf}</button>
                    </div>
                  )}
                </div>
              );
            })}
            {loading && (
              <div style={{ display: "flex", justifyContent: rtl ? "flex-end" : "flex-start", animation: `msgIn 250ms ${E} forwards` }}>
                <div style={{ padding: "12px 18px", borderRadius: 16, background: P.aiBubble, border: `1px solid ${P.border}`, color: P.gold, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                  <span>{t.thinking}</span>
                  <span style={{ display: "inline-flex", gap: 3 }}>
                    {[0, 1, 2].map((d) => (
                      <span key={d} style={{ width: 4, height: 4, borderRadius: "50%", background: P.gold, animation: `dots 1.4s infinite ${d * 0.2}s` }} />
                    ))}
                  </span>
                </div>
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
        padding: "12px 20px 20px",
        background: `linear-gradient(to top, ${P.bg} 70%, transparent)`,
      }}>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", gap: 10, alignItems: "center" }}>
          <input
            type="text" value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={t.placeholder}
            disabled={loading}
            style={{
              flex: 1, height: 48, padding: "0 18px",
              fontSize: 14, fontFamily: ff,
              color: P.text,
              background: P.bgInput,
              border: `1px solid ${P.border}`,
              borderRadius: 12, outline: "none",
              transition: `all 200ms ${E}`,
              direction: rtl ? "rtl" : "ltr",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = P.goldMuted; e.currentTarget.style.boxShadow = `0 0 0 3px ${P.gold}12`; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = P.border; e.currentTarget.style.boxShadow = "none"; }}
          />
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            style={{
              width: 44, height: 44,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: loading || !input.trim() ? P.bgInput : P.gold,
              color: loading || !input.trim() ? P.textDim : P.bg,
              border: "none", borderRadius: 12,
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              transition: `all 250ms ${E}`,
              flexShrink: 0,
            }}
            onMouseEnter={(e) => { if (!loading && input.trim()) e.currentTarget.style.background = P.goldLight; }}
            onMouseLeave={(e) => { if (!loading && input.trim()) e.currentTarget.style.background = P.gold; }}
          ><SendIcon /></button>
        </div>
        <p style={{ maxWidth: 760, margin: "10px auto 0", fontSize: 11, color: P.textDim, textAlign: "center", lineHeight: 1.4 }}>{t.disclaimer}</p>
      </div>
      )}
    </div>
  );
}

