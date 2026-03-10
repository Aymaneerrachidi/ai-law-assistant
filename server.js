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
  return `${primary}\n\nDomain instructions:\n${domainPrompt}`;
}

app.use(cors());
app.use(express.json({ limit: "1mb" }));

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

app.listen(port, () => {
  console.log(`Moroccan Law QA proxy listening on http://localhost:${port}`);
});
