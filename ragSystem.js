/**
 * ragSystem.js — Server-side RAG for Moroccan Law
 *
 * Approach: TF-IDF cosine similarity over a document corpus
 * built from the legal KB articles.  Index is computed once
 * at module load (< 30 ms) and reused for every request.
 *
 * Exports:
 *   retrieveTopChunks(query, topK?)  → formatted string for LLM
 *   retrieveDocs(query, topK?)       → raw doc array with scores
 */

/* ─────────────────────────────────────────────
   CORPUS  (one entry per article / concept cluster)
───────────────────────────────────────────── */
const CORPUS = [
  // ── FAMILY CODE ────────────────────────────────────────────
  {
    id: "mc-03-13",
    article: "Arts. 3, 12, 13",
    title: "Marriage Formation",
    content: "Marriage is a legal relationship that requires: offer and acceptance, guardian presence or wakil, two witnesses, recorded mahr (sadaq). Full and free consent is mandatory — marriage void without it. Knowledgeable consent required for both spouses.",
    tags: ["marriage", "formation", "contract", "consent", "nikah", "mariage", "formation", "consentement", "زواج", "عقد", "رضا", "موافقة", "نكاح"],
  },
  {
    id: "mc-19-20",
    article: "Arts. 19, 20",
    title: "Marriage Age",
    content: "Legal marriage age: 18 for both men and women (Moudawana Art. 19). Judge may authorize marriage below 18 for compelling reasons after verifying maturity and benefit of the minor.",
    tags: ["marriage age", "minor", "18", "mariage mineur", "سن الزواج", "قاصر", "18 سنة", "سن الرشد"],
  },
  {
    id: "mc-26-29",
    article: "Arts. 26–29",
    title: "Mahr (Dower / Sadaq)",
    content: "Mahr (sadaq/dower) is the exclusive right of the wife. Husband cannot reclaim it after valid marriage. Amount must be agreed; if not fixed, judge sets mahr al-mithl. Must be recorded in marriage contract.",
    tags: ["mahr", "sadaq", "dower", "dot", "صداق", "مهر", "حق الزوجة"],
  },
  {
    id: "mc-40-43",
    article: "Arts. 40–43",
    title: "Polygamy",
    content: "New marriage while first marriage subsists requires PRIOR judicial authorization. Judge grants authorization only if: written consent of first wife, proven financial capacity, no harm to first wife or children. Judge refuses if financial capacity not proven.",
    tags: ["polygamy", "polygamie", "second wife", "تعدد الزوجات", "زوجة ثانية", "تعدد"],
  },
  {
    id: "mc-77-93",
    article: "Arts. 77–93",
    title: "Divorce Types and Procedures",
    content: "Marriage dissolved only by judicial decree (Art. 77). Grounds: harm/discord, failure to pay nafaqa, absence >1 year, imprisonment >3 years, serious defect, khul. Mutual consent divorce (shiqaq): judge appoints two arbiters, mediates up to 6 months. Repudiation (talaq) requires court authorization. Court fixes wife's financial rights (mut'a, nafaqa, housing) before recording talaq. Idda: 3 menstrual cycles for divorced wife. Third talaq is irrevocable.",
    tags: ["divorce", "talaq", "khul", "repudiation", "shiqaq", "tribunal", "divorce judiciaire", "طلاق", "تطليق", "خلع", "شقاق", "فراق", "إيواء", "نفقة", "متعة"],
  },
  {
    id: "mc-163-177",
    article: "Arts. 163–177",
    title: "Child Custody (Hadana)",
    content: "Custody is the child's right. Priority order: mother → father → maternal grandmother → paternal grandmother → maternal aunt. Mother loses custody if she remarries (unless judge decides otherwise). Non-custodial parent has right of access. Guardian (wali) is father.",
    tags: ["custody", "hadana", "children", "garde", "gardien", "حضانة", "وليّ", "حاضنة", "أطفال", "الأم", "الأب"],
  },
  {
    id: "mc-168-190",
    article: "Arts. 168–190",
    title: "Child Maintenance (Nafaqa)",
    content: "Father pays child maintenance regardless of custody. Maintenance includes housing, food, education, healthcare. Amount set by judge based on father's resources and child's needs.",
    tags: ["nafaqa", "maintenance", "alimony", "pension alimentaire", "child support", "نفقة", "إعالة", "مصروف الأولاد", "حق الأطفال"],
  },
  {
    id: "mc-276-332",
    article: "Arts. 276–332",
    title: "Inheritance and Succession",
    content: "Estate vests in heirs immediately at death. Will (wasiya) cannot exceed 1/3 of estate for non-heirs. Islamic (Maliki) obligatory shares: daughter = 1/2, two daughters = 2/3, mother = 1/6–1/3, wife = 1/8–1/4, husband = 1/2–1/4. Obligatory bequest for grandchildren whose parent predeceased grandparent.",
    tags: ["inheritance", "succession", "will", "héritage", "testament", "إرث", "ميراث", "تركة", "وصية", "حصص الإرث", "وارث"],
  },

  // ── PENAL CODE – VIOLENCE ───────────────────────────────────
  {
    id: "pc-390-402",
    article: "Arts. 390–402",
    title: "Homicide",
    content: "Premeditated murder: death penalty (commuted to life in practice). Non-premeditated murder: 20–30 years. Manslaughter / negligent homicide: 3 months–5 years + fine.",
    tags: ["murder", "homicide", "killing", "meurtre", "homicide", "قتل", "جريمة القتل", "قتل المنفعة"],
  },
  {
    id: "pc-393-398",
    article: "Arts. 393–398",
    title: "Assault and Bodily Harm",
    content: "Simple assault causing injury: 1–6 months, 200–1,000 DH (Art. 393). Assault causing permanent disability/loss of organ: 2–6 years (Art. 394). Assault causing illness >20 days: 1–3 years (Art. 395). Assault on child under 14, woman, public official: doubled penalties (Art. 396). Assault with weapon: minimum 3 years (Art. 398).",
    tags: ["assault", "violence", "bodily harm", "injury", "agression", "coups et blessures", "ضرب", "جرح", "اعتداء", "إيذاء جسدي"],
  },
  {
    id: "pc-475-479",
    article: "Arts. 475–479",
    title: "Rape and Sexual Offenses",
    content: "Rape: 5–10 years (Art. 475). Victim under 18: 10–20 years. Rape within marriage: 5–10 years. Aggravated rape (gang, weapon, incest): 20–30 years (Art. 476). Indecent assault without penetration: 1–5 years. Consensual relations with minor under 18: 1–3 years.",
    tags: ["rape", "sexual assault", "viol", "agression sexuelle", "اغتصاب", "تحرش جنسي", "اعتداء جنسي", "قاصر جنسي"],
  },
  {
    id: "pc-306-1-4",
    article: "Arts. 306-1 to 306-4",
    title: "Sports Violence and Stadium Disorder",
    content: "Introducing/using incendiary or pyrotechnic materials in sports facilities: 1–2 years, 5,000–20,000 DH. Disturbing public order at sports venue: 1–2 years, 5,000–20,000 DH. Rioting during sporting events: 1–2 years; doubled for organizers/inciters. Additional sanctions: stadium ban 1–5 years.",
    tags: ["sports violence", "stadium", "rioting", "hooliganism", "violence sportive", "stade", "شغب", "ملاعب", "مشجعين", "شماريخ", "حرائق ملاعب"],
  },

  // ── PENAL CODE – PROPERTY ──────────────────────────────────
  {
    id: "pc-467-472",
    article: "Arts. 467–472",
    title: "Theft and Robbery",
    content: "Simple theft: 1–2 years, 100–2,000 DH (Art. 467). Aggravated theft (dwelling, night, gang, weapon): 2–10 years, 200–5,000 DH (Art. 468). Robbery using force: 3–10 years (Art. 469). Armed robbery: 5–10 years (Art. 470). Gang robbery: 5–20 years (Art. 471). Robbery with violence causing injury: 5–20 years; causing death: 30 years (Art. 472).",
    tags: ["theft", "robbery", "stealing", "vol", "brigandage", "سرقة", "نهب", "سطو مسلح", "جنحة سرقة"],
  },
  {
    id: "pc-450-235",
    article: "Arts. 450, 234–235",
    title: "Fraud and Document Forgery",
    content: "Fraud/swindling: 1–3 years, 250–5,000 DH; aggravated: up to 5 years (Art. 450). Document forgery: 6 months–3 years (Art. 234). Using forged documents: 1–5 years (Art. 235).",
    tags: ["fraud", "forgery", "swindling", "escroquerie", "faux", "احتيال", "نصب", "تزوير", "وثائق مزورة"],
  },
  {
    id: "pc-248-250",
    article: "Arts. 248–250",
    title: "Bribery and Corruption",
    content: "Active bribery of public official: 5–10 years, 10,000–100,000 DH (Art. 248). Passive bribery (official receiving): 5–10 years (Art. 249). Abuse of power/influence peddling: 3–5 years, 5,000–50,000 DH (Art. 250).",
    tags: ["bribery", "corruption", "corruption active", "pot-de-vin", "رشوة", "فساد", "إرتشاء", "رشوة موظف"],
  },

  // ── PENAL CODE – SPECIALIZED ──────────────────────────────
  {
    id: "pc-448-10-14",
    article: "Arts. 448-10 to 448-14",
    title: "Human Trafficking",
    content: "Trafficking in human beings: 1–5 years, 5,000–50,000 DH. Forced labor/debt bondage: same penalties. Trafficking a minor (under 18): doubled (2–10 years). Victims not criminally liable for acts resulting from being trafficked.",
    tags: ["trafficking", "human trafficking", "forced labor", "traite des êtres humains", "اتجار بالبشر", "تهريب", "عمل قسري", "استغلال"],
  },
  {
    id: "pc-218-1-5",
    article: "Arts. 218-1 to 218-5",
    title: "Terrorism",
    content: "Terrorism: acts intended to cause disorder, terror, or intimidate state/public. Membership in terrorist organization: 10–30 years. Supporting terrorists: 5–10 years. Financing terrorism: life imprisonment or 30 years. Providing financing channels: same penalties.",
    tags: ["terrorism", "terrorisme", "إرهاب", "منظمة إرهابية", "تمويل إرهاب"],
  },
  {
    id: "pc-209-212",
    article: "Arts. 209–212",
    title: "Drug Offenses",
    content: "Possession for personal use: 1 month–1 year, 500–5,000 DH (Art. 209). Drug trafficking: 2–10 years, 5,000–50,000 DH (Art. 210). Manufacture/production: 5–10 years (Art. 211). Large-scale trafficking/organized crime: 10–20 years, 100,000–1,000,000 DH (Art. 212).",
    tags: ["drugs", "possession", "trafficking", "narcotics", "drogues", "trafic", "مخدرات", "حشيش", "حيازة مخدرات", "تهريب مخدرات"],
  },
  {
    id: "pc-317-320",
    article: "Arts. 317–320",
    title: "Illegal Weapons Possession",
    content: "Illegal possession of weapon: 3 months–2 years (Art. 317). Carrying concealed weapon in public: 6 months–1 year (Art. 318). Automatic/prohibited weapons: 2–5 years (Art. 320).",
    tags: ["weapons", "arms", "armes", "illegal weapon", "سلاح", "حيازة سلاح", "سلاح ناري"],
  },

  // ── CRIMINAL PROCEDURE ────────────────────────────────────
  {
    id: "cpc-114-115",
    article: "Arts. 114–115",
    title: "Garde à Vue (Police Detention)",
    content: "Police may detain suspect: max 24 hours initially. Extension up to 48 hours total; up to 72 hours for serious crimes with prosecutor authorization. Terrorism/organized crime: up to 96 hours. Suspect has right to have family notified and access to lawyer after 24 hours.",
    tags: ["garde a vue", "detention", "police custody", "rights", "garde à vue", "توقيف", "استجواب", "حبس احتياطي", "حقوق الموقوف"],
  },
  {
    id: "cpc-50",
    article: "Art. 50",
    title: "Statute of Limitations",
    content: "Statute of limitations: 10 years for serious crimes (jnaiya, felony), 3 years for misdemeanors (jnha), 1 year for minor violations (mukhalafa). Crimes against humanity: imprescriptible.",
    tags: ["statute of limitations", "prescription", "prescripción", "تقادم", "مدة التقادم", "انقضاء الدعوى"],
  },
  {
    id: "cpc-appeal",
    article: "Appeals Timeline",
    title: "Appeal Deadlines",
    content: "Time to appeal judgment: 10 days from judgment date. Appeals court hearing: typically 3–6 months after filing. Cassation filing: 10 days from appeals court decision. Court structure: District courts → Courts of First Instance → Courts of Appeal (21) → Court of Cassation.",
    tags: ["appeal", "cassation", "deadline", "timeline", "appel", "pourvoi", "استئناف", "طعن", "نقض", "أجل الطعن", "محكمة الاستئناف"],
  },
  {
    id: "cpc-investigation",
    article: "Investigation Phase",
    title: "Criminal Investigation and Trial Rights",
    content: "Investigation time limit: 3 months (renewable); 6 months for serious crimes. Investigating judge may indict, dismiss, or refer to trial. Right to fair trial, right to counsel, right to interpreter. Arbitrary detention by public servant: criminal liability (Art. 227).",
    tags: ["investigation", "trial", "rights", "lawyer", "instruction", "droits de la défense", "تحقيق", "محاكمة", "حق الدفاع", "محامي", "محاكمة عادلة"],
  },
  {
    id: "cpc-704",
    article: "Art. 704",
    title: "Moroccan Court Jurisdiction",
    content: "Moroccan courts have jurisdiction over offenses committed on Moroccan territory regardless of perpetrator's nationality. Also over offenses committed abroad by Moroccan nationals if punishable by 1+ year sentence.",
    tags: ["jurisdiction", "compétence", "اختصاص", "محكمة مغربية", "إقليمية"],
  },

  // ── CIVIL OBLIGATIONS & CONTRACTS ────────────────────────
  {
    id: "doc-230-456",
    article: "Arts. 230, 456 (DOC)",
    title: "Contract Formation and Sale",
    content: "Valid contract requires: offer + acceptance, legal capacity, lawful object, real cause. Consent vitiated by error, fraud, or duress: contract voidable. Contracts bind parties as law between them (Art. 230). Sale complete upon agreement on thing and price (Art. 456).",
    tags: ["contract", "sale", "formation", "contrat", "vente", "عقد", "بيع", "تعاقد", "صحة العقد"],
  },
  {
    id: "doc-lease",
    article: "Arts. 505+, Law 67-12",
    title: "Lease and Rental Agreements",
    content: "Lease must define property, term, rent amount. Tenant cannot sublet without owner's written consent. Eviction: court order required — owner cannot self-help evict. Residential lease protections under Law 67-12 (2016).",
    tags: ["lease", "rental", "eviction", "bail", "loyer", "expulsion", "كراء", "إيجار", "إخلاء", "عقد الكراء"],
  },
  {
    id: "doc-77-264",
    article: "Arts. 77, 264 (DOC)",
    title: "Liability, Damages, Force Majeure",
    content: "Any person causing harm through fault is liable to compensate (Art. 77). Compensation covers actual damage (direct + consequential) and loss of earnings. Debtor not liable for force majeure — unforeseen, irresistible event (Art. 264). Civil statute of limitations: 15 years general; 5 years commercial; 3 years tort.",
    tags: ["damages", "liability", "force majeure", "tort", "responsabilité", "dommages", "تعويض", "مسؤولية", "قوة قاهرة", "ضرر"],
  },

  // ── SENTENCING FRAMEWORK ──────────────────────────────────
  {
    id: "sent-framework",
    article: "Sentencing Framework",
    title: "Moroccan Sentencing Principles",
    content: "Jnaiya (serious felony): 5–30 years or life/death. Jnha (misdemeanor): 2 months–5 years + fine. Mukhalafa (violation): warning to 3 days custody + fine. Mitigating factors: first offense, young age, cooperation, remorse, repair of harm. Aggravating: premeditation, weapons, multiple victims, organized crime, victim is minor/vulnerable.",
    tags: ["sentencing", "penalty", "sentence", "peine", "condamnation", "عقوبة", "تخفيف", "تشديد", "العقوبة", "أحكام"],
  },
];

/* ─────────────────────────────────────────────
   TF-IDF INDEX  (built at module load)
───────────────────────────────────────────── */

function tokenize(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[.,;:!?"'"'()\[\]{}\-–—/\\|@#$%^&*+=<>]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

function buildIndex(docs) {
  const N = docs.length;
  // termDocs[term] = count of documents containing term
  const termDocs = {};
  // docTermFreq[i][term] = normalized TF for doc i
  const docTermFreq = docs.map((doc) => {
    const words = tokenize(
      `${doc.title} ${doc.content} ${doc.tags.join(" ")} ${doc.article}`
    );
    const freq = {};
    for (const w of words) freq[w] = (freq[w] || 0) + 1;
    const total = words.length || 1;
    const tf = {};
    for (const [w, c] of Object.entries(freq)) {
      tf[w] = c / total;
    }
    return tf;
  });

  // Build DF (document frequency) for each term
  for (const tf of docTermFreq) {
    for (const term of Object.keys(tf)) {
      termDocs[term] = (termDocs[term] || 0) + 1;
    }
  }

  // Compute IDF
  const idf = {};
  for (const [term, df] of Object.entries(termDocs)) {
    idf[term] = Math.log((N + 1) / (df + 1)) + 1;
  }

  // Compute TF-IDF vectors + norms
  const docVectors = docTermFreq.map((tf) => {
    const vec = {};
    let normSq = 0;
    for (const [term, tfVal] of Object.entries(tf)) {
      const val = tfVal * (idf[term] || 1);
      vec[term] = val;
      normSq += val * val;
    }
    return { vec, norm: Math.sqrt(normSq) };
  });

  return { idf, docVectors };
}

function queryVector(query, idf) {
  const words = tokenize(query);
  const freq = {};
  for (const w of words) freq[w] = (freq[w] || 0) + 1;
  const total = words.length || 1;
  const vec = {};
  let normSq = 0;
  for (const [w, c] of Object.entries(freq)) {
    const tfVal = c / total;
    const idfVal = idf[w] || 0.5; // mild score for unseen terms
    const val = tfVal * idfVal;
    vec[w] = val;
    normSq += val * val;
  }
  return { vec, norm: Math.sqrt(normSq) };
}

function cosineSim(qv, dv) {
  if (qv.norm === 0 || dv.norm === 0) return 0;
  let dot = 0;
  for (const [term, qVal] of Object.entries(qv.vec)) {
    if (dv.vec[term]) dot += qVal * dv.vec[term];
  }
  return dot / (qv.norm * dv.norm);
}

// Build index at module load
const { idf, docVectors } = buildIndex(CORPUS);

/* ─────────────────────────────────────────────
   PUBLIC API
───────────────────────────────────────────── */

/**
 * Returns top-K docs with similarity scores
 * @param {string} query
 * @param {number} topK
 * @returns {{doc, score}[]}
 */
export function retrieveDocs(query, topK = 4) {
  const qv = queryVector(query, idf);
  const scored = CORPUS.map((doc, i) => ({
    doc,
    score: cosineSim(qv, docVectors[i]),
  }));
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .filter((r) => r.score > 0.02); // discard near-zero matches
}

/**
 * Returns formatted context string for LLM injection
 * @param {string} query
 * @param {number} topK
 * @returns {string}
 */
export function retrieveTopChunks(query, topK = 4) {
  const results = retrieveDocs(query, topK);
  if (results.length === 0) return "";

  return results
    .map(
      ({ doc, score }) =>
        `[${doc.article}] ${doc.title}\n${doc.content.trim()}\n(relevance: ${(score * 100).toFixed(0)}%)`
    )
    .join("\n\n---\n\n");
}
