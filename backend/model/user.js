/* ============================================================================
 * @file        backend/model/user.js
 * @brief       User schema & model (Mongoose).
 * @author      ResumeX Project
 * @copyright   © 2025 ResumeX
 * ========================================================================== */

import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  name:{
      type: String,
      required: true
  },
   email:{
      type: String,
      required: true,
      unique: true
  },
   password:{
      type: String,
      required: true
  },
   isVerified:{
      type: Boolean,
      default: false
  },
  resetPasswordToken: String,
  resetPasswordExpiresAt: Date,
  verificationToken: String,
  verificationTokenExpiresAt: Date
})
export const User = mongoose.model("User",userSchema);