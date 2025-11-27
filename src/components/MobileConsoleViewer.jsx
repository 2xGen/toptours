"use client";
import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';

// Safe stringify function that handles circular references and non-serializable values
function safeStringify(value, visited = new WeakSet()) {
  // Handle primitives
  if (value === null || value === undefined) {
    return String(value);
  }
  
  if (typeof value === 'string') {
    return value;
  }
  
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  
  // Handle functions
  if (typeof value === 'function') {
    return `[Function: ${value.name || 'anonymous'}]`;
  }
  
  // Handle DOM elements
  if (value instanceof HTMLElement) {
    return `[HTMLElement: ${value.tagName}${value.id ? `#${value.id}` : ''}${value.className ? `.${value.className.split(' ').join('.')}` : ''}]`;
  }
  
  // Handle Error objects
  if (value instanceof Error) {
    return `${value.name}: ${value.message}${value.stack ? '\n' + value.stack : ''}`;
  }
  
  // Handle arrays
  if (Array.isArray(value)) {
    if (visited.has(value)) {
      return '[Circular Array]';
    }
    visited.add(value);
    try {
      return '[' + value.map(item => safeStringify(item, visited)).join(', ') + ']';
    } catch (e) {
      return '[Array]';
    } finally {
      visited.delete(value);
    }
  }
  
  // Handle objects
  if (typeof value === 'object') {
    if (visited.has(value)) {
      return '[Circular Object]';
    }
    visited.add(value);
    
    try {
      // Manually stringify with circular reference handling
      const keys = Object.keys(value);
      const pairs = keys.slice(0, 10).map(key => {
        try {
          return `${key}: ${safeStringify(value[key], visited)}`;
        } catch (e) {
          return `${key}: [Unable to stringify]`;
        }
      });
      if (keys.length > 10) {
        pairs.push(`... and ${keys.length - 10} more`);
      }
      return `{${pairs.join(', ')}}`;
    } catch (e2) {
      return `[Object: ${value.constructor?.name || 'Object'}]`;
    } finally {
      visited.delete(value);
    }
  }
  
  // Fallback for anything else
  try {
    return String(value);
  } catch (e) {
    return '[Unable to stringify]';
  }
}

export default function MobileConsoleViewer() {
  const [errors, setErrors] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Only show in development or when ?debug=true is in URL
    const urlParams = new URLSearchParams(window.location.search);
    const isDebug = process.env.NODE_ENV === 'development' || urlParams.get('debug') === 'true';
    
    if (!isDebug) return;
    
    // Check for pre-existing errors from global handler
    if (typeof window !== 'undefined' && window.__errorLog && window.__errorLog.length > 0) {
      // Defer setState to avoid React warning about updating during render
      setTimeout(() => {
        window.__errorLog.forEach(error => {
          if (error.type === 'error') {
            setErrors(prev => [...prev.slice(-9), { message: error.message + (error.stack ? '\n' + error.stack : ''), timestamp: new Date(error.timestamp) }]);
          }
        });
        setIsVisible(true);
      }, 0);
    }

    // Store original console methods
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalLog = console.log;

    // Override console.error
    console.error = (...args) => {
      originalError.apply(console, args);
      // Defer setState to avoid React warning about updating during render
      setTimeout(() => {
        try {
          const errorMessage = args.map(arg => safeStringify(arg)).join(' ');
          setErrors(prev => [...prev.slice(-9), { message: errorMessage, timestamp: new Date() }]);
          setIsVisible(true);
        } catch (e) {
          // Fallback if stringification fails completely
          setErrors(prev => [...prev.slice(-9), { message: args.map(a => String(a)).join(' '), timestamp: new Date() }]);
          setIsVisible(true);
        }
      }, 0);
    };

    // Override console.warn
    console.warn = (...args) => {
      originalWarn.apply(console, args);
      // Defer setState to avoid React warning about updating during render
      setTimeout(() => {
        try {
          const warnMessage = args.map(arg => safeStringify(arg)).join(' ');
          setLogs(prev => [...prev.slice(-9), { message: warnMessage, type: 'warn', timestamp: new Date() }]);
        } catch (e) {
          // Fallback if stringification fails completely
          setLogs(prev => [...prev.slice(-9), { message: args.map(a => String(a)).join(' '), type: 'warn', timestamp: new Date() }]);
        }
      }, 0);
    };

    // Override console.log (optional, for debugging)
    console.log = (...args) => {
      originalLog.apply(console, args);
      // Only log if ?debug=verbose
      if (urlParams.get('debug') === 'verbose') {
        // Defer setState to avoid React warning about updating during render
        setTimeout(() => {
          try {
            const logMessage = args.map(arg => safeStringify(arg)).join(' ');
            setLogs(prev => [...prev.slice(-9), { message: logMessage, type: 'log', timestamp: new Date() }]);
          } catch (e) {
            // Fallback if stringification fails completely
            setLogs(prev => [...prev.slice(-9), { message: args.map(a => String(a)).join(' '), type: 'log', timestamp: new Date() }]);
          }
        }, 0);
      }
    };

    // Catch unhandled errors
    const handleError = (event) => {
      const errorMessage = event.error 
        ? `${event.error.name}: ${event.error.message}\n${event.error.stack}`
        : event.message || 'Unknown error';
      setErrors(prev => [...prev.slice(-9), { message: errorMessage, timestamp: new Date() }]);
      setIsVisible(true);
    };

    // Catch unhandled promise rejections
    const handleRejection = (event) => {
      const errorMessage = event.reason 
        ? (event.reason.message || String(event.reason))
        : 'Unhandled promise rejection';
      setErrors(prev => [...prev.slice(-9), { message: errorMessage, timestamp: new Date() }]);
      setIsVisible(true);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      console.log = originalLog;
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  // Don't render if not in debug mode
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const isDebug = process.env.NODE_ENV === 'development' || (urlParams && urlParams.get('debug') === 'true');
  
  if (!isDebug) return null;

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-[9999] bg-red-500 text-white p-3 rounded-full shadow-lg hover:bg-red-600 transition-colors"
        style={{ zIndex: 9999 }}
      >
        <AlertCircle className="w-5 h-5" />
        {errors.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-white text-red-500 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {errors.length}
          </span>
        )}
      </button>

      {/* Console Panel */}
      {isVisible && (
        <div 
          className="fixed bottom-0 left-0 right-0 bg-black text-white p-4 z-[9998] max-h-[50vh] overflow-y-auto"
          style={{ zIndex: 9998 }}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-sm">Console Errors ({errors.length})</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-white hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {errors.length === 0 ? (
            <p className="text-gray-400 text-xs">No errors yet</p>
          ) : (
            <div className="space-y-2">
              {errors.map((error, idx) => (
                <div key={idx} className="bg-red-900/50 p-2 rounded text-xs font-mono break-words">
                  <div className="text-red-300 mb-1">
                    {error.timestamp.toLocaleTimeString()}
                  </div>
                  <div className="text-white whitespace-pre-wrap">{error.message}</div>
                </div>
              ))}
            </div>
          )}

          {logs.length > 0 && urlParams?.get('debug') === 'verbose' && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <h4 className="font-bold text-xs mb-2">Logs ({logs.length})</h4>
              <div className="space-y-1">
                {logs.map((log, idx) => (
                  <div key={idx} className="bg-gray-800 p-2 rounded text-xs font-mono break-words">
                    <div className="text-gray-400 mb-1">
                      {log.timestamp.toLocaleTimeString()} [{log.type}]
                    </div>
                    <div className="text-white whitespace-pre-wrap">{log.message}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-400">
            <p>Add <code className="bg-gray-800 px-1 rounded">?debug=true</code> to URL to enable</p>
            <p>Add <code className="bg-gray-800 px-1 rounded">?debug=verbose</code> to also show console.log</p>
          </div>
        </div>
      )}
    </>
  );
}

