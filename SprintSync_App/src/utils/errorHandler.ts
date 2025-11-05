/**
 * Global error handler to suppress Chrome extension errors
 * and handle other unhandled errors gracefully
 */

// Helper function to check if an error is a Chrome extension error
const isChromeExtensionError = (error: any): boolean => {
  if (!error) return false;
  
  const errorMessage = error?.message || error?.toString() || '';
  const errorString = String(error || '');
  const errorText = typeof error === 'string' ? error : JSON.stringify(error);
  
  const chromeErrorPatterns = [
    'runtime.lastError',
    'Could not establish connection',
    'Receiving end does not exist',
    'Extension context invalidated',
    'message port closed',
    'The message port closed',
    'Extension context invalidated',
    'chrome-extension://',
    'moz-extension://',
    'safari-extension://',
    'Unchecked runtime.lastError'
  ];
  
  const allErrorTexts = [errorMessage, errorString, errorText].join(' ').toLowerCase();
  
  return chromeErrorPatterns.some(pattern => 
    allErrorTexts.includes(pattern.toLowerCase())
  );
};

// Suppress Chrome extension errors in console.error
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  // Check if any argument contains Chrome extension errors
  const errorText = args.map(arg => {
    if (typeof arg === 'string') return arg;
    if (arg?.message) return arg.message;
    if (arg?.toString) return arg.toString();
    return String(arg);
  }).join(' ');
  
  // Filter out Chrome extension errors
  if (isChromeExtensionError(errorText)) {
    // Silently ignore these Chrome extension errors
    return;
  }
  
  // Check all arguments individually for Chrome extension errors
  const hasChromeError = args.some(arg => isChromeExtensionError(arg));
  if (hasChromeError) {
    return;
  }
  
  // Call original console.error for other errors
  originalConsoleError.apply(console, args);
};

// Suppress Chrome extension errors in console.warn
const originalConsoleWarn = console.warn;
console.warn = (...args: any[]) => {
  // Check if any argument contains Chrome extension errors
  const errorText = args.map(arg => {
    if (typeof arg === 'string') return arg;
    if (arg?.message) return arg.message;
    if (arg?.toString) return arg.toString();
    return String(arg);
  }).join(' ');
  
  // Filter out Chrome extension errors
  if (isChromeExtensionError(errorText)) {
    return;
  }
  
  const hasChromeError = args.some(arg => isChromeExtensionError(arg));
  if (hasChromeError) {
    return;
  }
  
  originalConsoleWarn.apply(console, args);
};

// Suppress Chrome extension errors in console.log as well
const originalConsoleLog = console.log;
console.log = (...args: any[]) => {
  // Check if any argument contains Chrome extension errors
  const errorText = args.map(arg => {
    if (typeof arg === 'string') return arg;
    if (arg?.message) return arg.message;
    if (arg?.toString) return arg.toString();
    return String(arg);
  }).join(' ');
  
  // Filter out Chrome extension errors
  if (isChromeExtensionError(errorText)) {
    return;
  }
  
  const hasChromeError = args.some(arg => isChromeExtensionError(arg));
  if (hasChromeError) {
    return;
  }
  
  originalConsoleLog.apply(console, args);
};

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  const error = event.reason;
  
  // Suppress Chrome extension related errors
  if (isChromeExtensionError(error)) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
  
  // Log other unhandled rejections normally
  console.error('Unhandled promise rejection:', error);
});

// Handle general errors
window.addEventListener('error', (event) => {
  // Suppress Chrome extension related errors
  if (isChromeExtensionError(event.error || event.message)) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
});

// Wrap chrome.runtime APIs to suppress errors
if (typeof window !== 'undefined') {
  const checkAndSetupChromeRuntime = () => {
    const chrome = (window as any).chrome;
    if (!chrome?.runtime) {
      // Chrome runtime not available yet, retry after a short delay
      setTimeout(checkAndSetupChromeRuntime, 100);
      return;
    }
    
    // Wrap sendMessage
    if (chrome.runtime.sendMessage && typeof chrome.runtime.sendMessage === 'function') {
      const originalSendMessage = chrome.runtime.sendMessage;
      chrome.runtime.sendMessage = function(...args: any[]) {
        try {
          const result = originalSendMessage.apply(chrome.runtime, args);
          
          // Handle promise-based sendMessage
          if (result && typeof result.catch === 'function') {
            return result.catch((error: any) => {
              if (isChromeExtensionError(error) || chrome.runtime.lastError) {
                // Return a resolved promise to prevent rejection
                return Promise.resolve();
              }
              throw error;
            });
          }
          
          return result;
        } catch (error: any) {
          // Suppress connection errors
          if (isChromeExtensionError(error) || chrome.runtime.lastError) {
            return Promise.resolve();
          }
          throw error;
        }
      };
    }
    
    // Wrap connect
    if (chrome.runtime.connect && typeof chrome.runtime.connect === 'function') {
      const originalConnect = chrome.runtime.connect;
      chrome.runtime.connect = function(...args: any[]) {
        try {
          const result = originalConnect.apply(chrome.runtime, args);
          
          // Wrap the returned port's postMessage to handle errors
          if (result && typeof result.postMessage === 'function') {
            const originalPostMessage = result.postMessage;
            result.postMessage = function(...postArgs: any[]) {
              try {
                return originalPostMessage.apply(result, postArgs);
              } catch (error: any) {
                if (isChromeExtensionError(error) || chrome.runtime.lastError) {
                  // Silently ignore
                  return;
                }
                throw error;
              }
            };
          }
          
          return result;
        } catch (error: any) {
          if (isChromeExtensionError(error) || chrome.runtime.lastError) {
            // Return a mock port object to prevent errors
            return {
              postMessage: () => {},
              disconnect: () => {},
              onMessage: { addListener: () => {}, removeListener: () => {} },
              onDisconnect: { addListener: () => {}, removeListener: () => {} },
            };
          }
          throw error;
        }
      };
    }
    
    // Periodically check and suppress lastError
    setInterval(() => {
      try {
        if (chrome.runtime.lastError) {
          // Access lastError to clear it (this is required by Chrome)
          const error = chrome.runtime.lastError;
          // Suppress it silently
        }
      } catch (e) {
        // Ignore errors while checking lastError
      }
    }, 1000);
  };
  
  // Start checking for chrome.runtime
  checkAndSetupChromeRuntime();
}

export {};

