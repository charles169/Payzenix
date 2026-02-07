import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Debug: Check if JavaScript is running
console.log('🟢 main.tsx loaded - JavaScript is working!');

const rootElement = document.getElementById("root");

if (rootElement) {
  try {
    console.log('🟢 Creating React root...');
    createRoot(rootElement).render(<App />);
    console.log('✅ React app rendered successfully!');
  } catch (error) {
    console.error('❌ Error rendering React app:', error);
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: Arial; color: red;">
        <h1>Error Loading App</h1>
        <p>${error}</p>
        <p>Check browser console (F12) for details</p>
      </div>
    `;
  }
} else {
  console.error('❌ Root element not found!');
  document.body.innerHTML = '<h1 style="color: red;">Error: Root element not found!</h1>';
}

