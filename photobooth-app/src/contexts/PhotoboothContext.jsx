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
  sessionStep: 'idle', // idle, quantity, payment, capture, selection, template_selection, delivery, thankyou
  sessionExpired: false,
  
  // Photo options
  selectedQuantity: null,
  captureMethod: null, // 'manual' or 'timer'
  timerDuration: null, // 3, 5, or 10 seconds
  
  // Photo captures
  capturedPhotos: [], // Array of photo data URIs
  selectedPhotos: [], // Array of indices of selected photos
  photoFilters: {}, // Map of photo indices to their filter ids, e.g. {0: 'warm', 1: 'bw'}
  
  // Editing
  photoBackground: null, // ID of selected background
  photoTemplate: null, // ID of selected template
  templateLayout: null, // Layout configuration for the selected template
  
  // Beautification
  beautificationSettings: {}, // Map of photo indices to their beautification settings
  
  // Delivery
  deliveryMethod: null, // 'print' or 'qr'
  qrCodeUrl: null, // URL for download via QR
  qrCodeData: null, // Additional QR code data (id, expiration, etc.)
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
      sessionExpired: false
    });
  }, [updateState, enterFullscreen]);
  
  // Select photo quantity and template
  const selectQuantity = useCallback((quantity, templateId = null, templateLayout = null) => {
    // For new design, we always use 4 photos with a template
    updateState({
      selectedQuantity: quantity,
      photoTemplate: templateId,
      templateLayout: templateLayout,
      sessionStep: 'capture',
      paymentComplete: true, // Set payment as complete to skip payment page
      capturedPhotos: [], // Reset captured photos when starting a new session
      photoFilters: {} // Reset filters
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
  const capturePhoto = useCallback((photoDataUri, photoIndex = null) => {
    setState(prevState => {
      // If photoIndex is provided, replace the photo at that index
      if (photoIndex !== null && photoIndex >= 0 && photoIndex < prevState.capturedPhotos.length) {
        const newCapturedPhotos = [...prevState.capturedPhotos];
        newCapturedPhotos[photoIndex] = photoDataUri;
        return {
          ...prevState,
          capturedPhotos: newCapturedPhotos
        };
      } else {
        // Otherwise, add a new photo
        const newCapturedPhotos = [...prevState.capturedPhotos, photoDataUri];
        return {
          ...prevState,
          capturedPhotos: newCapturedPhotos
        };
      }
    });
  }, []);
  
  // Select photos from captured
  const selectPhotos = useCallback((selectedIndices) => {
    setState(prevState => {
      // Determine required number of photos based on template type
      const isDuoTemplate = prevState.photoTemplate === 'vertical_duo' || prevState.photoTemplate === 'horizontal_duo';
      const requiredPhotos = isDuoTemplate ? 2 : 4;
      
      // Check if we have the right number of photos selected
      if (selectedIndices.length !== requiredPhotos) return prevState;
      
      return {
        ...prevState,
        selectedPhotos: selectedIndices,
        sessionStep: 'template_selection' // Skip editing page and go directly to template_selection
      };
    });
  }, []);
  
  // Apply filter to photos
  const applyFilter = useCallback((filterId) => {
    setState(prevState => ({
      ...prevState,
      photoFilters: { ...prevState.photoFilters, [prevState.selectedPhotos.length]: filterId }
    }));
  }, []);
  
  // Apply filter to a specific photo
  const applyFilterToPhoto = useCallback((photoIndex, filterId) => {
    setState(prevState => ({
      ...prevState,
      photoFilters: { ...prevState.photoFilters, [photoIndex]: filterId }
    }));
  }, []);
  
  // Apply beautification settings to a specific photo
  const applyBeautificationToPhoto = useCallback((photoIndex, settings) => {
    setState(prevState => ({
      ...prevState,
      beautificationSettings: { ...prevState.beautificationSettings, [photoIndex]: settings }
    }));
  }, []);
  
  // Get beautification settings for a specific photo
  const getBeautificationSettings = useCallback((photoIndex) => {
    return state.beautificationSettings[photoIndex] || {
      smoothing: 0.5,
      skinTone: 0.2,
      brightness: 0.1,
      faceSlimming: 0.2,
    };
  }, [state.beautificationSettings]);
  
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
  
  // Complete template selection
  const completeTemplateSelection = useCallback((templateId, layoutType) => {
    updateState({
      photoTemplate: templateId,
      templateLayout: layoutType,
      sessionStep: 'delivery'
    });
  }, [updateState]);
  
  // Complete editing
  const completeEditing = useCallback(() => {
    updateState({
      sessionStep: 'delivery'
    });
  }, [updateState]);
  
  // Generate a unique download ID
  const generateDownloadId = useCallback(() => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }, []);

  // Generate QR code URL for downloading photos
  const generateQrCodeUrl = useCallback(() => {
    const downloadId = generateDownloadId();
    
    // Create a direct download link for the photos
    // We'll use Firebase Dynamic Links or a similar service in a real app
    // For now, we'll use a mock URL that would be accessible from any device
    
    // Option 1: Use a URL shortener service (mock for now)
    const shortUrl = `https://pbth.io/${downloadId}`;
    
    // Option 2: Use a cloud storage URL (mock for now)
    const cloudUrl = `https://storage.googleapis.com/photobooth-app/downloads/${downloadId}`;
    
    // Option 3: Use a QR code that contains the photos directly (for small number of photos)
    // This would encode the actual photo data in the QR code for direct download
    // We'll simulate this with a data URL
    const dataUrl = `data:text/plain;base64,${btoa(JSON.stringify({id: downloadId, timestamp: Date.now()}))}`;  
    
    // Store the photos in localStorage for the download page to access
    try {
      const photosToStore = {
        photos: state.capturedPhotos,
        selectedPhotos: state.selectedPhotos,
        templateId: state.photoTemplate,
        timestamp: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours from now
      };
      
      // Store by specific download ID
      localStorage.setItem(`photobooth_${downloadId}`, JSON.stringify(photosToStore));
      
      // Also store the current state for fallback
      localStorage.setItem('photoboothState', JSON.stringify(state));
      
      console.log('Photos stored in localStorage for download');
    } catch (error) {
      console.error('Error storing photos in localStorage:', error);
    }
    
    return {
      url: shortUrl, // Use the short URL for the QR code
      cloudUrl: cloudUrl,
      dataUrl: dataUrl,
      id: downloadId,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      localUrl: `${window.location.origin}/download.html?id=${downloadId}` // For local testing
    };
  }, [generateDownloadId, state]);

  // Choose delivery method
  const selectDeliveryMethod = useCallback((method) => {
    updateState({
      deliveryMethod: method,
      sessionStep: method === 'print' ? 'printing' : 'qr'
    });
    
    // Handle delivery method
    if (method === 'qr') {
      // Generate QR code URL for downloading photos
      const qrCodeData = generateQrCodeUrl();
      updateState({ 
        qrCodeUrl: qrCodeData.url,
        qrCodeData: qrCodeData
      });
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
  }, [updateState, generateQrCodeUrl]);
  
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
    applyFilterToPhoto,
    applyBeautificationToPhoto,
    getBeautificationSettings,
    selectBackground,
    selectTemplate,
    completeTemplateSelection,
    completeEditing,
    selectDeliveryMethod,
    resetSession,
    getPrice,
    updateState
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