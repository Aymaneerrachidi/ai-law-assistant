// ── API Configuration ──
// Change BASE_URL to your deployed backend URL (e.g. https://adalaapp.com)
// or use localhost for development
const BASE_URL = "https://www.adalaapp.com";

export const API = {
  qa: `${BASE_URL}/api/moroccan-law-qa`,
  analyze: `${BASE_URL}/api/analyze-document`,
  extract: `${BASE_URL}/api/extract-with-llm`,
  explain: `${BASE_URL}/api/explain-concept`,
  transcribe: `${BASE_URL}/api/transcribe`,
};

export default BASE_URL;
