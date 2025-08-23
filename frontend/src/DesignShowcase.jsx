/* ============================================================================
 * @file        frontend/src/DesignShowcase.jsx
 * @brief       Animated hero vignette with logo and orbiting cards (purely visual).
 * @author      ResumeX Project
 * @copyright   © 2025 ResumeX
 * ========================================================================== */

import React from "react";
import "./DesignShowcase.css";
import Logo from "./assets/logo.svg"; // <-- update path if needed

// Icons
import { FaRobot, FaRocket, FaChartBar, FaRegFileAlt } from "react-icons/fa";

function DesignShowcase() {
  return (
    <div className="design-showcase-wrapper">
      {/* Laser beams */}
      <svg className="laser-svg" aria-hidden="true">
        <line className="beam beam-top-left" x1="50%" y1="50%" x2="10%" y2="10%" />
        <line className="beam beam-top-right" x1="50%" y1="50%" x2="90%" y2="10%" />
        <line className="beam beam-bottom-left" x1="50%" y1="50%" x2="10%" y2="90%" />
        <line className="beam beam-bottom-right" x1="50%" y1="50%" x2="90%" y2="90%" />
      </svg>

      {/* Corner cards */}
      <div className="glass-card top-left">
        <FaRobot size={18} style={{ marginRight: 8 }} />
        <span>AI Tools</span>
      </div>

      <div className="glass-card top-right">
        <FaRocket size={18} style={{ marginRight: 8 }} />
        <span>Projects</span>
      </div>

      <div className="glass-card bottom-left">
        <FaChartBar size={18} style={{ marginRight: 8 }} />
        <span>Analytics</span>
      </div>

      <div className="glass-card bottom-right">
        <FaRegFileAlt size={18} style={{ marginRight: 8 }} />
        <span>Resume Tips</span>
      </div>

      {/* Center logo */}
      <div className="logo-center">
        <img src={Logo} alt="Center Logo" />
      </div>
    </div>
  );
}

export default DesignShowcase;
