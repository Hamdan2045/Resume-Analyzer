import './Description.css';
import { useEffect, useRef, useState } from 'react';

function Description() {
  const titleRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.5 }
    );

    if (titleRef.current) observer.observe(titleRef.current);

    return () => {
      if (titleRef.current) observer.unobserve(titleRef.current);
    };
  }, []);

  return (
    <div className="description-section">
      <h2 ref={titleRef} className={`h2-title ${visible ? 'animate-up' : ''}`}>
        A Smarter Way to Land Your Dream Job
      </h2>

      <p className="description-subtitle">
        The intelligence of AI-crafted resumes, paired with powerful design and real-time guidance.
      </p>

      <p className="description-support">
        Trusted by professionals, students, and freelancers worldwide — ResumeX is changing how careers are built.
      </p>

      <p className="description-upload-call">
        Upload your resume below and let AI do the rest.
      </p>
    </div>
  );
}

export default Description;
