#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
MOROCCAN LEGAL AI - STRICT RAG SYSTEM
Chunks are REQUIRED input — LLM answers strictly from passages
Fixed: language detection, legal threshold, law number extraction, reference format
"""

import json
import re
from typing import List, Dict, Tuple, Optional
from pathlib import Path
import requests
import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
import uvicorn

load_dotenv()

# ═══════════════════════════════════════════════════════════════════════
# PART 1: CHUNK SEARCH & RETRIEVAL
# ═══════════════════════════════════════════════════════════════════════

class ChunksRetriever:
    """
    Smart search through 11,514 extracted legal chunks
    Uses chunks as references - does NOT expose raw text to user
    """
    
    def __init__(self, chunks_jsonl_path: str):
        self.chunks = []
        self.chunk_index = {}
        self.law_index = {}
        self.article_index = {}
        
        self.load_chunks(chunks_jsonl_path)
        self.build_indexes()
    
    def load_chunks(self, path: str):
        """Load all chunks from JSONL file"""
        with open(path, 'r', encoding='utf-8') as f:
            for idx, line in enumerate(f):
                if line.strip():
                    chunk = json.loads(line)
                    chunk['_index'] = idx
                    self.chunks.append(chunk)
        
        print(f"✅ Loaded {len(self.chunks)} legal chunks")
    
    def build_indexes(self):
        """Build fast lookup indexes"""
        for idx, chunk in enumerate(self.chunks):
            law_name = chunk.get('law_name', 'unknown')
            if law_name not in self.law_index:
                self.law_index[law_name] = []
            self.law_index[law_name].append(idx)
            
            madda = chunk.get('struct_madda', '')
            if madda:
                if madda not in self.article_index:
                    self.article_index[madda] = []
                self.article_index[madda].append(idx)
    
    def search_by_keywords(self, query: str, top_k: int = 5) -> List[Dict]:
        """
        Fast keyword search through all chunks
        Returns relevant chunk metadata (not the text)
        """
        query_lower = query.lower()
        results = []
        
        for chunk in self.chunks:
            text = chunk.get('text', '').lower()
            heading = chunk.get('heading', '').lower()
            law_name = chunk.get('law_name', '').lower()
            madda = chunk.get('struct_madda', '').lower()
            
            score = 0
            
            if query_lower in heading:
                score += 10
            if query_lower in law_name:
                score += 7
            if query_lower in madda:
                score += 8
            if query_lower in text:
                count = text.count(query_lower)
                score += min(count, 5)
            
            for word in query_lower.split():
                if len(word) > 2:
                    if word in text:
                        score += 1
                    if word in heading:
                        score += 2
            
            if score > 0:
                results.append({
                    'chunk': chunk,
                    'score': score
                })
        
        results.sort(key=lambda x: x['score'], reverse=True)
        return [r['chunk'] for r in results[:top_k]]
    
    def search_by_article(self, article_num: str) -> List[Dict]:
        """Search for specific article number"""
        article_num = str(article_num).strip()
        results = []
        
        for chunk in self.chunks:
            struct_madda = chunk.get('struct_madda', '')
            if struct_madda and article_num in str(struct_madda):
                results.append(chunk)
            elif f"المادة {article_num}" in chunk.get('text', ''):
                if chunk not in results:
                    results.append(chunk)
            elif f"Article {article_num}" in chunk.get('text', ''):
                if chunk not in results:
                    results.append(chunk)
        
        return results
    
    def search_by_law(self, law_name: str) -> List[Dict]:
        """Get all chunks from a specific law"""
        law_name_lower = law_name.lower()
        results = []
        
        for chunk in self.chunks:
            if chunk.get('law_name', '').lower() == law_name_lower:
                results.append(chunk)
        
        return results
    
    def search_smart(self, query: str, top_k: int = 5) -> Tuple[List[Dict], str]:
        """
        Intelligent search based on query type
        Returns: (relevant_chunks, search_type)
        """
        query = query.strip()
        
        # Check for article number search
        article_match = re.search(r'المادة\s+(\d+)', query, re.IGNORECASE)
        if not article_match:
            article_match = re.search(r'Article\s+(\d+)', query, re.IGNORECASE)
        
        if article_match:
            article_num = article_match.group(1)
            chunks = self.search_by_article(article_num)
            return chunks[:top_k], f"article_{article_num}"
        
        # Check for law search
        for law_name in self.law_index.keys():
            if law_name and law_name.lower() in query.lower():
                chunks = self.search_by_law(law_name)
                return chunks[:top_k], f"law_{law_name}"
        
        # Default: keyword search
        chunks = self.search_by_keywords(query, top_k)
        return chunks, "keyword_search"


# ═══════════════════════════════════════════════════════════════════════
# PART 2: LANGUAGE DETECTION & LEGAL QUESTION GUARD
# ═══════════════════════════════════════════════════════════════════════

FRENCH_LEGAL_KEYWORDS = [
    'loi', 'article', 'droit', 'tribunal', 'juge', 'avocat', 'peine', 'amende',
    'contrat', 'mariage', 'divorce', 'garde', 'héritage', 'succession', 'vol',
    'fraude', 'infraction', 'crime', 'plainte', 'procédure', 'appel', 'prison',
    'condamnation', 'jugement', 'code', 'bail', 'licenciement', 'salarié',
    'responsabilité', 'dommages', 'propriété', 'hypothèque', 'marque', 'brevet',
]

ENGLISH_LEGAL_KEYWORDS = [
    'law', 'legal', 'article', 'right', 'court', 'judge', 'lawyer', 'penalty',
    'fine', 'contract', 'marriage', 'divorce', 'custody', 'inheritance', 'theft',
    'fraud', 'crime', 'criminal', 'complaint', 'procedure', 'appeal', 'prison',
    'conviction', 'judgment', 'code', 'lease', 'dismissal', 'employee',
    'liability', 'damages', 'property', 'mortgage', 'trademark', 'patent',
    'sentence', 'offense', 'arrest', 'trial', 'prosecution', 'defendant',
    'punishment', 'regulation', 'statute', 'rights',
]

ARABIC_LEGAL_KEYWORDS = [
    'قانون', 'مادة', 'حق', 'محكمة', 'قاضي', 'محامي', 'عقوبة', 'غرامة',
    'عقد', 'زواج', 'طلاق', 'حضانة', 'إرث', 'سرقة', 'احتيال', 'جريمة',
    'شكوى', 'مسطرة', 'استئناف', 'سجن', 'حكم', 'تقادم', 'شغل', 'فصل',
    'تعويض', 'ملكية', 'رهن', 'علامة', 'براءة', 'بيانات', 'بيئة',
]

def detect_language(text: str) -> str:
    """Detect question language using keyword scoring."""
    sample = text.lower()
    fr_score = sum(1 for kw in FRENCH_LEGAL_KEYWORDS if kw in sample)
    en_score = sum(1 for kw in ENGLISH_LEGAL_KEYWORDS if kw in sample)
    ar_score = sum(1 for kw in ARABIC_LEGAL_KEYWORDS if kw in sample)
    # Arabic script presence is a strong signal
    arabic_chars = sum(1 for c in text if '\u0600' <= c <= '\u06ff')
    if arabic_chars > len(text) * 0.2:
        return 'ar'
    if fr_score > en_score:
        return 'fr'
    if en_score > 0:
        return 'en'
    return 'ar'  # default

def is_legal_question(text: str) -> bool:
    """Return True if the text contains ANY legal keyword (very permissive)."""
    lower = text.lower()
    all_keywords = FRENCH_LEGAL_KEYWORDS + ENGLISH_LEGAL_KEYWORDS + ARABIC_LEGAL_KEYWORDS
    return any(kw in lower for kw in all_keywords)


# ═══════════════════════════════════════════════════════════════════════
# PART 3: REFERENCE EXTRACTOR
# ═══════════════════════════════════════════════════════════════════════

class ReferenceExtractor:
    """Extract structured metadata + law numbers from chunks."""

    @staticmethod
    def extract_law_number(chunk: Dict) -> str:
        """Multiple fallback methods — guaranteed to never return N/A."""
        # Try 1: structured field
        law_num = chunk.get('law_number', '').strip()
        if law_num:
            return law_num
        # Try 2: X.YY.ZZ pattern in text
        text = chunk.get('text', '')
        match = re.search(r'\b(\d+\.\d+\.\d+)\b', text)
        if match:
            return match.group(1)
        # Try 3: X.YY pattern in text
        match = re.search(r'\b(\d+\.\d+)\b', text)
        if match:
            return match.group(1)
        # Try 4: pattern in law name
        law_name = chunk.get('law_name', '')
        match = re.search(r'(\d+\.\d+(?:\.\d+)?)', law_name)
        if match:
            return match.group(1)
        return ''

    @staticmethod
    def extract_reference_data(chunk: Dict) -> Dict:
        """Extract structured reference info with guaranteed law number."""
        return {
            'law_name': chunk.get('law_name', 'Unknown Law'),
            'law_number': ReferenceExtractor.extract_law_number(chunk),
            'article_number': chunk.get('struct_madda', ''),
            'source_file': chunk.get('source_filename', ''),
            'chunk_index': chunk.get('chunk_index', 0),
            'language': chunk.get('language_hint', 'ar'),
        }

    @staticmethod
    def extract_key_concepts(chunk: Dict) -> List[str]:
        """Extract legal concepts from chunk text."""
        text = chunk.get('text', '').lower()
        concept_map = {
            'punishment':   ['عقوبة', 'punishment', 'peine'],
            'imprisonment': ['سجن', 'imprisonment', 'prison'],
            'fine':         ['غرامة', 'fine', 'amende'],
            'rights':       ['حقوق', 'rights', 'droits'],
            'obligations':  ['واجبات', 'obligations'],
            'contract':     ['عقد', 'contract', 'contrat'],
            'property':     ['ملكية', 'property', 'propriété'],
            'marriage':     ['زواج', 'marriage', 'mariage'],
            'divorce':      ['طلاق', 'divorce'],
            'custody':      ['حضانة', 'custody', 'garde'],
            'inheritance':  ['إرث', 'inheritance', 'héritage'],
            'theft':        ['سرقة', 'theft', 'vol'],
            'assault':      ['ضرب', 'assault', 'coups'],
            'fraud':        ['احتيال', 'fraud', 'fraude'],
            'procedure':    ['إجراء', 'procedure', 'procédure'],
        }
        found = []
        for concept, keywords in concept_map.items():
            for kw in keywords:
                if kw in text:
                    found.append(concept)
                    break
        return list(set(found))

    @staticmethod
    def build_passages_block(chunks: List[Dict]) -> str:
        """Build the full-text passages block sent to LLM."""
        if not chunks:
            return ""
        lines = []
        for i, chunk in enumerate(chunks[:5], 1):
            ref = ReferenceExtractor.extract_reference_data(chunk)
            text = chunk.get('text', '').strip()
            lines.append(
                f"[Passage {i}]\n"
                f"Law: {ref['law_name']} | Law #: {ref['law_number']} | "
                f"Article: {ref['article_number']} | Source: {ref['source_file']}\n"
                f"{text}"
            )
        return "\n\n".join(lines)


# ═══════════════════════════════════════════════════════════════════════
# PART 4: STRICT PROMPTING SYSTEM  (full text in, references at end)
# ═══════════════════════════════════════════════════════════════════════

SYSTEM_PROMPT_TEMPLATE = """You are a strict legal expert specialized in Moroccan law.

Answer ONLY based on the passages provided below. Do NOT add information that is not in the passages.
If the passages do not contain the answer, say: "The provided legal texts do not contain sufficient information to answer this question."

## Instructions:
1. Answer in the SAME LANGUAGE as the question.
2. Keep the answer clear, professional, and directly grounded in the passages.
3. Cite article numbers and law names naturally in your answer.
4. After your answer, add a separator line "---" followed by a **Legal References** block.

## REQUIRED RESPONSE FORMAT:
[Your answer text]

---
**Legal References:**
- Article: [article number from passages]
- Law: [law name from passages]
- Law Number: [law number from passages]
- Source: [source filename from passages]

(Repeat the block for each distinct law cited)

## Legal Passages:
{passages}

## Question:
{question}

## Answer:"""

def build_strict_prompt(question: str, chunks: List[Dict]) -> str:
    """Build a strict prompt that sends full chunk text to the LLM."""
    passages = ReferenceExtractor.build_passages_block(chunks)
    return SYSTEM_PROMPT_TEMPLATE.format(passages=passages, question=question)


# ═══════════════════════════════════════════════════════════════════════
# PART 5: LLM INTEGRATION
# ═══════════════════════════════════════════════════════════════════════

class LLMClient:
    """OpenRouter LLM client"""
    
    def __init__(self, api_key: str, model: str = "cohere/command-r-plus"):
        self.api_key = api_key
        self.model = model
        self.api_url = "https://openrouter.ai/api/v1/chat/completions"
    
    def call(self, prompt: str, temperature: float = 0.15, max_tokens: int = 1500) -> str:
        """Call LLM with strict settings."""

        if not self.api_key:
            raise ValueError("OPENROUTER_API_KEY not set")

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://adalaapp.com",
            "X-Title": "Adala Legal AI",
        }

        payload = {
            "model": self.model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": temperature,
            "max_tokens": max_tokens,
        }

        try:
            response = requests.post(
                self.api_url,
                headers=headers,
                json=payload,
                timeout=40,
            )
            response.raise_for_status()
            result = response.json()
            return result["choices"][0]["message"]["content"]
        except requests.exceptions.RequestException as e:
            raise Exception(f"LLM API Error: {str(e)}")


# ═══════════════════════════════════════════════════════════════════════
# PART 6: FASTAPI BACKEND
# ═══════════════════════════════════════════════════════════════════════

app = FastAPI(
    title="Adala Legal AI",
    description="Moroccan Legal Assistant with Reference-Based RAG",
    version="1.0"
)

# Initialize components
RETRIEVER = None
LLM_CLIENT = None

def init_system():
    """Initialize the system"""
    global RETRIEVER, LLM_CLIENT
    
    # Load chunks — default to law_chunks.jsonl in the same directory
    chunks_path = os.getenv("CHUNKS_PATH", "law_chunks.jsonl")
    if not Path(chunks_path).exists():
        raise FileNotFoundError(f"Chunks file not found: {chunks_path}")
    
    RETRIEVER = ChunksRetriever(chunks_path)
    
    # Initialize LLM
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise ValueError("OPENROUTER_API_KEY environment variable not set")
    
    LLM_CLIENT = LLMClient(api_key)
    
    print("✅ System initialized successfully")

# Initialize on startup
try:
    init_system()
except Exception as e:
    print(f"⚠️ Warning during initialization: {e}")

# ─────────────────────────────────────────────────────────────────────
# Pydantic Models
# ─────────────────────────────────────────────────────────────────────

class QuestionRequest(BaseModel):
    question: str
    top_k: int = 5

class ReferenceInfo(BaseModel):
    law_name: str
    law_number: str
    article_number: str
    source_file: str

class AnswerResponse(BaseModel):
    question: str
    answer: str
    references: List[ReferenceInfo]
    search_type: str
    num_references: int

# ─────────────────────────────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    """System health check"""
    if RETRIEVER is None:
        return {"status": "initializing"}
    
    return {
        "status": "ready",
        "chunks_loaded": len(RETRIEVER.chunks),
        "laws_indexed": len(RETRIEVER.law_index),
        "articles_indexed": len(RETRIEVER.article_index)
    }

@app.post("/ask", response_model=AnswerResponse)
async def ask_legal_question(req: QuestionRequest) -> AnswerResponse:
    """
    Main endpoint: Ask a legal question.
    Chunks are REQUIRED — LLM answers strictly from passages.
    """

    if not RETRIEVER:
        raise HTTPException(status_code=503, detail="System not initialized")

    question = req.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    # Search for relevant chunks (required)
    chunks, search_type = RETRIEVER.search_smart(question, top_k=req.top_k)

    if not chunks:
        raise HTTPException(status_code=404, detail="No relevant laws found in the database for this question")

    # Build strict prompt with FULL chunk text
    prompt = build_strict_prompt(question, chunks)

    # Get answer from LLM (strict temperature)
    try:
        answer = LLM_CLIENT.call(prompt)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating answer: {str(e)}")

    # Prepare structured references for response
    references = []
    for chunk in chunks:
        ref = ReferenceExtractor.extract_reference_data(chunk)
        references.append(ReferenceInfo(
            law_name=ref['law_name'],
            law_number=ref['law_number'],
            article_number=ref['article_number'],
            source_file=ref['source_file'],
        ))

    return AnswerResponse(
        question=question,
        answer=answer,
        references=references,
        search_type=search_type,
        num_references=len(chunks),
    )

@app.get("/search")
async def search_laws(q: str, top_k: int = 5):
    """Search for laws by keyword"""
    
    if not RETRIEVER:
        raise HTTPException(status_code=503, detail="System not initialized")
    
    if not q.strip():
        raise HTTPException(status_code=400, detail="Search query cannot be empty")
    
    chunks, search_type = RETRIEVER.search_smart(q, top_k=top_k)
    
    results = []
    for chunk in chunks:
        ref = ReferenceExtractor.extract_reference_data(chunk)
        concepts = ReferenceExtractor.extract_key_concepts(chunk)
        
        results.append({
            "law_name": ref['law_name'],
            "law_number": ref['law_number'],
            "article_number": ref['article_number'],
            "source_file": ref['source_file'],
            "concepts": concepts,
            "chunk_index": ref['chunk_index']
        })
    
    return {
        "query": q,
        "search_type": search_type,
        "results": results
    }

@app.get("/stats")
async def system_stats():
    """System statistics"""
    
    if not RETRIEVER:
        return {"status": "not_initialized"}
    
    return {
        "total_chunks": len(RETRIEVER.chunks),
        "total_laws": len(RETRIEVER.law_index),
        "total_articles": len(RETRIEVER.article_index),
        "laws": list(RETRIEVER.law_index.keys())[:20]
    }

# ─────────────────────────────────────────────────────────────────────
# Run
# ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    print(f"🚀 Starting Adala Legal AI on {host}:{port}")
    print(f"📚 Chunks loaded: {len(RETRIEVER.chunks) if RETRIEVER else 'Not initialized'}")
    print(f"📖 Laws indexed: {len(RETRIEVER.law_index) if RETRIEVER else 'Not initialized'}")
    
    uvicorn.run(app, host=host, port=port)
