import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { ChevronUp } from 'lucide-react';

interface ScrollToTopButtonProps {
  targetId?: string; // Optional: scroll to specific element ID
  threshold?: number; // Optional: scroll threshold to show button
  className?: string; // Optional: custom styling
}

const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({ 
  targetId, 
  threshold = 100, 
  className = '' 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when user scrolls down past threshold
  const toggleVisibility = () => {
    if (targetId) {
      // If targetId is provided, check scroll position relative to that element
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        setIsVisible(rect.top < -threshold);
      }
    } else {
      // Default: check window scroll position
      if (window.pageYOffset > threshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    }
  };

  // Scroll to top function
  const scrollToTop = () => {
    if (targetId) {
      // Scroll to specific element
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    } else {
      // Default: scroll to top of page
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, [targetId, threshold]);

  if (!isVisible) {
    return null;
  }

  return (
    <Button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${className}`}
      title="Scroll to top"
    >
      <ChevronUp className="h-5 w-5" />
    </Button>
  );
};

export default ScrollToTopButton;
