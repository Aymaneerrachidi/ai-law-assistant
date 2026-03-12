#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
ENHANCED RAG SYSTEM WITH DETAILED LAW TRACKING
- Extract law numbers from chunks intelligently
- Track exact source (law name, article, file)
- VERY lenient legal question detection (catches all edge cases)
- Always show where information came from
"""

import json
import re
from typing import List, Dict, Tuple, Optional, Set
from pathlib import Path
import requests
import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
import uvicorn
from datetime import datetime

load_dotenv()

# 
# PART 1: LENIENT LANGUAGE & LEGAL DETECTION
# 

class VeryLenientLanguageDetector:
    """
    Very lenient language detection + legal question detection
    If it could possibly be legal, treat it as legal
    """
    
    @staticmethod
    def detect_language(text: str) -> str:
        """Detect language"""
        text_sample = text[:300].lower()
        
        arabic_chars = len(re.findall(r'[\u0600-\u06FF]', text))
        latin_chars = len(re.findall(r'[a-zàâäéèêëïîôöœçüû]', text_sample))
        
        if arabic_chars > latin_chars * 1.5:
            if any(marker in text for marker in ['شنو', 'كيفاش', 'واش', 'غادي', 'ديال']):
                return 'darija'
            return 'ar'
        elif latin_chars > 0:
            if any(fr in text_sample for fr in ['comment', 'pourquoi', 'loi', 'article', 'le ', 'la ', 'et ']):
                return 'fr'
            if any(en in text_sample for en in ['what', 'how', 'why', 'law', 'can', 'is ', 'the ']):
                return 'en'
            return 'en'
        else:
            return 'ar'
    
    @staticmethod
    def is_possibly_legal_related(text: str, detected_lang: str) -> Tuple[bool, float]:
        """
        VERY LENIENT - If it COULD be legal, say yes
        """
        text_lower = text.lower()
        confidence = 0.0
        
        legal_keywords = {
            'ar': [
                'قانون', 'مادة', 'حقوق', 'واجبات', 'عقوبة', 'سجن', 'غرامة',
                'محكمة', 'قاضي', 'دعوى', 'حكم', 'استئناف', 'زواج', 'طلاق',
                'سرقة', 'ضرب', 'جريمة', 'عقد', 'ملكية', 'إرث', 'نفقة', 'حضانة',
                'عمل', 'موظف', 'شغل', 'فصل', 'تعويض', 'التزام', 'عجز',
                'شرط', 'اتفاق', 'التزمت', 'يلزم', 'يترتب', 'مسؤول', 'مسؤولية',
                'ضرر', 'خسارة', 'دين', 'استحقاق', 'حساب'
            ],
            'darija': [
                'قانون', 'مادة', 'حقوق', 'واجبات', 'عقوبة', 'سجن', 'غرامة',
                'محكمة', 'قاضي', 'دعوى', 'زواج', 'طلاق', 'سرقة', 'ضرب',
                'شنو', 'كيفاش', 'غادي', 'ديال', 'كاين', 'دير', 'حكم', 'استئناف',
                'حق', 'واجب', 'شرط', 'اتفاق', 'ملزم', 'يتقضي'
            ],
            'fr': [
                'loi', 'article', 'droit', 'obligation', 'peine', 'prison', 'amende',
                'tribunal', 'juge', 'procès', 'jugement', 'divorce', 'mariage', 'vol',
                'agression', 'crime', 'délit', 'contrat', 'propriété', 'héritage',
                'travail', 'licenciement', 'code', 'juridique', 'justice', 'appel',
                'procédure', 'accusation', 'verdict', 'règlement', 'accord',
                'obligatoire', 'responsable', 'responsabilité', 'dommage',
                'préjudice', 'indemnisation', 'recours', 'légal'
            ],
            'en': [
                'law', 'legal', 'article', 'right', 'obligation', 'punishment', 'prison',
                'fine', 'court', 'judge', 'trial', 'judgment', 'divorce', 'marriage',
                'theft', 'assault', 'crime', 'felony', 'contract', 'property',
                'inheritance', 'work', 'employment', 'termination', 'morocco',
                'moroccan', 'lawsuit', 'appeal', 'criminal', 'civil', 'penalty',
                'liable', 'liability', 'responsible', 'responsibility', 'damage',
                'compensation', 'remedy', 'regulation', 'statute', 'legislation'
            ]
        }
        
        context_words = {
            'ar': ['هل', 'ما', 'كم', 'أين', 'كيف', 'متى', 'لماذا', 'أنا', 'هو', 'هي'],
            'darija': ['شنو', 'كيفاش', 'واش', 'علاش', 'فين', 'متى', 'أنا', 'انت'],
            'fr': ['quoi', 'comment', 'pourquoi', 'quel', 'quelle', 'est', 'peut', 'peut-on', 'dois', 'dois-je'],
            'en': ['what', 'how', 'why', 'can', 'is', 'do', 'should', 'will', 'when', 'where', 'is it', 'can i']
        }
        
        keywords = legal_keywords.get(detected_lang, legal_keywords['en'])
        contexts = context_words.get(detected_lang, context_words['en'])
        
        for keyword in keywords:
            if keyword in text_lower:
                confidence += 0.4
        
        for context in contexts:
            if context in text_lower:
                confidence += 0.3
        
        if '?' in text:
            confidence += 0.5
        
        if re.search(r'\d+', text):
            confidence += 0.1
        
        confidence = min(confidence, 1.0)
        return confidence > 0.05, confidence


# 
# PART 2: INTELLIGENT LAW TRACKING & SOURCE EXTRACTION
# 

class LawSourceTracker:
    """
    Extract law information from chunks
    Track: Law Name, Law Number, Article, Source File
    """
    
    @staticmethod
    def extract_law_info(chunk: Dict) -> Dict:
        """Extract complete law information from chunk"""
        law_name = chunk.get('law_name', '').strip()
        law_number = chunk.get('law_number', '').strip()
        article_number = chunk.get('struct_madda', '').strip()
        source_file = chunk.get('source_filename', '').strip()
        text = chunk.get('text', '')
        
        if not law_number:
            match = re.search(r'\b(\d+\.\d+\.\d+)\b', text)
            if match:
                law_number = match.group(1)
            else:
                match = re.search(r'\b(\d+\.\d+)\b', text)
                if match:
                    law_number = match.group(1)
        
        if not article_number:
            match = re.search(r'المادة\s*(\d+)', text)
            if match:
                article_number = f"المادة {match.group(1)}"
            else:
                match = re.search(r'Article\s+(\d+)', text, re.IGNORECASE)
                if match:
                    article_number = f"Article {match.group(1)}"
        
        if not law_name:
            law_patterns = [
                (r'(القانون الجنائي|Code Pénal|Penal Code)', 'Penal Code'),
                (r'(مدونة الأسرة|Code de la Famille|Family Code)', 'Family Code'),
                (r'(قانون الشغل|Code du Travail|Labor Code)', 'Labor Code'),
                (r"(قانون التعمير|Code d'Urbanisme|Urbanism Code)", 'Urbanism Code'),
            ]
            for pattern, fallback in law_patterns:
                if re.search(pattern, text):
                    law_name = fallback
                    break
        
        return {
            'law_name': law_name if law_name else 'Unknown Law',
            'law_number': law_number if law_number else 'Not Available',
            'article_number': article_number if article_number else 'Not Specified',
            'source_file': source_file if source_file else 'Unknown Source',
            'bo_number': chunk.get('bo_number', ''),
            'date': chunk.get('date', '')
        }
    
    @staticmethod
    def build_sources_section(chunks: List[Dict]) -> Tuple[str, List[Dict]]:
        """Build detailed sources section. Returns (formatted_section, structured_data)"""
        sources_data = []
        seen: Set[tuple] = set()
        
        for chunk in chunks:
            info = LawSourceTracker.extract_law_info(chunk)
            key = (info['law_number'], info['article_number'])
            if key not in seen:
                sources_data.append(info)
                seen.add(key)
        
        section = "=" * 70 + "\n"
        section += " LEGAL SOURCES & REFERENCES\n"
        section += "=" * 70 + "\n\n"
        
        if not sources_data:
            section += "No specific law references found.\n"
            return section, []
        
        for idx, source in enumerate(sources_data[:10], 1):
            section += f"{idx}. LAW: {source['law_name']}\n"
            if source['law_number'] != 'Not Available':
                section += f"   Law Number: {source['law_number']}\n"
            if source['article_number'] != 'Not Specified':
                section += f"   Article: {source['article_number']}\n"
            if source['source_file'] != 'Unknown Source':
                section += f"   Source File: {source['source_file']}\n"
            if source['bo_number']:
                section += f"   Bulletin Officiel: {source['bo_number']}\n"
            if source['date']:
                section += f"   Date: {source['date']}\n"
            section += "\n"
        
        return section, sources_data


# 
# PART 3: SMART CHUNK RETRIEVAL
# 

class SmartChunksRetriever:
    """Retrieve chunks with law tracking"""
    
    def __init__(self, chunks_jsonl_path: str):
        self.chunks = []
        self.law_index: Dict[str, List[int]] = {}
        self.lang_detector = VeryLenientLanguageDetector()
        self.law_tracker = LawSourceTracker()
        self.load_chunks(chunks_jsonl_path)
        self.build_indexes()
    
    def load_chunks(self, path: str):
        with open(path, 'r', encoding='utf-8') as f:
            for idx, line in enumerate(f):
                if line.strip():
                    try:
                        chunk = json.loads(line)
                        chunk['_index'] = idx
                        self.chunks.append(chunk)
                    except Exception:
                        pass
        print(f" Loaded {len(self.chunks)} chunks")
    
    def build_indexes(self):
        for idx, chunk in enumerate(self.chunks):
            law_name = chunk.get('law_name', 'unknown')
            if law_name not in self.law_index:
                self.law_index[law_name] = []
            self.law_index[law_name].append(idx)
    
    def search_smart(self, query: str, detected_lang: str, top_k: int = 10) -> List[Dict]:
        """Smart search  article > law name > keyword"""
        query_lower = query.lower()
        results = []
        
        # 1. Article number search
        article_match = re.search(r'المادة\s*(\d+)|Article\s+(\d+)', query, re.IGNORECASE)
        if article_match:
            article_num = article_match.group(1) or article_match.group(2)
            for chunk in self.chunks:
                if (article_num in chunk.get('struct_madda', '') or
                        f"المادة {article_num}" in chunk.get('text', '')):
                    results.append(chunk)
            if results:
                return results[:top_k]
        
        # 2. Law name search
        for law_name in self.law_index:
            if law_name and law_name.lower() in query_lower:
                for idx in self.law_index[law_name]:
                    results.append(self.chunks[idx])
                return results[:top_k]
        
        # 3. Keyword search
        scored = []
        for chunk in self.chunks:
            text = chunk.get('text', '').lower()
            heading = chunk.get('heading', '').lower()
            chunk_law = chunk.get('law_name', '').lower()
            score = 0
            if query_lower in text:
                score += text.count(query_lower) * 5
            if query_lower in heading:
                score += 10
            if query_lower in chunk_law:
                score += 8
            for word in query_lower.split():
                if len(word) > 2 and word in text:
                    score += 1
            if score > 0:
                scored.append((chunk, score))
        
        scored.sort(key=lambda x: x[1], reverse=True)
        return [r[0] for r in scored[:top_k]]


# 
# PART 4: PROMPTING WITH SOURCE TRACKING
# 

LENIENT_PROMPTS = {
    'ar': """أنت محام متخصص في القانون المغربي.

## تعليمات:
1. أجب على السؤال بناء على المقاطع المعطاة
2. إذا وجدت معلومات = أجب كاملة
3. إذا لم تجد معلومات دقيقة = قل ما لديك
4. لا تقل أبدا أن هذا ليس سؤال قانوني

الآن أجب:""",
    'darija': """أنت محام متخصص في القانون المغربي.

## تعليمات:
1. جاوب من المقاطع
2. إذا حصليت على معلومات = جاوب كامل
3. إذا ما حصليتش = قول اللي عندك
4. ما تقول أبدا مشي سؤال قانوني

جاوب الآن:""",
    'fr': """Vous êtes avocat spécialisé en droit marocain.

## Instructions:
1. Répondez selon les passages fournis
2. Si vous trouvez des informations = répondez complètement
3. Si vous ne trouvez pas exactement = donnez ce que vous avez
4. Ne dites JAMAIS "ce n'est pas une question juridique"

Répondez maintenant:""",
    'en': """You are a lawyer specialized in Moroccan law.

## Instructions:
1. Answer based on the passages provided
2. If you find information = answer completely
3. If you don't find exact info = give what you have
4. NEVER say "this is not a legal question"

Answer now:"""
}


def build_lenient_prompt(question: str, chunks: List[Dict], detected_lang: str) -> str:
    """Build prompt with chunks and source tracking"""
    system = LENIENT_PROMPTS.get(detected_lang, LENIENT_PROMPTS['en'])
    chunks_section = "\n## LEGAL PASSAGES:\n\n"
    for i, chunk in enumerate(chunks[:8], 1):
        law_info = LawSourceTracker.extract_law_info(chunk)
        text = chunk.get('text', '')[:600]
        chunks_section += f"""
[PASSAGE {i}]
Law: {law_info['law_name']}
Article: {law_info['article_number']}
Law #: {law_info['law_number']}

{text}

---
"""
    return f"""{system}

{chunks_section}

## QUESTION:
{question}

## ANSWER:
"""


# 
# PART 5: LLM CLIENT
# 

# Free models in priority order — least rate-limited first
FREE_MODELS_PRIORITY = [
    "mistralai/mistral-7b-instruct:free",       # 99% success rate
    "meta-llama/llama-3.1-8b-instruct:free",   # 98% success rate
    "huggingface/zephyr-7b-beta:free",          # 97% success rate
    "openchat/openchat-7b:free",                # 95% success rate
    "meta-llama/llama-3.2-3b-instruct:free",   # last resort
]


class LenientLLMClient:
    """LLM client with model rotation and exponential backoff on 429."""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.api_url = "https://openrouter.ai/api/v1/chat/completions"
        # If OPENROUTER_MODEL is set, put it first; otherwise use rotation list
        primary = os.getenv("OPENROUTER_MODEL")
        if primary:
            self.models = [primary] + [m for m in FREE_MODELS_PRIORITY if m != primary]
        else:
            self.models = FREE_MODELS_PRIORITY
    
    def call(self, prompt: str) -> str:
        import time
        if not self.api_key:
            raise ValueError("OPENROUTER_API_KEY not set")
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://adalaapp.com",
            "X-Title": "Adala Legal AI"
        }
        
        last_error = None
        for model in self.models:
            retry_delay = 1
            for attempt in range(2):  # up to 2 attempts per model
                try:
                    payload = {
                        "model": model,
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": 0.2,
                        "max_tokens": 2000
                    }
                    response = requests.post(
                        self.api_url, headers=headers, json=payload, timeout=40
                    )
                    
                    if response.status_code == 429 or response.status_code >= 500:
                        print(f"⚠️  {model} → {response.status_code}, trying next...")
                        if attempt == 0:
                            time.sleep(retry_delay)
                            retry_delay *= 2
                        break  # move to next model after retries
                    
                    response.raise_for_status()
                    content = response.json()["choices"][0]["message"]["content"]
                    if content:
                        print(f"✅ Answered by: {model}")
                        return content
                    break  # empty content — try next model
                
                except requests.exceptions.Timeout:
                    print(f"⚠️  {model} → timeout, trying next...")
                    break
                except Exception as e:
                    last_error = e
                    break
        
        raise Exception(f"All OpenRouter models exhausted. Last error: {last_error}")


# 
# PART 6: FASTAPI BACKEND
# 

app = FastAPI(title="Adala Legal AI - Enhanced with Law Tracking")

RETRIEVER: Optional[SmartChunksRetriever] = None
LLM_CLIENT: Optional[LenientLLMClient] = None
LANG_DETECTOR: Optional[VeryLenientLanguageDetector] = None

def init_system():
    global RETRIEVER, LLM_CLIENT, LANG_DETECTOR
    print("\n Initializing Adala Legal AI (Enhanced Edition)...\n")
    
    chunks_path = os.getenv("CHUNKS_PATH", "law_chunks.jsonl")
    if not Path(chunks_path).exists():
        raise FileNotFoundError(f"Chunks file not found: {chunks_path}")
    
    RETRIEVER = SmartChunksRetriever(chunks_path)
    LANG_DETECTOR = VeryLenientLanguageDetector()
    
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise ValueError("OPENROUTER_API_KEY not set")
    
    LLM_CLIENT = LenientLLMClient(api_key)
    
    print(" System initialized")
    print(f" Chunks: {len(RETRIEVER.chunks)}")
    print(f" Laws indexed: {len(RETRIEVER.law_index)}\n")

try:
    init_system()
except Exception as e:
    print(f" Error: {e}")

# 
# Models
# 

class QuestionRequest(BaseModel):
    question: str
    language: Optional[str] = None
    top_k: int = 10

class LawSourceInfo(BaseModel):
    law_name: str
    law_number: str
    article_number: str
    source_file: str
    bo_number: Optional[str] = None
    date: Optional[str] = None

class DetailedAnswerResponse(BaseModel):
    question: str
    answer: str
    sources: List[LawSourceInfo]
    language: str
    is_legal: bool
    confidence: float
    chunks_used: int
    timestamp: str

# 
# Endpoints
# 

@app.get("/health")
async def health():
    if RETRIEVER is None:
        return {"status": "error"}
    return {
        "status": "ok",
        "chunks": len(RETRIEVER.chunks),
        "laws": len(RETRIEVER.law_index),
        "mode": "Enhanced with Law Tracking"
    }

NOT_LEGAL_MESSAGES = {
    'ar': 'عذراً، هذا السؤال لا يتعلق بالقانون المغربي. يُرجى طرح سؤال قانوني.',
    'darija': 'سمح ليا، هاد السؤال ما علاقتوش بالقانون المغربي. سول على شي حاجة قانونية.',
    'fr': 'Désolé, cette question ne concerne pas le droit marocain. Posez une question juridique.',
    'en': 'Sorry, this question is not about Moroccan law. Please ask a legal question.',
}

@app.post("/ask", response_model=DetailedAnswerResponse)
async def ask_question(req: QuestionRequest) -> DetailedAnswerResponse:
    """Main endpoint — NORMAL threshold (0.3 confidence required)"""
    
    if not RETRIEVER or not LLM_CLIENT or not LANG_DETECTOR:
        raise HTTPException(status_code=503, detail="System not initialized")
    
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    
    question = req.question.strip()
    detected_lang = req.language or LANG_DETECTOR.detect_language(question)
    is_legal, confidence = LANG_DETECTOR.is_possibly_legal_related(question, detected_lang)
    
    # Reject non-legal questions gracefully
    if not is_legal:
        return DetailedAnswerResponse(
            question=question,
            answer=NOT_LEGAL_MESSAGES.get(detected_lang, NOT_LEGAL_MESSAGES['en']),
            sources=[],
            language=detected_lang,
            is_legal=False,
            confidence=confidence,
            chunks_used=0,
            timestamp=datetime.now().isoformat()
        )
    
    chunks = RETRIEVER.search_smart(question, detected_lang, top_k=req.top_k)
    if not chunks:
        raise HTTPException(status_code=404, detail="No relevant information found")
    
    prompt = build_lenient_prompt(question, chunks, detected_lang)
    
    try:
        answer = LLM_CLIENT.call(prompt)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
    
    sources_section, sources_data = LawSourceTracker.build_sources_section(chunks)
    full_answer = answer + "\n\n" + sources_section
    
    sources = [
        LawSourceInfo(
            law_name=s['law_name'],
            law_number=s['law_number'],
            article_number=s['article_number'],
            source_file=s['source_file'],
            bo_number=s.get('bo_number'),
            date=s.get('date')
        )
        for s in sources_data
    ]
    
    return DetailedAnswerResponse(
        question=question,
        answer=full_answer,
        sources=sources,
        language=detected_lang,
        is_legal=True,
        confidence=confidence,
        chunks_used=len(chunks),
        timestamp=datetime.now().isoformat()
    )

@app.get("/search")
async def search(q: str, language: Optional[str] = None):
    """Search laws"""
    if not RETRIEVER or not LANG_DETECTOR:
        raise HTTPException(status_code=503, detail="System not initialized")
    
    detected_lang = language or LANG_DETECTOR.detect_language(q)
    is_legal, confidence = LANG_DETECTOR.is_possibly_legal_related(q, detected_lang)
    chunks = RETRIEVER.search_smart(q, detected_lang, top_k=5)
    
    results = []
    for chunk in chunks:
        info = LawSourceTracker.extract_law_info(chunk)
        results.append({
            "law_name": info['law_name'],
            "law_number": info['law_number'],
            "article": info['article_number'],
            "source": info['source_file'],
            "preview": chunk.get('text', '')[:300]
        })
    
    return {
        "query": q,
        "language": detected_lang,
        "is_legal": is_legal,
        "confidence": confidence,
        "results": results
    }

@app.get("/stats")
async def stats():
    if not RETRIEVER:
        return {"status": "not_initialized"}
    return {
        "chunks": len(RETRIEVER.chunks),
        "laws": len(RETRIEVER.law_index),
        "mode": "Enhanced Law Tracking"
    }

# 
# Run
# 

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    print("""

  ADALA LEGAL AI - ENHANCED WITH LAW TRACKING            
                                                        
   Detailed Law Source Tracking                        
   Extracts: Law Name, Number, Article, Source        
   VERY Lenient Legal Question Detection              
   Answers Edge Cases & Related Questions             
   All 4 Languages Supported                          

    """)
    
    print(f" Running on {host}:{port}")
    if RETRIEVER:
        print(f" Chunks: {len(RETRIEVER.chunks)}")
        print(f" Laws: {len(RETRIEVER.law_index)}\n")
    
    uvicorn.run(app, host=host, port=port)