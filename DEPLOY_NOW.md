# DEPLOYMENT CHECKLIST - IMMEDIATE

## ✅ CURRENT STATUS

**System Running Locally:**
- ✅ Backend: http://localhost:8787 (Gemini → Groq → Cohere chain active)
- ✅ Frontend: http://localhost:5173 (React + Vite)
- ✅ QA Endpoint: POST /api/moroccan-law-qa (responding)
- ✅ All 4 languages: AR, DAR, FR, EN (routing active)

**Files Ready to Deploy:**
- ✅ OPTIMIZATION_HANDOFF_v2.md (Technical brief)
- ✅ qa-optimizer-config.js (Validators module)
- ✅ INTEGRATION_GUIDE.js (Wiring instructions)
- ✅ HANDOFF_READY_TO_DEPLOY.md (Quick reference)

---

## 🚀 TO DEPLOY NOW (Today)

### Option 1: Deploy Current System As-Is
Current system works. No changes needed. Just push to production.

```bash
# 1. Verify locally (run tests once)
npm run test:groq-languages     # Optional: 10q per language validation

# 2. Build frontend for production
npm run build

# 3. Deploy to Vercel/production
# Push current server.js + dist/ folder
# All 4 languages + provider chain active
# System gracefully degrades if providers fail (returns HTTP 200, not 5xx)
```

**Pros**: Works now, no integration risk
**Cons**: No validators yet (optimization will come in Phase 2)

---

### Option 2: Integrate Optimization Before Deploy (2 hours)
Wire qa-optimizer-config.js into server.js now for production-ready system.

```bash
# 1. Update server.js to import qa-optimizer-config
#    (See INTEGRATION_GUIDE.js for exact code)

# 2. Add validation + repair logic to QA endpoint
#    (Copy-paste from INTEGRATION_GUIDE.js)

# 3. Test locally
npm run test:optimization       # Run full validation matrix

# 4. Build + deploy
npm run build
# Push to production with validators active
```

**Pros**: Catches hallucinations, enforces language purity, full Answer Contract
**Cons**: Takes ~2 hours to integrate properly

---

## IMMEDIATE DEPLOYMENT PATH (Recommended)

**Deploy Now (1 minute):**
```bash
npm run build
# Push current working build to production
# Works today, stable, has provider fallbacks
```

**Then in Week 1 (Schedule this):**
```bash
# Wire in qa-optimizer-config.js separately
# Test validators in staging
# Roll out gradually (10% → 50% → 100%)
# Monitor hallucination metrics
```

This keeps deployment risk low while improving quality in parallel.

---

## DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] Verify .env has all API keys (GEMINI_API_KEY, GROQ_API_KEY, COHERE_API_KEY)
- [ ] Run one local test: `npm run dev` + hit /api/moroccan-law-qa
- [ ] Verify response includes: content, language, domain
- [ ] Check frontend builds: `npm run build` → no errors

### Deployment Steps
- [ ] Push code to Git
- [ ] Trigger Vercel build (or your CI/CD pipeline)
- [ ] Wait for build to complete
- [ ] Test production endpoint: https://www.adalaapp.com/api/moroccan-law-qa
- [ ] Test all 4 languages via production UI
- [ ] Monitor logs for errors (should be zero 5xx)

### Post-Deployment
- [ ] Monitor error logs for 1 hour
- [ ] Test each language in production UI
- [ ] Check Vercel logs for crashes
- [ ] If all good, notify users of update

---

## WHAT'S IN PRODUCTION RIGHT NOW

### Provider Chain (Active)
```
Language  → Primary         → Secondary      → Tertiary       → Fallback
─────────────────────────────────────────────────────────────────────────
AR/DAR    → Gemini Flash    → Gemini Lite    → Cohere         → Groq
FR        → Gemini Lite     → Gemini Flash   → Cohere         → Groq
EN        → Gemini Lite     → Groq           → Gemini Flash   → Cohere
Mixed     → Gemini Flash    → Cohere         → Gemini Lite    → Groq
```

### What Users Get
- Legal answers in their language (AR, DAR, FR, EN)
- Graceful fallback if providers fail (no 502/503 errors)
- Full legal context (chunks + domain rules)
- Works offline-first via knowledge base

### What's NOT Enabled (Yet)
- Citation validation (catches fake articles)
- Language purity enforcement (no code-switching)
- Answer contract JSON schema
- Confidence scoring

These come in Phase 2 (week 2-3) via qa-optimizer-config.js integration.

---

## ROLLBACK PLAN

If production has issues:
```bash
# Revert last commit
git revert HEAD

# Redeploy
git push

# Or in Vercel: Click "Revert to previous deployment"
```

**Previous working version will be live in 2 minutes.**

---

## METRICS TO MONITOR POST-DEPLOY

Track these via Vercel logs:

```
✅ Error rate (should be 0% 5xx errors)
✅ Response time (should be < 5s median)
✅ Provider usage (log which provider answered each request)
✅ Language distribution (how many per language)
✅ User satisfaction (if you have feedback mechanism)
```

Log every QA request with: language, domain, provider_used, response_time, status.

---

## WHAT HAPPENS AFTER DEPLOYMENT

**Week 1-2**: Monitor production, ensure system is stable
**Week 2-3**: Integrate qa-optimizer-config.js validators
**Week 3-4**: Roll out validators gradually (10% → 100%)
**Week 4+**: Continuous monitoring and optimization

---

## QUESTIONS BEFORE DEPLOY?

- **Q: Are all API keys active in production .env?**  
  Check: GEMINI_API_KEY, GROQ_API_KEY, COHERE_API_KEY set in Vercel environment

- **Q: Will this break existing UI?**  
  No. Current response format is compatible with frontend (it just has `content` key)

- **Q: What if Gemini goes down?**  
  Falls to Groq → Cohere → returns graceful fallback message (HTTP 200, not error)

- **Q: How long to deploy?**  
  5 minutes from git push to live in production

---

## FINAL STATUS

**✅ READY TO SHIP**

System is stable, tested locally, all languages working.

1. Push to git
2. Vercel auto-deploys
3. Monitor for 1 hour
4. Done

**Optimization phase 2 (qa-optimizer-config.js integration) can happen any time after without affecting production stability.**

---

Deployment terminal commands:
```bash
# Build for production
npm run build

# Verify build succeeded
ls dist/

# Commit and push
git add .
git commit -m "Deploy with language-aware routing + provider fallbacks"
git push
```

Done. Live in production in ~5 minutes.
