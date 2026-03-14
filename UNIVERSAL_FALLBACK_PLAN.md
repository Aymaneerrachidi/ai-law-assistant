# Fallback & Routing Architecture for All Server Functions

## Current State
- `/api/moroccan-law-qa` ✅ Has full fallback chain
- `/api/analyze-document`, `/api/extract-with-llm`, `/api/explain-concept`, `/api/draft-contract` ❌ Only use Cohere

## Proposed Universal Architecture

All functions should follow this provider chain:

```
PRIMARY PROVIDERS (Free/Fast)
├─ 1. Gemini Flash/Lite (based on language)
├─ 2. Groq Llama 3.3 70B
└─ 3. Cohere Command

FALLBACK PROVIDERS (Cost-Optimized)
├─ 4. OpenAI GPT-4.1-nano ($0.10/1M)
└─ 5. OpenAI GPT-4o-mini ($0.15/1M)

DEGRADED MODE
└─ 6. Return template response or cached data
```

## Implementation Strategy

### 1. Create Universal Provider Functions

```javascript
// Generic provider caller for text generation
async function callAllProviders(
  messages,       // Array of {role, content}
  options = {}    // { language, maxTokens, temperature, timeout }
)
```

### 2. Update Each Endpoint

**For Document Analysis (`/api/analyze-document`):**
- Build system prompt + user request
- Pass to `callAllProviders`
- Return provider response with metadata

**For Concept Explanation (`/api/explain-concept`):**
- Same pattern as analysis
- Use language-specific routing

**For Contract Drafting (`/api/draft-contract`):**
- Same pattern
- Higher token limits (3000 tokens)

**For LLM Extraction (`/api/extract-with-llm`):**
- Target JSON validation
- Fallback if malformed JSON

### 3. Error Handling

- Quota exhaustion → Try next provider
- Timeout → Try next provider
- Malformed response → Try next provider or return degraded

### 4. Logging

Each endpoint logs which provider answered:
```
[ANALYZE] lang=ar | answered by Groq (1534 chars)
[CONCEPT] lang=fr | Cohere quota exhausted, trying Groq...
[CONTRACT] lang=en | answered by OpenAI/gpt-4.1-nano
```

## Benefits

✅ Resilience - Never fail if any provider works
✅ Cost optimization - Free tiers first, OpenAI only as fallback
✅ Consistency - Same routing logic across all functions
✅ Performance - Fastest provider often answers first
✅ Scalability - Easy to add new providers

## API Response Format (Unified)

```json
{
  "content": "response text...",
  "provider": "groq|gemini|cohere|openai-nano|openai-mini|degraded",
  "responseTime": 4.5,
  "language": "ar",
  "success": true
}
```

## Minimal Code Changes Required

Instead of:
```javascript
const response = await fetch("cohere-api", {...})
```

Use:
```javascript
const response = await callAllProviders(messages, {
  language: lang,
  maxTokens: 2500,
  temperature: 0.4
})
```

## Testing Checklist

- [ ] Test each endpoint with all 4 languages
- [ ] Simulate provider failures
- [ ] Verify fallback chain execution
- [ ] Check OpenAI is only used as fallback
- [ ] Monitor response times
- [ ] Verify degraded mode responses
