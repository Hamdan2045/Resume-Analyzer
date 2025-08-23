import React from "react";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">

        {/* LEFT: Branding */}
        <div className="footer-branding">
          <h2 className="d-title">ResumeX</h2>
          <p className="footer-tagline">Revolutionizing career building with AI</p>
        </div>

        {/* CENTER: Features */}
        <div className="footer-center">
          <h4 className="footer-heading">Why ResumeX?</h4>
          <ul className="footer-list">
            <li>⚡ Lightning-fast resume analysis</li>
            <li>🎯 AI-powered job matching</li>
            <li>🧠 Smart keyword suggestions</li>
            <li>📊 Dynamic match scoring</li>
          </ul>
        </div>

        {/* RIGHT: Stats or Impact */}
        <div className="footer-right">
          <h4 className="footer-heading">Our Impact</h4>
          <ul className="footer-list">
            <li>📄 12,000+ Resumes Enhanced</li>
            <li>🌍 Used by 25+ Countries</li>
            <li>💼 8,000+ Jobs Landed</li>
            <li>💡 95% User Satisfaction</li>
          </ul>
        </div>

      </div>

      {/* Bottom copyright strip */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} ResumeX. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
