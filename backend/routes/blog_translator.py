"""
Blog article auto-translation using Claude Sonnet 4.5 via emergentintegrations.

Translates an article (title + meta description + HTML body) into target
languages while preserving all HTML tags, attributes and structure intact.
"""
import os
import re
import json
import uuid
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

# 4 target languages we support (in addition to the source EN)
TARGET_LANGS = ["fr", "es", "ru", "hy"]
LANG_NAMES = {
    "fr": "French",
    "es": "Spanish",
    "ru": "Russian",
    "hy": "Armenian",
    "en": "English",
}


async def translate_slug(en_title: str, target_lang: str) -> str:
    """
    Generate a URL-safe kebab-case slug in target_lang by asking the LLM to
    translate the English title and convert it to an SEO-friendly slug.
    Russian and Armenian are transliterated to Latin for URL safety.
    """
    if not en_title or not en_title.strip():
        return ""

    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        raise RuntimeError("EMERGENT_LLM_KEY missing in environment")

    target_name = LANG_NAMES.get(target_lang, target_lang)
    transliterate_note = (
        " Transliterate any non-Latin characters to ASCII Latin (e.g., 'трансфер' -> 'transfer', 'օդանավակայան' -> 'odanavakayan')."
        if target_lang in ("ru", "hy")
        else " Strip accents/diacritics (é -> e, à -> a, ñ -> n)."
    )

    system_prompt = (
        f"You are an SEO expert. Given an English blog article title, generate ONE URL-safe slug "
        f"that captures the article's meaning translated to {target_name}.\n"
        f"STRICT RULES:\n"
        f"1. Output ONLY the slug, no explanation, no quotes, no markdown.\n"
        f"2. Lowercase ASCII letters, digits and hyphens only — no spaces, no special chars, no accents.\n"
        f"3. Maximum 70 characters. 5-9 words ideally.\n"
        f"4. Include the main SEO keywords in {target_name}.\n"
        f"5. Keep proper nouns (paris, orly, cdg, zont, beauvais) lowercased.\n"
        f"6.{transliterate_note}\n"
        f"7. NEVER include the words 'blog', 'article', 'translation'."
    )

    from emergentintegrations.llm.chat import LlmChat, UserMessage
    chat = (
        LlmChat(
            api_key=api_key,
            session_id=f"slug-{uuid.uuid4()}",
            system_message=system_prompt,
        )
        .with_model("anthropic", "claude-sonnet-4-6")
    )

    try:
        response = await chat.send_message(UserMessage(text=en_title))
        result = (response or "").strip().lower()
        # Strip code fences
        result = re.sub(r"^```\w*\s*", "", result)
        result = re.sub(r"\s*```\s*$", "", result)
        # Take only first line
        result = result.splitlines()[0].strip() if result else ""
        # Aggressive sanitize: only [a-z0-9-]
        result = re.sub(r"[^a-z0-9\-\s]", "", result)
        result = re.sub(r"[\s_]+", "-", result)
        result = re.sub(r"-+", "-", result).strip("-")
        return result[:70].rstrip("-")
    except Exception as e:
        logger.error(f"Slug translation failed ({target_lang}): {e}")
        # Fallback to original slug suffixed with lang
        return ""


async def translate_text(text: str, target_lang: str, *, preserve_html: bool = False, kind: str = "text") -> str:
    """
    Translate a chunk of text to target_lang using Claude Sonnet 4.5.
    kind: 'title', 'meta', 'html', 'text' — controls strictness of prompt + post-processing.
    """
    if not text or not text.strip():
        return text

    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        raise RuntimeError("EMERGENT_LLM_KEY missing in environment")

    target_name = LANG_NAMES.get(target_lang, target_lang)
    if preserve_html or kind == "html":
        system_prompt = (
            f"You are a professional translator. Translate the user's HTML content "
            f"from English to {target_name}. Strict rules:\n"
            f"1. Keep ALL HTML tags, attributes, classes, ids, src, href EXACTLY as-is.\n"
            f"2. Only translate visible text inside tags and attribute values like alt, title.\n"
            f"3. Do NOT add markdown fences, comments, or any extra text.\n"
            f"4. Do NOT translate URLs, brand names (ZONT), or proper nouns of places "
            f"(Paris, Orly, CDG, Beauvais, Disneyland) — keep them as-is.\n"
            f"5. Reply with ONLY the translated HTML, nothing else.\n"
            f"6. Use ONLY the target language ({target_name}). Do NOT mix in words from other languages."
        )
    elif kind == "title":
        system_prompt = (
            f"Translate the following blog article title from English to {target_name}.\n"
            f"CRITICAL RULES:\n"
            f"1. Reply with ONLY the translated title, on ONE single line.\n"
            f"2. Do NOT add an explanation, paragraph, or extra content.\n"
            f"3. Maximum 120 characters in the translation.\n"
            f"4. Keep proper nouns (Paris, Orly, CDG, ZONT, Beauvais) untranslated.\n"
            f"5. Use ONLY the target language. Do NOT mix languages."
        )
    elif kind == "meta":
        system_prompt = (
            f"Translate the following meta description from English to {target_name}.\n"
            f"OUTPUT FORMAT — EXTREMELY STRICT:\n"
            f"1. Output ONLY the translated sentence. Nothing else. No prefix, no quotes.\n"
            f"2. Maximum 160 characters. Single sentence, no line breaks.\n"
            f"3. Use ONLY {target_name} characters. NEVER mix in English, Russian or any other language.\n"
            f"4. Do NOT include phrases like 'Wait', 'Let me', 'I need to'. Do NOT explain your reasoning.\n"
            f"5. Keep proper nouns (Paris, Orly, CDG, ZONT, Beauvais) untranslated.\n"
            f"6. If you make a mistake, do NOT correct yourself in the output — output only the final clean translation."
        )
    else:
        system_prompt = (
            f"You are a professional translator. Translate the user's text from English to "
            f"{target_name}. Reply with ONLY the translated text, no quotes, no explanation. "
            f"Keep proper nouns (Paris, Orly, CDG, ZONT) untranslated. "
            f"Use ONLY the target language."
        )

    from emergentintegrations.llm.chat import LlmChat, UserMessage

    chat = (
        LlmChat(
            api_key=api_key,
            session_id=f"translate-{uuid.uuid4()}",
            system_message=system_prompt,
        )
        .with_model("anthropic", "claude-sonnet-4-6")
    )

    try:
        response = await chat.send_message(UserMessage(text=text))
        result = (response or "").strip()
        result = re.sub(r"^```(?:html|markdown)?\s*", "", result, flags=re.IGNORECASE)
        result = re.sub(r"\s*```\s*$", "", result)
        # Strict post-processing for short fields
        if kind == "title":
            # Take only the first non-empty line
            for line in result.splitlines():
                line = line.strip().strip('"').strip("'")
                if line:
                    result = line[:200]
                    break
        elif kind == "meta":
            # Collapse whitespace, strip self-correction phrases, cap length
            result = re.sub(r"\s+", " ", result).strip().strip('"').strip("'")
            # Cut at self-correction phrases (model thinking out loud in English)
            cut_markers = [
                "Wait,", "Wait ", "Let me ", "Let me,",
                "I need to", "Actually,", "Actually ",
                "Hmm,", "Hmm ", "Sorry,", "Sorry ",
            ]
            for marker in cut_markers:
                idx = result.find(marker)
                if idx > 20:  # only cut if there's actual content before the marker
                    result = result[:idx].strip()
                    break
            result = result[:220].strip()
        return result
    except Exception as e:
        logger.error(f"Translation failed ({target_lang}/{kind}): {e}")
        raise


async def translate_jsonld(jsonld: Optional[Dict[str, Any]], target_lang: str) -> Optional[Dict[str, Any]]:
    """Translate JSON-LD text fields (headline, description, name, text) in place."""
    if not jsonld or not isinstance(jsonld, dict):
        return jsonld
    out = json.loads(json.dumps(jsonld))  # deep copy

    text_fields = {"headline", "description", "name", "text", "alternativeHeadline", "articleBody"}

    async def walk(node):
        if isinstance(node, dict):
            for k, v in node.items():
                if k in text_fields and isinstance(v, str) and v.strip():
                    node[k] = await translate_text(v, target_lang, preserve_html=False)
                elif isinstance(v, (dict, list)):
                    await walk(v)
        elif isinstance(node, list):
            for item in node:
                await walk(item)

    try:
        await walk(out)
    except Exception as e:
        logger.warning(f"JSON-LD translation partial failure: {e}")
    return out


async def translate_article_to_lang(article: Dict[str, Any], target_lang: str) -> Dict[str, Any]:
    """
    Translate a full article document into target_lang.
    Returns a NEW dict (does not mutate the original) ready to be inserted with upsert.
    """
    logger.info(f"Translating article '{article.get('slug')}' to {target_lang}...")

    # Translate the small text fields in parallel-safe sequence
    translated_title = await translate_text(article.get("title", ""), target_lang, kind="title")
    translated_meta = await translate_text(article.get("meta_description", ""), target_lang, kind="meta")
    translated_html = await translate_text(article.get("content_html", ""), target_lang, preserve_html=True, kind="html")
    translated_json_ld = await translate_jsonld(article.get("json_ld"), target_lang)
    translated_faq_json_ld = await translate_jsonld(article.get("faq_json_ld"), target_lang)

    translated = dict(article)
    translated["external_id"] = f"{article.get('external_id', article.get('slug'))}-{target_lang}"

    # Translate the slug into a native SEO-friendly kebab-case
    en_title_for_slug = article.get("title", "") or article.get("slug", "")
    new_slug = await translate_slug(en_title_for_slug, target_lang)
    # Safety: if slug translation failed or collided, fall back to original-{lang}
    if not new_slug or len(new_slug) < 5:
        new_slug = f"{article.get('slug', '')}-{target_lang}"
    translated["slug"] = new_slug
    translated["title"] = translated_title
    translated["meta_title"] = translated_title
    translated["meta_description"] = translated_meta
    translated["content_html"] = translated_html
    translated["json_ld"] = translated_json_ld
    translated["faq_json_ld"] = translated_faq_json_ld
    translated["language_code"] = target_lang
    translated["source_external_id"] = article.get("external_id")
    translated["source_language"] = article.get("language_code", "en")
    # Clear server-only fields so they get freshly stamped
    translated.pop("_id", None)
    translated.pop("source_ip", None)

    return translated
