#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
MOROCCAN LEGAL AI - ENGLISH PROMPTING SYSTEM
Chunks used as REFERENCES ONLY - LLM completes answers intelligently
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
# PART 2: REFERENCE EXTRACTOR (No raw text!)
# ═══════════════════════════════════════════════════════════════════════

class ReferenceExtractor:
    """
    Extract REFERENCES from chunks - NOT the text
    LLM uses these as guidance, not as content to repeat
    """
    
    @staticmethod
    def extract_reference_data(chunk: Dict) -> Dict:
        """Extract structured reference info"""
        return {
            'law_name': chunk.get('law_name', 'Unknown Law'),
            'law_number': chunk.get('law_number', ''),
            'article_number': chunk.get('struct_madda', ''),
            'source_file': chunk.get('source_filename', ''),
            'chunk_index': chunk.get('chunk_index', 0),
            'language': chunk.get('language_hint', 'ar')
        }
    
    @staticmethod
    def extract_key_concepts(chunk: Dict) -> List[str]:
        """Extract legal concepts WITHOUT exposing text"""
        text = chunk.get('text', '').lower()
        
        # Legal concept keywords (English + Arabic)
        concepts = {
            'punishment': ['عقوبة', 'punishment', 'peine'],
            'imprisonment': ['سجن', 'imprisonment', 'prison'],
            'fine': ['غرامة', 'fine', 'amende'],
            'article': ['مادة', 'article'],
            'rights': ['حقوق', 'rights', 'droits'],
            'obligations': ['واجبات', 'obligations', 'obligations'],
            'contract': ['عقد', 'contract', 'contrat'],
            'property': ['ملكية', 'property', 'propriété'],
            'marriage': ['زواج', 'marriage', 'mariage'],
            'divorce': ['طلاق', 'divorce', 'divorce'],
            'custody': ['حضانة', 'custody', 'garde'],
            'inheritance': ['إرث', 'inheritance', 'héritage'],
            'theft': ['سرقة', 'theft', 'vol'],
            'assault': ['ضرب', 'assault', 'coups'],
            'fraud': ['احتيال', 'fraud', 'fraude'],
            'procedure': ['إجراء', 'procedure', 'procédure']
        }
        
        found = []
        for concept, keywords in concepts.items():
            for keyword in keywords:
                if keyword in text:
                    found.append(concept)
                    break
        
        return list(set(found))
    
    @staticmethod
    def build_reference_guide(chunks: List[Dict]) -> str:
        """
        Build a REFERENCE GUIDE for LLM
        NOT the actual chunk text - just metadata
        """
        if not chunks:
            return "No relevant laws found in reference database."
        
        extractor = ReferenceExtractor()
        guide_lines = []
        
        for i, chunk in enumerate(chunks[:5], 1):
            ref = extractor.extract_reference_data(chunk)
            concepts = extractor.extract_key_concepts(chunk)
            
            line = f"""
{i}. Law: {ref['law_name']} (#{ref['law_number']})
   Article: {ref['article_number']}
   Concepts: {', '.join(concepts[:5]) if concepts else 'general'}
   Source: {ref['source_file']}"""
            guide_lines.append(line)
        
        return "\n".join(guide_lines)


# ═══════════════════════════════════════════════════════════════════════
# PART 3: ENGLISH PROMPTING SYSTEM
# ═══════════════════════════════════════════════════════════════════════

SYSTEM_PROMPT = """You are an expert legal advisor specialized in Moroccan law.

Your role is to provide accurate, comprehensive legal answers based on Moroccan legislation.

## How to use the reference database:

The references below show which Moroccan laws are relevant to the question.
Use these as GUIDANCE to construct your answer, but provide the complete answer yourself.

Do NOT quote the reference text directly - instead, synthesize the information and provide 
a clear, professional legal explanation.

## Response guidelines:

1. Answer in English clearly and professionally
2. Use the provided law references to ground your answer in actual legislation
3. If the question touches multiple laws, explain how they relate
4. Always mention which laws (by number and name) support your answer
5. Provide practical implications when relevant
6. If information is not in the references, acknowledge that
7. For sensitive matters, recommend consulting with a lawyer
8. Be concise but comprehensive

## Answer format:

Start with a direct answer, then explain the legal basis, then provide practical details.

Now answer the following question using the law references provided:"""

def build_prompt_with_references(question: str, chunks: List[Dict]) -> str:
    """
    Build prompt with references ONLY (not raw text)
    LLM completes the answer intelligently
    """
    
    reference_guide = ReferenceExtractor.build_reference_guide(chunks)
    
    prompt = f"""{SYSTEM_PROMPT}

## Question:
{question}

## Relevant Law References:
{reference_guide}

## Your Complete Answer:"""
    
    return prompt


# ═══════════════════════════════════════════════════════════════════════
# PART 4: LLM INTEGRATION
# ═══════════════════════════════════════════════════════════════════════

class LLMClient:
    """OpenRouter LLM client"""
    
    def __init__(self, api_key: str, model: str = "cohere/command-r-plus"):
        self.api_key = api_key
        self.model = model
        self.api_url = "https://openrouter.ai/api/v1/chat/completions"
    
    def call(self, prompt: str, temperature: float = 0.3, max_tokens: int = 1000) -> str:
        """Call LLM with prompt"""
        
        if not self.api_key:
            raise ValueError("OPENROUTER_API_KEY not set")
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://adalaapp.com",
            "X-Title": "Adala Legal AI"
        }
        
        payload = {
            "model": self.model,
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        try:
            response = requests.post(
                self.api_url,
                headers=headers,
                json=payload,
                timeout=30
            )
            response.raise_for_status()
            
            result = response.json()
            answer = result["choices"][0]["message"]["content"]
            return answer
            
        except requests.exceptions.RequestException as e:
            raise Exception(f"LLM API Error: {str(e)}")


# ═══════════════════════════════════════════════════════════════════════
# PART 5: FASTAPI BACKEND
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
    Main endpoint: Ask a legal question
    
    Uses chunks as REFERENCES ONLY
    LLM generates complete answer
    """
    
    if not RETRIEVER:
        raise HTTPException(status_code=503, detail="System not initialized")
    
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    
    # Search for relevant chunks
    chunks, search_type = RETRIEVER.search_smart(req.question, top_k=req.top_k)
    
    if not chunks:
        raise HTTPException(status_code=404, detail="No relevant laws found")
    
    # Build prompt with references (NOT raw text)
    prompt = build_prompt_with_references(req.question, chunks)
    
    # Get answer from LLM
    try:
        answer = LLM_CLIENT.call(prompt, temperature=0.3, max_tokens=1000)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating answer: {str(e)}")
    
    # Prepare references for response
    references = []
    for chunk in chunks:
        ref = ReferenceExtractor.extract_reference_data(chunk)
        references.append(ReferenceInfo(
            law_name=ref['law_name'],
            law_number=ref['law_number'],
            article_number=ref['article_number'],
            source_file=ref['source_file']
        ))
    
    return AnswerResponse(
        question=req.question,
        answer=answer,
        references=references,
        search_type=search_type,
        num_references=len(chunks)
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
