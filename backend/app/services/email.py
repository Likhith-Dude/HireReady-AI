"""SendGrid email service with HTML templates. Logs to console if key not set."""
import logging
from app.config import settings

logger = logging.getLogger(__name__)


def _send(to: str, subject: str, html: str) -> bool:
    if not settings.sendgrid_api_key:
        logger.info(f"[Email] (no SendGrid key) To: {to} | Subject: {subject}")
        return True
    try:
        from sendgrid import SendGridAPIClient
        from sendgrid.helpers.mail import Mail
        msg = Mail(
            from_email=(settings.email_from, settings.email_from_name),
            to_emails=to,
            subject=subject,
            html_content=html,
        )
        sg = SendGridAPIClient(settings.sendgrid_api_key)
        resp = sg.send(msg)
        logger.info(f"[Email] Sent to {to} — status {resp.status_code}")
        return resp.status_code in (200, 202)
    except Exception as e:
        logger.error(f"[Email] Failed to send to {to}: {e}")
        return False


def _base_template(title: str, body: str) -> str:
    return f"""
<!DOCTYPE html><html><body style="font-family:Inter,sans-serif;background:#f8fafc;padding:40px 0;margin:0">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">
  <div style="background:#4f46e5;padding:28px 32px">
    <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700">🎯 HireReady AI</h1>
  </div>
  <div style="padding:32px">
    <h2 style="color:#111;font-size:18px;margin-top:0">{title}</h2>
    {body}
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:28px 0">
    <p style="color:#94a3b8;font-size:12px;margin:0">HireReady AI — Your Job Hunting Co-Pilot</p>
  </div>
</div></body></html>"""


def send_welcome(to: str, name: str) -> bool:
    body = f"""
<p style="color:#374151">Hi <strong>{name}</strong>, welcome to HireReady AI! 🎉</p>
<p style="color:#374151">You're all set to start your job hunt. Here's what you can do:</p>
<ul style="color:#374151;line-height:1.8">
  <li>🔍 <strong>Search jobs</strong> from 7+ sources</li>
  <li>⚡ <strong>One Click Apply</strong> — AI tailors your resume instantly</li>
  <li>📊 <strong>ATS Checker</strong> — score your resume before applying</li>
  <li>💬 <strong>Interview Prep</strong> — practice with AI-generated Q&A</li>
  <li>💰 <strong>Salary Insights</strong> — know your worth</li>
</ul>
<a href="http://localhost:3000" style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px">Open HireReady AI →</a>"""
    return _send(to, "Welcome to HireReady AI! 🎯", _base_template("Welcome aboard!", body))


def send_verification(to: str, name: str, token: str) -> bool:
    verify_url = f"{settings.oauth_redirect_base}/verify?token={token}"
    body = f"""
<p style="color:#374151">Hi <strong>{name}</strong>, please verify your email address.</p>
<a href="{verify_url}" style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Verify Email →</a>
<p style="color:#94a3b8;font-size:13px;margin-top:16px">This link expires in 24 hours.</p>"""
    return _send(to, "Verify your HireReady AI email", _base_template("Confirm your email", body))


def send_password_reset(to: str, name: str, token: str) -> bool:
    reset_url = f"{settings.oauth_redirect_base}/reset-password?token={token}"
    body = f"""
<p style="color:#374151">Hi <strong>{name}</strong>, you requested a password reset.</p>
<a href="{reset_url}" style="display:inline-block;background:#ef4444;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Reset Password →</a>
<p style="color:#94a3b8;font-size:13px;margin-top:16px">This link expires in 1 hour. If you didn't request this, ignore this email.</p>"""
    return _send(to, "Reset your HireReady AI password", _base_template("Password Reset", body))


def send_daily_digest(to: str, name: str, jobs: list) -> bool:
    job_items = "".join([
        f'<li style="margin-bottom:8px"><strong>{j.get("title")}</strong> at {j.get("company")} — {j.get("location")}</li>'
        for j in jobs[:10]
    ])
    body = f"""
<p style="color:#374151">Hi <strong>{name}</strong>, here are today's top job matches:</p>
<ul style="color:#374151;line-height:1.8">{job_items}</ul>
<a href="http://localhost:3000" style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px">View All Jobs →</a>"""
    return _send(to, f"🎯 {len(jobs)} new job matches for you", _base_template("Your Daily Job Digest", body))


def send_follow_up_reminder(to: str, name: str, company: str, job_title: str) -> bool:
    body = f"""
<p style="color:#374151">Hi <strong>{name}</strong>, it's been a week since you applied to <strong>{job_title}</strong> at <strong>{company}</strong>.</p>
<p style="color:#374151">Consider sending a follow-up email to check on your application status!</p>
<a href="http://localhost:3000/tracker" style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Open Tracker →</a>"""
    return _send(to, f"⏰ Follow up on your {company} application", _base_template("Time to Follow Up!", body))
