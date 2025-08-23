import React, { useEffect, useState } from 'react';
import './HeroText.css';

const words = [
  'career growth',
  'hiring potential',
  'interview success',
  'professional journey'
];

function HeroText() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fullText = words[currentWordIndex];
    const speed = isDeleting ? 50 : 100;

    const timeout = setTimeout(() => {
      setDisplayedText((prev) =>
        isDeleting ? fullText.substring(0, prev.length - 1) : fullText.substring(0, prev.length + 1)
      );

      if (!isDeleting && displayedText === fullText) {
        setTimeout(() => setIsDeleting(true), 1000);
      } else if (isDeleting && displayedText === '') {
        setIsDeleting(false);
        setCurrentWordIndex((prev) => (prev + 1) % words.length);
      }
    }, speed);

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, currentWordIndex]);

  return (
    <div className="hero-text-wrapper">
      <h1 className="hero-title">
        Accelerate your<br />
        <span className="type-text">{displayedText}</span>
        <span className="cursor">|</span>
      </h1>

      <p className="hero-subtitle">
        Discover tailored tools and insights to elevate your professional journey.
        Build stronger resumes, improve interview readiness, and unlock real opportunities.
      </p>

      <button className="btn" onClick={() => document.getElementById('resume-upload')?.scrollIntoView({ behavior: 'smooth' })}>Get Started</button>
    </div>
  );
}

export default HeroText;
