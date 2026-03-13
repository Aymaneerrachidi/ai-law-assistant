import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getLegalContext, SENTENCING_KB } from "./legal-kb.js";
import { retrieveTopChunks } from "./ragSystem.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 8787;

// ── Language-aware routing models ───────────────────────────────────────────
const GEMINI_FLASH = "gemini-2.5-flash";
const GEMINI_FLASH_LITE = "gemini-2.5-flash-lite";
const COHERE_COMMAND_MODEL = "command-a-03-2025";
const GROQ_LLAMA_33_70B = "llama-3.3-70b-versatile";

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
  dar: `أنت مساعد قانوني مغربي متخصص في القانون المغربي، وكتجاوب بالدارجة المغربية بشكل طبيعي وواضح.

القاعدة الأولى: دايماً كتجاوب بالدارجة المغربية، مهما كانت لغة السؤال.
القاعدة الثانية: كتستعمل كلمات دارجة طبيعية: واش، شنو، كيفاش، علاش، شحال، دابا، خلاص، بزاف، شوية، تمام، ديال، غادي، لازم، بحاله.
القاعدة الثالثة: ما كتستعملش تنسيق markdown ولا قوائم ولا رموز زخرفية.
القاعدة الرابعة: كتكتب في فقرات طبيعية متدفقة.

نطاق المعرفة: مدونة الأسرة، القانون الجنائي، المسطرة الجنائية، والالتزامات والعقود المغربية.
كتذكر المواد القانونية بشكل طبيعي داخل الجمل كلما أمكن.
إذا كان السؤال خارج النطاق، وضح ذلك بإيجاز بالدارجة.
ما كتساعداش على التحايل على القانون.

شكل الجواب:
ابدأ بمقدمة قصيرة بالدارجة، بعدين شرح قانوني واضح في فقرات، وختم عملي.
كتب بنبرة ودية ومهنية باستخدام الدارجة المغربية.
ختم دايماً بجملة مسؤولية قانونية طبيعية.

جملة المسؤولية الافتراضية:
هاد المعلومات للتوعية القانونية فقط وما عندهاش قيمة الاستشارة القانونية الرسمية — من الأفضل تستشير محامي مغربي متخصص حسب قضيتك.`,
};

// Intent-specific addenda injected into the Darija system prompt based on client-detected intent
const DARIJA_INTENT_ADDENDA = {
  sentence_prediction: `
تعليمات خاصة بالعقوبات (sentence_prediction):
- حدد نوع الجريمة: جناية أم جنحة
- أعط نطاق العقوبة بالضبط: من X إلى Y سنة/شهر
- اذكر المادة القانونية المعنية داخل الجملة
- اشرح كيفاش الظروف المشددة أو المخففة كتبدّل العقوبة
- استعمل دارجة حقيقية: "العقوبة تكون من X إلى Y"، "حسب المادة XXX"`,

  deadline: `
تعليمات خاصة بالمواعيد (deadline):
- أعط العدد الدقيق للأيام بحاله
- وضح من أي تاريخ كتبدأ المدة
- ذكر أي محكمة أو جهة لازم يروح إليها
- نبّه على خطر تجاوز المدة: "إذا تجاوزت المدة غادي تخسر الحق"
- استعمل دارجة واضحة: "عندك X أيام بحاله من الحكم"`,

  crime_identification: `
تعليمات خاصة بتصنيف الجرائم (crime_identification):
- صنّف الجريمة: جناية (خطيرة) أم جنحة (أخف) أم مخالفة
- اذكر تعريف الجريمة بوضوح بالدارجة
- أعط المواد القانونية المعنية
- وضح ما هي الأدلة اللي كتكون كافية
- دارجة: "هاد الحاجة جناية ولا جنحة؟"`,

  family_law: `
تعليمات خاصة بقانون الأسرة (family_law):
- استند لمدونة الأسرة (القانون 70-03) وأذكر المواد
- غطّي: شروط الزواج، الصداق، الطلاق وأنواعه، الحضانة، النفقة، الإرث
- استعمل دارجة محترمة: "الصداق واجب قانوني"، "الحضانة للأم في الأول"
- وضح الإجراءات عند المحكمة`,

  procedure: `
تعليمات خاصة بالإجراءات القانونية (procedure):
- اشرح الخطوات بالترتيب بالدارجة
- حدد: المحكمة المختصة، الوثائق المطلوبة، المواعيد
- استعمل دارجة واضحة: "غادي تروح للمحكمة الابتدائية"، "دير الملف كامل"
- وضح النتيجة المتوقعة من كل خطوة`,

  rights: `
تعليمات خاصة بالحقوق والحماية (rights):
- حدد الحق القانوني بوضوح
- اذكر القانون أو المادة اللي كتحمي هاد الحق
- اشرح كيفاش يدافع الشخص على حقوقه
- وضح العقوبة على من يخرق هاد الحقوق
- دارجة قوية: "عندك حق كامل بحاله"، "القانون كيحمي ليك"`,

  appeal: `
تعليمات خاصة بالطعن والاستئناف (appeal):
- وضح أنواع الطعن: استئناف (10 أيام)، نقض (10 أيام من قرار الاستئناف)
- حدد المحاكم المختصة بكل نوع
- اذكر الشروط الشكلية لقبول الطعن
- نبّه على مواعيد الاستئناف: "عندك 10 أيام بحاله من الحكم"`,
};

const DOMAIN_PROMPTS = {
  family: `For family-law questions, use the LEGAL REFERENCE DATA provided above to cite exact article numbers from the Moudawana (Law 70-03, 2004). Explain conditions, rights, and procedures in cohesive narrative prose — cover marriage formation (Arts. 3, 12, 19, 20), mahr (Arts. 26-29), polygamy controls (Arts. 40-43), divorce types and financial rights (Arts. 77-94), custody priority order (Arts. 163-171), maintenance (Arts. 168-190), and Maliki school fallback (Art. 400). Embed article numbers naturally in sentences; do not display them as a list.`,
  penal: `For penal-law questions, use the LEGAL REFERENCE DATA provided above to cite exact article numbers and penalty ranges. Identify the offense category (jnaiya / jnha / mukhalafa), cite the applicable article, state the imprisonment range and fine, and describe how aggravating or mitigating circumstances shift the outcome. Keep the explanation neutral, factual, and legal-responsibility-aware.`,
  procedure: `For procedure questions, use the LEGAL REFERENCE DATA to describe the legal path as a coherent narrative: garde à vue limits (Art. 114-115), investigation phase, indictment, trial, appeal timeline (10 days), cassation (10 days from appeals decision), and statute of limitations (Art. 50). Present as flowing prose with clear transitions between phases.`,
  contracts: `For obligations and contracts questions, use the LEGAL REFERENCE DATA to explain formation validity, performance, breach consequences, compensation (Art. 77 DOC), force majeure (Art. 264 DOC), and enforcement mechanisms. Integrate practical risk points and article references naturally without list formatting.`,
  labor: `For labor-law questions, use the LEGAL REFERENCE DATA to explain employee and employer rights under the Labor Code (Law 65-99). Cite relevant article numbers for contract types (Arts. 13-16), working hours, wages (SMIG), dismissal procedure and severance pay (Arts. 39-40), social security obligations (CNSS), and dispute resolution. Be precise on deadlines and amounts.`,
  commercial: `For commercial-law questions, use the LEGAL REFERENCE DATA to explain merchant obligations, company formation (SARL/SA/SNC), commercial register requirements, business fund transfers, and insolvency procedures (Law 15-95). Cite relevant articles and explain practical consequences for trading entities.`,
  realestate: `For real estate questions, use the LEGAL REFERENCE DATA to explain title registration (immatriculation foncière), transfer requirements, mortgage and security rights, expropriation procedure, and co-ownership rules (Laws 39-08, 18-00, 7-81). Clarify the distinction between registered (titre foncier) and unregistered (melkia) property and its legal implications.`,
  ip: `For intellectual property questions, use the LEGAL REFERENCE DATA to explain copyright (automatic protection, duration, moral rights), trademark and patent registration at OMPIC, infringement remedies (civil and criminal), and enforcement tools such as saisie-contrefaçon (Law 22-97 and amendments). Be precise on registration requirements and penalty ranges.`,
  dataprotection: `For data protection questions, use the LEGAL REFERENCE DATA to explain Law 09-08 obligations: legal basis for processing, data subject rights (access, rectification, erasure, objection), CNDP declaration requirements, security obligations, and penalties for violations. Distinguish between ordinary personal data and sensitive categories.`,
  cybercrime: `For cybercrime questions, use the LEGAL REFERENCE DATA to cite the relevant Penal Code articles (607-1 to 607-7 as introduced by Law 07-03), electronic signature rules (Law 53-05), consumer protection for online transactions (Law 31-08), and online fraud / identity theft provisions. Be precise on article numbers and penalty ranges.`,
  environmental: `For environmental law questions, use the LEGAL REFERENCE DATA to explain EIA requirements (Law 12-03), water/air/waste pollution penalties, protected area rules, and civil/criminal liability for environmental damage (Laws 11-03, 28-00, 36-15). Explain the polluter-pays and precautionary principles and administrative enforcement powers.`,
  general: `For broad legal questions, provide a concise general explanation, reference any relevant articles from the LEGAL REFERENCE DATA if applicable, and maintain elegance, clarity, and legal precision.`,
};

// ── Off-topic guard ──────────────────────────────────────────────────────────
const LEGAL_KEYWORDS = [

  // ══════════════════════════════════════════════════════════
  // ENGLISH — Core legal terms
  // ══════════════════════════════════════════════════════════
  "law","legal","legally","legality","lawful","unlawful","illegal","illegally",
  "court","courts","courthouse","judge","judges","judiciary","judicial",
  "lawyer","lawyers","attorney","attorneys","counsel","barrister","solicitor","advocate",
  "lawsuit","lawsuits","lawsuit filed","case","cases","legal case","legal action",
  "penalty","penalties","fine","fines","prison","imprisonment","jail","incarceration",
  "sentence","sentenced","sentencing","statute","statutes","article","articles",
  "code","penal code","civil code","labor code","commercial code","family code",
  "regulation","regulations","regulatory","ordinance","decree","legislation",
  "verdict","verdicts","judgment","judgments","ruling","rulings","decision",
  "appeal","appeals","appealed","appealing","appellate","cassation","cassate",
  "complaint","complaints","petition","petitions","charge","charges","indictment",
  "police","gendarmerie","officer","law enforcement","arrest","arrested","detain","detention",
  "rights","right","civil rights","human rights","fundamental rights","constitutional",
  "contract","contracts","contractual","agreement","deed","notarial deed","covenant",
  "crime","crimes","criminal","criminally","felony","felonies","misdemeanor","misdemeanors",
  "offence","offenses","offense","violations","violation","infraction","infractions",
  "divorce","divorces","divorced","marriage","married","wed","wedlock","annulment",
  "custody","custodial","guardianship","guardian","ward","minor","minors","child","children",
  "inheritance","heir","heirs","estate","will","testament","probate","succession","legacy",
  "theft","stealing","steal","robbery","robbery","burglary","larceny",
  "fraud","fraudulent","swindle","swindling","embezzlement","forgery","forged",
  "assault","battery","bodily harm","injury","injured","wound","wounding","beating",
  "lease","leasing","rental","rent","tenant","landlord","eviction","evict","sublease",
  "obligation","obligations","liability","liable","duty","duties","breach","default",
  "damages","compensation","indemnity","indemnification","remedy","remedies","reparation",
  "trial","trials","hearing","hearings","prosecution","prosecute","defendant","defendants",
  "plaintiff","plaintiffs","claimant","claimants","witness","witnesses","testimony","evidence",
  "investigation","investigate","interrogation","interrogate","search","seizure","warrant",
  "jurisdiction","jurisdictional","competence","venue","authority","mandate",
  "employment","employee","employees","employer","employers","worker","workers",
  "salary","salaries","wage","wages","pay","payroll","remuneration","overtime",
  "dismissal","dismissed","termination","terminate","fired","layoff","redundancy","severance",
  "labor","labour","labor law","labour law","trade union","strike","picket","collective",
  "company","companies","corporation","incorporated","llc","sarl","partnership","firm",
  "merchant","merchants","trader","commercial","commerce","business","enterprise",
  "trademark","trademarks","brand","patent","patents","copyright","intellectual property",
  "data protection","personal data","privacy","gdpr","cndp","data breach","cyber",
  "hacking","hack","hacked","cybercrime","cyberattack","phishing","online fraud","identity theft",
  "environment","environmental","pollution","pollute","pollutant","contamination",
  "waste","hazardous waste","dumping","landfill","emissions","biodiversity",
  "property","properties","real estate","land","land registration","title deed","mortgage",
  "rape","sexual assault","sexual abuse","harassment","sexual harassment","stalking",
  "murder","homicide","manslaughter","killing","assassination","premeditated",
  "terrorism","terrorist","terror","extremism","radicalization","bomb","explosive",
  "trafficking","human trafficking","smuggling","forced labor","debt bondage","exploitation",
  "drugs","narcotics","drug trafficking","possession","controlled substance","cannabis",
  "weapons","arms","firearm","gun","knife","prohibited weapon","illegal weapon",
  "bribery","bribe","corrupt","corruption","kickback","embezzle","embezzlement",
  "statute of limitations","prescriptive period","limitation period","time limit",
  "insolvency","bankrupt","bankruptcy","liquidation","reorganization","creditor","debtor",
  "expropriation","compulsory purchase","public interest","eminent domain","compensation",
  "co-ownership","condominium","homeowner","association","copropriété",

  // ══════════════════════════════════════════════════════════
  // FRENCH — Core & expanded legal vocabulary
  // ══════════════════════════════════════════════════════════
  "loi","lois","législation","légal","légale","légalement","illégal","illégale","illicite",
  "tribunal","tribunaux","cour","cours","juridiction","judiciaire","justice",
  "juge","juges","magistrat","magistrats","parquet","procureur","substitut",
  "avocat","avocats","conseil","défenseur","barreau","notaire","huissier","greffier",
  "plainte","plaintes","porter plainte","dépôt de plainte","requête","pétition",
  "jugement","jugements","arrêt","décision","ordonnance","sentence","prononcé",
  "peine","peines","amende","amendes","prison","emprisonnement","détention","incarcération",
  "appel","appels","recours","pourvoi","cassation","révision","réformation",
  "procès","audience","débats","plaidoirie","instruction","inculpation","renvoi",
  "contrat","contrats","accord","convention","clause","avenant","résiliation","nullité",
  "bail","baux","loyer","locataire","propriétaire","sous-location","expulsion","congé",
  "crime","crimes","délit","délits","infraction","infractions","contravention","faute",
  "droit","droits","droit civil","droit pénal","droit du travail","droit commercial",
  "code civil","code pénal","code du travail","code de commerce","moudawana",
  "mariage","époux","épouse","conjoint","conjointe","fiançailles","dot","mahr",
  "divorce","séparation","répudiation","khul","dissolution","garde","hadana",
  "succession","héritage","héritier","héritiers","testament","legs","légataire",
  "nfaqa","pension alimentaire","entretien","obligation alimentaire",
  "travail","emploi","salarié","employé","employeur","licenciement","rupture","préavis",
  "salaire","rémunération","heures supplémentaires","congé","congé maternité",
  "smig","smic","syndicat","grève","convention collective","code du travail",
  "entreprise","société","sarl","société anonyme","associé","actionnaire","capital",
  "commerce","commerçant","acte de commerce","fonds de commerce","registre de commerce",
  "faillite","liquidation judiciaire","redressement judiciaire","sauvegarde","créancier",
  "marque","brevet","invention","propriété intellectuelle","droits d'auteur","contrefaçon",
  "données personnelles","vie privée","cndp","traitement de données","consentement",
  "vol","voleur","cambriolage","recel","escroquerie","abus de confiance","arnaque",
  "trafic","trafiquant","drogue","drogues","stupéfiant","stupéfiants","narcotique","cannabis",
  "terrorisme","terroriste","acte terroriste","financement du terrorisme","organisation terroriste",
  "arme","armes","port d'arme","arme à feu","arme blanche","arme prohibée",
  "corruption","corrompu","pot-de-vin","prise illégale d'intérêt","détournement de fonds",
  "traite","traite des êtres humains","proxénétisme","exploitation sexuelle",
  "homicide","meurtre","assassinat","coups","blessures","voie de fait","violence",
  "viol","agression sexuelle","attentat à la pudeur","harcèlement","harcèlement sexuel",
  "menace","intimidation","chantage","diffamation","injure","calomnie",
  "dette","créance","débiteur","créancier","recouvrement","saisie","saisie-exécution",
  "preuve","preuves","témoignage","témoin","aveu","constat","rapport d'expertise",
  "responsabilité","faute","préjudice","dommage","indemnisation","réparation","tort",
  "prescription","délai","délai de recours","forclusion","péremption","déchéance",
  "acte authentique","acte sous seing privé","légalisation","apostille",
  "mise en demeure","assignation","sommation","commandement","injonction",
  "propriété","immeuble","bien immobilier","titre foncier","immatriculation foncière",
  "hypothèque","rente","saisie immobilière","copropriété","lotissement",
  "expropriation","utilité publique","indemnité d'expropriation",
  "environnement","pollution","déchets","décharge","nuisance","impact environnemental",
  "piratage informatique","accès non autorisé","cybercriminalité","fraude informatique",
  "sanction","sanctions","condamnation","relaxe","acquittement","non-lieu",
  "détention provisoire","garde à vue","liberté provisoire","caution","contrôle judiciaire",
  "inculpé","prévenu","accusé","mis en examen","suspect","victime","partie civile",
  "gendarmerie","police judiciaire","officier de police judiciaire","opj","parquet",
  "litige","différend","conflit","contentieux","arbitrage","médiation","conciliation",
  "nullité","annulation","résolution","rescision","vice du consentement","dol","erreur",
  "capacité","incapacité","tutelle","curatelle","émancipation","mineur","majeur",
  "faux","usage de faux","document falsifié","faux en écriture","usurpation d'identité",
  "abus","détournement","malversation","prise illégale","favoritisme",

  // ══════════════════════════════════════════════════════════
  // ARABIC — Core, courts, procedure, family, penal, civil, commercial
  // ══════════════════════════════════════════════════════════
  // General law & courts
  "قانون","قوانين","تشريع","قانوني","قانونية","غير قانوني","مشروع","غير مشروع",
  "محكمة","محاكم","قضاء","قضائي","قضائية","هيئة قضائية","مجلس قضائي",
  "قاضي","قضاة","قاضية","مستشار","مستشارون","هيئة الحكم",
  "محامي","محامون","محامية","هيئة المحامين","نقابة المحامين","وكيل الدفاع",
  "نيابة","نيابة عامة","وكيل الملك","النائب العام","المدعي العام",
  "دعوى","دعاوى","دعوه","قضية","قضايا","ملف","ملفات","الدوسيه","إجراء","إجراءات",
  "شكوى","شكايا","شكاية","بلاغ","بلاغات","إخبار","محضر","محاضر",
  "حكم","أحكام","قرار","قرارات","أمر","أوامر","حكم ابتدائي","حكم نهائي",
  "استئناف","طعن","نقض","مراجعة","طعن بالنقض","محكمة الاستئناف","محكمة النقض",
  "عقوبة","عقوبات","جزاء","جزاءات","غرامة","غرامات","سجن","حبس","اعتقال","موقوف",
  "جناية","جنايات","جنحة","جنح","مخالفة","مخالفات","جريمة","جرائم",
  "متهم","متهمون","مشتبه به","ضحية","ضحايا","مدعي","مدعى عليه","طرف",
  "توقيف","احتجاز","اعتقال تعسفي","حراسة نظرية","حبس احتياطي","إفراج","ضمان",
  "تحقيق","تحقيقات","استجواب","تفتيش","حجز","ضبط","حكم بالبراءة","الإدانة",
  "اختصاص","اختصاص ترابي","اختصاص نوعي","اختصاص محلي","صلاحية",
  "تقادم","مدة التقادم","انقضاء","سقوط الحق","السقوط","مرور الزمن",
  "إجراءات قضائية","مسطرة","مسطرة مدنية","مسطرة جنائية","تبليغ","إعلام","استدعاء",
  "جلسة","جلسات","مرافعة","دفاع","دفوع","استنتاج","استنتاجات",
  "شاهد","شهود","شهادة","شهادة زور","إثبات","دليل","أدلة","حجة","قرينة",
  "دستور","دستوري","قانون أساسي","ظهير","مرسوم","قرار وزيري",
  "مادة","مواد","فصل","فصول","باب","أبواب","بند","بنود",
  // Family law
  "زواج","عقد زواج","زيجة","اقتران","نكاح","خطبة","خطوبة","مهر","صداق",
  "طلاق","تطليق","خلع","شقاق","فراق","رجعة","بينونة","عدة","إيلاء","ظهار",
  "حضانة","ولاية","ولاية على القاصر","كفالة","نسب","بنوة","انتساب",
  "نفقة","نفقة الزوجة","نفقة الأولاد","واجب النفقة","متعة","سكن الأسرة",
  "مدونة الأسرة","مدونة","الأحوال الشخصية","أسرة","عائلة","زوج","زوجة",
  "زوجته","زوجها","ابن","بنت","أبناء","أولاد","قاصر","بالغ","رشيد",
  "تعدد الزوجات","تعدد","زوجة ثانية","إذن بالزواج",
  "مضمون الطلاق","مآل الأولاد","حقوق الزوجة","واجبات الزوج",
  // Inheritance
  "إرث","ميراث","وراثة","تركة","ورثة","وارث","وارثون","موروث","موروثون",
  "وصية","وصايا","موصي","موصى له","وصي","ثلث التركة","ثلث","نصيب","حصة",
  "قسمة التركة","قسمة","شيوع","ملكية مشتركة","حقوق الورثة","مستحق",
  // Penal
  "سرقة","نهب","سطو","سطو مسلح","احتيال","تدليس","نصب","تزوير","اختلاس",
  "اعتداء","جرح","ضرب","ضرب وجرح","إيذاء جسدي","عنف","اغتصاب","هتك العرض",
  "قتل","قتل عمد","قتل خطأ","إهمال عمدي","جريمة القتل","اعتداء جنسي",
  "إرهاب","إرهابي","منظمة إرهابية","تمويل الإرهاب","تجنيد إرهابي",
  "مخدرات","حيازة مخدرات","تهريب مخدرات","تجارة المخدرات","حشيش","مواد مخدرة",
  "سلاح","أسلحة","سلاح ناري","حيازة سلاح","سلاح محظور","ذخيرة",
  "رشوة","ارتشاء","رشوة سلبية","رشوة إيجابية","فساد","إفساد","استغلال النفوذ",
  "اتجار بالبشر","تهريب بشر","عمل قسري","استغلال","قوادة","دعارة",
  "ابتزاز","تهديد","تخويف","إكراه","تشهير","قذف","سب","شتم",
  "جرائم إلكترونية","قرصنة","اختراق حاسوبي","اختراق","تصيد احتيالي","نصب إلكتروني",
  "شغب","أعمال شغب","تخريب","إتلاف","التقدم على الممتلكات",
  // Labor
  "شغل","عمل","عقد الشغل","عقد العمل","عامل","عمال","أجير","أجراء","موظف",
  "صاحب العمل","مشغل","رب العمل","فصل","طرد","إخطار","إشعار","أجل الإخطار",
  "أجر","أجور","الراتب","الحد الأدنى للأجر","أجر إضافي","ساعات عمل",
  "تعويض عن الفصل","تعويض طرد تعسفي","إشعار بالفصل","تقاعد","ضمان اجتماعي",
  "إضراب","نقابة","اتحاد","اتفاقية جماعية","تفاوض جماعي","صندوق الضمان الاجتماعي",
  // Civil & contracts
  "عقد","عقود","اتفاقية","اتفاق","وثيقة","سند","توثيق","إشهاد","تصريح",
  "بيع","شراء","اشترى","باع","شراء عقار","بيت","منزل","شقة","أرض","عقار",
  "كراء","عقد كراء","إيجار","مستأجر","مؤجر","إخلاء","إنهاء الكراء","رسوم الكراء",
  "التزام","التزامات","دين","ديون","دائن","مدين","وفاء","اعتراف بالدين",
  "تعويض","تعويضات","ضرر","أضرار","خسارة","تكاليف","قوة قاهرة","ظرف طارئ",
  "إخلال بالعقد","فسخ العقد","إبطال","بطلان","رضا","خطأ","تدليس","إكراه",
  "مسؤولية مدنية","مسؤولية","التزام بالتعويض","التعويض عن الضرر",
  "مضي المدة","تقادم مدني","أجل الطعن","ميعاد الطعن",
  // Real estate & commercial
  "تحفيظ","تحفيظ عقاري","رسم عقاري","مسطرة التحفيظ","مصلحة التحفيظ","طيطل فونسيي",
  "رهن","رهن عقاري","رهن حيازي","تسجيل الرهن","تفكيك الرهن",
  "ملكية","ملكية عقارية","حق الملكية","نزع الملكية","التعويض عن نزع الملكية",
  "ملكية مشتركة","طابق","عمارة","سينديكا","نظام الطابق المشترك",
  "شركة","شركات","ذات مسؤولية محدودة","شركة مساهمة","اندماج","تصفية","إفلاس",
  "تاجر","السجل التجاري","قيد تجاري","نشاط تجاري","محل تجاري","أصل تجاري",
  "صعوبات مقاولة","مسطرة التسوية","إعادة هيكلة","دائن","رتبة دائن",
  // IP & data protection
  "علامة تجارية","تسجيل العلامة","حقوق الطبع","حق المؤلف","اختراع",
  "براءة اختراع","تصميم صناعي","حقوق الملكية الفكرية","تقليد","انتحال",
  "حماية البيانات","بيانات شخصية","خصوصية البيانات","معالجة البيانات","CNDP",
  // Environment
  "بيئة","حماية البيئة","تلوث","ملوث","نفايات","تفريغ عشوائي","مياه عادمة",
  "تقييم الأثر البيئي","محمية طبيعية","صيد غير مشروع","تجريف",
  // Court structures & procedure extras
  "ابتدائية","محكمة ابتدائية","استئنافية","محكمة استئناف","غرفة","دائرة",
  "كتابة الضبط","قاضي التحقيق","غرفة الجنايات","غرفة الجنح","محكمة التجارة",
  "محكمة الأسرة","محكمة الإدارية","مجلس الدولة","المحكمة الدستورية",
  "نزاع","خلاف","مطالبة","طلب","عريضة","استدعاء","حضور","غياب",

  // ══════════════════════════════════════════════════════════
  // DARIJA — Moroccan colloquial legal vocabulary
  // ══════════════════════════════════════════════════════════
  // General — Darija spellings & phonetics
  "القانون","القضاء","المحكمه","المحكمة","الحق","الحقوق","الجريمه","الجريمة",
  "الحكم","القضيه","القضية","الملف","الدوسيه","المحامي","القاضي","النيابه",
  "شكاية","شكايه","شكاوي","بلاغ","محضر","إدانه","إدانة","براءه","براءة",
  "العقوبه","عقوبه","غرامه","غرامة","السجن","الاعتقال","التوقيف","الإفراج",
  "الاستئناف","الاستيناف","الطعن","النقض","قرار المحكمه","الحكم النهائي",
  // Family
  "الطلاق","الزواج","الحضانه","الحضانة","الولاية","الخلع","الشقاق","النفقه","النفقة",
  "زواج مدني","عقد الزواج","المهر","الصداق","الرجعه","الرجعة","الإيداع",
  "الأولاد","الأطفال","الأم","الأب","الجدة","الجد","الأخ","الأخت",
  "زوجها","زوجته","مرته","راجلها","راجلها","مولات الدار",
  "تعدد الزوجات","زوجه تانيه","الإذن بالزواج","الإذن من المحكمه",
  // Inheritance
  "الميراث","الإرث","الوراثة","التركه","التركة","الورثه","الورثة","حصة الإرث",
  "الوصيه","الوصية","ثلث التركه","قسمة التركه","حق الوارث",
  // Penal
  "السرقه","السرقة","الاحتيال","النصب","التزوير","الضرب","الجرح","الاعتداء",
  "القتل","الاغتصاب","التحرش","الإرهاب","المخدرات","الحشيش","تهريب المخدرات",
  "السلاح","حيازة السلاح","الرشوه","الرشوة","الفساد","الاختلاس","التهريب",
  "الاتجار بالبشر","الاستغلال","العمل القسري","الابتزاز","التهديد",
  "القرصنه","القرصنة","الاختراق","الجرائم الإلكترونيه","النصب الإلكتروني",
  // Labor
  "الشغل","العمل","عقد الشغل","الفصل من الشغل","الطرد التعسفي",
  "الأجر","الحد الأدنى","الراتب","التعويض","الضمان الاجتماعي","التقاعد",
  "الإضراب","النقابه","النقابة","اتفاقية الشغل","حق الشغل",
  // Civil & property
  "العقد","البيع","الشراء","الكراء","المنزل","الدار","الشقه","الشقة","الأرض","العقار",
  "الرهن","التحفيظ","الرسم العقاري","نزاع عقاري","ملكية الدار",
  "الدين","الديون","الدائن","المدين","الخسارة","التعويض المدني",
  // Commercial
  "الشركه","الشركة","الإفلاس","التصفية","السجل التجاري","التاجر","النزاع التجاري",
  "العلامه التجارية","براءة الاختراع","حق المؤلف","الملكية الفكرية",
  // Key Darija question starters / cues
  "واش يجوز","واش يمكن","واش خاصو","كيفاش دير","شنو هو","شنو هي","علاش",
  "فين نمشي","من حقي","من حقه","من حقها","حق القانون","كيحكم القانون",
  "فالمحكمه","فالمحكمة","القاضي كيقول","المحامي كيقول","الحكم كيكون",
  "مسطره قانونية","مسطرة قانونية","ملف القضيه","كيمشي الملف",
  "الاعتقال ديالو","العقوبة ديالو","ديال المحكمه","عند المحامي",
];


const OFF_TOPIC_RESPONSES = {
  ar: "سؤالك لا يتعلق بالقانون المغربي. أنا مساعد قانوني متخصص في القانون المغربي فقط، ولا أستطيع الإجابة على أسئلة خارج هذا النطاق. إذا كان لديك سؤال قانوني يخص القانون المغربي، يسعدني مساعدتك.",
  fr: "Votre question ne porte pas sur le droit marocain. Je suis un assistant juridique spécialisé uniquement dans le droit marocain et je ne peux pas répondre à des questions hors de ce domaine. Si vous avez une question juridique concernant le droit marocain, je serai heureux de vous aider.",
  en: "Your question does not appear to be related to Moroccan law. I am a legal assistant specialized exclusively in Moroccan law and cannot answer questions outside this scope. If you have a legal question concerning Moroccan law, I would be happy to help.",
  dar: "سؤالك ماشيش متعلق بالقانون المغربي. أنا مساعد قانوني متخصص فقط في القانون المغربي، وما كنقدرش نجاوب على أسئلة خارج هاد النطاق. إذا عندك سؤال قانوني على القانون المغربي، يسرني نعاونك.",
};

function normalizeArabic(text) {
  return (text || "")
    // Strip Latin accent marks (NFD decomposition) so hériter = heriter, etc.
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    // Strip Arabic diacritics (tashkeel) — U+0610..U+061A, U+064B..U+065F, U+0670
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670]/g, "")
    // Normalize all alef variants → plain alef ا
    .replace(/[أإآٱ]/g, "ا")
    // Normalize alef maksura → yeh
    .replace(/ى/g, "ي")
    // Normalize tah marbuta → heh
    .replace(/ة/g, "ه")
    .toLowerCase();
}

// Pre-normalize keywords once at startup so matching is fast
const NORMALIZED_LEGAL_KEYWORDS = LEGAL_KEYWORDS.map(normalizeArabic);

function isLegallyRelevant(userText, standardArabic) {
  const combined = normalizeArabic(`${userText || ""} ${standardArabic || ""}`);
  return NORMALIZED_LEGAL_KEYWORDS.some((k) => combined.includes(k));
}

// ── Domain classifier ────────────────────────────────────────────────────────
function detectDomain(text) {
  const t = (text || "").toLowerCase();

  const familyTerms = [
    "marriage", "divorce", "custody", "inherit", "inheritance", "moudawana", "nafaqa", "mahr", "sadaq", "khul", "polygam",
    "زوج", "زواج", "طلاق", "حضانة", "إرث", "ميراث", "مدونة الأسرة", "نفقة", "مهر", "خلع", "تعدد",
    "mariage", "garde", "héritage", "succession", "pension alimentaire",
  ];
  const penalTerms = [
    "theft", "vol", "robbery", "crime", "penalty", "criminal", "assault", "fraud", "arrest", "rape", "violence",
    "murder", "homicide", "terrorism", "trafficking", "drug", "weapon", "bribery", "corruption", "sport", "riot", "stade",
    "سرقة", "جريمة", "عقوبة", "جنائي", "اعتداء", "اغتصاب", "قتل", "إرهاب", "اتجار", "مخدر", "سلاح", "رشوة", "شغب",
    "fraude", "infraction", "peine", "viol", "trafic", "terrorisme", "arme",
  ];
  const procedureTerms = [
    "procedure", "appeal", "trial", "investigation", "evidence", "hearing", "detention", "garde à vue", "prescription",
    "statute of limitations", "jurisdiction", "cassation",
    "مسطرة", "إجراء", "استئناف", "محاكمة", "تحقيق", "توقيف", "تقادم", "اختصاص",
    "appel", "procès", "preuve", "procédure pénale",
  ];
  const contractTerms = [
    "contract", "lease", "obligation", "agreement", "damages", "breach", "liability", "force majeure", "rent", "sale",
    "عقد", "التزام", "كراء", "تعويض", "إخلال", "بيع", "شراء",
    "contrat", "bail", "obligations", "dommages", "responsabilité",
  ];
  const laborTerms = [
    "labor", "labour", "employment", "worker", "employee", "salary", "wage", "dismissal", "severance", "termination",
    "working hours", "overtime", "smig", "maternity", "strike", "union", "cnss", "social security",
    "travail", "salarié", "licenciement", "salaire", "employeur", "heures supplémentaires", "congé",
    "شغل", "عامل", "أجير", "فصل", "تعويض عن الفصل", "أجر", "ساعات العمل", "إضراب", "صناديق التقاعد",
  ];
  const commercialTerms = [
    "commercial", "commerce", "merchant", "company", "sarl", "société anonyme", "bankruptcy", "insolvency",
    "liquidation", "business fund", "fonds de commerce", "register", "registre de commerce",
    "تجاري", "شركة", "تاجر", "إفلاس", "تصفية", "السجل التجاري", "مسطرة صعوبات المقاولة",
  ];
  const realEstateTerms = [
    "real estate", "property", "land", "mortgage", "title", "immatriculation", "hypothèque", "foncier",
    "copropriété", "expropriation", "lease", "eviction", "titre foncier",
    "عقار", "ملكية عقارية", "رهن", "تحفيظ", "نزع الملكية", "طرد", "ملكية مشتركة",
  ];
  const ipTerms = [
    "trademark", "patent", "copyright", "intellectual property", "brand", "counterfeit", "ompic",
    "marque", "brevet", "droits d'auteur", "contrefaçon", "propriété intellectuelle",
    "علامة تجارية", "براءة اختراع", "حقوق النشر", "ملكية فكرية", "تقليد",
  ];
  const dataProtectionTerms = [
    "data protection", "personal data", "privacy", "gdpr", "cndp", "data breach",
    "données personnelles", "protection des données",
    "بيانات شخصية", "حماية البيانات", "خصوصية",
  ];
  const cybercrimeTerms = [
    "cyber", "hacking", "phishing", "unauthorized access", "electronic", "online fraud", "identity theft",
    "piratage", "accès non autorisé", "fraude en ligne",
    "جرائم إلكترونية", "قرصنة", "اختراق", "نصب إلكتروني",
  ];
  const environmentalTerms = [
    "environment", "pollution", "waste", "eia", "biodiversity", "water pollution", "hazardous",
    "environnement", "déchets", "polluant", "étude d'impact",
    "بيئة", "تلوث", "نفايات", "حماية البيئة", "تقييم الأثر البيئي",
  ];

  if (familyTerms.some((k) => t.includes(k)))         return "family";
  if (penalTerms.some((k) => t.includes(k)))           return "penal";
  if (procedureTerms.some((k) => t.includes(k)))       return "procedure";
  if (laborTerms.some((k) => t.includes(k)))           return "labor";
  if (commercialTerms.some((k) => t.includes(k)))      return "commercial";
  if (realEstateTerms.some((k) => t.includes(k)))      return "realestate";
  if (ipTerms.some((k) => t.includes(k)))              return "ip";
  if (dataProtectionTerms.some((k) => t.includes(k)))  return "dataprotection";
  if (cybercrimeTerms.some((k) => t.includes(k)))      return "cybercrime";
  if (environmentalTerms.some((k) => t.includes(k)))   return "environmental";
  if (contractTerms.some((k) => t.includes(k)))        return "contracts";
  return "general";
}

function buildSystemPrompt(language, domain, userText, darijaIntent) {
  const lang = ["ar", "fr", "en", "dar"].includes(language) ? language : "ar";
  const primary = PRIMARY_SYSTEM_PROMPTS[lang] || PRIMARY_SYSTEM_PROMPTS["ar"];
  const domainPrompt = DOMAIN_PROMPTS[domain] || DOMAIN_PROMPTS.general;

  // RAG: retrieve most relevant article chunks by cosine similarity
  const ragChunks = retrieveTopChunks(userText, 4);
  // KB: existing keyword-based full-section context (complementary)
  const kbContext = getLegalContext(domain, userText);
  const sentencingNeeded = /penalt|sentence|prison|fine|amendе|emprisonnement|عقوبة|سجن|غرامة/.test((userText || "").toLowerCase());

  // Build combined context block: RAG first (most relevant), then full KB section
  const contextParts = [];
  if (ragChunks) contextParts.push(`MOST RELEVANT ARTICLES (ranked by relevance):\n${ragChunks}`);
  if (kbContext) contextParts.push(`FULL LEGAL REFERENCE:\n${kbContext}`);
  if (sentencingNeeded) contextParts.push(SENTENCING_KB);

  const legalCtxBlock = contextParts.length
    ? `\n\nLEGAL REFERENCE DATA (use these exact article numbers and penalties in your answer):\n${contextParts.join("\n\n---\n\n")}`
    : "";

  const langOverride =
    lang === "fr"
      ? "\n\nRappel impératif: répondez UNIQUEMENT en français, sans aucune exception."
      : lang === "ar"
      ? "\n\nتذكير حتمي: أجب باللغة العربية فقط، دون استثناء."
      : lang === "dar"
      ? "\n\nتذكير حتمي: أجب بالدارجة المغربية فقط، باستخدام كلمات مغربية طبيعية."
      : "";

  // For Darija: append intent-specific instructions when the client detected a clear intent
  const intentAddendum = (lang === "dar" && darijaIntent && DARIJA_INTENT_ADDENDA[darijaIntent])
    ? `\n\n${DARIJA_INTENT_ADDENDA[darijaIntent]}`
    : "";

  return `${primary}${legalCtxBlock}\n\nDomain instructions:\n${domainPrompt}${langOverride}${intentAddendum}`;
}

function getProviderErrorMessage(payload) {
  if (!payload) return "";
  if (typeof payload === "string") return payload;
  if (typeof payload?.message === "string") return payload.message;
  if (typeof payload?.error === "string") return payload.error;
  if (typeof payload?.error?.message === "string") return payload.error.message;
  if (Array.isArray(payload?.errors)) {
    const firstMessage = payload.errors
      .map((entry) => entry?.message || entry?.detail || entry?.error)
      .find((entry) => typeof entry === "string" && entry.trim());
    if (firstMessage) return firstMessage;
  }
  return "";
}

function isQuotaExceededError(payload) {
  const message = getProviderErrorMessage(payload).toLowerCase();
  if (!message) return false;

  return [
    "trial key",
    "limited to",
    "quota",
    "credit",
    "billing",
    "payment required",
    "exceeded",
  ].some((needle) => message.includes(needle));
}

function summarizeProviderFailure(payload) {
  if (!payload) return null;

  const message = getProviderErrorMessage(payload);
  return {
    id: payload?.id || null,
    code: payload?.code || payload?.error?.code || null,
    message: message || "Provider returned no usable content",
  };
}

function buildQaDegradedReply(language) {
  const lang = ["ar", "fr", "en", "dar"].includes(language) ? language : "ar";
  const replies = {
    ar: "تعذر توليد جواب مفصل الآن لأن مزود الذكاء الاصطناعي الاحتياطي وصل إلى الحد المسموح به مؤقتاً. يمكنك المتابعة لاحقاً بعد تجديد الحصة أو تفعيل مزود بديل. هذه المعلومات للتوعية العامة ولا تعد استشارة قانونية ملزمة.",
    fr: "Je ne peux pas générer une réponse détaillée pour le moment, car le fournisseur IA de secours a atteint sa limite temporaire. Vous pouvez réessayer après renouvellement du quota ou activation d'un autre fournisseur. Ces informations restent purement éducatives et ne remplacent pas un avis juridique.",
    en: "I cannot generate a detailed answer right now because the backup AI provider has temporarily reached its quota. Please retry after renewing quota or enabling an alternative provider. This remains educational information and not formal legal advice.",
    dar: "حالياً ما قدرتش نولد جواب مفصل حيث مزود الذكاء الاصطناعي الاحتياطي سالات ليه الحصة المؤقتة. تقدر تعاود المحاولة من بعد ملي يتجدد الكوطا ولا يتفعل مزود بديل. هاد المعلومات غير للتوعية القانونية وماشي استشارة قانونية رسمية.",
  };

  return replies[lang] || replies.ar;
}

function buildAnalysisDegradedReply(language) {
  const lang = ["ar", "fr", "en"].includes(language) ? language : "ar";
  const replies = {
    ar: "التحليل القانوني النصي المفصل غير متاح مؤقتاً لأن مزود الذكاء الاصطناعي وصل إلى الحد المسموح به. مع ذلك ما زال بإمكان التطبيق عرض النص المستخرج والتصنيف التقريبي وبعض المؤشرات المستخرجة بالقواعد المحلية.",
    fr: "L'analyse juridique rédigée n'est pas disponible temporairement, car le fournisseur IA a atteint sa limite. L'application peut toutefois continuer à afficher le texte extrait, une classification approximative et certains indicateurs issus des règles locales.",
    en: "Detailed prose analysis is temporarily unavailable because the AI provider has reached its quota. The app can still show the extracted text, an approximate classification, and some indicators derived from local rules.",
  };

  return replies[lang] || replies.ar;
}

app.use(cors());
app.use(express.json({ limit: "20mb" }));

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
    const inputMessages = Array.isArray(req.body?.messages) ? req.body.messages : [];
    if (inputMessages.length === 0) {
      return res.status(400).json({ error: "messages array is required" });
    }

    const lang = req.body?.language || "ar";
    const lastUserMessage = [...inputMessages].reverse().find((m) => m?.role === "user")?.content || "";
    console.log(`[QA] lang=${lang} | q=${lastUserMessage.slice(0, 200)}`);

    // ── Off-topic guard ────────────────────────────────────────────────────
    const standardArabicText = req.body?.standardArabic || "";
    if (!isLegallyRelevant(lastUserMessage, standardArabicText)) {
      const offTopicMsg = OFF_TOPIC_RESPONSES[lang] || OFF_TOPIC_RESPONSES.ar;
      return res.json({ content: offTopicMsg, offTopic: true });
    }

    // For Darija, use standard Arabic conversion for domain detection if provided by client
    const textForDomain = (lang === "dar" && standardArabicText) ? standardArabicText : lastUserMessage;
    const domain = detectDomain(textForDomain);
    // Combine last user message with standardArabic conversion for better RAG retrieval on Darija queries
    const textForRAG = standardArabicText
      ? `${lastUserMessage} ${standardArabicText}`
      : lastUserMessage;
    // Accept client-detected Darija intent for intent-specific prompt injection
    const darijaIntent = (lang === "dar" && req.body?.darijaIntent) ? String(req.body.darijaIntent).slice(0, 50) : null;
    const systemPrompt = buildSystemPrompt(lang, domain, textForRAG, darijaIntent);

    const messages = [
      { role: "system", content: systemPrompt },
      ...inputMessages.map((m) => ({ role: m.role, content: m.content })),
    ];

    // ── Suggestions fire in background immediately ──────────────────────
    const suggestionsPromise = (async () => {
      try {
        const cohereKey = process.env.COHERE_API_KEY;
        if (!cohereKey) return [];
        const langLabel = { ar: "Arabic", fr: "French", en: "English", dar: "Moroccan Darija" }[lang] || "Arabic";
        const sugPrompt = `You are a Moroccan law assistant. Based on this user question about Moroccan law: "${lastUserMessage.slice(0, 300)}"

Generate exactly 3 short natural follow-up questions the user might want to ask next, in ${langLabel}.
Return ONLY a JSON array of 3 strings, no explanation, no markdown, no numbering. Example: ["question 1","question 2","question 3"]`;
        const r = await fetch("https://api.cohere.com/v2/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${cohereKey}` },
          body: JSON.stringify({
            model: "command-a-03-2025",
            messages: [{ role: "user", content: sugPrompt }],
            temperature: 0.7,
            max_tokens: 200,
          }),
        });
        const sd = await r.json();
        const raw = sd?.message?.content?.[0]?.text || "";
        const match = raw.match(/\[[\s\S]*?\]/);
        if (match) {
          const arr = JSON.parse(match[0]);
          if (Array.isArray(arr)) return arr.slice(0, 3).map(String).filter(Boolean);
        }
      } catch {}
      return [];
    })();

    // ── 1. Python microservice (when PYTHON_SERVICE_URL is set) ─────────
    if (process.env.PYTHON_SERVICE_URL) {
      try {
        const pyBase = process.env.PYTHON_SERVICE_URL.replace(/\/+$/, "");
        const pyRes = await fetch(`${pyBase}/ask`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: lastUserMessage, top_k: 5 }),
          signal: AbortSignal.timeout(25000),
        });
        if (pyRes.ok) {
          const pyData = await pyRes.json();
          if (pyData?.answer) {
            const suggestions = await suggestionsPromise;
            return res.json({ content: pyData.answer, suggestions });
          }
        }
      } catch (pyErr) {
        console.warn(`[QA] Python unavailable → OpenRouter | ${pyErr.message}`);
      }
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;
    const cohereKey = process.env.COHERE_API_KEY;
    let lastGeminiData = null;
    let lastGroqData = null;
    let fallbackData = null;

    const geminiMessages = messages.map((m) => ({
      role: m.role === "system" ? "user" : m.role,
      parts: [{ text: m.content }],
    }));

    const tryGemini = async (model) => {
      if (!geminiKey) return null;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 18000);
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${geminiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: geminiMessages,
            generationConfig: { maxOutputTokens: 2500, temperature: 0.4 },
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        const data = await response.json();
        lastGeminiData = data;
        if (!response.ok) {
          console.warn(`[QA] Gemini/${model} -> ${response.status}`);
          return null;
        }
        const content = data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
        if (content && content.length > 100) {
          console.log(`[QA] answered by Gemini/${model} (${content.length} chars for ${lang})`);
          return content;
        }
      } catch (e) {
        console.warn(`[QA] Gemini/${model} fetch error | ${e.message}`);
      }
      return null;
    };

    const tryCohere = async () => {
      if (!cohereKey) return null;
      try {
        const response = await fetch("https://api.cohere.com/v2/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cohereKey}`,
          },
          body: JSON.stringify({
            model: COHERE_COMMAND_MODEL,
            messages,
            temperature: 0.4,
            max_tokens: 2500,
          }),
        });
        const data = await response.json();
        fallbackData = data;
        const content = data?.message?.content?.[0]?.text || null;
        if (response.ok && content) {
          console.log(`[QA] answered by Cohere/${COHERE_COMMAND_MODEL} (${content.length} chars for ${lang})`);
          return content;
        }
        if (isQuotaExceededError(data)) {
          console.warn(`[QA] Cohere quota exhausted`);
        }
      } catch (e) {
        console.warn(`[QA] Cohere fetch error | ${e.message}`);
      }
      return null;
    };

    const tryGroq = async () => {
      if (!groqKey) return null;
      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: GROQ_LLAMA_33_70B,
            messages,
            max_tokens: 2500,
            temperature: 0.4,
          }),
        });
        const data = await response.json();
        lastGroqData = data;
        if (!response.ok) {
          console.warn(`[QA] Groq/${GROQ_LLAMA_33_70B} -> ${response.status}`);
          return null;
        }
        const content = data?.choices?.[0]?.message?.content || null;
        if (content && content.length > 100) {
          console.log(`[QA] answered by Groq/${GROQ_LLAMA_33_70B} (${content.length} chars for ${lang})`);
          return content;
        }
      } catch (e) {
        console.warn(`[QA] Groq/${GROQ_LLAMA_33_70B} fetch error | ${e.message}`);
      }
      return null;
    };

    const text = `${lastUserMessage}`;
    const hasArabic = /[\u0600-\u06FF]/.test(text);
    const hasFrenchMarkers = /[àâçéèêëîïôûùüÿœæ]|\b(le|la|les|des|du|de|pour|droit|tribunal|mariage|plainte|succession|contrat)\b/i.test(text);
    const isMixedArFr = (hasArabic && hasFrenchMarkers) || ((lang === "ar" || lang === "dar") && hasFrenchMarkers) || (lang === "fr" && hasArabic);

    let routeSteps;
    if (isMixedArFr) {
      routeSteps = [
        { provider: "gemini", model: GEMINI_FLASH },
        { provider: "cohere" },
        { provider: "gemini", model: GEMINI_FLASH_LITE },
        { provider: "groq" },
      ];
      console.log(`[QA] route=mixed(ar+fr)`);
    } else if (lang === "ar" || lang === "dar") {
      routeSteps = [
        { provider: "gemini", model: GEMINI_FLASH },
        { provider: "gemini", model: GEMINI_FLASH_LITE },
        { provider: "cohere" },
        { provider: "groq" },
      ];
      console.log(`[QA] route=${lang}`);
    } else if (lang === "fr") {
      routeSteps = [
        { provider: "gemini", model: GEMINI_FLASH_LITE },
        { provider: "gemini", model: GEMINI_FLASH },
        { provider: "cohere" },
        { provider: "groq" },
      ];
      console.log(`[QA] route=fr`);
    } else {
      routeSteps = [
        { provider: "gemini", model: GEMINI_FLASH_LITE },
        { provider: "groq" },
        { provider: "gemini", model: GEMINI_FLASH },
        { provider: "cohere" },
      ];
      console.log(`[QA] route=en`);
    }

    for (const step of routeSteps) {
      let content = null;
      if (step.provider === "gemini") content = await tryGemini(step.model);
      else if (step.provider === "cohere") content = await tryCohere();
      else if (step.provider === "groq") content = await tryGroq();

      if (content) {
        const suggestions = await suggestionsPromise;
        return res.json({ content, suggestions });
      }
    }

    return res.status(200).json({
      content: buildQaDegradedReply(lang),
      suggestions: [],
      degraded: true,
      reason: "all_providers_exhausted",
      details: {
        gemini: summarizeProviderFailure(lastGeminiData),
        cohere: summarizeProviderFailure(fallbackData),
        groq: summarizeProviderFailure(lastGroqData),
      },
    });
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

    const ocrLang = (language === "ar" || language === "dar") ? "ara" : language === "fr" ? "fre" : "eng";

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
      if (isQuotaExceededError(data)) {
        console.warn(`[Analyze] Cohere quota exhausted | ${getProviderErrorMessage(data).slice(0, 160)}`);
        return res.json({
          analysis: buildAnalysisDegradedReply(lang),
          degraded: true,
          reason: "cohere_quota_exhausted",
        });
      }

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
      if (isQuotaExceededError(data)) {
        console.warn(`[Extract] Cohere quota exhausted | ${getProviderErrorMessage(data).slice(0, 160)}`);
        return res.json({ fallback: true, reason: "cohere_quota_exhausted" });
      }

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

/* ─── Legal Concept Explainer ─── */
app.post("/api/explain-concept", async (req, res) => {
  try {
    const cohereKey = process.env.COHERE_API_KEY;
    if (!cohereKey) return res.status(500).json({ error: "Missing COHERE_API_KEY" });

    const { concept, language, level, style, background } = req.body;
    if (!concept || typeof concept !== "string" || concept.trim().length === 0)
      return res.status(400).json({ error: "concept is required" });

    const lang = ["ar", "fr", "en"].includes(language) ? language : "ar";

    const levelMap = {
      ar: { beginner: "مبتدئ", intermediate: "متوسط", advanced: "متقدم" },
      fr: { beginner: "débutant", intermediate: "intermédiaire", advanced: "avancé" },
      en: { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" },
    };
    const styleMap = {
      ar: { simple: "بسيط جداً وسهل الفهم", detailed: "مع تفاصيل إضافية", technical: "تقني ودقيق" },
      fr: { simple: "très simple et accessible", detailed: "avec des détails supplémentaires", technical: "technique et précis" },
      en: { simple: "very simple and easy to follow", detailed: "with additional detail", technical: "technical and precise" },
    };
    const bgMap = {
      ar: { nonlawyer: "شخص عادي غير متخصص في القانون", business: "صاحب عمل أو تاجر", student: "طالب", parent: "ولي أمر أو أحد الوالدين" },
      fr: { nonlawyer: "non-spécialiste du droit", business: "chef d'entreprise ou commerçant", student: "étudiant(e)", parent: "parent ou tuteur" },
      en: { nonlawyer: "a non-lawyer member of the public", business: "a business owner or entrepreneur", student: "a student", parent: "a parent or guardian" },
    };

    const lvl = (levelMap[lang] || levelMap.ar)[level] || levelMap[lang].beginner;
    const sty = (styleMap[lang] || styleMap.ar)[style] || styleMap[lang].simple;
    const bg  = (bgMap[lang]   || bgMap.ar)[background]  || bgMap[lang].nonlawyer;

    const conceptSafe = concept.trim().slice(0, 300);

    const prompt = lang === "ar"
      ? `أنت مُعلِّم قانوني مغربي متخصص يشرح المفاهيم القانونية بأسلوب واضح ومبسط.

ملف المستخدم:
- مستوى الفهم: ${lvl}
- أسلوب الشرح المطلوب: ${sty}
- خلفية المستخدم: ${bg}

المفهوم القانوني: ${conceptSafe}

اشرح هذا المفهوم بالتفصيل مراعياً ملف المستخدم أعلاه، وفق هذا الهيكل الإلزامي:

١. التعريف البسيط
جملة واحدة يفهمها أي شخص.

٢. لماذا يهمك هذا المفهوم؟
ثلاثة أسباب عملية مرتبطة بحياة المستخدم اليومية في المغرب.

٣. كيف يعمل؟ (خطوات بسيطة)
اشرح الآلية القانونية في ٣ إلى ٥ خطوات واضحة.

٤. مثال مغربي واقعي
قدّم سيناريو حقيقي يمكن أن يحدث في المغرب مع توضيح كيف ينطبق المفهوم.

٥. ماذا يحدث إذا تجاهلت هذا المفهوم؟
اذكر ثلاثة عواقب محتملة من الأقل إلى الأشد خطورة.

٦. ما الذي يجب فعله عملياً؟
قدّم قائمة تحقق من ٤ إلى ٦ إجراءات قابلة للتنفيذ.

٧. الأخطاء الشائعة
اذكر خطأين أو ثلاثة أخطاء يقع فيها الناس وكيف تتجنبها.

٨. في القانون المغربي تحديداً
اذكر القوانين والمواد المغربية ذات الصلة (مدونة الأسرة، القانون الجنائي، قانون الالتزامات والعقود...).

٩. الخلاصة في جملة واحدة
أهم شيء يجب تذكره.

اكتب بأسلوب ودود ومباشر، واستخدم "أنت" ليشعر القارئ بأنك تخاطبه مباشرة. تجنب المصطلحات القانونية المعقدة إلا إذا شرحتها فوراً.`
      : lang === "fr"
      ? `Vous êtes un éducateur juridique marocain spécialisé qui explique les concepts juridiques de manière claire et accessible.

Profil de l'utilisateur :
- Niveau de compréhension : ${lvl}
- Style d'explication souhaité : ${sty}
- Profil de l'utilisateur : ${bg}

Concept juridique : ${conceptSafe}

Expliquez ce concept en détail en tenant compte du profil ci-dessus, selon cette structure obligatoire :

1. DÉFINITION SIMPLE
Une phrase compréhensible par tout le monde.

2. POURQUOI C'EST IMPORTANT POUR VOUS ?
Trois raisons pratiques liées à la vie quotidienne au Maroc.

3. COMMENT ÇA FONCTIONNE ? (Étapes simples)
Expliquez le mécanisme en 3 à 5 étapes claires.

4. EXEMPLE MAROCAIN CONCRET
Un scénario réel qui peut se produire au Maroc avec application du concept.

5. QUE SE PASSE-T-IL SI VOUS IGNOREZ CE CONCEPT ?
Trois conséquences possibles, de la moins grave à la plus grave.

6. QUE FAIRE CONCRÈTEMENT ?
Une liste de vérification de 4 à 6 actions réalisables.

7. ERREURS COURANTES
Deux ou trois erreurs fréquentes et comment les éviter.

8. EN DROIT MAROCAIN SPÉCIFIQUEMENT
Lois et articles marocains applicables (Code de la Famille, Code Pénal, DOC...).

9. L'ESSENTIEL EN UNE PHRASE
La chose la plus importante à retenir.

Écrivez dans un style amical et direct, en utilisant "vous" pour s'adresser directement au lecteur. Évitez le jargon juridique sauf si vous l'expliquez immédiatement.`
      : `You are a Moroccan legal educator who explains legal concepts in clear, accessible language.

User profile:
- Understanding level: ${lvl}
- Explanation style: ${sty}
- User background: ${bg}

Legal concept: ${conceptSafe}

Explain this concept in detail adapted to the profile above, following this mandatory structure:

1. SIMPLE DEFINITION
One sentence anyone can understand.

2. WHY DOES THIS MATTER TO YOU?
Three practical reasons connected to daily life in Morocco.

3. HOW DOES IT WORK? (Simple steps)
Explain the mechanism in 3 to 5 clear steps.

4. REAL MOROCCAN EXAMPLE
A realistic scenario that could happen in Morocco showing the concept in action.

5. WHAT HAPPENS IF YOU IGNORE THIS CONCEPT?
Three possible consequences, from least to most serious.

6. WHAT CAN YOU DO PRACTICALLY?
A checklist of 4 to 6 actionable steps.

7. COMMON MISTAKES
Two or three frequent mistakes and how to avoid them.

8. IN MOROCCAN LAW SPECIFICALLY
Relevant Moroccan laws and articles (Family Code, Penal Code, Obligations & Contracts...).

9. THE KEY TAKEAWAY IN ONE SENTENCE
The single most important thing to remember.

Write in a friendly, direct style using "you" to address the reader. Avoid legal jargon unless immediately explained.`;

    const response = await fetch("https://api.cohere.com/v2/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${cohereKey}` },
      body: JSON.stringify({
        model: "command-a-03-2025",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
        max_tokens: 2800,
      }),
    });

    const data = await response.json();
    const content = data?.message?.content?.[0]?.text || null;
    if (!response.ok || !content) {
      if (isQuotaExceededError(data)) {
        console.warn(`[Explain] Cohere quota exhausted | ${getProviderErrorMessage(data).slice(0, 160)}`);
        return res.json({
          explanation: buildAnalysisDegradedReply(lang),
          degraded: true,
          reason: "cohere_quota_exhausted",
        });
      }

      return res.status(502).json({ error: "Cohere explanation failed", details: data });
    }

    return res.json({ explanation: content });
  } catch (error) {
    return res.status(500).json({ error: "Explanation error", details: error.message });
  }
});

/* ─── Contract Drafting ─── */
app.post("/api/draft-contract", async (req, res) => {
  try {
    const cohereKey = process.env.COHERE_API_KEY;
    if (!cohereKey) return res.status(500).json({ error: "Missing COHERE_API_KEY" });
    const { contractType, params, language } = req.body;
    if (!contractType) return res.status(400).json({ error: "contractType required" });
    const lang = ["ar", "fr", "en"].includes(language) ? language : "ar";
    const paramStr = Object.entries(params || {}).filter(([, v]) => v).map(([k, v]) => `- ${k}: ${v}`).join("\n");
    const typeLabelMap = {
      ar: { marriage: "عقد زواج", lease: "عقد كراء", sale: "عقد بيع" },
      fr: { marriage: "contrat de mariage", lease: "contrat de bail", sale: "contrat de vente" },
      en: { marriage: "marriage contract", lease: "lease agreement", sale: "sale contract" },
    };
    const typeLabel = (typeLabelMap[lang] || typeLabelMap.ar)[contractType] || contractType;
    const prompt = lang === "ar"
      ? `أنت محامٍ مغربي متخصص. أنشئ ${typeLabel} قانونياً كاملاً وفق القانون المغربي بناءً على البيانات التالية:\n\n${paramStr || "(بيانات غير مكتملة)"}\n\nالعقد يجب أن:\n- يتضمن ديباجة قانونية\n- يذكر أسماء الأطراف وبياناتهم\n- يحتوي على جميع البنود الإلزامية وفق القانون المغربي\n- يُحيل إلى المواد القانونية ذات الصلة\n- يتضمن بنوداً للفسخ والنزاعات\n- ينتهي بخانات التوقيع\n- لا يحتوي على أي أجزاء محذوفة أو معتمة أو [محذوف] أو أي علامات حذف\n- يكون كاملاً ومفصلاً دون حذف أي معلومات\n\naكتب العقد كاملاً جاهزاً للطباعة:`
      : lang === "fr"
      ? `Vous êtes un avocat marocain spécialisé. Rédigez un ${typeLabel} complet et légalement valide selon la loi marocaine à partir des données suivantes:\n\n${paramStr || "(données incomplètes)"}\n\nLe contrat doit:\n- Inclure un préambule juridique\n- Mentionner les parties et leurs coordonnées\n- Contenir toutes les clauses obligatoires selon le droit marocain\n- Référencer les articles de loi pertinents\n- Inclure des clauses de résiliation et de règlement des litiges\n- Se terminer par des blocs de signature\n- Ne contenir aucune partie supprimée, masquée ou [supprimé] ou marques de suppression\n- Être complet et détaillé sans omission d'informations\n\nRédigez le contrat complet prêt à imprimer:`
      : `You are a Moroccan legal specialist. Draft a complete, legally sound ${typeLabel} under Moroccan law using these details:\n\n${paramStr || "(incomplete data)"}\n\nThe contract must:\n- Include a legal preamble\n- Name and describe both parties\n- Contain all mandatory clauses under Moroccan law\n- Reference relevant legal articles\n- Include termination and dispute resolution clauses\n- End with signature blocks\n- Contain no redacted, blacked-out, or [REDACTED] sections or redaction marks\n- Be complete and detailed without omitting any information\n\nWrite the complete contract ready to print:`;
    const response = await fetch("https://api.cohere.com/v2/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${cohereKey}` },
      body: JSON.stringify({ model: "command-a-03-2025", messages: [{ role: "user", content: prompt }], temperature: 0.3, max_tokens: 3000 }),
    });
    const data = await response.json();
    const content = data?.message?.content?.[0]?.text || null;
    if (!response.ok || !content) return res.status(502).json({ error: "Cohere draft failed", details: data });
    
    // Remove any redactions or blacked-out sections
    const cleanedContract = content
      .replace(/\[[^\]]*(redact|محذوف|supprim|delete)[^\]]*\]/gi, '') // Remove [REDACTED], [محذوف], etc.
      .replace(/\[.*?\]/g, '') // Remove any remaining bracketed text that might be redactions
      .replace(/█+/g, '') // Remove black box characters
      .replace(/▉+/g, '') // Remove other black block characters
      .replace(/\*\*\*+/g, '') // Remove asterisks that might indicate redactions
      .replace(/_{3,}/g, '') // Remove underscores that might indicate redactions
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Clean up excessive line breaks
      .trim();
    
    return res.json({ contract: cleanedContract });
  } catch (error) {
    return res.status(500).json({ error: "Draft error", details: error.message });
  }
});

// ── Voice Transcription (Groq primary → HF fallback) ────────────────────────
app.post("/api/transcribe", async (req, res) => {
  try {
    const groqKey = process.env.GROQ_API_KEY;
    const hfKey   = process.env.HF_API_KEY;

    const { audio, language, mimeType = "audio/webm" } = req.body;
    if (!audio) return res.status(400).json({ error: "audio required" });

    const buffer  = Buffer.from(audio, "base64");
    const ext     = mimeType.includes("ogg") ? "ogg" : "webm";
    const langCode = (language === "ar" || language === "dar") ? "ar" : language === "fr" ? "fr" : "en";

    // Re-usable FormData factory (Blob can only be read once per fetch)
    const makeForm = (model = "whisper-large-v3-turbo") => {
      const blob = new Blob([buffer], { type: mimeType.split(";")[0] });
      const fd = new FormData();
      fd.append("file", blob, `audio.${ext}`);
      fd.append("model", model);
      fd.append("language", langCode);
      fd.append("response_format", "json");
      return fd;
    };

    // ── Primary: Groq (free tier, fastest Whisper available) ─────────────────
    if (groqKey) {
      try {
        const r = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
          method: "POST",
          headers: { Authorization: `Bearer ${groqKey}` },
          body: makeForm("whisper-large-v3-turbo"),
        });
        if (r.ok) {
          const d = await r.json();
          return res.json({ transcript: (d.text || "").trim() });
        }
        console.error("[Transcribe] Groq error:", r.status, await r.text());
      } catch (e) {
        console.error("[Transcribe] Groq fetch error:", e.message);
      }
    }

    // ── Fallback: HuggingFace Inference Router ────────────────────────────────
    if (hfKey) {
      try {
        const r = await fetch(
          "https://router.huggingface.co/hf-inference/models/openai/whisper-large-v3-turbo/v1/audio/transcriptions",
          {
            method: "POST",
            headers: { Authorization: `Bearer ${hfKey}` },
            body: makeForm("openai/whisper-large-v3-turbo"),
          }
        );
        if (r.ok) {
          const d = await r.json();
          return res.json({ transcript: (d.text || "").trim() });
        }
        const err = await r.text();
        return res.status(502).json({ error: "Transcription failed", details: err });
      } catch (e) {
        return res.status(500).json({ error: "HF fetch error", details: e.message });
      }
    }

    return res.status(500).json({
      error: "GROQ_API_KEY manquant. Obtenez une clé gratuite sur console.groq.com et ajoutez-la dans .env",
    });
  } catch (error) {
    return res.status(500).json({ error: "Transcription error", details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Moroccan Law QA proxy listening on http://localhost:${port}`);
});

// Global error handler — always returns JSON
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("[Global error]", err);
  res.status(500).json({ error: err.message || "Internal server error" });
});

export default app;
