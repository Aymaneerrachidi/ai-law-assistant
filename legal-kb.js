/**
 * Moroccan Legal Knowledge Base
 * Structured reference data injected into AI system prompts for accurate legal answers.
 * Sources: Moroccan Penal Code (Dahir 1-59-413, 1962 + 2019 amendments),
 *          Family Code / Moudawana (Dahir 1-04-22, Law 70-03, 2004),
 *          Code of Criminal Procedure, Civil Code, Commercial Code.
 */

/* ─────────────────────────────────────────────
   FAMILY LAW (Moudawana – Law 70-03 / 2004)
───────────────────────────────────────────── */
export const FAMILY_KB = `
FAMILY CODE (MOUDAWANA) – KEY ARTICLES
Sources: Dahir 1-04-22 of February 3, 2004, Law No. 70-03. Maliki school applies where code is silent (Art. 400).

MARRIAGE FORMATION:
• Art. 3  – Marriage is a legal relationship between a man and a woman
• Art. 5  – Engagement (khitba) creates no contractual obligation
• Art. 12 – Contract requires: offer/acceptance, guardian presence, two witnesses, recorded mahr
• Art. 13 – Full and free consent is mandatory; marriage void without it
• Art. 19 – Legal marriage age: 18 for both men and women
• Art. 20 – Judge may authorize marriage under 18 for compelling reasons; judge must verify maturity and benefit
• Art. 24 – Adult woman may conclude her own marriage contract (no mandatory guardian)
• Art. 25 – Woman may appoint her father or male relative as guardian (wakil) if she chooses
• Art. 26-29 – Absolute prohibitions: mahram relatives, prior marriage impediments, incompatible religions

MAHR (SADAQ / DOWER):
• Art. 26 – Mahr is the wife's exclusive right; husband cannot claim it back after valid marriage
• Art. 28 – Amount must be agreed; if not fixed, judge sets a mahr al-mithl
• Art. 29 – Mahr must be recorded in marriage contract

POLYGAMY (strictly controlled):
• Art. 40 – New marriage while first marriage subsists requires PRIOR judicial authorization
• Art. 41 – Judge grants authorization only if: first wife's written consent obtained, husband proves financial capacity, no harm to first wife/children
• Art. 42 – Judge notifies first wife; she may seek divorce on grounds of harm
• Art. 43 – Judge refuses if financial capacity not proven

DIVORCE:
• Art. 77 – Marriage can only be dissolved by judicial decree
• Art. 79 – Grounds for judicial divorce: harm/discord, failure to pay nafaqa, husband's absence >1 year, husband's imprisonment >3 years, serious defect, khul'
• Art. 80 – Mutual consent divorce (shiqaq): judge appoints two arbiters; mediates for up to 6 months
• Art. 82 – Repudiation (talaq) requires court authorization; no valid repudiation without court stamp
• Art. 83 – Court fixes wife's financial rights (mut'a, nafaqa, housing) before recording talaq
• Art. 84 – Idda (waiting period): 3 menstrual cycles for divorced wife; 4 months 10 days for widow
• Art. 89 – Khul' divorce: wife pays compensation to husband; compensation set by judge if no agreement
• Art. 93 – Revocable vs. irrevocable talaq: third talaq is irrevocable

CUSTODY (HADANA):
• Art. 163 – Custody is child's right, not parents' right
• Art. 166 – Priority order: mother → father → maternal grandmother → paternal grandmother → maternal aunt → paternal aunt → other relatives
• Art. 167 – Mother loses custody if she remarries (unless judge decides otherwise in child's interest)
• Art. 171 – Custody continues until: age 7 (male child), puberty (female child) — unless judge extends based on interest
• Art. 175 – Non-custodial parent has right of access; judge fixes schedule
• Art. 177 – Guardian (wali) is father; if father absent, maternal grandfather appointed

MAINTENANCE (NAFAQA):
• Art. 168 – Father pays child maintenance regardless of custody
• Art. 189 – Maintenance includes housing, food, education, healthcare
• Art. 190 – Amount set by judge based on father's resources and child's needs; indexed to cost of living

SUCCESSION & INHERITANCE:
• Art. 276 – Succession opens at death; estate vests in heirs immediately
• Art. 278 – Testator must be of sound mind (18+, not incapacitated) to make a will
• Art. 279 – Will (wasiya): cannot exceed 1/3 of estate for non-heirs; bequest to heir valid only if other heirs consent
• Art. 285 – Islamic (Maliki) obligatory shares: daughter = 1/2, two daughters = 2/3, mother = 1/6 or 1/3, wife = 1/8 or 1/4, husband = 1/2 or 1/4
• Art. 332 – Obligatory bequest for grandchildren whose parent predeceased the grandparent (Arts 369-372)

CIVIL REGISTRATION:
• Art. 53 – Marriage must be recorded with civil status officer within 3 months of contract
• Art. 58 – Unregistered marriage may be validated by adoul or judge if its conditions are met`;

/* ─────────────────────────────────────────────
   PENAL CODE – GENERAL VIOLENCE & HOMICIDE
───────────────────────────────────────────── */
export const PENAL_VIOLENCE_KB = `
PENAL CODE – VIOLENCE & HOMICIDE ARTICLES
Source: Dahir 1-59-413 (1962), amended by Law 33-18 (2019).

OFFENSE SEVERITY CLASSES:
• Jnaiya (جناية) – serious felony: 5 years to life / death
• Jnha (جنحة) – misdemeanor: 2 months to 5 years + fine
• Mukhalafa (مخالفة) – violation: warning to 3 days custody

HOMICIDE:
• Art. 390 – Premeditated murder (qatl 'amad ma' sbaqa niya): death penalty (commuted to life in practice)
• Art. 401 – Non-premeditated murder: 20–30 years imprisonment
• Art. 402 – Manslaughter / negligent homicide: 3 months–5 years + fine

ASSAULT & BODILY HARM:
• Art. 393 – Simple assault causing injury: 1–6 months, 200–1,000 DH fine
• Art. 394 – Assault causing permanent disability / loss of organ: 2–6 years, 2,000–10,000 DH
• Art. 395 – Assault causing illness/incapacity exceeding 20 days: 1–3 years
• Art. 396 – Assault on child under 14, woman, public official: doubled penalties
• Art. 398 – Assault with weapon: minimum 3 years; doubled penalties apply

SEXUAL OFFENSES:
• Art. 475 – Rape: 5–10 years; victim under 18: 10–20 years; rape within marriage: 5–10 years
• Art. 476 – Rape with aggravating circumstances (gang, weapon, incest): 20–30 years
• Art. 477 – Indecent assault without penetration: 1–5 years; on minor: 5–10 years
• Art. 478 – Incest: 5–10 years
• Art. 479 – Consensual sexual relations with minor under 18: 1–3 years

SPORTS & PUBLIC ORDER VIOLENCE (added by Law 33-18):
• Art. 306-1 – Introducing/using incendiary or pyrotechnic materials in sports facilities: 1–2 years, 5,000–20,000 DH
• Art. 306-2 – Disturbing public order in sports venues: 1–2 years, 5,000–20,000 DH
• Art. 306-3 – Violence/rioting during sporting events: 1–2 years, 5,000–20,000 DH; doubled for organizers/inciters
• Art. 306-4 – Failure by organizers to prevent prohibited behavior: 6 months–1 year, 2,000–5,000 DH
• Additional sports penalties: stadium ban 1–5 years, ban on team colors/travel during matches`;

/* ─────────────────────────────────────────────
   PENAL CODE – PROPERTY CRIMES
───────────────────────────────────────────── */
export const PENAL_PROPERTY_KB = `
PENAL CODE – PROPERTY CRIME ARTICLES

THEFT:
• Art. 467 – Simple theft: 1–2 years, 100–2,000 DH
• Art. 468 – Aggravated theft (dwelling, night, gang, weapons): 2–10 years, 200–5,000 DH
• Art. 469 – Robbery (theft using force or threats): 3–10 years, 500–10,000 DH
• Art. 470 – Armed robbery: 5–10 years
• Art. 471 – Gang robbery: 5–20 years
• Art. 472 – Robbery with violence causing injury: 5–20 years; causing death: 30 years

FRAUD & FINANCIAL CRIMES:
• Art. 450 – Fraud/swindling (escroquerie): 1–3 years, 250–5,000 DH; aggravated: up to 5 years
• Art. 234 – Document forgery: 6 months–3 years
• Art. 235 – Using forged documents: 1–5 years; same penalties as forgery if greater
• Art. 213 – Currency counterfeiting: 5–10 years, heavy fines

CORRUPTION & ABUSE OF POWER:
• Art. 248 – Active bribery of public official: 5–10 years, 10,000–100,000 DH
• Art. 249 – Passive bribery (official receiving): 5–10 years, same fine
• Art. 250 – Abuse of power / influence peddling: 3–5 years, 5,000–50,000 DH`;

/* ─────────────────────────────────────────────
   PENAL CODE – SPECIALIZED OFFENSES
───────────────────────────────────────────── */
export const PENAL_SPECIAL_KB = `
PENAL CODE – SPECIALIZED OFFENSES

HUMAN TRAFFICKING (Law 27-14 / 2016, integrated into Penal Code):
• Art. 448-10 – Trafficking in human beings: 1–5 years, 5,000–50,000 DH
• Art. 448-11 – Forced labor / debt bondage: same penalties
• Art. 448-12 – Trafficking a minor (under 18): doubled penalties (2–10 years, 10,000–100,000 DH)
• Art. 448-13 – Victims not criminally liable for acts committed as result of being trafficked
• Art. 448-14 – Extraterritorial jurisdiction: Morocco may prosecute regardless of where offense occurred

TERRORISM (Law 40-15 / 2015):
• Art. 218-1 – Terrorism definition: acts intended to cause disorder, terror, intimidate state/public
• Art. 218-2 – Membership in terrorist organization: 10–30 years
• Art. 218-3 – Supporting terrorists / providing safe haven: 5–10 years
• Art. 218-4 – Financing terrorism: life imprisonment or 30 years
• Art. 218-5 – Providing funds / setting up financing channels: same penalties

DRUGS (Law 68-00 / Code modifications):
• Art. 209 – Possession for personal use: 1 month–1 year, 500–5,000 DH
• Art. 210 – Drug trafficking: 2–10 years, 5,000–50,000 DH
• Art. 211 – Drug manufacture / production: 5–10 years, 10,000–100,000 DH
• Art. 212 – Large-scale trafficking / organized crime: 10–20 years, 100,000–1,000,000 DH

WEAPONS:
• Art. 317 – Illegal possession of weapon: 3 months–2 years
• Art. 318 – Carrying concealed weapon in public: 6 months–1 year
• Art. 320 – Automatic / prohibited weapons: 2–5 years`;

/* ─────────────────────────────────────────────
   CODE OF CRIMINAL PROCEDURE
───────────────────────────────────────────── */
export const PROCEDURE_KB = `
CODE OF CRIMINAL PROCEDURE – KEY PROVISIONS

ARREST & GARDE À VUE (Preliminary Detention):
• Art. 114 – Police may detain suspect for initial questioning: max 24 hours
• Art. 115 – Extension: up to 48 hours total; up to 72 hours for serious crimes with prosecutor authorization
• Terrorism / organized crime: up to 96 hours with special judicial authorization
• Suspect has right to have a family member notified and access to a lawyer after 24 hours

INVESTIGATION PHASE:
• Time limit: 3 months (renewable by investigating judge); 6 months for serious crimes
• Investigating judge may indict, dismiss, or refer to trial
• Art. 227 – Arbitrary detention by public servants: criminal liability

STATUTE OF LIMITATIONS (Art. 50):
• Capital crimes / felonies (jnaiya): 10 years from date of offense
• Misdemeanors (jnha): 3 years from date of offense
• Violations (mukhalafa): 1 year from date of offense
• Crimes against humanity / genocide: imprescriptible (no limitation)

JURISDICTION (Art. 704):
• Moroccan courts have jurisdiction over offenses committed on Moroccan territory
• Also over offenses committed abroad by Moroccan nationals (if under Moroccan law and carrying 1+ year sentence)

TRIAL RIGHTS:
• Art. 65 – Court may grant witness protection measures
• Art. 87 (Constitution) – Right to fair trial; right to be heard; right to counsel
• Right to interpreter if needed

COURT STRUCTURE:
• District/Municipal courts: minor violations, civil disputes < ~1,000 DH
• Courts of First Instance (68 total): general criminal, civil, family, commercial
• Courts of Appeal (21 total): hear appeals from first instance
• Court of Cassation (Supreme Court): reviews legality of judgments, does not retry facts

APPEAL TIMELINES:
• Time to appeal: 10 days from judgment date
• Appeals court hearing: typically 3–6 months after filing
• Cassation filing: 10 days from appeals decision
• Average total criminal process (arrest → final judgment): 2–4 years`;

/* ─────────────────────────────────────────────
   CIVIL OBLIGATIONS & CONTRACTS (DOC)
───────────────────────────────────────────── */
export const CONTRACTS_KB = `
CIVIL CODE & OBLIGATIONS/CONTRACTS CODE (DOC) – KEY PROVISIONS
Sources: Dahir 1-57-179 (Civil Code), Dahir of 12 August 1913 (Obligations & Contracts).

CONTRACT FORMATION:
• A valid contract requires: offer + acceptance, legal capacity of parties, lawful object, and real cause
• Consent vitiated by error, fraud, or duress renders contract voidable
• Art. 230 – Contracts legally formed bind the parties as law between them
• Art. 456 – Sale contract: complete upon agreement on thing sold and price (even if not yet delivered/paid)

租约 / LEASE (KIRA):
• Art. 505+ – Lease must define property, term, rent amount
• Tenant cannot sublet without owner's written consent
• Eviction: court order required; owner cannot self-help evict
• Residential lease protections: Law 67-12 (2016) regulates residential tenancy

LIABILITY & DAMAGES:
• Art. 77 – Any person who causes harm through fault is liable to compensate
• Fault may be intentional (dol) or negligent (khata)
• Compensation covers actual damage (direct + consequential) and loss of earnings
• Art. 264 – Debtor not liable for force majeure (unforeseen, irresistible event)

STATUTE OF LIMITATIONS (Civil):
• General civil claim: 15 years from accrual (DOC default)
• Commercial claim: 5 years
• Tort / personal injury: 3 years from knowledge of damage and identity of tortfeasor

ENFORCEMENT:
• Civil judgment enforceable by execution department of court (huissier)
• Wage garnishment, property attachment, forced sale available
• Imprisonment for debt: NOT available for ordinary debts`;

/* ─────────────────────────────────────────────
   LABOR CODE (Law 65-99 / 2004)
───────────────────────────────────────────── */
export const LABOR_KB = `
LABOR CODE (Law 65-99 / 2004) – KEY PROVISIONS

EMPLOYMENT CONTRACT TYPES (Arts. 13–16):
• Art. 13 – Employment contract may be fixed-term or indefinite; written form required for fixed-term
• Art. 14 – Fixed-term contracts: max 1 year, renewable once; becomes indefinite if continued beyond maximum
• Art. 15 – Part-time employees enjoy same rights as full-time pro rata
• Art. 16 – Probation period: 3 months for executives/managers, 1.5 months for employees, 15 days for workers; renewable once

WAGES & WORKING TIME (Arts. 23, 201–205):
• Art. 23 – Employer must pay wages in national currency; cannot be paid in-kind only
• Minimum wage (SMIG): updated periodically by government decree; applies to all private-sector workers
• Maximum working hours: 44 hours/week (10 hours/day max)
• Overtime: paid at 125% of base (or 150% on rest days); Art. 201

EMPLOYEE PROTECTIONS (Arts. 39–40):
• Art. 39 – Gross misconduct justifying immediate dismissal: violence/assault at work, serious insubordination, theft, moral offenses, absences without notice >4 days/month
• Art. 40 – Unjustified dismissal (licenciement abusif): employee entitled to: (a) notice period (1 month for employees, 1.5 months for manager-level), (b) severance pay = 1/2 month wage × years of service for first 5 years + 2/3 month per year 6–10 + 1 month per year after 10, (c) damages if no fault

DISMISSAL PROCEDURE:
• Employer must: (1) summon employee for prior hearing, (2) notify in writing with reasons, (3) respect notice period (unless gross misconduct)
• Collective dismissal requires: prior consultation with workers' representatives, ANAPEC notification, labor inspector authorization for >10 employees

WOMEN & CHILD PROTECTION:
• Maternity leave: 14 weeks paid (Art. 152)
• Night work for women: allowed only in specific sectors with enhanced protections
• Minimum age for employment: 15 years (Art. 143); hazardous work: 18 years

LABOR DISPUTES:
• Individual disputes first go to labor inspector for conciliation
• If failed: Labor Court (Tribunal du Travail) in Courts of First Instance
• Collective disputes: Ministry of Labor mediation; then arbitration if needed

SOCIAL SECURITY / CNSS:
• Employer contribution: ~16.29% of wage; employee: ~4.29%
• Covers: sickness, maternity, disability, work accidents, retirement (60 years for private sector), death benefit`;

/* ─────────────────────────────────────────────
   COMMERCIAL CODE (Law 15-95 / 1996)
───────────────────────────────────────────── */
export const COMMERCIAL_KB = `
COMMERCIAL CODE (Law 15-95 / 1996) – KEY PROVISIONS

DEFINITION OF MERCHANT & COMMERCIAL ACT (Arts. 1–3):
• Art. 1 – A commercial act is one performed habitually for profit: purchase-resale, manufacturing, banking, insurance, transport, real estate development, services
• Art. 2 – Merchant (commerçant): any natural or legal person habitually performing commercial acts for their own benefit
• Art. 3 – Commercial companies are merchants from their date of registration in the commercial register

COMMERCIAL REGISTER (RC):
• All merchants must register: individual traders within 3 months of starting activity
• Failure to register: merchant cannot invoke commercial status but remains bound by obligations
• Changes (address, partner, dissolution) must be filed within 1 month

COMMERCIAL OBLIGATIONS:
• Commercial obligations are subject to: 5-year statute of limitations (vs. 15 years civil)
• Commercial contracts: binding from meeting of minds; no formality required unless specifically provided
• Commercial partners: jointly and severally liable unless agreed otherwise

BUSINESS FUNDS (FONDS DE COMMERCE, Arts. 79–108):
• Business fund includes: trade name, client base, goodwill, IP rights, equipment, stock
• Sale of business fund must be in writing; published in Official Gazette and commercial register
• Pre-emption right of lessors may apply
• Pledge of business fund: allowed as security for loans

COMMERCIAL COMPANIES (Law 17-95 on SA; Law 5-96 on SARL/SNC):
• SARL (Société à responsabilité limitée): min capital 10,000 MAD; shareholders liable only to extent of contributions; common for SMEs
• SA (Société anonyme): min capital 300,000 MAD (non-public) or 3,000,000 MAD (public offering); board of directors required
• SNC (Société en nom collectif): partners jointly and severally liable; no minimum capital
• Dissolution: by shareholders vote, court order, expiration of term, loss of ≥75% capital

INSOLVENCY & BANKRUPTCY (Arts. 545–757):
• Art. 550 – Procedure of difficulty (procédure de traitement des difficultés): reorganization plan (sauvegarde, redressement) before liquidation
• Judicial liquidation: liquidator appointed by court; assets sold to pay creditors in priority order
• Priority: super-privileged claims (wages up to 3 months) → secured claims → unsecured claims`;

/* ─────────────────────────────────────────────
   REAL ESTATE LAW (Law 39-08 / 2011)
───────────────────────────────────────────── */
export const REALESTATE_KB = `
REAL ESTATE LAW – KEY PROVISIONS (Law 39-08 on Real Property Rights, 2011)

PROPERTY REGISTRATION (TITRAGE FONCIER):
• Land registration under dahir of 12 August 1913 (Immatriculation Foncière)
• Once registered (titre foncier), ownership is definitive and unassailable (opposable à tous)
• Unregistered property (melkia): governed by customary/Islamic law; less secure title
• Registration process: publication → objections period (2 months) → final title issued

OWNERSHIP RIGHTS (Arts. 17–23 of Law 39-08):
• Owner has full right to use, enjoy, and dispose of property
• Co-ownership (indivision): each co-owner has proportional share; may request partition
• Usufruct (droit d'usufruit): right to use property owned by another; extinguished upon death
• Easements (servitudes): access rights, light servitudes, registered on title

REAL ESTATE TRANSACTIONS:
• Sale of registered property: requires authenticated notarial deed; transfer registered on titre foncier
• Sale of unregistered property: private deed valid; registration recommended for security
• Transfer tax: 4% of sale price (droits d'enregistrement); reduceable for first-time buyers
• Capital gains tax (TPI): applies to resales; rate varies by holding period

PRE-EMPTION RIGHTS (CHEFAA):
• Co-owners and neighbors have pre-emption right on sale: must exercise within 7 days of notification
• Pre-emption under Islamic law (shuf'a): applies to undivided property; waivable

EXPROPRIATION (Law 7-81):
• State may expropriate for public utility upon: declaration of public benefit, prior fair compensation
• Owner may challenge valuation in court; entitled to full market value + ancillary damages
• Occupation before full payment: provisional compensation must be deposited

HORIZONTAL PROPERTY/CO-OWNERSHIP (Copropriété, Law 18-00):
• Co-owners in apartment buildings: syndicat des copropriétaires (owners' association)
• Common areas can only be modified by unanimous vote or qualified majority
• Charges for maintenance: allocated per share; unpaid charges enforceable by court

MORTGAGE & SECURITY (Hypothèque):
• Mortgage on registered property: requires notarial deed + registration on titre foncier
• Priority: first registered mortgage has priority
• Foreclosure: judicial sale after notice; proceeds distributed by priority`;

/* ─────────────────────────────────────────────
   INTELLECTUAL PROPERTY (Law 22-97 / 2000, as amended)
───────────────────────────────────────────── */
export const IP_KB = `
INTELLECTUAL PROPERTY LAW (Law 22-97 / 2000, as amended by Law 34-05 and Law 99-12) – KEY PROVISIONS
Managed by: OMPIC (Office Marocain de la Propriété Industrielle et Commerciale)

COPYRIGHT (DROIT D'AUTEUR):
• Protection automatic from creation (no registration required)
• Duration: life of author + 70 years
• Protected works: literary, musical, visual art, film, architecture, software, databases
• Moral rights (droit moral): perpetual, inalienable — author's name and integrity rights
• Economic rights: reproduction, distribution, public performance, broadcasting
• Infringement: civil damages + criminal sanctions 10,000–1,000,000 MAD; repeat offenders: up to 2 years prison

TRADEMARKS (MARQUES):
• Registration required for protection; filed with OMPIC
• Duration: 10 years from filing date, renewable indefinitely
• Rights: exclusive use in Morocco for registered goods/services classes (Nice classification)
• Infringement (contrefaçon): 3 months–5 years, 25,000–1,500,000 MAD fine
• Well-known marks (Art. 141): protected even without registration in Morocco

PATENTS (BREVETS):
• Protection: 20 years from filing date (non-renewable)
• Required: novelty, inventive step, industrial application
• Can be filed at OMPIC or via PCT (Patent Cooperation Treaty)
• Patent owner may grant licenses; compulsory license possible if not worked within 3 years
• Infringement: civil damages; criminal: 10,000–500,000 MAD

INDUSTRIAL DESIGNS (DESSINS ET MODÈLES):
• Registration at OMPIC; protection 5 years renewable up to 25 years total
• Protects ornamental/aesthetic aspects of a product

GEOGRAPHICAL INDICATIONS (INDICATIONS GÉOGRAPHIQUES):
• Protected under Law 25-06; origin marks for products with specific geographic link (Argane oil, Argan)

ENFORCEMENT:
• Saisie-contrefaçon: rightholder can request court-ordered seizure of infringing goods
• Customs may detain suspected infringing imports`;

/* ─────────────────────────────────────────────
   DATA PROTECTION (Law 09-08 / 2009)
───────────────────────────────────────────── */
export const DATAPROTECTION_KB = `
DATA PROTECTION LAW (Law 09-08 / 2009) – KEY PROVISIONS
Supervised by: CNDP (Commission Nationale de contrôle de la Protection des Données à caractère Personnel)

SCOPE & DEFINITIONS:
• Applies to all automated and manual processing of personal data of natural persons in Morocco
• Personal data: any information identifying or making identifiable a natural person (name, ID, address, phone, email, biometric)
• Data controller: any person/entity determining purposes and means of processing
• Special categories: ethnic origin, political opinions, religious beliefs, health, sex life — extra protection required

LEGAL BASIS FOR PROCESSING:
• Unambiguous consent of data subject, OR
• Performance of a contract, OR
• Legal obligation, OR
• Public interest, OR
• Legitimate interests pursued by controller (proportionate)

DATA SUBJECT RIGHTS (Arts. 7–12):
• Right of access: data subject can request copy of personal data held
• Right of rectification: correct inaccurate data
• Right to object: to processing for direct marketing; to any processing on legitimate grounds
• Right of erasure: delete data no longer necessary
• Right to information: at time of collection — must disclose purpose, identity of controller, recipients

OBLIGATIONS OF DATA CONTROLLERS (Arts. 15–23):
• Prior declaration to CNDP required for most processing (or authorization for sensitive data)
• Security measures: technical and organizational measures to protect against unauthorized access, loss, destruction
• Data retention: no longer than necessary for stated purpose
• Transfers abroad: allowed only to countries with adequate level of protection (CNDP approval required otherwise)

SANCTIONS (Arts. 44–65):
• Administrative: CNDP may issue compliance orders, fines
• Criminal: unauthorized processing / failure to notify data breach: 10,000–300,000 MAD, 3 months–3 years imprisonment
• Aggravated: processing sensitive data without authorization: doubled penalties
• Companies criminally liable; director may also be personally prosecuted`;

/* ─────────────────────────────────────────────
   CYBERCRIME / IT LAW (Law 07-03 / 2003 amending Penal Code; Law 09-08)
───────────────────────────────────────────── */
export const CYBERCRIME_KB = `
CYBERCRIME AND IT LAW (Law 07-03 of 2003 — amendments to Penal Code; Law 09-08; Law 31-08 on Consumer Protection) – KEY PROVISIONS

UNAUTHORIZED ACCESS (Arts. 607-1 to 607-7 Penal Code, as amended by Law 07-03):
• Art. 607-1 – Accessing or remaining in an automated data processing system without authorization: 3 months–1 year, 2,000–10,000 MAD
• Art. 607-2 – Unauthorized access causing modification or deletion of data: 1–3 years, 10,000–200,000 MAD
• Art. 607-3 – Fraudulently preventing or distorting system operation: 2–6 years, 10,000–200,000 MAD
• Art. 607-4 – Introduction of fraudulent or false data: 2–6 years, 10,000–200,000 MAD
• Art. 607-5 – Interception of data transmissions without authorization: 1–3 years, 10,000–200,000 MAD

CYBERFRAUD & PHISHING:
• Online fraud prosecuted under Penal Code Art. 450 (escroquerie) + Art. 607 for IT element
• Identity theft online: Art. 447-1 Penal Code: 6 months–3 years, 10,000–100,000 MAD
• Phishing / fake websites: charged as fraud + unauthorized IT system use

ELECTRONIC SIGNATURES & COMMERCE (Law 53-05 / 2007):
• Electronic signature legally equivalent to handwritten signature if meeting security criteria
• Trusted certification authority (AC) issues qualified certificates
• Electronic documents admissible as evidence equivalent to written document

ELECTRONIC TRANSACTIONS (Law 31-08 on Consumer Protection; Law 08-09):
• Online merchants must: clearly display identity, product description, total price including taxes
• Consumer has 7-day cooling-off right for distance purchases
• Unsolicited commercial emails (spam): prohibited without prior consent of recipient

INTERCEPTION & ELECTRONIC SURVEILLANCE:
• Lawful interception: only by judicial order; unauthorized interception of communications: criminal offense under Art. 607-5 + Law 24-96 on Telecommunications

PENALTIES SUMMARY:
• Basic unauthorized access: 3 months–1 year + fine
• With data damage: 1–6 years + fine
• Organized cybercrime gang: penalties doubled
• Company liability: fine up to 10× individual fine`;

/* ─────────────────────────────────────────────
   ENVIRONMENTAL LAW (Law 11-03 / 2003)
───────────────────────────────────────────── */
export const ENVIRONMENTAL_KB = `
ENVIRONMENTAL PROTECTION LAW (Law 11-03 / 2003 on Protection and Enhancement of the Environment) – KEY PROVISIONS

GENERAL PRINCIPLES (Arts. 1–6):
• Art. 1 – State, local authorities, and persons must protect the environment for present and future generations
• Polluter-pays principle: whoever causes environmental damage bears cost of prevention/remediation
• Precautionary principle: absence of certainty does not justify postponing preventive measures
• Art. 3 – Right to a healthy environment: citizens can report violations to environmental authorities

ENVIRONMENTAL IMPACT ASSESSMENT (EIA — Law 12-03 / 2003):
• Required for any project likely to affect environment: industrial plants, roads, dams, tourism projects
• Process: EIA study → public inquiry → review committee → ministerial authorization
• Decision issued within 60 days of complete file submission; renewable
• Operating without valid EIA authorization: fine + suspension of works

WATER PROTECTION (Law 36-15 / 2016 on Water):
• Discharge of pollutants into public water domain: requires prior authorization or prohibited
• National water protection standards set by decree
• Penalties: 200,000–2,000,000 MAD for illegal discharge; closure of facility possible

AIR QUALITY & INDUSTRY:
• Industrial facilities classified as dangerous/unhealthy/unsanitary require environmental authorization
• Air emission standards set by decree; non-compliance: fines + closure orders
• Vehicle emissions: controlled via periodic technical inspection

WASTE MANAGEMENT (Law 28-00 / 2006):
• Producers of hazardous waste must register and hold hazardous waste permit
• Household solid waste: managed by municipalities
• Illegal dumping: 2,000–20,000 MAD fine; repeat: doubled
• Hazardous waste illegal disposal: 50,000–500,000 MAD + possible imprisonment

PROTECTED AREAS & BIODIVERSITY:
• National parks and protected areas designated by royal decree; activities strictly regulated
• Hunting and fishing: regulated licences; illegal hunting: fine + confiscation of equipment
• Protected species: trade/capture prohibited; criminal penalties

ENFORCEMENT:
• Environmental police (inspecteurs de l'environnement): authority to inspect premises, take samples, issue compliance notices
• Administrative sanctions: suspension of operations, withdrawal of authorization, remediation order
• Civil liability: any person causing environmental harm liable for remediation cost + damages
• Criminal liability: intentional pollution offenses: up to 2 years + heavy fines`;

/* ─────────────────────────────────────────────
   SELECTOR – pick KB section for domain
───────────────────────────────────────────── */
export function getLegalContext(domain, userText) {
  const t = (userText || "").toLowerCase();

  // Sub-domain refinement
  const hasViolence       = /violen|assault|murder|homicide|agression|meurtre|ضرب|قتل|اعتداء/.test(t);
  const hasSexual         = /rape|sexual|viol|agression sexuelle|اغتصاب|تحرش|فاحشة/.test(t);
  const hasProperty       = /theft|vol|robbery|fraud|forgery|سرقة|احتيال|تزوير/.test(t);
  const hasSpecial        = /traffick|traite|terrorism|terrorisme|drug|drogue|weapon|arme|إرهاب|اتجار|مخدر/.test(t);
  const hasSports         = /sport|stade|stadium|شغب|مشجع|ملاعب|شماريخ|hooliganis/.test(t);
  const hasFamily         = /marriage|divorce|custody|inherit|moudawana|mariage|garde|héritage|زواج|طلاق|حضانة|إرث|مهر|نفقة/.test(t);
  const hasProcedure      = /procedure|appeal|trial|detention|garde à vue|prescription|appel|مسطرة|توقيف|استئناف|تقادم/.test(t);
  const hasContracts      = /contract|lease|obligation|bail|contrat|عقد|كراء|التزام|تعويض/.test(t);
  const hasLabor          = /labor|labour|employment|worker|salary|wage|dismissal|licenciement|salarié|travail|contrat de travail|شغل|عامل|أجير|فصل|تعويض عن الفصل|أجر/.test(t);
  const hasCommercial     = /commercial|commerce|merchant|company|société|sarl|sa\b|bankruptcy|insolvency|fonds de commerce|liquidation|تجاري|شركة|تاجر|إفلاس|تصفية/.test(t);
  const hasRealEstate     = /real estate|property|mortgage|land|title|immatriculation|hypothèque|foncier|copropriété|expropriation|عقار|ملكية عقارية|رهن|تحفيظ|طرد/.test(t);
  const hasIP             = /intellectual property|trademark|patent|copyright|brand|marque|brevet|contrefaçon|ompic|ملكية فكرية|علامة تجارية|براءة اختراع|حقوق النشر/.test(t);
  const hasDataProtection = /data protection|personal data|privacy|gdpr|cndp|données personnelles|حماية البيانات|بيانات شخصية|خصوصية/.test(t);
  const hasCybercrime     = /cyber|hacking|phishing|unauthorized access|electronic|piratage|jrimes informatiques|جرائم إلكترونية|قرصنة|اختراق|نصب إلكتروني/.test(t);
  const hasEnvironmental  = /environment|pollution|waste|nature|biodiversity|eia|environnement|déchets|polluant|بيئة|تلوث|نفايات/.test(t);

  const parts = [];

  if (domain === "family" || hasFamily)                 parts.push(FAMILY_KB);
  if (hasSports || (domain === "penal" && hasSports))   parts.push(PENAL_VIOLENCE_KB);
  if (domain === "penal" && (hasViolence || hasSexual || (!hasProperty && !hasSpecial))) parts.push(PENAL_VIOLENCE_KB);
  if (domain === "penal" && (hasProperty || (!hasViolence && !hasSpecial && !hasSexual))) parts.push(PENAL_PROPERTY_KB);
  if (domain === "penal" && hasSpecial)                 parts.push(PENAL_SPECIAL_KB);
  if (domain === "penal" && parts.length === 0)         parts.push(PENAL_VIOLENCE_KB, PENAL_PROPERTY_KB);
  if (domain === "procedure" || hasProcedure)           parts.push(PROCEDURE_KB);
  if (domain === "contracts" || hasContracts)           parts.push(CONTRACTS_KB);
  if (domain === "labor" || hasLabor)                   parts.push(LABOR_KB);
  if (domain === "commercial" || hasCommercial)         parts.push(COMMERCIAL_KB);
  if (domain === "realestate" || hasRealEstate)         parts.push(REALESTATE_KB);
  if (domain === "ip" || hasIP)                         parts.push(IP_KB);
  if (domain === "dataprotection" || hasDataProtection) parts.push(DATAPROTECTION_KB);
  if (domain === "cybercrime" || hasCybercrime)         parts.push(CYBERCRIME_KB);
  if (domain === "environmental" || hasEnvironmental)   parts.push(ENVIRONMENTAL_KB);

  // Deduplicate
  const seen = new Set();
  return parts.filter(p => { if (seen.has(p)) return false; seen.add(p); return true; }).join("\n\n");
}

/* ─────────────────────────────────────────────
   SENTENCING CONTEXT (injected for penalty questions)
───────────────────────────────────────────── */
export const SENTENCING_KB = `
MOROCCAN SENTENCING FRAMEWORK:
• Jnaiya (serious felony): 5–30 years or life/death
• Jnhiya (misdemeanor): 2 months–5 years + fine
• Mukhalafa (violation): warning to 3 days' custody + small fine
• Suspended sentence: probation 2–5 years; revoked if re-offending
• Supplementary penalties: confiscation, professional disqualification, loss of civic rights, compensation to victims, stadium ban (sports), community service, electronic monitoring (experimental)
• Mitigating: first offense, young age, cooperation, remorse, repair of harm
• Aggravating: premeditation, use of weapons, multiple victims, abuse of authority, organized crime, victim is minor/vulnerable person`;

export default {
  FAMILY_KB,
  PENAL_VIOLENCE_KB,
  PENAL_PROPERTY_KB,
  PENAL_SPECIAL_KB,
  PROCEDURE_KB,
  CONTRACTS_KB,
  SENTENCING_KB,
  LABOR_KB,
  COMMERCIAL_KB,
  REALESTATE_KB,
  IP_KB,
  DATAPROTECTION_KB,
  CYBERCRIME_KB,
  ENVIRONMENTAL_KB,
  getLegalContext,
};
