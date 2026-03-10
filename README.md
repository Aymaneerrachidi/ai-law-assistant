# المساعد القانوني المغربي · Assistant Juridique Marocain · Moroccan Legal Assistant

> تطبيق ويب ذكي متعدد اللغات مخصص للقانون المغربي  
> Application web IA multilingue dédiée au droit marocain  
> Multilingual AI web app dedicated to Moroccan law

---

## 🇲🇦 العربية

### ما هو هذا التطبيق؟

**المساعد القانوني المغربي** هو تطبيق ويب مجاني يجمع بين الذكاء الاصطناعي وقاعدة معرفة قانونية متخصصة، يهدف إلى مساعدة المواطنين المغاربة على فهم القانون المغربي بأسلوب واضح وبسيط — دون الحاجة إلى خبرة قانونية مسبقة.

---

### الوضائف الرئيسية

#### 1. المحادثة القانونية (وضع الدردشة)
- اطرح أي سؤال قانوني مغربي بالعربية أو الفرنسية أو الإنجليزية
- الذكاء الاصطناعي يكتشف تلقائياً موضوع سؤالك (أسرة، جنائي، عقود، مسطرة) ويحقن السياق القانوني الصحيح من قاعدة المعرفة
- الإجابات تذكر أرقام المواد القانونية الدقيقة (مدونة الأسرة، القانون الجنائي، قانون الالتزامات والعقود...)
- تصميم محادثة احترافي مع إمكانية نسخ وتمديد الأجوبة

#### 2. تحليل الوثائق القانونية (وضع المستندات)
- ارفع وثيقة قانونية بتنسيق **PDF أو JPG أو PNG**
- استخراج النص تلقائياً:
  - من الصور: عبر OCR (OCR.Space API)
  - من PDF: استخراج مباشر
- **تصنيف الوثيقة تلقائياً**: عقد زواج، عقد إيجار، عقد بيع، محضر قضائي، قضية جنائية...
- **استخراج الكيانات** حسب نوع الوثيقة:
  - وثائق الأسرة: الأطراف، التواريخ، المبالغ، المهر، المواد القانونية
  - الوثائق القضائية: رقم القضية، القضاة، المتهمون، التهم، الأحكام
- **تحليل المخاطر القانونية**: يكتشف البنود الغائبة أو المخاطر المحتملة حسب نوع الوثيقة (خاص بكل نوع — لا تتداخل فحوصات عقد الزواج مع المحاضر القضائية)
- **استخراج ذكي بالذكاء الاصطناعي**: يعمل بالتوازي مع التحليل النثري (Cohere command-a-03-2025) لاستخراج بيانات منظمة JSON مع نسبة الثقة
- بطاقة استخبارات تعرض ملخصاً ثرياً للوثيقة: نوعها، كيانات مستخرجة، مخاطر، نسبة ثقة LLM

#### 3. شارح المفاهيم القانونية (وضع التعلم)
- اختر من **12 مفهوماً قانونياً** شائعاً مع أرقام مواد دقيقة، أو اكتب مفهوماً مخصصاً
- خصّص ملفك الشخصي:
  - **المستوى**: مبتدئ / متوسط / متقدم
  - **الأسلوب**: بسيط / مع تفاصيل / تقني
  - **الخلفية**: شخص عادي / صاحب عمل / طالب / ولي أمر
- الشرح يتبع **هيكلاً إلزامياً من 9 أقسام**: التعريف · لماذا يهمك · كيف يعمل · مثال مغربي واقعي · عواقب التجاهل · ماذا تفعل عملياً · أخطاء شائعة · المواد القانونية المغربية · الخلاصة
- المفاهيم تشمل: التقادم، الحضانة، المهر، النفقة، الإرث، الكراء، الطلاق، العنف في الملاعب، الوكالة، التوقيف للنظر...

---

### قاعدة المعرفة القانونية

التطبيق مدعوم بقاعدة بيانات قانونية مغربية متخصصة (`legal-kb.js`) تغطي:

| القانون | المحتوى |
|---------|---------|
| مدونة الأسرة (ق. 70-03) | الزواج، الطلاق، الحضانة، النفقة، الإرث — 30+ مادة |
| القانون الجنائي (ظ. 1-59-413) | العنف، الجنس، السرقة، الاحتيال، الإرهاب، الاتجار، المخدرات |
| قانون المسطرة الجنائية | التوقيف، الاختصاص، التقادم، هيكل المحاكم |
| قانون الالتزامات والعقود | العقود، المسؤولية، الإيجار، القوة القاهرة |

---

### التقنيات المستخدمة

| الطبقة | التقنية |
|--------|---------|
| الواجهة | React 18 + Vite |
| الخادم | Express.js (Node.js) |
| محادثة قانونية | OpenRouter API |
| تحليل الوثائق | Cohere `command-a-03-2025` |
| استخراج LLM | Cohere `command-a-03-2025` |
| شرح المفاهيم | Cohere `command-a-03-2025` |
| OCR للصور | OCR.Space API |
| اللغات | العربية (RTL) · الفرنسية · الإنجليزية |

---

### كيفية التشغيل

```bash
# 1. نسخ متغيرات البيئة
cp .env.example .env
# أضف مفاتيح API في ملف .env

# 2. تثبيت التبعيات
npm install

# 3. تشغيل الخادم (المنفذ 8787)
node server.js

# 4. تشغيل الواجهة (المنفذ 5173)
npm run dev
```

---

### ملاحظة قانونية

هذا التطبيق للتوعية القانونية العامة فقط ولا يُعد استشارة قانونية ملزمة. للحصول على مشورة قانونية خاصة بوضعك، يُنصح بالتواصل مع محامٍ مغربي مختص.

---
---

## 🇫🇷 Français

### Qu'est-ce que cette application ?

**L'Assistant Juridique Marocain** est une application web gratuite combinant intelligence artificielle et base de connaissances juridiques spécialisée, conçue pour aider les citoyens à comprendre le droit marocain de manière claire et accessible — sans expertise juridique préalable.

---

### Fonctionnalités principales

#### 1. Chat Juridique (Mode conversation)
- Posez toute question juridique marocaine en arabe, français ou anglais
- L'IA détecte automatiquement le domaine (famille, pénal, contrats, procédure) et injecte les références légales exactes depuis la base de connaissances
- Les réponses citent les numéros d'articles exacts (Code de la Famille, Code Pénal, DOC, CPP...)
- Interface de chat professionnelle avec copie et réponses extensibles

#### 2. Analyse de Documents Juridiques (Mode documents)
- Importez un document au format **PDF, JPG ou PNG**
- Extraction automatique du texte :
  - Depuis images : via OCR (API OCR.Space)
  - Depuis PDF : extraction directe
- **Classification automatique** : contrat de mariage, bail, acte de vente, procès-verbal, affaire pénale...
- **Extraction d'entités** selon le type de document :
  - Documents familiaux : parties, dates, montants, sadaq, articles juridiques
  - Documents judiciaires : numéro d'affaire, juges, prévenus, charges, verdict
- **Analyse des risques juridiques** : détecte les clauses manquantes ou risques potentiels selon le type de document (totalement isolée par type — les vérifications d'un contrat de mariage ne s'appliquent pas à un PV judiciaire)
- **Extraction IA parallèle** : fonctionne en parallèle avec l'analyse prose (Cohere) pour extraire des données JSON structurées avec un score de confiance
- Carte de renseignement affichant un résumé riche : type du document, entités extraites, risques, taux de confiance LLM

#### 3. Explicateur de Concepts Juridiques (Mode apprentissage)
- Choisissez parmi **12 concepts juridiques** courants avec références d'articles précises, ou saisissez un concept personnalisé
- Personnalisez votre profil :
  - **Niveau** : Débutant / Intermédiaire / Avancé
  - **Style** : Très simple / Avec détails / Technique
  - **Profil** : Non-spécialiste / Chef d'entreprise / Étudiant / Parent
- L'explication suit une **structure obligatoire en 9 sections** : Définition · Pourquoi ça vous concerne · Comment ça fonctionne · Exemple marocain concret · Conséquences de l'ignorance · Que faire concrètement · Erreurs courantes · Droit marocain spécifiquement · L'essentiel en une phrase
- Concepts couverts : prescription, garde d'enfants, douaire, pension alimentaire, succession, bail, divorce, violence dans les stades, procuration, garde à vue...

---

### Base de Connaissances Juridiques

L'application est alimentée par une base de données juridique marocaine spécialisée (`legal-kb.js`) couvrant :

| Code | Contenu |
|------|---------|
| Code de la Famille (Loi 70-03) | Mariage, divorce, garde, pension, succession — 30+ articles |
| Code Pénal (Dahir 1-59-413) | Violences, infractions sexuelles, vol, fraude, terrorisme, trafic, drogues |
| Code de Procédure Pénale | Garde à vue, compétence, prescription, structure des tribunaux |
| DOC (Obligations & Contrats) | Contrats, responsabilité, bail, force majeure |

---

### Technologies Utilisées

| Couche | Technologie |
|--------|-------------|
| Frontend | React 18 + Vite |
| Backend | Express.js (Node.js) |
| Chat juridique | OpenRouter API |
| Analyse de documents | Cohere `command-a-03-2025` |
| Extraction LLM | Cohere `command-a-03-2025` |
| Explication concepts | Cohere `command-a-03-2025` |
| OCR images | OCR.Space API |
| Langues | Arabe (RTL) · Français · Anglais |

---

### Démarrage rapide

```bash
# 1. Copier les variables d'environnement
cp .env.example .env
# Ajoutez vos clés API dans .env

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur (port 8787)
node server.js

# 4. Lancer le frontend (port 5173)
npm run dev
```

---

### Avertissement juridique

Cette application est fournie à titre éducatif uniquement et ne constitue pas un conseil juridique formel. Pour une situation spécifique, consultez un avocat marocain qualifié.

---
---

## 🇬🇧 English

### What is this app?

**Moroccan Legal Assistant** is a free, AI-powered web application that combines a large language model with a structured Moroccan legal knowledge base. It helps citizens, students, business owners, and anyone dealing with Moroccan law understand their rights and legal options in clear, accessible language — no legal background required.

---

### Core Features

#### 1. Legal Chat (Chat mode)
- Ask any Moroccan law question in **Arabic, French, or English**
- The AI automatically detects the legal domain (family, penal, contracts, criminal procedure) and injects the correct legal context and article references from the knowledge base into its system prompt
- Answers naturally cite exact article numbers from the Family Code, Penal Code, Code of Criminal Procedure, and Obligations & Contracts Code
- Professional chat UI with copy-to-clipboard, expandable answers, and multi-turn conversation history

#### 2. Legal Document Analysis (Documents mode)
- Upload a legal document as **PDF, JPG, or PNG**
- Automatic text extraction:
  - Images: OCR via OCR.Space API (Arabic + French + English modes)
  - PDFs: direct text extraction via PDF.js
- **Automatic document classification**: detects marriage contract, lease, sale deed, court report, criminal case, and more — using a weighted multi-signal scorer with negative indicators (e.g., court documents are penalised against marriage keywords to prevent mis-classification)
- **Type-specific entity extraction** based on detected document type:
  - Family documents: parties, dates, financial amounts, mahr/sadaq, legal articles
  - Court/criminal documents: case numbers, judges, defendants, charges, verdicts
- **Context-isolated risk analysis**: each document type has its own risk checks — marriage contract risks (missing witnesses, underage parties, missing mahr) never appear on court reports, and vice versa
- **Parallel LLM extraction**: fires alongside the prose analysis call via `Promise.allSettled` — Cohere extracts a structured JSON object with `docType`, `confidence` %, `reasoning`, and full entities; falls back to rule-based extraction if LLM fails
- **Intelligence card** displays: document type badge, LLM confidence %, extracted entities, risk flags, extracted text preview

#### 3. Legal Concepts Explainer (Learn mode)
- Choose from **12 key legal concepts** with precise article references displayed on each card, or type any custom concept
- Customise your learning profile:
  - **Level**: Beginner / Intermediate / Advanced
  - **Style**: Very simple / With detail / Technical
  - **Background**: Non-lawyer / Business owner / Student / Parent
- Explanations follow a **mandatory 9-section structure**: Simple definition · Why it matters to you · How it works (step by step) · Real Moroccan example · Consequences of ignoring it · Practical checklist · Common mistakes · Moroccan law specifically (with article numbers) · Key takeaway in one sentence
- Copy button on result; one-click reset to explain another concept
- Concepts covered: statute of limitations, child custody, mahr/dower, alimony/nafaqa, inheritance, lease contracts, divorce & repudiation, sports violence/rioting, power of attorney, police detention/garde à vue, and more

---

### Legal Knowledge Base

The app is backed by a dedicated Moroccan legal knowledge base (`legal-kb.js`) that is dynamically injected into AI system prompts based on the detected question domain:

| Code | Coverage |
|------|----------|
| Family Code — Law 70-03 (2004) | Marriage, divorce, custody, maintenance, inheritance — 30+ articles |
| Penal Code — Dahir 1-59-413 (1962, amended 2019) | Violence, sexual offenses, theft, fraud, terrorism, trafficking, drugs, sports rioting |
| Code of Criminal Procedure | Garde à vue limits, jurisdiction, statute of limitations, court hierarchy |
| Obligations & Contracts Code (DOC) | Contract formation, liability, lease, force majeure |

The domain detector scans the user's message for 80+ keywords across Arabic, French, and English to select the right KB sections, including sub-topic refinement (e.g., sports keywords load the sports violence articles even within a general penal query).

---

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite (port 5173) |
| Backend | Express.js / Node.js (port 8787) |
| Legal chat | OpenRouter API |
| Document analysis | Cohere `command-a-03-2025` |
| LLM extraction | Cohere `command-a-03-2025` |
| Concept explanation | Cohere `command-a-03-2025` |
| Image OCR | OCR.Space API |
| Languages | Arabic (RTL) · French · English |
| Design | Dark theme · Cairo font (Arabic) · Josefin Sans (Latin) |

---

### Environment Variables

Copy `.env.example` to `.env` and fill in your API keys:

```env
OPENROUTER_API_KEY=your_openrouter_key
OPENROUTER_MODEL=openai/gpt-4o-mini       # or any OpenRouter model
COHERE_API_KEY=your_cohere_key
OCR_SPACE_API_KEY=your_ocr_space_key
PORT=8787
```

---

### Getting Started

```bash
# 1. Clone and install
git clone https://github.com/Aymaneerrachidi/ai-law-assistant.git
cd ai-law-assistant
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your API keys

# 3. Start the backend proxy (port 8787)
node server.js

# 4. Start the frontend dev server (port 5173)
npm run dev

# Then open http://localhost:5173
```

---

### Project Structure

```
├── moroccan-law-qa.jsx   # Main React component (single-file app)
├── server.js             # Express backend — API proxy for all AI calls
├── legal-kb.js           # Moroccan legal knowledge base (articles, penalties, procedures)
├── src/
│   ├── main.jsx          # React entry point
│   └── App.jsx           # App shell
├── index.html            # HTML entry
├── vite.config.js        # Vite configuration
├── .env.example          # Environment variable template (no real keys)
└── package.json
```

---

### Legal Disclaimer

This application is for general legal education only and does not constitute formal legal advice. For guidance specific to your situation, consult a qualified Moroccan lawyer (*avocat inscrit au Barreau du Maroc*).

---

*Built with ❤️ for Moroccan legal literacy — مبني لخدمة الوعي القانوني المغربي*
