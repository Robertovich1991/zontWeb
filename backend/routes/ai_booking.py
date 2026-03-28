"""AI-assisted booking text parser using Gemini Flash for speed."""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
import os
import json
import logging
from datetime import datetime, timedelta, timezone

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/booking", tags=["ai-booking"])


class AIParseRequest(BaseModel):
    text: str
    locale: str = "fr"
    source: str = "homepage_ai"


class AIParseData(BaseModel):
    pickup: Optional[str] = None
    dropoff: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None
    passengers: Optional[int] = None


class AIParseResponse(BaseModel):
    success: bool
    confidence: float = 0.0
    data: AIParseData = AIParseData()
    missing_fields: List[str] = []


SYSTEM_PROMPT = """You are a booking text parser for a premium airport transfer service (ZONT) operating in Europe.

Parse the user's text to extract booking details. Return ONLY valid JSON with this exact structure:
{
  "confidence": 0.0-1.0,
  "pickup": "full address or location name",
  "dropoff": "full address or location name", 
  "date": "YYYY-MM-DD",
  "time": "HH:MM",
  "passengers": number or null
}

Rules:
- TODAY is {today}
- "demain" = tomorrow, "apres-demain" = day after tomorrow
- "lundi/mardi/etc prochain" = next occurrence of that day
- Common airport codes: CDG = Aeroport Paris Charles de Gaulle, ORY = Aeroport Paris Orly, NCE = Aeroport Nice Cote d'Azur, BCN = Aeroport Barcelona El Prat, FCO = Aeroport Roma Fiumicino, BER = Berlin Brandenburg
- Arrow symbols (→, ->, vers, to, a) separate pickup from dropoff
- If time uses 12h format, convert to 24h
- If a field cannot be determined, set it to null
- confidence should reflect how certain you are about the extraction (0.0 to 1.0)
- ONLY return the JSON object, no markdown, no explanation"""


@router.post("/ai-parse", response_model=AIParseResponse)
async def ai_parse_booking(req: AIParseRequest):
    """Parse natural language booking text into structured fields using LLM."""
    if not req.text or len(req.text.strip()) < 3:
        return AIParseResponse(success=False, confidence=0, missing_fields=["text too short"])

    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        logger.error("EMERGENT_LLM_KEY not configured")
        return AIParseResponse(success=False, confidence=0, missing_fields=["AI service unavailable"])

    today = datetime.now(timezone.utc).strftime("%Y-%m-%d (%A)")

    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage

        chat = LlmChat(
            api_key=api_key,
            session_id=f"booking-parse-{datetime.now().timestamp()}",
            system_message=SYSTEM_PROMPT.replace("{today}", today),
        )
        chat.with_model("gemini", "gemini-3-flash-preview")

        user_message = UserMessage(text=f"[Locale: {req.locale}] {req.text}")
        response = await chat.send_message(user_message)

        # Parse JSON from response
        text = response.strip()
        # Remove markdown code fences if present
        if text.startswith("```"):
            text = text.split("\n", 1)[-1].rsplit("```", 1)[0].strip()

        parsed = json.loads(text)

        confidence = float(parsed.get("confidence", 0))
        data = AIParseData(
            pickup=parsed.get("pickup"),
            dropoff=parsed.get("dropoff"),
            date=parsed.get("date"),
            time=parsed.get("time"),
            passengers=parsed.get("passengers"),
        )

        missing = []
        if not data.pickup:
            missing.append("pickup")
        if not data.dropoff:
            missing.append("dropoff")
        if not data.date:
            missing.append("date")
        if not data.time:
            missing.append("time")

        return AIParseResponse(
            success=confidence >= 0.5,
            confidence=confidence,
            data=data,
            missing_fields=missing,
        )

    except json.JSONDecodeError as e:
        logger.error(f"AI parse JSON error: {e}, response: {response[:200] if 'response' in dir() else 'N/A'}")
        return AIParseResponse(success=False, confidence=0, missing_fields=["AI response parse error"])
    except Exception as e:
        logger.error(f"AI parse error: {e}")
        return AIParseResponse(success=False, confidence=0, missing_fields=[str(e)[:100]])
