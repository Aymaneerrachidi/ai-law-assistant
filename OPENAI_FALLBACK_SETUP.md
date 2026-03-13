# OpenAI Fallback Integration Guide

## Setup Instructions

### 1. **CRITICAL: Delete Your Exposed API Key**
- Go to [OpenAI API Keys](https://platform.openai.com/account/api-keys)
- **Delete the key you shared** (sk-proj-...)
- Generate a **new secret key**
- Copy it for the next step

### 2. **Configure Environment Variables**
Create a `.env` file in your project root (already in `.gitignore`):

```
# Copy from .env.example and add your actual keys:
GEMINI_API_KEY=your_actual_key
GROQ_API_KEY=your_actual_key
COHERE_API_KEY=your_actual_key
OPENAI_API_KEY=sk-proj-[YOUR_NEW_KEY_HERE]

# Choose model (gpt-4-mini is cheapest and performs well):
OPENAI_MODEL=gpt-4-mini

# Or test with alternatives:
# OPENAI_MODEL=gpt-3.5-turbo      # Cheapest (~$0.50/1M input tokens)
# OPENAI_MODEL=gpt-4-turbo        # Most capable (~$10/1M input tokens)
```

### 3. **Understand the Fallback Chain**

Your system now uses this priority order for each language:

**Arabic/Darija:**
```
1. Gemini Flash         ▼
2. Gemini Flash Lite    ▼
3. Cohere Command       ▼
4. Groq Llama 3.3 70B   ▼
5. OpenAI (gpt-4-mini)  ▼
6. Degraded Response (no provider available)
```

**French:**
```
1. Gemini Flash Lite    ▼
2. Gemini Flash         ▼
3. Cohere Command       ▼
4. Groq Llama 3.3 70B   ▼
5. OpenAI (gpt-4-mini)  ▼
6. Degraded Response
```

**English:**
```
1. Gemini Flash Lite    ▼
2. Groq Llama 3.3 70B   ▼
3. Gemini Flash         ▼
4. Cohere Command       ▼
5. OpenAI (gpt-4-mini)  ▼
6. Degraded Response
```

## Cost Comparison & Model Selection

### Estimated costs per request:
- **gpt-3.5-turbo**: ~$0.0005-0.001 per response (~500-1000 tokens)
- **gpt-4-mini**: ~$0.015 per response (~1500 tokens)
- **gpt-4-turbo**: ~$0.045 per response (~1500 tokens)

### Recommended:
- **Testing & Development**: `gpt-3.5-turbo` (cheapest)
- **Production**: `gpt-4-mini` (cost-effective, good quality)
- **High-Quality Only**: `gpt-4-turbo` (best responses, expensive)

With a $5 credit:
- **gpt-3.5-turbo**: ~5000-10000 requests
- **gpt-4-mini**: ~300-330 requests
- **gpt-4-turbo**: ~100-110 requests

## Testing the Implementation

### 1. **Start your server:**
```bash
npm install  # if needed
node server.js
```

You should see in console:
```
[QA] route=ar
[QA] route=fr
[QA] route=en
```

### 2. **Send a test request with curl:**

**Arabic test:**
```bash
curl -X POST http://localhost:8787/api/moroccan-law-qa \
  -H "Content-Type: application/json" \
  -d '{
    "question": "شنو هي العقوبة ديال السرقة في القانون المغربي؟",
    "language": "dar"
  }'
```

**French test:**
```bash
curl -X POST http://localhost:8787/api/moroccan-law-qa \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Quelle est la peine pour vol au Maroc?",
    "language": "fr"
  }'
```

**English test:**
```bash
curl -X POST http://localhost:8787/api/moroccan-law-qa \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is the penalty for theft in Morocco?",
    "language": "en"
  }'
```

### 3. **Monitor logs:**
The server will show which provider answered:

```
[QA] route=dar
[QA] answered by Gemini/gemini-2.5-flash (1200 chars for dar)
```

Or if fallback is needed:
```
[QA] answered by OpenAI/gpt-4-mini (1350 chars for fr)
```

## Comparing Models

### To compare responses from different models:

1. **Force OpenAI fallback** by temporarily disabling other providers:
   - Comment out `GEMINI_API_KEY`, `GROQ_API_KEY`, `COHERE_API_KEY`
   - Test with `OPENAI_API_KEY` only

2. **Compare outputs:**
   - Response speed
   - Legal accuracy
   - Language quality (especially for Arabic/Darija)
   - Cost per token

3. **Switch models:**
   Edit `.env`:
   ```
   # Test gpt-3.5-turbo
   OPENAI_MODEL=gpt-3.5-turbo
   
   # Send request, log response time/quality
   # Then switch to gpt-4-mini
   OPENAI_MODEL=gpt-4-mini
   
   # Compare quality vs cost
   ```

## Monitoring Costs

### In OpenAI Dashboard:
1. Go to [Usage](https://platform.openai.com/account/usage/overview)
2. Track daily/monthly spend
3. Set up [usage limits](https://platform.openai.com/account/billing/limits):
   - Set hard limit below $5 to avoid overspending

### From Server Logs:
Add optional tracking:
```bash
# Check recent logs for OpenAI calls
grep "answered by OpenAI" server.log | wc -l
```

## Troubleshooting

### Error: "OPENAI_API_KEY not found"
- Ensure `.env` file exists in project root
- Check that key is not wrapped in quotes
- Verify `dotenv.config()` is called in server.js

### Error: "Invalid API key"
- Go regenerate the key (your shared key is now invalid)
- Copy the new key correctly (no extra spaces)
- Restart the server

### Error: "Quota exceeded" or "Rate limited"
- OpenAI has rate limits: 3,500 RPM for free trial, 90,000 RPM for paid
- Wait 60 seconds and retry
- Fallback to next provider works automatically

### Getting only degraded responses
- Check that all provider keys are set correctly
- Verify internet connection to api.openai.com
- Check server logs for specific error messages

## Next Steps

1. ✅ Regenerate your API key
2. ✅ Add `OPENAI_API_KEY` to `.env`
3. ✅ Restart server: `npm restart`
4. ✅ Test with curl requests above
5. ✅ Monitor costs in OpenAI dashboard
6. ✅ Compare model quality/cost tradeoffs
7. ✅ Adjust `OPENAI_MODEL` based on findings

## Files Modified

- `server.js` - Added `tryOpenAI()` function and routing logic
- `.env.example` - Added OpenAI configuration options
- `.env` (you create this) - Your actual API keys

## Security Notes

- ✅ `.env` is in `.gitignore` — never commit real keys
- ✅ `.env.example` shows structure without real values
- ⚠️ Never share your OpenAI API key in chat/email
- ⚠️ Regenerate keys if accidentally exposed
