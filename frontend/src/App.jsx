/* ============================================================================
 * @file        frontend/src/App.jsx
 * @brief       Top-level route configuration for the SPA (React Router).
 * @author      ResumeX Project
 * @copyright   © 2025 ResumeX
 * ========================================================================== */

import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './Home.jsx';
import SignupPage from './SignupPage.jsx';
import VerifyEmail from './VerifyEmail.jsx';
import LoginPage from './LoginPage.jsx';
import ForgotPasswordPage from './ForgotPasswordPage.jsx';
import ResetPasswordPage from './ResetPasswordPage.jsx';
import "./Responsive.css";
import "./App.css"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/signup" element={<SignupPage />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
