import React, { useEffect, useRef } from 'react';

const Starfield: React.FC = () => {
  const starfieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const starfield = starfieldRef.current;
    if (!starfield) return;

    // Create stars
    const numStars = 100;
    for (let i = 0; i < numStars; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.left = Math.random() * 100 + '%';
      star.style.top = Math.random() * 100 + '%';
      star.style.animationDelay = Math.random() * 4 + 's';
      starfield.appendChild(star);
    }

    return () => {
      starfield.innerHTML = '';
    };
  }, []);

  return <div ref={starfieldRef} className="starfield" />;
};

export default Starfield;