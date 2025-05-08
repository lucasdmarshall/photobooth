import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import useFullscreen from '../hooks/useFullscreen';
import { createGlobalStyle } from 'styled-components';

// Global styles to prevent touch gestures from disrupting the photobooth experience
const GlobalTouchStyles = createGlobalStyle`
  * {
    /* Prevent text selection */
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    
    /* Prevent touch callouts */
    -webkit-touch-callout: none;
    
    /* Prevent context menu on long press */
    -webkit-touch-action: manipulation;
    touch-action: manipulation;
  }
  
  /* Prevent drag actions */
  html, body, #root {
    -webkit-user-drag: none;
    user-drag: none;
  }
  
  /* Only allow selection in input fields */
  input, textarea {
    user-select: text;
    -webkit-user-select: text;
    -moz-user-select: text;
    -ms-user-select: text;
  }
`;

// Mock pricing for different photo package options
const PHOTO_PACKAGE_PRICES = {
  4: 5.00,
  6: 7.00,
  8: 9.00,
  12: 12.00
};

// Initial context state
const initialState = {
  // Session state
  sessionActive: false,
  paymentComplete: false,
  sessionStep: 'idle', // idle, quantity, payment, capture, selection, editing, delivery, thankyou
  sessionExpired: false,
  sessionTimeRemaining: 180, // 3 minutes in seconds

  // Photo options
  selectedQuantity: null,
  captureMethod: null, // 'manual' or 'timer'
  timerDuration: null, // 3, 5, or 10 seconds
  
  // Photo captures
  capturedPhotos: [], // Array of photo data URIs
  selectedPhotos: [], // Array of indices of selected photos
  
  // Editing
  photoFilters: [], // Array of filter ids applied to selected photos
  photoBackground: null, // ID of selected background
  photoTemplate: null, // ID of selected template
  templateLayout: null, // Layout configuration for the selected template
  
  // Delivery
  deliveryMethod: null, // 'print' or 'qr'
  qrCodeUrl: null, // URL for download via QR
};

// Create context
const PhotoboothContext = createContext(initialState);

// Provider component
export const PhotoboothProvider = ({ children }) => {
  const [state, setState] = useState(initialState);
  const { enterFullscreen, isFullscreen } = useFullscreen();
  
  // Updates state with partial state
  const updateState = useCallback((partialState) => {
    setState(prevState => ({ ...prevState, ...partialState }));
  }, []);
  
  // Listen for fullscreen changes and attempt to re-enter if exited
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!isFullscreen && state.sessionActive) {
        // Don't automatically try to re-enter fullscreen as it will fail without user interaction
        // Instead, we'll show the fullscreen indicator button for the user to click
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, [isFullscreen, state.sessionActive]);
  
  // Start a new session
  const startSession = useCallback(() => {
    // Try to enter fullscreen when the user starts a session (this is a user interaction)
    enterFullscreen();
    
    updateState({
      sessionActive: true,
      sessionStep: 'quantity',
      sessionExpired: false,
      sessionTimeRemaining: 180
    });
  }, [updateState, enterFullscreen]);
  
  // Select photo quantity and template
  const selectQuantity = useCallback((quantity, templateId = null, templateLayout = null) => {
    // For new design, we always use 4 photos with a template
    updateState({
      selectedQuantity: quantity,
      photoTemplate: templateId,
      templateLayout: templateLayout,
      sessionStep: 'payment'
    });
  }, [updateState]);
  
  // Process payment
  const processPayment = useCallback((success = true) => {
    if (success) {
      updateState({
        paymentComplete: true,
        sessionStep: 'capture'
      });
    }
  }, [updateState]);
  
  // Select capture method
  const selectCaptureMethod = useCallback((method, duration = null) => {
    updateState({
      captureMethod: method,
      timerDuration: method === 'timer' ? duration : null
    });
  }, [updateState]);
  
  // Capture a photo
  const capturePhoto = useCallback((photoDataUri) => {
    setState(prevState => {
      const newCapturedPhotos = [...prevState.capturedPhotos, photoDataUri];
      
      // We always want to capture exactly 8 photos regardless of the template
      const totalPhotosToCapture = 8;
      
      // Move to selection step if we have captured enough photos
      const newStep = newCapturedPhotos.length >= totalPhotosToCapture 
        ? 'selection' 
        : prevState.sessionStep;
      
      return {
        ...prevState,
        capturedPhotos: newCapturedPhotos,
        sessionStep: newStep
      };
    });
  }, []);
  
  // Select photos from captured
  const selectPhotos = useCallback((selectedIndices) => {
    setState(prevState => {
      // Always select 4 photos for the final output
      if (selectedIndices.length !== 4) return prevState;
      
      return {
        ...prevState,
        selectedPhotos: selectedIndices,
        sessionStep: 'editing'
      };
    });
  }, []);
  
  // Apply filter to photos
  const applyFilter = useCallback((filterId) => {
    setState(prevState => ({
      ...prevState,
      photoFilters: filterId
    }));
  }, []);
  
  // Select background
  const selectBackground = useCallback((backgroundId) => {
    updateState({
      photoBackground: backgroundId
    });
  }, [updateState]);
  
  // Select template
  const selectTemplate = useCallback((templateId) => {
    updateState({
      photoTemplate: templateId
    });
  }, [updateState]);
  
  // Complete editing
  const completeEditing = useCallback(() => {
    updateState({
      sessionStep: 'delivery'
    });
  }, [updateState]);
  
  // Choose delivery method
  const selectDeliveryMethod = useCallback((method) => {
    updateState({
      deliveryMethod: method,
      sessionStep: method === 'print' ? 'printing' : 'qr'
    });
    
    // Simulate QR code generation or printing completion
    if (method === 'qr') {
      // In a real app, this would generate a unique URL for downloading photos
      updateState({ qrCodeUrl: 'https://example.com/download/photos?id=123456' });
    } else if (method === 'print') {
      // Simulate printing time
      setTimeout(() => {
        updateState({ sessionStep: 'thankyou' });
        
        // After thank you, return to idle mode
        setTimeout(() => {
          resetSession();
        }, 60000); // 60 seconds
      }, 5000); // 5 seconds printing simulation
    }
  }, [updateState]);
  
  // Handle session expiration
  const handleSessionExpire = useCallback(() => {
    updateState({
      sessionExpired: true,
      sessionStep: 'expired'
    });
    
    // Return to idle mode after a few seconds
    setTimeout(() => {
      resetSession();
    }, 5000);
  }, [updateState]);
  
  // Reset session to initial state
  const resetSession = useCallback(() => {
    setState(initialState);
  }, []);
  
  // Session timer countdown
  useEffect(() => {
    let timer;
    
    if (state.sessionActive && state.paymentComplete && state.sessionTimeRemaining > 0) {
      timer = setInterval(() => {
        setState(prevState => {
          const newTimeRemaining = prevState.sessionTimeRemaining - 1;
          
          if (newTimeRemaining <= 0) {
            clearInterval(timer);
            handleSessionExpire();
            return {
              ...prevState,
              sessionTimeRemaining: 0
            };
          }
          
          return {
            ...prevState,
            sessionTimeRemaining: newTimeRemaining
          };
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [state.sessionActive, state.paymentComplete, state.sessionTimeRemaining, handleSessionExpire]);
  
  // Get price for selected quantity
  const getPrice = useCallback((quantity) => {
    return PHOTO_PACKAGE_PRICES[quantity] || 0;
  }, []);

  // Context value to be provided
  const contextValue = {
    ...state,
    isFullscreen,
    startSession,
    selectQuantity,
    processPayment,
    selectCaptureMethod,
    capturePhoto,
    selectPhotos,
    applyFilter,
    selectBackground,
    selectTemplate,
    completeEditing,
    selectDeliveryMethod,
    resetSession,
    getPrice
  };
  
  return (
    <PhotoboothContext.Provider value={contextValue}>
      <GlobalTouchStyles />
      {children}
    </PhotoboothContext.Provider>
  );
};

// Custom hook to use the photobooth context
export const usePhotobooth = () => {
  const context = useContext(PhotoboothContext);
  if (context === undefined) {
    throw new Error('usePhotobooth must be used within a PhotoboothProvider');
  }
  return context;
};

export default PhotoboothContext; 