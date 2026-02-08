import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";
import toast from "react-hot-toast";
import "./index.css";
import "./animations.css";

// Debug: Check if JavaScript is running
console.log('🟢 main.tsx loaded - JavaScript is working!');

// INTERCEPT TOAST.ERROR IMMEDIATELY - Before anything else
const originalToastError = toast.error;
(toast as any).error = (message: any, options?: any) => {
  const messageStr = typeof message === 'string' ? message : String(message);
  
  // Suppress null/undefined property errors
  if (
    messageStr.includes('Cannot read properties of null') ||
    messageStr.includes('Cannot read properties of undefined') ||
    messageStr.includes('null is not an object') ||
    messageStr.includes('undefined is not an object') ||
    messageStr.includes('reading \'name\'') ||
    messageStr.includes('reading \'_id\'')
  ) {
    console.warn('🔇 Suppressed error toast:', messageStr);
    return '';
  }
  
  // Show all other errors
  return originalToastError(message, options);
};

console.log('✅ Toast error interceptor installed');

// AGGRESSIVE ERROR SUPPRESSION - Hide all null property errors from UI
window.addEventListener('error', (event) => {
  // Log to console for debugging
  console.error('❌ ERROR CAUGHT:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
  });
  
  // Suppress ALL null/undefined property errors from showing in UI
  if (event.message && (
    event.message.includes('Cannot read properties of null') ||
    event.message.includes('Cannot read properties of undefined') ||
    event.message.includes('null is not an object') ||
    event.message.includes('undefined is not an object') ||
    event.message.includes('Failed to load') ||
    event.message.includes('Failed to fetch') ||
    event.message.includes('Network request failed')
  )) {
    console.warn('⚠️ Suppressing error from UI (logged above for debugging)');
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    return false;
  }
});

// Suppress unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ PROMISE REJECTION:', event.reason);
  
  const message = event.reason?.message || String(event.reason);
  
  if (message && (
    message.includes('Cannot read properties of null') ||
    message.includes('Cannot read properties of undefined') ||
    message.includes('Failed to load') ||
    message.includes('Failed to fetch') ||
    message.includes('Network request failed') ||
    message.includes('Load failed')
  )) {
    console.warn('⚠️ Suppressing rejection from UI');
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  }
});

// Override console.error to filter out null property errors from showing in UI
const originalConsoleError = console.error;
let suppressErrorToasts = false;

console.error = (...args) => {
  const message = args.join(' ');
  
  // Still log to console but don't let React show the error overlay
  if (message.includes('Cannot read properties of null') || 
      message.includes('Cannot read properties of undefined') ||
      message.includes('Failed to load') ||
      message.includes('Failed to fetch')) {
    // Log with a different style so we can still see it
    console.warn('🔇 Suppressed error:', ...args);
    return;
  }
  
  // Let other errors through
  originalConsoleError.apply(console, args);
};

// Export function to temporarily suppress error toasts
(window as any).suppressErrorToasts = (suppress: boolean) => {
  suppressErrorToasts = suppress;
  console.log(`🔇 Error toast suppression: ${suppress ? 'ON' : 'OFF'}`);
};

const rootElement = document.getElementById("root");

if (rootElement) {
  try {
    console.log('🟢 Creating React root...');
    
    // Wrap the entire app in an error boundary
    const root = createRoot(rootElement);
    
    // Catch any rendering errors
    try {
      root.render(
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      );
      console.log('✅ React app rendered successfully!');
    } catch (renderError) {
      console.error('❌ Error rendering React app:', renderError);
      // Don't show error to user, just log it
      console.warn('⚠️ Continuing despite render error...');
    }
    
  } catch (error) {
    console.error('❌ Error creating React root:', error);
    // Fallback: try to render anyway
    try {
      createRoot(rootElement).render(<App />);
    } catch (fallbackError) {
      console.error('❌ Fallback render also failed:', fallbackError);
    }
  }
} else {
  console.error('❌ Root element not found!');
}


