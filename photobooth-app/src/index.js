import React from 'react';
import { createRoot } from 'react-dom/client';
import { MotionConfig } from 'framer-motion';
import App from './App';
import { PhotoboothProvider } from './contexts/PhotoboothContext';
import './index.css';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <MotionConfig reducedMotion="user">
      <PhotoboothProvider>
        <App />
      </PhotoboothProvider>
    </MotionConfig>
  </React.StrictMode>
); 