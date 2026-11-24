import os
import asyncio
import logging
import resend
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

resend.api_key = os.environ.get("RESEND_API_KEY", "")
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")


def build_booking_confirmation_html(booking_data: dict) -> str:
    booking_id = booking_data.get("bookingId", "N/A")
    client_name = booking_data.get("clientName", "Client")
    pickup = booking_data.get("startAddress", "")
    dropoff = booking_data.get("endAddress", "")
    date_time = booking_data.get("startDate", "")
    price = booking_data.get("clientPrice", 0)
    car_type = booking_data.get("carType", "")
    distance = booking_data.get("distance", 0)
    duration = booking_data.get("duration", 0)

    return f"""
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background-color:#0f172a;padding:28px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">ZONT.CAB</h1>
              <p style="margin:6px 0 0;color:#94a3b8;font-size:13px;">Votre partenaire de transport premium</p>
            </td>
          </tr>

          <!-- Confirmation Badge -->
          <tr>
            <td style="padding:32px 40px 0;text-align:center;">
              <div style="display:inline-block;background-color:#ecfdf5;border:1px solid #a7f3d0;border-radius:50px;padding:8px 24px;">
                <span style="color:#059669;font-size:14px;font-weight:600;">Reservation confirmee</span>
              </div>
              <h2 style="margin:16px 0 4px;color:#0f172a;font-size:22px;font-weight:700;">Merci, {client_name} !</h2>
              <p style="margin:0;color:#64748b;font-size:14px;">Votre reservation a ete enregistree avec succes.</p>
            </td>
          </tr>

          <!-- Booking ID -->
          <tr>
            <td style="padding:24px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
                <tr>
                  <td style="padding:16px 20px;text-align:center;">
                    <p style="margin:0;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Numero de reservation</p>
                    <p style="margin:6px 0 0;color:#0f172a;font-size:28px;font-weight:800;letter-spacing:1px;">#{booking_id}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Trip Details -->
          <tr>
            <td style="padding:24px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <!-- Pickup -->
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #f1f5f9;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="32" valign="top">
                          <div style="width:24px;height:24px;background-color:#dcfce7;border-radius:50%;text-align:center;line-height:24px;font-size:12px;">A</div>
                        </td>
                        <td style="padding-left:12px;">
                          <p style="margin:0;color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Depart</p>
                          <p style="margin:2px 0 0;color:#0f172a;font-size:14px;font-weight:600;">{pickup}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Dropoff -->
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #f1f5f9;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="32" valign="top">
                          <div style="width:24px;height:24px;background-color:#fee2e2;border-radius:50%;text-align:center;line-height:24px;font-size:12px;">B</div>
                        </td>
                        <td style="padding-left:12px;">
                          <p style="margin:0;color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Arrivee</p>
                          <p style="margin:2px 0 0;color:#0f172a;font-size:14px;font-weight:600;">{dropoff}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Info Grid -->
          <tr>
            <td style="padding:20px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" style="padding:8px 8px 8px 0;">
                    <div style="background-color:#f8fafc;border-radius:8px;padding:14px 16px;">
                      <p style="margin:0;color:#94a3b8;font-size:11px;text-transform:uppercase;">Date & Heure</p>
                      <p style="margin:4px 0 0;color:#0f172a;font-size:14px;font-weight:600;">{date_time}</p>
                    </div>
                  </td>
                  <td width="50%" style="padding:8px 0 8px 8px;">
                    <div style="background-color:#f8fafc;border-radius:8px;padding:14px 16px;">
                      <p style="margin:0;color:#94a3b8;font-size:11px;text-transform:uppercase;">Vehicule</p>
                      <p style="margin:4px 0 0;color:#0f172a;font-size:14px;font-weight:600;">{car_type}</p>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td width="50%" style="padding:8px 8px 8px 0;">
                    <div style="background-color:#f8fafc;border-radius:8px;padding:14px 16px;">
                      <p style="margin:0;color:#94a3b8;font-size:11px;text-transform:uppercase;">Distance</p>
                      <p style="margin:4px 0 0;color:#0f172a;font-size:14px;font-weight:600;">{distance} km</p>
                    </div>
                  </td>
                  <td width="50%" style="padding:8px 0 8px 8px;">
                    <div style="background-color:#f8fafc;border-radius:8px;padding:14px 16px;">
                      <p style="margin:0;color:#94a3b8;font-size:11px;text-transform:uppercase;">Duree estimee</p>
                      <p style="margin:4px 0 0;color:#0f172a;font-size:14px;font-weight:600;">{duration} min</p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Price -->
          <tr>
            <td style="padding:20px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;border-radius:10px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <p style="margin:0;color:#94a3b8;font-size:13px;">Montant total</p>
                        </td>
                        <td align="right">
                          <p style="margin:0;color:#ffffff;font-size:28px;font-weight:800;">{price:.2f} EUR</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:28px 40px 32px;text-align:center;">
              <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6;">
                Un chauffeur vous sera attribue sous peu.<br>
                Vous recevrez une notification lors de la prise en charge.
              </p>
              <hr style="margin:20px 0;border:none;border-top:1px solid #e2e8f0;">
              <p style="margin:0;color:#cbd5e1;font-size:11px;">
                ZONT.CAB - Service de transport premium<br>
                Pour toute question : contact@zont.cab
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""


async def send_booking_confirmation(email: str, booking_data: dict):
    if not resend.api_key:
        logger.warning("RESEND_API_KEY not set, skipping email")
        return None

    html = build_booking_confirmation_html(booking_data)
    client_name = booking_data.get("clientName", "Client")

    params = {
        "from": SENDER_EMAIL,
        "to": [email],
        "subject": f"Confirmation de reservation #{booking_data.get('bookingId', '')} - ZONT.CAB",
        "html": html,
    }

    try:
        result = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Booking confirmation email sent to {email}: {result}")
        return result
    except Exception as e:
        logger.error(f"Failed to send booking confirmation email to {email}: {e}")
        return None


async def send_kiosk_payment_link(email: str, data: dict):
    """Email a Stripe payment link for a kiosk booking made via a reception code."""
    if not resend.api_key:
        logger.warning("RESEND_API_KEY not set, skipping kiosk payment-link email")
        return None

    ref = data.get("reference", "")
    pay_url = data.get("paymentUrl", "")
    price = data.get("price", 0)
    html = f"""
<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;background:#0b1120;color:#e5e7eb;border-radius:16px;overflow:hidden">
  <div style="background:#111827;padding:24px 28px;border-bottom:3px solid #2ecc71">
    <h1 style="margin:0;font-size:20px;color:#fff">ZONT.CAB — Votre transfert</h1>
  </div>
  <div style="padding:28px">
    <p style="font-size:15px;margin:0 0 18px">Bonjour {data.get('clientName','')},</p>
    <p style="font-size:15px;line-height:1.5;margin:0 0 22px">
      Votre réservation de transfert est prête. Cliquez ci-dessous pour régler en toute sécurité par carte.
    </p>
    <table style="width:100%;border-collapse:collapse;background:#111827;border-radius:12px;margin-bottom:24px">
      <tr><td style="padding:12px 16px;color:#9ca3af;font-size:13px">Référence</td><td style="padding:12px 16px;text-align:right;font-weight:bold;color:#fff">{ref}</td></tr>
      <tr><td style="padding:12px 16px;color:#9ca3af;font-size:13px">Départ</td><td style="padding:12px 16px;text-align:right;color:#fff">{data.get('hotelName','')}</td></tr>
      <tr><td style="padding:12px 16px;color:#9ca3af;font-size:13px">Destination</td><td style="padding:12px 16px;text-align:right;color:#fff">{data.get('destination','')}</td></tr>
      <tr><td style="padding:12px 16px;color:#9ca3af;font-size:13px">Date & heure</td><td style="padding:12px 16px;text-align:right;color:#fff">{data.get('date','')} {data.get('time','')}</td></tr>
      <tr><td style="padding:12px 16px;color:#9ca3af;font-size:13px">Véhicule</td><td style="padding:12px 16px;text-align:right;color:#fff">{data.get('vehicleType','')}</td></tr>
      <tr><td style="padding:12px 16px;color:#9ca3af;font-size:13px">Code réception</td><td style="padding:12px 16px;text-align:right;color:#fff">{data.get('receptionCode','')}</td></tr>
      <tr><td style="padding:12px 16px;color:#2ecc71;font-size:15px;font-weight:bold">Total</td><td style="padding:12px 16px;text-align:right;color:#2ecc71;font-size:22px;font-weight:bold">{price} €</td></tr>
    </table>
    <a href="{pay_url}" style="display:block;background:#2ecc71;color:#fff;text-decoration:none;text-align:center;padding:16px;border-radius:12px;font-size:17px;font-weight:bold">Payer {price} € maintenant</a>
    <p style="font-size:12px;color:#6b7280;margin:18px 0 0;text-align:center">Ce lien expire dans 30 minutes. Paiement sécurisé par Stripe.</p>
  </div>
</div>
"""
    params = {
        "from": f"ZONT.CAB <{SENDER_EMAIL}>",
        "to": [email],
        "reply_to": "zontcab@gmail.com",
        "subject": f"Payez votre transfert ZONT #{ref} — {price} €",
        "html": html,
    }
    try:
        result = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Kiosk payment-link email sent to {email} for {ref}: {result}")
        return result
    except Exception as e:
        logger.error(f"Failed to send kiosk payment-link email to {email}: {e}")
        return None
