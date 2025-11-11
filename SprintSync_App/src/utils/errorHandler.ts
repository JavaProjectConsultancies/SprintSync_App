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
  
  // Filter out Chrome extension errors (including specific patterns)
  if (isChromeExtensionError(errorText) ||
      errorText.toLowerCase().includes('unchecked runtime.lasterror') ||
      errorText.toLowerCase().includes('could not establish connection') ||
      errorText.toLowerCase().includes('receiving end does not exist')) {
    // Silently ignore these Chrome extension errors
    return;
  }
  
  // Check all arguments individually for Chrome extension errors
  const hasChromeError = args.some(arg => {
    const argText = typeof arg === 'string' ? arg : (arg?.message || arg?.toString?.() || String(arg || ''));
    return isChromeExtensionError(argText) ||
           argText.toLowerCase().includes('unchecked runtime.lasterror') ||
           argText.toLowerCase().includes('could not establish connection') ||
           argText.toLowerCase().includes('receiving end does not exist');
  });
  
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
  const errorMessage = error?.message || error?.toString() || String(error || '');
  
  // Suppress Chrome extension related errors
  if (isChromeExtensionError(error) || 
      isChromeExtensionError(errorMessage) ||
      errorMessage.includes('runtime.lastError') ||
      errorMessage.includes('Could not establish connection') ||
      errorMessage.includes('Receiving end does not exist') ||
      errorMessage.includes('Unchecked runtime.lastError')) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
  
  // Log other unhandled rejections normally (but also check for extension errors)
  const hasExtensionError = errorMessage.toLowerCase().includes('runtime.lasterror') ||
                          errorMessage.toLowerCase().includes('could not establish connection') ||
                          errorMessage.toLowerCase().includes('receiving end does not exist');
  if (!hasExtensionError) {
    console.error('Unhandled promise rejection:', error);
  }
}, true); // Use capture phase

// Handle general errors
window.addEventListener('error', (event) => {
  // Suppress Chrome extension related errors
  const errorMessage = event.error?.message || event.message || '';
  const errorString = event.error?.toString() || '';
  
  if (isChromeExtensionError(errorMessage) || 
      isChromeExtensionError(errorString) ||
      errorMessage.includes('runtime.lastError') ||
      errorMessage.includes('Could not establish connection') ||
      errorMessage.includes('Receiving end does not exist')) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
}, true); // Use capture phase to catch errors early

// Wrap chrome.runtime APIs to suppress errors
if (typeof window !== 'undefined') {
  // Early error suppression - catch errors before React loads
  const suppressChromeExtensionErrors = () => {
    try {
      const chrome = (window as any).chrome;
      if (chrome?.runtime) {
        // Override lastError getter to prevent errors
        try {
          const runtime = chrome.runtime;
          if (runtime && typeof runtime === 'object') {
            // Create a safe wrapper for lastError
            const originalLastError = Object.getOwnPropertyDescriptor(runtime, 'lastError');
            if (!originalLastError || originalLastError.get) {
              Object.defineProperty(runtime, 'lastError', {
                get: function() {
                  try {
                    if (originalLastError?.get) {
                      const error = originalLastError.get.call(this);
                      // Return null instead of throwing
                      return error;
                    }
                  } catch (e) {
                    // Suppress error
                  }
                  return null;
                },
                configurable: true,
                enumerable: false
              });
            }
          }
        } catch (e) {
          // Ignore errors during setup
        }
      }
    } catch (e) {
      // Ignore setup errors
    }
  };
  
  // Run immediately
  suppressChromeExtensionErrors();
  
  const checkAndSetupChromeRuntime = () => {
    const chrome = (window as any).chrome;
    if (!chrome?.runtime) {
      // Chrome runtime not available yet, retry after a short delay
      setTimeout(checkAndSetupChromeRuntime, 100);
      return;
    }
    
    // Run suppression again after runtime is available
    suppressChromeExtensionErrors();
    
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
    
    // Suppress lastError property access
    const originalLastError = Object.getOwnPropertyDescriptor(chrome.runtime, 'lastError');
    if (originalLastError) {
      Object.defineProperty(chrome.runtime, 'lastError', {
        get: function() {
          try {
            return originalLastError.get?.call(this);
          } catch (e) {
            return null;
          }
        },
        configurable: true
      });
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
    
    // Override onMessage to suppress errors
    if (chrome.runtime.onMessage) {
      const originalAddListener = chrome.runtime.onMessage.addListener;
      chrome.runtime.onMessage.addListener = function(...args: any[]) {
        try {
          return originalAddListener.apply(chrome.runtime.onMessage, args);
        } catch (error: any) {
          if (isChromeExtensionError(error) || chrome.runtime.lastError) {
            return;
          }
          throw error;
        }
      };
    }
  };
  
  // Start checking for chrome.runtime
  checkAndSetupChromeRuntime();
}

export {};

