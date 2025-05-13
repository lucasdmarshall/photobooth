import React, { useEffect } from 'react';
import { ThemeProvider } from 'styled-components';
import { AnimatePresence, motion } from 'framer-motion';

import theme from './styles/theme';
import GlobalStyles from './styles/GlobalStyles';
import { usePhotobooth } from './contexts/PhotoboothContext';
import FullscreenIndicator from './components/ui/FullscreenIndicator';
import BackgroundMusic from './components/ui/BackgroundMusic';
import useGlobalClickSound from './hooks/useGlobalClickSound';

// Pages
import IdlePage from './pages/IdlePage';
import QuantityPage from './pages/QuantityPage';
import PaymentPage from './pages/PaymentPage';
import CapturePage from './pages/CapturePage';
import SelectionPage from './pages/SelectionPage';
import TemplateSelectionPage from './pages/TemplateSelectionPage';
import DeliveryPage from './pages/DeliveryPage';
import ThankYouPage from './pages/ThankYouPage';
import ExpiredPage from './pages/ExpiredPage';

// Session timeout modal
const SessionTimeoutModal = ({ visible }) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '500px',
              textAlign: 'center',
            }}
          >
            <h2 style={{ color: '#FF5555', marginBottom: '16px' }}>
              Session Expired
            </h2>
            <p style={{ marginBottom: '24px' }}>
              Your session has timed out. Please start a new session to continue.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Main App component
const App = () => {
  const { sessionStep, sessionExpired } = usePhotobooth();
  
  // Use the global click sound hook to add bubble sounds to all clickable elements
  useGlobalClickSound();
  
  // Prevent default keyboard behavior to maintain kiosk-like experience
  useEffect(() => {
    const preventDefaultKeyboardBehavior = (e) => {
      // Prevent F11 default behavior (we handle fullscreen ourselves)
      if (e.key === 'F11' || e.keyCode === 122) {
        e.preventDefault();
      }
      
      // Prevent other keys that could disrupt the experience
      // Escape, Tab, Alt+Tab, Ctrl+Shift combinations, etc.
      if (['Escape', 'Tab', 'F5'].includes(e.key) || 
          (e.altKey && e.key === 'Tab') ||
          (e.ctrlKey && e.shiftKey)) {
        e.preventDefault();
      }
    };
    
    document.addEventListener('keydown', preventDefaultKeyboardBehavior);
    
    return () => {
      document.removeEventListener('keydown', preventDefaultKeyboardBehavior);
    };
  }, []);
  
  // Render the current step based on session state
  const renderStep = () => {
    switch (sessionStep) {
      case 'idle':
        return <IdlePage />;
      case 'quantity':
        return <QuantityPage />;
      case 'payment':
        // Skip payment step and go directly to capture
        return <CapturePage />;
      case 'capture':
        return <CapturePage />;
      case 'selection':
        return <SelectionPage />;
      case 'template_selection':
        return <TemplateSelectionPage />;
      case 'editing':
        // Skip editing page and go directly to delivery
        return <DeliveryPage />;
      case 'delivery':
      case 'printing':
      case 'qr':
        return <DeliveryPage />;
      case 'thankyou':
        return <ThankYouPage />;
      case 'expired':
        return <ExpiredPage />;
      default:
        return <IdlePage />;
    }
  };
  
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <BackgroundMusic />
      <AnimatePresence mode="wait">
        {renderStep()}
      </AnimatePresence>
      <SessionTimeoutModal visible={sessionExpired} />
      <FullscreenIndicator />
    </ThemeProvider>
  );
};

export default App;