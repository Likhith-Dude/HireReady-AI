"""Multi-provider AI with Groq primary, OpenAI fallback, response caching, token tracking."""
import json
import re
import time
import hashlib
import logging
from typing import Optional, Generator
from cachetools import TTLCache
from app.config import settings

logger = logging.getLogger(__name__)

# Response cache: 1000 entries, 1 hour TTL
_cache = TTLCache(maxsize=1000, ttl=3600)

# Token usage tracking
_usage = {"groq_tokens": 0, "openai_tokens": 0, "groq_calls": 0, "openai_calls": 0, "cache_hits": 0}


def _cache_key(prompt: str) -> str:
    return hashlib.md5(prompt.encode()).hexdigest()


def _get_groq_client():
    if not settings.groq_api_key:
        return None
    try:
        from groq import Groq
        return Groq(api_key=settings.groq_api_key)
    except Exception:
        return None


def _get_openai_client():
    if not settings.openai_api_key:
        return None
    try:
        import openai
        return openai.OpenAI(api_key=settings.openai_api_key)
    except Exception:
        return None


def _try_groq(prompt: str, max_tokens: int = 4096) -> Optional[str]:
    client = _get_groq_client()
    if not client:
        return None
    try:
        start = time.time()
        resp = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=max_tokens,
        )
        text = resp.choices[0].message.content
        tokens = resp.usage.total_tokens if resp.usage else 0
        _usage["groq_tokens"] += tokens
        _usage["groq_calls"] += 1
        logger.info(f"[AI] Groq OK — {tokens} tokens, {time.time()-start:.2f}s")
        return text
    except Exception as e:
        logger.warning(f"[AI] Groq failed: {e}")
        return None


def _try_openai(prompt: str, max_tokens: int = 4096) -> Optional[str]:
    client = _get_openai_client()
    if not client:
        return None
    try:
        start = time.time()
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=max_tokens,
        )
        text = resp.choices[0].message.content
        tokens = resp.usage.total_tokens if resp.usage else 0
        _usage["openai_tokens"] += tokens
        _usage["openai_calls"] += 1
        logger.info(f"[AI] OpenAI fallback OK — {tokens} tokens, {time.time()-start:.2f}s")
        return text
    except Exception as e:
        logger.warning(f"[AI] OpenAI failed: {e}")
        return None


def chat(prompt: str, max_tokens: int = 4096, use_cache: bool = True) -> str:
    """Route to Groq, fall back to OpenAI, raise if both fail."""
    key = _cache_key(prompt)
    if use_cache and key in _cache:
        _usage["cache_hits"] += 1
        logger.info("[AI] Cache hit")
        return _cache[key]

    text = _try_groq(prompt, max_tokens) or _try_openai(prompt, max_tokens)
    if not text:
        raise RuntimeError("All AI providers failed. Check GROQ_API_KEY / OPENAI_API_KEY.")

    if use_cache:
        _cache[key] = text
    return text


def stream(prompt: str) -> Generator[str, None, None]:
    """Streaming from Groq (no fallback for streams)."""
    client = _get_groq_client()
    if not client:
        raise RuntimeError("Groq not configured")
    stream_resp = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        max_tokens=4096,
        stream=True,
    )
    for chunk in stream_resp:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta


def parse_json(text: str) -> dict:
    text = re.sub(r"```(?:json)?", "", text).strip().rstrip("`").strip()
    return json.loads(text)


def get_usage() -> dict:
    return dict(_usage)
