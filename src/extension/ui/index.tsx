import React from 'react';
import ReactDOM from 'react-dom/client';
import { ExtensionApp } from './App.tsx';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ExtensionApp />
    </React.StrictMode>
  );
}
