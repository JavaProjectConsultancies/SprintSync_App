import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { ChevronUp, ArrowUp } from 'lucide-react';

interface EnhancedScrollToTopButtonProps {
  targetId?: string; // Optional: scroll to specific element ID
  threshold?: number; // Optional: scroll threshold to show button
  className?: string; // Optional: custom styling
  showOnFormScroll?: boolean; // Whether to show on form scroll
  showOnPageScroll?: boolean; // Whether to show on page scroll
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'; // Button position
}

const EnhancedScrollToTopButton: React.FC<EnhancedScrollToTopButtonProps> = ({ 
  targetId, 
  threshold = 100, 
  className = '',
  showOnFormScroll = true,
  showOnPageScroll = false,
  position = 'bottom-right'
}) => {
  const [isVisible, setIsVisible] = useState(false);

  // Get position classes based on position prop
  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-6 left-6';
      case 'top-right':
        return 'top-6 right-6';
      case 'top-left':
        return 'top-6 left-6';
      default:
        return 'bottom-6 right-6';
    }
  };

  // Show button when user scrolls down past threshold
  const toggleVisibility = () => {
    let shouldShow = false;

    if (showOnFormScroll && targetId) {
      // Check scroll position relative to specific element
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        shouldShow = rect.top < -threshold;
      }
    }

    if (showOnPageScroll) {
      // Check window scroll position
      if (window.pageYOffset > threshold) {
        shouldShow = true;
      }
    }

    setIsVisible(shouldShow);
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
    if (showOnFormScroll || showOnPageScroll) {
      window.addEventListener('scroll', toggleVisibility);
      return () => {
        window.removeEventListener('scroll', toggleVisibility);
      };
    }
  }, [targetId, threshold, showOnFormScroll, showOnPageScroll]);

  if (!isVisible) {
    return null;
  }

  return (
    <Button
      onClick={scrollToTop}
      className={`fixed ${getPositionClasses()} z-50 h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${className}`}
      title="Scroll to top"
    >
      {targetId ? <ChevronUp className="h-5 w-5" /> : <ArrowUp className="h-5 w-5" />}
    </Button>
  );
};

export default EnhancedScrollToTopButton;
