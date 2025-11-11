import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div
      className={`page-transition-wrapper ${isAnimating ? 'page-transition-entering' : 'page-transition-entered'}`}
      key={location.pathname}
    >
      {children}
    </div>
  );
};

export default PageTransition;

