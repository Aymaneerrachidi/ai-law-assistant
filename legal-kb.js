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
   SELECTOR – pick KB section for domain
───────────────────────────────────────────── */
export function getLegalContext(domain, userText) {
  const t = (userText || "").toLowerCase();

  // Sub-domain refinement
  const hasViolence    = /violen|assault|murder|homicide|agression|meurtre|ضرب|قتل|اعتداء/.test(t);
  const hasSexual      = /rape|sexual|viol|agression sexuelle|اغتصاب|تحرش|فاحشة/.test(t);
  const hasProperty    = /theft|vol|robbery|fraud|forgery|سرقة|احتيال|تزوير/.test(t);
  const hasSpecial     = /traffick|traite|terrorism|terrorisme|drug|drogue|weapon|arme|إرهاب|اتجار|مخدر/.test(t);
  const hasSports      = /sport|stade|stadium|شغب|مشجع|ملاعب|شماريخ|hooliganis/.test(t);
  const hasFamily      = /marriage|divorce|custody|inherit|moudawana|mariage|garde|héritage|زواج|طلاق|حضانة|إرث|مهر|نفقة/.test(t);
  const hasProcedure   = /procedure|appeal|trial|detention|garde à vue|prescription|appel|مسطرة|توقيف|استئناف|تقادم/.test(t);
  const hasContracts   = /contract|lease|obligation|bail|contrat|عقد|كراء|التزام|تعويض/.test(t);

  const parts = [];

  if (domain === "family" || hasFamily)         parts.push(FAMILY_KB);
  if (hasSports || (domain === "penal" && hasSports)) parts.push(PENAL_VIOLENCE_KB);
  if (domain === "penal" && (hasViolence || hasSexual || (!hasProperty && !hasSpecial))) parts.push(PENAL_VIOLENCE_KB);
  if (domain === "penal" && (hasProperty || (!hasViolence && !hasSpecial && !hasSexual))) parts.push(PENAL_PROPERTY_KB);
  if (domain === "penal" && hasSpecial)         parts.push(PENAL_SPECIAL_KB);
  if (domain === "penal" && parts.length === 0) parts.push(PENAL_VIOLENCE_KB, PENAL_PROPERTY_KB);
  if (domain === "procedure" || hasProcedure)   parts.push(PROCEDURE_KB);
  if (domain === "contracts" || hasContracts)   parts.push(CONTRACTS_KB);

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
  getLegalContext,
};
