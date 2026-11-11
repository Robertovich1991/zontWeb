"""Best-effort email + Telegram alerts for B2B / partnership leads (same channels as bookings).

Primary path: POST https://api.zont.cab/api/AdminNotify/partnershipLead (C# SMTP + Telegram).
Fallback: Resend + Telegram from this backend if C# is unreachable.
"""
import asyncio
import html
import logging
import os
from typing import Any

import httpx
import resend
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

CSHARP_API = os.environ.get("CSHARP_API_URL", "https://api.zont.cab").rstrip("/")

resend.api_key = os.environ.get("RESEND_API_KEY", "")
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")
ADMIN_NOTIFICATION_EMAIL = os.environ.get(
    "ADMIN_NOTIFICATION_EMAIL",
    "zontcab@gmail.com,carscomfort@gmail.com",
)
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_GROUP_CHAT_ID = os.environ.get("TELEGRAM_GROUP_CHAT_ID", "")


def _parse_recipients(raw: str) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for part in (raw or "").replace(";", ",").split(","):
        email = part.strip()
        if not email or email.lower() in seen:
            continue
        seen.add(email.lower())
        out.append(email)
    return out


def _lead_fields(lead: dict[str, Any]) -> dict[str, str]:
    return {
        "name": (lead.get("name") or "").strip() or "N/A",
        "company": (lead.get("company") or "").strip() or "N/A",
        "email": (lead.get("email") or "").strip() or "N/A",
        "phone": (lead.get("phone") or "").strip() or "N/A",
        "message": (lead.get("message") or "").strip() or "—",
        "source": (lead.get("source_page") or "").strip() or "B2B",
        "lead_id": str(lead.get("id") or ""),
    }


def build_partnership_lead_html(lead: dict[str, Any]) -> str:
    f = {k: html.escape(v) for k, v in _lead_fields(lead).items()}
    return f"""<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:24px 12px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
          <tr>
            <td style="background:#0f172a;padding:20px 24px;">
              <p style="margin:0;color:#94a3b8;font-size:12px;letter-spacing:1px;text-transform:uppercase;">ZONT.CAB</p>
              <h1 style="margin:6px 0 0;color:#ffffff;font-size:20px;">New partnership request</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:24px;">
              <p style="margin:0 0 16px;color:#64748b;font-size:14px;">Source: <strong style="color:#0f172a;">{f["source"]}</strong></p>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#94a3b8;font-size:12px;width:120px;">Name</td><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#0f172a;font-size:14px;font-weight:600;">{f["name"]}</td></tr>
                <tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#94a3b8;font-size:12px;">Company</td><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#0f172a;font-size:14px;font-weight:600;">{f["company"]}</td></tr>
                <tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#94a3b8;font-size:12px;">Email</td><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#0f172a;font-size:14px;"><a href="mailto:{f["email"]}" style="color:#2563eb;text-decoration:none;">{f["email"]}</a></td></tr>
                <tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#94a3b8;font-size:12px;">Phone</td><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#0f172a;font-size:14px;">{f["phone"]}</td></tr>
                <tr><td style="padding:10px 0;color:#94a3b8;font-size:12px;vertical-align:top;">Message</td><td style="padding:10px 0;color:#0f172a;font-size:14px;white-space:pre-wrap;">{f["message"]}</td></tr>
              </table>
              <p style="margin:20px 0 0;color:#cbd5e1;font-size:11px;">Lead id: {f["lead_id"]}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


def build_partnership_lead_telegram(lead: dict[str, Any]) -> str:
    f = {k: html.escape(v) for k, v in _lead_fields(lead).items()}
    return (
        "🤝 <b>New partnership request</b>\n\n"
        f"<b>Name:</b> {f['name']}\n"
        f"<b>Company:</b> {f['company']}\n"
        f"<b>Email:</b> {f['email']}\n"
        f"<b>Phone:</b> {f['phone']}\n"
        f"<b>Source:</b> {f['source']}\n"
        f"<b>Message:</b>\n{f['message']}"
    )


async def notify_via_csharp(lead: dict[str, Any]) -> bool:
    fields = _lead_fields(lead)
    payload = {
        "name": fields["name"],
        "company": fields["company"],
        "email": fields["email"],
        "phone": fields["phone"],
        "message": fields["message"],
        "sourcePage": fields["source"],
        "leadId": fields["lead_id"],
    }
    url = f"{CSHARP_API}/api/AdminNotify/partnershipLead"
    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.post(url, json=payload)
        if resp.status_code >= 400:
            logger.warning(
                "C# partnership notify failed status=%s body=%s",
                resp.status_code,
                (resp.text or "")[:300],
            )
            return False
        logger.info("Partnership lead notified via C# API")
        return True
    except Exception as e:
        logger.warning("C# partnership notify error: %s", e)
        return False


async def send_partnership_lead_email(lead: dict[str, Any]) -> None:
    if not resend.api_key:
        logger.warning("RESEND_API_KEY not set, skipping partnership lead email fallback")
        return

    recipients = _parse_recipients(ADMIN_NOTIFICATION_EMAIL)
    if not recipients:
        logger.warning("ADMIN_NOTIFICATION_EMAIL empty, skipping partnership lead email fallback")
        return

    fields = _lead_fields(lead)
    params = {
        "from": SENDER_EMAIL,
        "to": recipients,
        "subject": f"Partnership request — {fields['company']} ({fields['name']})",
        "html": build_partnership_lead_html(lead),
    }
    if fields["email"] != "N/A":
        params["reply_to"] = fields["email"]

    try:
        result = await asyncio.to_thread(resend.Emails.send, params)
        logger.info("Partnership lead email fallback sent to %s: %s", recipients, result)
    except Exception as e:
        logger.error("Failed to send partnership lead email fallback: %s", e)


async def send_partnership_lead_telegram(lead: dict[str, Any]) -> None:
    bot_token = (TELEGRAM_BOT_TOKEN or "").strip()
    chat_id = (TELEGRAM_GROUP_CHAT_ID or "").strip()
    if not bot_token or not chat_id:
        logger.warning("Telegram bot/chat not configured, skipping partnership lead Telegram fallback")
        return

    text = build_partnership_lead_telegram(lead)
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML",
        "disable_web_page_preview": True,
    }
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, json=payload)
        if resp.status_code >= 400:
            logger.warning(
                "Telegram partnership lead fallback failed status=%s body=%s",
                resp.status_code,
                (resp.text or "")[:300],
            )
        else:
            logger.info("Partnership lead Telegram fallback sent OK")
    except Exception as e:
        logger.error("Telegram partnership lead fallback failed: %s", e)


async def notify_partnership_lead(lead: dict[str, Any]) -> None:
    if await notify_via_csharp(lead):
        return
    await asyncio.gather(
        send_partnership_lead_email(lead),
        send_partnership_lead_telegram(lead),
        return_exceptions=True,
    )


def fire_and_forget_partnership_lead(lead: dict[str, Any]) -> None:
    try:
        loop = asyncio.get_running_loop()
        loop.create_task(notify_partnership_lead(lead))
    except RuntimeError:
        logger.warning("No running loop, skipping partnership lead notifications")
