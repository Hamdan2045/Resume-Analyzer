/* ============================================================================
 * @file        backend/routes/auth-route.js
 * @brief       Auth routes mapping; protected /check/auth route.
 * @author      ResumeX Project
 * @copyright   © 2025 ResumeX
 * ========================================================================== */

import express from'express'
import { signup , login , logout , verifyEmail , forgotPassword, resetPassword , checkAuth } from '../controllers/auth-controller.js';
import { verifyToken } from "../middleware/verifyToken.js";
const router = express.Router(); 

router.post('/signup',signup);

router.post('/login',login)

router.post('/logout',logout)

router.post("/verify-email", verifyEmail);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", resetPassword);

router.get('/check', verifyToken, checkAuth);


export default router;