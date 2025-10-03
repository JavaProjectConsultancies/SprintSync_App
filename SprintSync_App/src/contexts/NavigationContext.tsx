import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface NavigationState {
  currentSection: string;
  currentPage?: string;
}

interface NavigationContextType {
  navigationState: NavigationState;
  navigateTo: (section: string, page?: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
  children: ReactNode;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Initialize state based on current URL
  const getCurrentSectionFromPath = (path: string) => {
    const segments = path.split('/').filter(Boolean);
    return segments[0] || 'dashboard';
  };

  const [navigationState, setNavigationState] = useState<NavigationState>(() => ({
    currentSection: getCurrentSectionFromPath(location.pathname),
  }));

  // Update navigation state when URL changes
  useEffect(() => {
    const currentSection = getCurrentSectionFromPath(location.pathname);
    setNavigationState(prev => ({
      ...prev,
      currentSection
    }));
  }, [location.pathname]);

  const navigateTo = (section: string, page?: string) => {
    setNavigationState({
      currentSection: section,
      currentPage: page,
    });
    
    // Navigate to the route
    const path = section === 'dashboard' ? '/' : `/${section}`;
    navigate(path);
  };

  return (
    <NavigationContext.Provider value={{ navigationState, navigateTo }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};