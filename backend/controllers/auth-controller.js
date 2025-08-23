/* ============================================================================
 * @file        backend/controllers/auth-controller.js
 * @brief       Auth controller: signup/login/logout/verify/reset + helpers.
 * @author      ResumeX Project
 * @copyright   © 2025 ResumeX
 * ========================================================================== */

import { User } from "../model/user.js";
import bcrypt from "bcryptjs";
import { generateVerificationToken } from "../utils/generateVerificationToken.js";
import { generateJWTToken } from "../utils/generateJWTToken.js";
import {
  sendPasswordResetEmail,
  sendResetSuccessEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../sendgrid/email.js";
import crypto from "crypto";

// helper at top (below imports)
const normalizeEmail = (e = "") => String(e).trim().toLowerCase();


// SIGNUP (normalize email)
/**
 * Create a new user, send verification email, set httpOnly JWT cookie.
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @returns {Promise<void>}
 */
export const signup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const emailNorm = normalizeEmail(email);

    const userAlreadyExists = await User.findOne({ email: emailNorm });
    if (userAlreadyExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = generateVerificationToken();
    const user = new User({
      name,
      email: emailNorm,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    await user.save();

    generateJWTToken(res, user._id);
    await sendVerificationEmail(user.email, verificationToken);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: { ...user._doc, password: undefined },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


// LOGIN (normalize email)
/**
 * Authenticate user credentials; requires a verified email; sets JWT cookie.
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @returns {Promise<void>}
 */
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const emailNorm = normalizeEmail(email);

    const user = await User.findOne({ email: emailNorm });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(400).json({ success: false, message: "Email not verified" });
    }

    generateJWTToken(res, user._id);
    res.status(200).json({ success: true, message: "Login successful" });
  } catch (error) {
    console.log("error logging in", error);
    res.status(400).json({ success: false, message: error.message });
  }
};


// LOGOUT (clear cookie with matching flags so it actually clears)
/**
 * Clear the auth cookie on the client.
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @returns {Promise<void>}
 */
export const logout = async (req, res) => {
  const isProd = process.env.NODE_ENV === "production";
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/", 
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
};


/**
 * Verify a one-time email code and mark the account as verified.
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @returns {Promise<void>}
 */
export const verifyEmail = async (req, res) => {
  const { code } = req.body;
  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    await sendWelcomeEmail(user.email, user.name);

    res
      .status(200)
      .json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    console.log("error verifying email", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// FORGOT PASSWORD (normalize email)
/**
 * Issue a password reset token and email a time-limited link.
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @returns {Promise<void>}
 */
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const emailNorm = normalizeEmail(email);

    const user = await User.findOne({ email: emailNorm });
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    const resetPasswordToken = crypto.randomBytes(32).toString("hex");
    const resetPasswordExpiresAt = Date.now() + 1 * 60 * 60 * 1000;

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpiresAt = resetPasswordExpiresAt;

    await user.save();
    await sendPasswordResetEmail(
      user.email,
      `${process.env.CLIENT_URL}/reset-password/${resetPasswordToken}`
    );

    res.status(200).json({
      success: true,
      message: "Password reset email sent successfully!",
    });
  } catch (error) {
    console.log("error sending password reset email", error);
    res.status(400).json({ success: false, message: error.message });
  }
};


/**
 * Validate a reset token and update the user's password.
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @returns {Promise<void>}
 */
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired reset token" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    await sendResetSuccessEmail(user.email);

    res
      .status(200)
      .json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.log("error resetting password", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Return the authenticated user's profile (minus password).
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @returns {Promise<void>}
 */
export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    res
      .status(200)
      .json({ success: true, user: { ...user._doc, password: undefined } });
  } catch (error) {
    console.log("error checking auth", error);
    res.status(400).json({ success: false, message: error.message });
  }
};