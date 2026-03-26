"""
Email Notification Service for TradeShift
Sends transactional emails for: signup, login, PIN events, trade events.
All functions are designed to be called via BackgroundTasks (non-blocking).
"""
import logging
from fastapi_mail import FastMail, MessageSchema, MessageType
from app.config import conf

logger = logging.getLogger(__name__)

# ── Brand colours (matching frontend) ──────────────────────────────────────
PRIMARY = "#2962FF"
BG_DARK = "#1E222D"
TEXT_LIGHT = "#9598A1"
# ───────────────────────────────────────────────────────────────────────────

def _html_wrapper(title: str, content: str) -> str:
    """Wrap email content in a branded HTML template."""
    return f"""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>{title}</title>
</head>
<body style="margin:0;padding:0;background:#0B0E11;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0B0E11;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:{BG_DARK};border-radius:20px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);max-width:600px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,{PRIMARY} 0%,#1565C0 100%);padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:26px;font-weight:800;letter-spacing:-0.5px;">
              Trade<span style="opacity:0.7;">Shift</span>
            </h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:13px;letter-spacing:2px;text-transform:uppercase;">{title}</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            {content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:rgba(0,0,0,0.3);padding:24px 40px;text-align:center;border-top:1px solid rgba(255,255,255,0.06);">
            <p style="margin:0;color:{TEXT_LIGHT};font-size:12px;">© 2025 TradeShift. All rights reserved.</p>
            <p style="margin:6px 0 0;color:{TEXT_LIGHT};font-size:11px;">This is an automated notification — please do not reply.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
"""

def _text(text: str, size: int = 15, color: str = "#C4C4C4") -> str:
    return f'<p style="margin:0 0 16px;color:{color};font-size:{size}px;line-height:1.6;">{text}</p>'

def _heading(text: str) -> str:
    return f'<h2 style="margin:0 0 20px;color:#fff;font-size:22px;font-weight:700;">{text}</h2>'

def _badge(text: str, color: str = PRIMARY) -> str:
    return f'<span style="background:{color};color:#fff;padding:5px 14px;border-radius:50px;font-size:12px;font-weight:700;letter-spacing:0.5px;">{text}</span>'

def _divider() -> str:
    return '<hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:24px 0;"/>'

def _info_row(label: str, value: str) -> str:
    return f"""
    <tr>
      <td style="padding:10px 0;color:{TEXT_LIGHT};font-size:13px;border-bottom:1px solid rgba(255,255,255,0.06);">{label}</td>
      <td style="padding:10px 0;color:#fff;font-size:13px;font-weight:600;text-align:right;border-bottom:1px solid rgba(255,255,255,0.06);">{value}</td>
    </tr>"""

def _info_table(rows: list[tuple[str, str]]) -> str:
    inner = "".join(_info_row(l, v) for l, v in rows)
    return f'<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">{inner}</table>'

def _cta_button(text: str, href: str = "http://localhost:5173") -> str:
    return f"""
    <div style="text-align:center;margin:28px 0 8px;">
      <a href="{href}" style="background:{PRIMARY};color:#fff;padding:14px 36px;border-radius:12px;font-size:14px;font-weight:700;text-decoration:none;display:inline-block;letter-spacing:0.3px;">{text}</a>
    </div>"""

# ── Async email sender ──────────────────────────────────────────────────────
async def _send(to_email: str, subject: str, html: str):
    try:
        message = MessageSchema(
            subject=subject,
            recipients=[to_email],
            body=html,
            subtype=MessageType.html,
        )
        fm = FastMail(conf)
        await fm.send_message(message)
        logger.info(f"✅ Email sent to {to_email}: {subject}")
    except Exception as e:
        logger.warning(f"❌ Failed to send email to {to_email}: {e}")


# ═══════════════════════════════════════════════════════════════════════════
# 1.  WELCOME EMAIL  (on signup)
# ═══════════════════════════════════════════════════════════════════════════
async def send_welcome_email(email: str, name: str):
    first = name.split()[0] if name else "Trader"
    content = f"""
    {_heading(f"Welcome aboard, {first}!")}
    {_text("Your TradeShift account has been successfully created. You are now part of an AI-powered trading simulation platform.")}
    {_divider()}
    {_text("Here's what you can do:", 13, TEXT_LIGHT)}
    <ul style="color:#C4C4C4;font-size:14px;line-height:2;padding-left:20px;margin:0 0 20px;">
      <li>[&#8226;] Simulate real-time stock trading with live market data</li>
      <li>[&#8226;] Get AI-powered market analysis and insights</li>
      <li>[&#8226;] Track your portfolio performance and trade history</li>
      <li>[&#8226;] Build your trading skills without any financial risk</li>
    </ul>
    {_cta_button("Start Trading Now")}
    """
    await _send(email, "Welcome to TradeShift — Your Account is Ready!", _html_wrapper("Welcome", content))


# ═══════════════════════════════════════════════════════════════════════════
# 2.  LOGIN ALERT  (on login)
# ═══════════════════════════════════════════════════════════════════════════
async def send_login_alert_email(email: str, name: str, login_time: str, ip_address: str = "Unknown"):
    first = name.split()[0] if name else "Trader"
    content = f"""
    {_heading("Successfully Logged In")}
    {_text(f"Hi {first}, you have successfully logged in to TradeShift.")}
    {_divider()}
    {_info_table([
        ("Website", "TradeShift"),
        ("Account", email),
        ("Login Time", login_time),
        ("IP Address", ip_address),
        ("Verified At", login_time),
    ])}
    """
    await _send(email, "New Login to Your TradeShift Account", _html_wrapper("Login Alert", content))


# ═══════════════════════════════════════════════════════════════════════════
# 3.  PIN VERIFIED  (on successful PIN check)
# ═══════════════════════════════════════════════════════════════════════════
async def send_pin_verified_email(email: str, name: str, verified_at: str):
    first = name.split()[0] if name else "Trader"
    content = f"""
    {_heading("Identity Verified")}
    {_text(f"Hi {first}, your Security PIN was successfully verified and your session is now active.")}
    {_divider()}
    {_info_table([
        ("Account", email),
        ("Verified At", verified_at),
        ("Session Status", "[ACTIVE]"),
    ])}
    {_text("If you did not just verify your PIN, please reset it immediately to protect your account.", 13, "#FF6B6B")}
    {_cta_button("Go to Dashboard")}
    """
    await _send(email, "Login Successful — TradeShift", _html_wrapper("Login Success", content))


# ═══════════════════════════════════════════════════════════════════════════
# 4.  PIN RESET  (on successful PIN reset)
# ═══════════════════════════════════════════════════════════════════════════
async def send_pin_reset_email(email: str, name: str, reset_at: str):
    first = name.split()[0] if name else "Trader"
    content = f"""
    {_heading("Security PIN Changed")}
    {_text(f"Hi {first}, your Security PIN has been successfully reset.")}
    {_divider()}
    {_info_table([
        ("Account", email),
        ("Reset At", reset_at),
        ("Status", "[SUCCESS] New PIN Active"),
    ])}
    {_text("If you did not request this change, your account may be compromised. Please contact support immediately.", 13, "#FF6B6B")}
    {_cta_button("Go to Login")}
    """
    await _send(email, "Your TradeShift Security PIN Has Been Changed", _html_wrapper("PIN Reset", content))


# ═══════════════════════════════════════════════════════════════════════════
# 5.  TRADE EXECUTED  (on buy/sell order)
# ═══════════════════════════════════════════════════════════════════════════
async def send_trade_confirmation_email(
    email: str,
    name: str,
    trade_id: int,
    symbol: str,
    direction: str,
    quantity: float,
    entry_price: float,
    order_type: str,
    executed_at: str,
    stop_loss: float | None = None,
    take_profit: float | None = None,
):
    first = name.split()[0] if name else "Trader"
    direction_color = "#26A69A" if direction.upper() == "BUY" else "#EF5350"
    direction_icon = "<span style='color:#26A69A'>&#9650;</span>" if direction.upper() == "BUY" else "<span style='color:#EF5350'>&#9660;</span>"
    rows = [
        ("Trade ID", f"#{trade_id}"),
        ("Symbol", symbol),
        ("Direction", f"{direction_icon} {direction.upper()}"),
        ("Quantity", f"{quantity} units"),
        ("Entry Price", f"₹{entry_price:,.2f}"),
        ("Order Type", order_type),
        ("Executed At", executed_at),
    ]
    if stop_loss:
        rows.append(("Stop Loss", f"₹{stop_loss:,.2f}"))
    if take_profit:
        rows.append(("Take Profit", f"₹{take_profit:,.2f}"))

    content = f"""
    {_heading(f"Trade Executed {direction_icon}")}
    <div style="text-align:center;margin-bottom:24px;">
      {_badge(f"{direction.upper()} &middot; {symbol}", direction_color)}
    </div>
    {_text(f"Hi {first}, your {direction.upper()} order for <strong style='color:#fff'>{symbol}</strong> has been executed successfully.")}
    {_divider()}
    {_info_table(rows)}
    {_text("Keep an eye on your position in the trading dashboard.", 13, TEXT_LIGHT)}
    {_cta_button("View Open Positions")}
    """
    await _send(email, f"Trade Confirmed: {direction.upper()} {symbol} — TradeShift", _html_wrapper("Trade Confirmation", content))


# ═══════════════════════════════════════════════════════════════════════════
# 6.  TRADE CLOSED  (on exit)
# ═══════════════════════════════════════════════════════════════════════════
async def send_trade_closed_email(
    email: str,
    name: str,
    trade_id: int,
    symbol: str,
    direction: str,
    quantity: float,
    entry_price: float,
    exit_price: float,
    pnl: float,
    closed_at: str,
):
    first = name.split()[0] if name else "Trader"
    pnl_color = "#26A69A" if pnl >= 0 else "#EF5350"
    pnl_icon = "<span style='color:#26A69A'>&#10003;</span>" if pnl >= 0 else "<span style='color:#EF5350'>&#10005;</span>"
    pnl_label = "Profit" if pnl >= 0 else "Loss"
    content = f"""
    {_heading(f"Position Closed &mdash; {symbol}")}
    <div style="text-align:center;margin-bottom:24px;">
      <span style="font-size:36px;font-weight:900;color:{pnl_color};">{pnl_icon} ₹{abs(pnl):,.2f}</span>
      <p style="margin:4px 0 0;color:{TEXT_LIGHT};font-size:13px;">{pnl_label}</p>
    </div>
    {_text(f"Hi {first}, your {direction.upper()} position on <strong style='color:#fff'>{symbol}</strong> has been closed.")}
    {_divider()}
    {_info_table([
        ("Trade ID", f"#{trade_id}"),
        ("Symbol", symbol),
        ("Direction", direction.upper()),
        ("Quantity", f"{quantity} units"),
        ("Entry Price", f"₹{entry_price:,.2f}"),
        ("Exit Price", f"₹{exit_price:,.2f}"),
        (pnl_label, f"₹{abs(pnl):,.2f}"),
        ("Closed At", closed_at),
    ])}
    {_cta_button("View Trade History")}
    """
    await _send(email, f"Position Closed: {symbol} — {pnl_label} ₹{abs(pnl):,.2f}", _html_wrapper("Position Closed", content))
