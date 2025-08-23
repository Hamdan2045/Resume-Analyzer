import React from 'react';
import './CompanyLogos.css';

function CompanyLogos() {
  return (
    <div className="logo-section">
      <p className="logo-section-title d-title">Trusted by top companies</p>

      <div className="logo-carousel-wrapper">
        <div className="logo-carousel">
          {/* Working Logos */}
          <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" alt="Google" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" alt="Amazon" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" alt="Microsoft" />
          
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/59/SAP_2011_logo.svg" alt="SAP" />
          <img src="https://1000logos.net/wp-content/uploads/2017/05/Netflix-Logo-768x432.png" alt="Netflix" />
          <img src="https://1000logos.net/wp-content/uploads/2017/03/Linkedin-Logo-500x281.png" alt="LinkedIn" />
          
          <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg" alt="Spotify" />

          {/* Duplicates for infinite scroll */}
          <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" alt="Google" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" alt="Amazon" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" alt="Microsoft" />
          
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/59/SAP_2011_logo.svg" alt="SAP" />
          <img src="https://1000logos.net/wp-content/uploads/2017/05/Netflix-Logo-768x432.png" alt="Netflix" />
          <img src="https://1000logos.net/wp-content/uploads/2017/03/Linkedin-Logo-500x281.png" alt="LinkedIn" />
          
          <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg" alt="Spotify" />
        </div>

       
      </div>
    </div>
  );
}

export default CompanyLogos;
