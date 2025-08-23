/* ============================================================================
 * @file        backend/utils/generateVerificationToken.js
 * @brief       Helper to generate a short-lived email verification code.
 * @author      ResumeX Project
 * @copyright   © 2025 ResumeX
 * ========================================================================== */

export const generateVerificationToken = () => Math.floor(100000 + Math.random() * 900000).toString();