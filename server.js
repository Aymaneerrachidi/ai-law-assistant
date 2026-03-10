import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 8787;
const model = process.env.OPENROUTER_MODEL || "openrouter/free";

const PRIMARY_SYSTEM_PROMPTS = {
  ar: `أنت مساعد قانوني مغربي متخصص في القانون المغربي، وتكتب بأسلوب قانوني أنيق وسلس.

القاعدة الأولى: الجواب يجب أن يكون بالعربية فقط إذا كتب المستخدم بالعربية.
القاعدة الثانية: لا تخلط اللغات داخل نفس الجواب.
القاعدة الثالثة: لا تستخدم تنسيق ماركداون أو القوائم النقطية أو الرموز الزخرفية.
القاعدة الرابعة: اكتب في فقرات طبيعية متدفقة، مع انتقالات واضحة بين الأفكار.

نطاق المعرفة: مدونة الأسرة، القانون الجنائي، المسطرة الجنائية، والالتزامات والعقود.
اذكر المواد القانونية داخل الجمل بشكل طبيعي كلما أمكن.
إذا كان السؤال خارج النطاق، وضح ذلك بلباقة وإيجاز.
لا تقدم أي مساعدة للتحايل على القانون.

أسلوب الإخراج الإلزامي:
قدّم مقدمة قصيرة تمهّد للإجابة، ثم شرحاً قانونياً واضحاً في فقرات متسلسلة، ثم خاتمة عملية.
اكتب بنبرة راقية ومهنية، وتجنب الجمل الميكانيكية أو المرقمة.
اختم دائماً بجملة مسؤولية قانونية طبيعية بدون رموز.

صيغة مسؤولية افتراضية:
هذه المعلومات للتوعية العامة ولا تعد استشارة قانونية ملزمة، ومن الأفضل الرجوع إلى محام مغربي مختص وفق تفاصيل الحالة.`,
  fr: `Vous etes un assistant juridique specialise dans le droit marocain, avec un style elegant et naturel.

Regle 1: repondre uniquement en francais si l'utilisateur ecrit en francais.
Regle 2: ne jamais melanger les langues dans une meme reponse.
Regle 3: ne pas utiliser de markdown, de listes a puces, ni de symboles decoratifs.
Regle 4: rediger en paragraphes fluides, avec des transitions claires entre les idees.

Domaine: Code de la Famille, Code Penal, Procedure Penale, Obligations et Contrats.
Integrer les references d'articles de maniere naturelle dans les phrases.
Si la question est hors perimetre, le signaler avec clarte et concision.
Ne pas fournir de conseils pour contourner la loi.

Sortie obligatoire:
Commencer par un court cadrage, developper l'analyse juridique en prose elegante, puis terminer par une conclusion pratique.
Conserver un ton professionnel, accessible et soigne.
Conclure toujours par une phrase de responsabilite juridique sans symboles.

Formule de responsabilite par defaut:
Ces informations sont fournies a titre educatif et ne constituent pas un conseil juridique complet; il est recommande de consulter un avocat marocain selon votre situation.`,
  en: `You are a Moroccan law legal information assistant who writes in elegant, polished prose.

Rule 1: reply only in the same language as the user.
Rule 2: never mix languages in one answer.
Rule 3: do not use markdown, bullet lists, numbered lists, or decorative symbols.
Rule 4: write in natural flowing paragraphs with smooth transitions.

Scope: Family Code, Penal Code, Criminal Procedure, and Obligations and Contracts.
Embed legal article references naturally inside sentences whenever possible.
If the question is out of scope, say so clearly and briefly.
Do not provide guidance for evading the law.

Output style requirements:
Open with a short framing paragraph, provide clear legal explanation in connected prose, and end with a practical closing paragraph.
Keep a professional yet readable legal tone.
Always end with a natural legal-responsibility sentence without symbols.

Default responsibility sentence:
This information is educational and not a substitute for formal legal advice; for case-specific guidance, consult a qualified Moroccan lawyer.`,
};

const DOMAIN_PROMPTS = {
  family: `For family-law questions, explain the legal framework of the Moudawana through cohesive prose. Cover conditions, rights, and procedures in narrative form. Reference relevant articles naturally in sentences, including where suitable Articles 19 and 20 on marriage age, Articles 24 and 25 on guardianship, Article 29 on sadaq, Articles 166 and 171 on custody, and Articles 369 to 372 on obligatory bequest.`,
  penal: `For penal-law questions, define the offense and legal elements in plain but formal prose, then explain penalties and how aggravating or mitigating circumstances affect outcomes. Mention article references naturally and keep the explanation neutral, factual, and legally responsible.`,
  procedure: `For procedure questions, describe the legal path as a coherent sequence in narrative paragraphs: authority, phase, rights, timeline, and remedies. Avoid list formatting and present procedural flow with clear transitions.`,
  contracts: `For obligations and contracts questions, explain validity, obligations, breach consequences, and enforcement in connected prose. Integrate practical risk points and legal references naturally, focusing on actionable understanding without list formatting.`,
  general: `For broad questions, provide a concise general legal explanation first, then ask up to two clarifying questions in plain prose if needed. Maintain elegance, clarity, and legal precision.`,
};

function detectDomain(text) {
  const t = (text || "").toLowerCase();

  const familyTerms = ["marriage", "divorce", "custody", "inherit", "inheritance", "moudawana", "nafaqa", "زوج", "زواج", "طلاق", "حضانة", "إرث", "مدونة الأسرة", "mariage", "divorce", "garde", "heritage", "moudawana"];
  const penalTerms = ["theft", "crime", "penalty", "criminal", "assault", "fraud", "arrest", "سرقة", "جريمة", "عقوبة", "جنائي", "اعتداء", "fraude", "infraction", "peine", "penal"];
  const procedureTerms = ["procedure", "appeal", "trial", "investigation", "evidence", "hearing", "مسطرة", "إجراء", "استئناف", "محاكمة", "تحقيق", "preuve", "appel", "proces", "procedure penale"];
  const contractTerms = ["contract", "lease", "obligation", "agreement", "damages", "breach", "عقد", "التزام", "كراء", "تعويض", "إخلال", "contrat", "bail", "obligations", "dommages"];

  if (familyTerms.some((k) => t.includes(k))) return "family";
  if (penalTerms.some((k) => t.includes(k))) return "penal";
  if (procedureTerms.some((k) => t.includes(k))) return "procedure";
  if (contractTerms.some((k) => t.includes(k))) return "contracts";
  return "general";
}

function buildSystemPrompt(language, domain) {
  const lang = ["ar", "fr", "en"].includes(language) ? language : "ar";
  const primary = PRIMARY_SYSTEM_PROMPTS[lang];
  const domainPrompt = DOMAIN_PROMPTS[domain] || DOMAIN_PROMPTS.general;
  const langOverride =
    lang === "fr"
      ? "\n\nRappel impératif: répondez UNIQUEMENT en français, sans aucune exception."
      : lang === "ar"
      ? "\n\nتذكير حتمي: أجب باللغة العربية فقط، دون استثناء."
      : "";
  return `${primary}\n\nDomain instructions:\n${domainPrompt}${langOverride}`;
}

app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.get("/", (_req, res) => {
  return res.status(200).json({
    service: "Moroccan Law QA API",
    status: "ok",
    usage: "Send POST requests to /api/moroccan-law-qa",
    frontend: "http://localhost:5173",
  });
});

app.get("/health", (_req, res) => {
  return res.status(200).json({ status: "ok" });
});

app.post("/api/moroccan-law-qa", async (req, res) => {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing OPENROUTER_API_KEY in .env" });
    }

    const inputMessages = Array.isArray(req.body?.messages) ? req.body.messages : [];
    if (inputMessages.length === 0) {
      return res.status(400).json({ error: "messages array is required" });
    }

    const lang = req.body?.language || "ar";
    const lastUserMessage = [...inputMessages].reverse().find((m) => m?.role === "user")?.content || "";
    const domain = detectDomain(lastUserMessage);
    const systemPrompt = buildSystemPrompt(lang, domain);

    const messages = [
      { role: "system", content: systemPrompt },
      ...inputMessages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 2500,
        temperature: 0.4,
        top_p: 0.9,
      }),
    });

    const data = await response.json();
    const message = data?.choices?.[0]?.message;
    const content = message?.content || message?.reasoning || null;

    if (!response.ok || !content) {
      return res.status(502).json({
        error: "OpenRouter request failed",
        details: data,
      });
    }

    return res.json({ content });
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

/* ─── OCR Proxy (OCR.Space) ─── */
app.post("/api/ocr", async (req, res) => {
  try {
    const ocrKey = process.env.OCR_SPACE_API_KEY;
    if (!ocrKey) return res.status(500).json({ error: "Missing OCR_SPACE_API_KEY" });

    const { base64Image, language } = req.body;
    if (!base64Image) return res.status(400).json({ error: "base64Image is required" });

    const ocrLang = language === "ar" ? "ara" : language === "fr" ? "fre" : "eng";

    const formBody = new URLSearchParams();
    formBody.append("apikey", ocrKey);
    formBody.append("base64Image", base64Image);
    formBody.append("language", ocrLang);
    formBody.append("isOverlayRequired", "false");
    formBody.append("OCREngine", "2");

    const response = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formBody.toString(),
    });

    const data = await response.json();
    if (data.IsErroredOnProcessing) {
      return res.status(502).json({ error: "OCR failed", details: data.ErrorMessage });
    }

    const text = (data.ParsedResults || []).map((r) => r.ParsedText).join("\n").trim();
    return res.json({ text });
  } catch (error) {
    return res.status(500).json({ error: "OCR error", details: error.message });
  }
});

/* ─── Document Analysis (Cohere) ─── */
app.post("/api/analyze-document", async (req, res) => {
  try {
    const cohereKey = process.env.COHERE_API_KEY;
    if (!cohereKey) return res.status(500).json({ error: "Missing COHERE_API_KEY" });

    const { text, language, docType } = req.body;
    if (!text) return res.status(400).json({ error: "text is required" });

    // Build type-specific instructions so the AI focuses on what matters for this document
    const typeInstructions = {
      ar: {
        court_report:   "الوثيقة محضر أو حكم قضائي. ركّز على: اسم المحكمة، رقم الملف، هوية القاضي، أسماء الأطراف، التهم الموجهة، منطوق الحكم، العقوبة المقررة، وآجال الطعن.",
        criminal_case:  "الوثيقة قضية جنائية أو جنحة. ركّز على: التهم الجنائية، هوية المتهم، أدلة الإدانة أو البراءة، العقوبة المحكوم بها أو المطلوبة، والنصوص القانونية المستند إليها.",
        marriage:       "الوثيقة عقد زواج. ركّز على: أطراف العقد، المهر والصداق، شروط الزواج، شهود العقد، والمسائل القانونية ذات الصلة.",
        divorce:        "الوثيقة وثيقة طلاق أو تطليق. ركّز على: أسباب الطلاق، حقوق النفقة والحضانة، تقسيم الممتلكات، وأحكام مدونة الأسرة المنطبقة.",
        lease:          "الوثيقة عقد كراء. ركّز على: مدة العقد، قيمة الإيجار، التزامات الطرفين، شروط الإنهاء، وأحكام قانون الكراء المغربي.",
        will:           "الوثيقة وصية. ركّز على: الموصي والموصى لهم، حدود الثلث القانوني، شهود الوصية، وصحتها من الناحية القانونية.",
        general:        "وثيقة قانونية عامة. قدّم تحليلاً شاملاً يشمل: نوع الوثيقة، الأطراف المعنية، الالتزامات، المخاطر القانونية، والمواد المنطبقة.",
      },
      fr: {
        court_report:   "Le document est un procès-verbal ou un jugement. Concentrez-vous sur: le nom du tribunal, le numéro de dossier, l'identité du juge, les parties, les chefs d'inculpation, le dispositif du jugement, la peine et les délais de recours.",
        criminal_case:  "Le document est une affaire pénale ou correctionnelle. Concentrez-vous sur: les charges pénales, l'identité du prévenu, les éléments de preuve, la peine prononcée ou requise, et les articles de loi invoqués.",
        marriage:       "Le document est un contrat de mariage. Concentrez-vous sur: les parties, la dot, les conditions du mariage, les témoins et les aspects juridiques.",
        divorce:        "Le document est un acte de divorce. Concentrez-vous sur: les motifs, la pension alimentaire, la garde et le partage des biens.",
        lease:          "Le document est un contrat de bail. Concentrez-vous sur: la durée, le loyer, les obligations des parties et les conditions de résiliation.",
        will:           "Le document est un testament. Concentrez-vous sur: le testateur, les légataires, la limite du tiers légal et la validité juridique.",
        general:        "Document juridique général. Fournissez une analyse complète: type, parties, obligations, risques et articles applicables.",
      },
      en: {
        court_report:   "The document is a court report or judgment. Focus on: court name, case number, judge identity, parties, charges, verdict/ruling, sentence, and appeal deadlines.",
        criminal_case:  "The document is a criminal or misdemeanor case. Focus on: criminal charges, defendant identity, evidence, sentence rendered or requested, and cited legal articles.",
        marriage:       "The document is a marriage contract. Focus on: parties, dower/mahr, marriage conditions, witnesses, and relevant legal points.",
        divorce:        "The document is a divorce deed. Focus on: grounds, alimony, child custody, property division, and applicable Family Code provisions.",
        lease:          "The document is a lease agreement. Focus on: duration, rent, obligations of both parties, and termination conditions.",
        will:           "The document is a will/testament. Focus on: testator, beneficiaries, one-third limit, witnesses, and legal validity.",
        general:        "General legal document. Provide a full analysis: document type, parties, obligations, legal risks, and applicable articles.",
      },
    };

    const lang = ["ar", "fr", "en"].includes(language) ? language : "ar";
    const typeHint = (typeInstructions[lang][docType] || typeInstructions[lang].general);

    const prompt =
      lang === "ar"
        ? `أنت محلل قانوني مغربي متخصص.\n\nتعليمات خاصة بنوع الوثيقة: ${typeHint}\n\nبعد التحليل قدّم بالترتيب:\n1. نوع الوثيقة القانوني المحدد\n2. ملخص المحتوى الأساسي\n3. المواد القانونية المذكورة ومرجعها في القانون المغربي\n4. النقاط القانونية المهمة\n5. توصيات عملية\n\nاكتب بأسلوب قانوني أنيق بدون تنسيق ماركداون.\n\nالوثيقة:\n${text}`
        : lang === "fr"
        ? `Vous êtes un analyste juridique marocain spécialisé.\n\nInstructions spécifiques au type de document: ${typeHint}\n\nAnalysez le document et fournissez dans l'ordre:\n1. Type juridique précis du document\n2. Résumé du contenu principal\n3. Articles de loi mentionnés et leur référence en droit marocain\n4. Points juridiques importants\n5. Recommandations pratiques\n\nRédigez en prose élégante sans formatage markdown.\n\nDocument:\n${text}`
        : `You are a specialized Moroccan legal analyst.\n\nDocument-type specific instructions: ${typeHint}\n\nAnalyze the document and provide in order:\n1. Precise legal document type\n2. Summary of key content\n3. Legal articles mentioned and their reference in Moroccan law\n4. Important legal points\n5. Practical recommendations\n\nWrite in elegant prose without markdown formatting.\n\nDocument:\n${text}`;

    const response = await fetch("https://api.cohere.com/v2/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cohereKey}`,
      },
      body: JSON.stringify({
        model: "command-a-03-2025",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    const content = data?.message?.content?.[0]?.text || null;

    if (!response.ok || !content) {
      return res.status(502).json({ error: "Cohere analysis failed", details: data });
    }

    return res.json({ analysis: content });
  } catch (error) {
    return res.status(500).json({ error: "Analysis error", details: error.message });
  }
});

/* ─── LLM Structured Extraction ─── */
app.post("/api/extract-with-llm", async (req, res) => {
  try {
    const cohereKey = process.env.COHERE_API_KEY;
    if (!cohereKey) return res.status(500).json({ error: "Missing COHERE_API_KEY" });

    const { text, language } = req.body;
    if (!text) return res.status(400).json({ error: "text is required" });

    const lang = ["ar", "fr", "en"].includes(language) ? language : "ar";

    const systemCtx =
      lang === "ar"
        ? "أنت محلل قانوني مغربي متخصص. مهمتك استخراج المعلومات من الوثيقة وإعادتها بصيغة JSON صالحة فقط، بدون أي نص إضافي."
        : lang === "fr"
        ? "Vous êtes un analyste juridique marocain. Extrayez les informations du document et retournez UNIQUEMENT un JSON valide, sans aucun texte supplémentaire."
        : "You are a Moroccan legal analyst. Extract information from the document and return ONLY valid JSON, with no extra text.";

    const docTypeList = "court_report|criminal_case|marriage|divorce|custody|will|lease|purchase|complaint|inheritance|general";

    const prompt = `${systemCtx}

Document:
${text.slice(0, 4000)}

Return ONLY this JSON object (no markdown, no explanation):
{
  "docType": "<one of: ${docTypeList}>",
  "confidence": <integer 0-100>,
  "reasoning": "<one sentence why this type>",
  "entities": {
    "dates":       [<up to 8 date strings found>],
    "amounts":     [<up to 6 money amounts with currency>],
    "articles":    [<up to 10 cited legal articles, e.g. 'المادة 306'>],
    "parties":     [<up to 6 party names – for non-court documents>],
    "caseNumbers": [<up to 3 case/dossier numbers>],
    "judges":      [<up to 3 judge names>],
    "defendants":  [<up to 4 defendant names>],
    "charges":     [<up to 5 charge descriptions>],
    "verdicts":    [<up to 3 verdict or judgment phrases>]
  }
}`;

    const response = await fetch("https://api.cohere.com/v2/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cohereKey}`,
      },
      body: JSON.stringify({
        model: "command-a-03-2025",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        max_tokens: 900,
      }),
    });

    const data = await response.json();
    const content = data?.message?.content?.[0]?.text || null;

    if (!response.ok || !content) {
      return res.status(502).json({ error: "Cohere extraction failed", details: data });
    }

    // Strip markdown code fences if the model wraps the JSON
    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON object found in model response");
      parsed = JSON.parse(jsonMatch[0]);
    } catch (e) {
      return res.status(422).json({ error: "JSON parse failed", raw: content.slice(0, 400) });
    }

    // Validate docType
    const validTypes = ["court_report","criminal_case","marriage","divorce","custody","will","lease","purchase","complaint","inheritance","general"];
    if (!validTypes.includes(parsed.docType)) parsed.docType = "general";

    // Sanitise entities – guarantee every key is a clean array
    const ent = parsed.entities && typeof parsed.entities === "object" ? parsed.entities : {};
    const take = (key, max) => Array.isArray(ent[key])
      ? ent[key].slice(0, max).map(String).filter(Boolean)
      : [];
    parsed.entities = {
      dates:       take("dates",       8),
      amounts:     take("amounts",     6),
      articles:    take("articles",   10),
      parties:     take("parties",     6),
      caseNumbers: take("caseNumbers", 3),
      judges:      take("judges",      3),
      defendants:  take("defendants",  4),
      charges:     take("charges",     5),
      verdicts:    take("verdicts",    3),
    };

    parsed.confidence = Number.isFinite(parsed.confidence)
      ? Math.min(100, Math.max(0, Math.round(parsed.confidence)))
      : null;

    return res.json(parsed);
  } catch (error) {
    return res.status(500).json({ error: "Extraction error", details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Moroccan Law QA proxy listening on http://localhost:${port}`);
});
