/* ============================================================================
 * @file        backend/sendgrid/email.js
 * @brief       SendGrid email helpers for verification/reset/welcome.
 * @author      ResumeX Project
 * @copyright   © 2025 ResumeX
 * ========================================================================== */

// services/email.js
import "dotenv/config";                // <— ensures env is loaded even if imported early
import sgMail from "@sendgrid/mail";

const rawKey = process.env.SENDGRID_API_KEY ?? "";
// strip accidental quotes/whitespace
const SENDGRID_KEY = rawKey.trim().replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");

// quick sanity logs (keep temporarily)
console.log("[sendgrid/email.js] prefix:", SENDGRID_KEY.slice(0, 3), "len:", SENDGRID_KEY.length);
// should print: prefix: SG.  len: ~69

// if key is wrong, fail fast with a helpful message
if (!SENDGRID_KEY.startsWith("SG.")) {
  throw new Error("SendGrid: API key not loaded or malformed (does not start with 'SG.').");
}

sgMail.setApiKey(SENDGRID_KEY);

const FROM = (process.env.EMAIL_FROM || "").trim().replace(/^"(.*)"$/, "$1");

async function sendWithTemplate({ to, templateId, dynamicTemplateData }) {
  try {
    await sgMail.send({
      to,
      from: FROM,
      templateId,
      dynamic_template_data: dynamicTemplateData,
    });
  } catch (err) {
    console.error("SendGrid error:", err?.response?.body || err);
    throw new Error("Email sending failed");
  }
}

export async function sendVerificationEmail(email, code, name = "there") {
  return sendWithTemplate({
    to: email,
    templateId: process.env.SENDGRID_TPL_VERIFY,
    dynamicTemplateData: { name, code, dashboard_url: process.env.CLIENT_URL || "http://localhost:5173",year: new Date().getFullYear() },
  });
}

export async function sendWelcomeEmail(email, name = "there") {
  return sendWithTemplate({
    to: email,
    templateId: process.env.SENDGRID_TPL_WELCOME,
    dynamicTemplateData: { name, year: new Date().getFullYear() },
  });
}

export async function sendPasswordResetEmail(email, resetURL, name = "there") {
  return sendWithTemplate({
    to: email,
    templateId: process.env.SENDGRID_TPL_RESET,
    dynamicTemplateData: { name, reset_url: resetURL, cta_text: "Reset Password", year: new Date().getFullYear() },
  });
}

export async function sendResetSuccessEmail(email, name = "there") {
  return sendWithTemplate({
    to: email,
    templateId: process.env.SENDGRID_TPL_RESET_OK,
    dynamicTemplateData: { name, year: new Date().getFullYear() },
  });
}
