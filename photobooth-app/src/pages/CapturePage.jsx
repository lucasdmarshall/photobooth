import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { usePhotobooth } from '../contexts/PhotoboothContext';
import Button from '../components/ui/Button';
import BubbleButton from '../components/ui/BubbleButton';
import Card from '../components/ui/Card';
import BeautificationControls from '../components/BeautificationControls';
import { applyBeautificationEffects } from '../utils/BeautificationUtils';

// Import sound files
import sound1 from '../../public/music/1.mp3';
import sound2 from '../../public/music/2.mp3';
import sound3 from '../../public/music/3.mp3';
import smileSound from '../../public/music/smile.mp3';

const PageContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.background};
  position: relative;
  overflow: hidden;
`;

const Title = styled(motion.h1)`
  font-size: ${({ theme }) => theme.fontSizes.xxl};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  text-align: center;
  z-index: 1;
`;

const StepContainer = styled(motion.div)`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xl};
`;

// Loading session components
const LoadingContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 500px;
  background-color: white;
  border-radius: ${({ theme }) => theme.borderRadius.large};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.medium};
`;

const LoadingText = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  text-align: center;
`;

const LoadingBar = styled(motion.div)`
  width: 100%;
  height: 12px;
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  overflow: hidden;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const LoadingProgress = styled(motion.div)`
  height: 100%;
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.pill};
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  width: 100%;
  justify-content: center;
`;

const CameraViewfinder = styled(motion.div)`
  width: 60vw;
  height: 45vw; /* Keep 4:3 aspect ratio */
  max-width: 700px;
  max-height: 525px;
  background-color: #000;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 10px solid white;
  box-shadow: ${({ theme }) => theme.shadows.large};
`;

const CameraFeed = styled.div`
  width: 100%;
  height: 100%;
  background-color: #222;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden; /* Ensure content doesn't spill out */
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border: 2px dashed ${({ theme }) => theme.colors.primary}50;
    margin: 20px;
    pointer-events: none;
    z-index: 2; /* Ensure it's above the video */
  }
`;

const MockCamera = styled.div`
  color: white;
  font-size: ${({ theme }) => theme.fontSizes.lg};
  text-align: center;
  opacity: 0.8;
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const RetryButton = styled(Button)`
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const BubbleCaptureButton = styled(motion.button)`
  position: absolute;
  bottom: ${({ theme }) => theme.spacing.xxl};
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary};
  border: 5px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  cursor: pointer;
  z-index: 5;
  
  &:hover {
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  &:before {
    content: '';
    width: 60%;
    height: 60%;
    border-radius: 50%;
    background-color: white;
  }
`;

const CaptureOverlay = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: white;
  z-index: 10;
  pointer-events: none;
`;

const ProcessingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.3);
  color: white;
  font-size: 18px;
  font-weight: bold;
  z-index: 5;
`;

const CountdownOverlay = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 150px;
  font-weight: bold;
  color: white;
`;

const PhotoInfo = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
`;

// Add these new styled components for the previews
const CaptureLayout = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: ${({ theme }) => theme.spacing.huge};
  margin: 0;
`;

const PreviewsColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxl};
  width: 180px;
  height: 100%;
  justify-content: space-between;
`;

const PreviewNumber = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const PhotoPreview = styled(motion.div)`
  width: 160px;
  height: 120px;
  background-color: ${({ $color, theme }) => !$color || $color.startsWith('hsl') ? $color || theme.colors.background : 'transparent'};
  background-image: ${({ $color }) => $color && $color.startsWith('data:') ? `url(${$color})` : 'none'};
  background-size: cover;
  background-position: center;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  border: 4px solid white;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  overflow: hidden;
  opacity: ${({ $empty }) => ($empty ? 0.3 : 1)};
  position: relative;
`;

const EmptyPreviewSlot = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.textSecondary};
  height: 100%;
  font-weight: bold;
`;

// Add a styled component for the next button
const NextButtonContainer = styled(motion.div)`
  position: absolute;
  bottom: ${({ theme }) => theme.spacing.xl};
  right: ${({ theme }) => theme.spacing.xl};
`;

// Add the arrow symbol
const NextButton = styled(motion.button)`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  font-size: ${({ theme }) => theme.fontSizes.xl};
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  
  &:hover {
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

// Photo Preview Modal Components
const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${({ theme }) => theme.spacing.xl};
`;

const ModalContent = styled(motion.div)`
  background-color: white;
  border-radius: ${({ theme }) => theme.borderRadius.large};
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  box-shadow: ${({ theme }) => theme.shadows.large};
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.background};
`;

const ModalTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.xl};
  cursor: pointer;
  
  &:hover {
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing.lg};
  
  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
`;

const LargePreview = styled.div`
  width: 100%;
  height: 300px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  position: relative;
  overflow: hidden;
  background-color: #f0f0f0;
  
  @media (min-width: 768px) {
    width: 60%;
    height: 400px;
    margin-bottom: 0;
    margin-right: ${({ theme }) => theme.spacing.lg};
  }
`;

const FilterOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${({ $color }) => $color || 'transparent'};
  opacity: 0.4;
  mix-blend-mode: ${({ $blendMode }) => $blendMode || 'normal'};
  pointer-events: none; /* Make sure clicks pass through to the preview */
  z-index: 2; /* Ensure it's above the background image */
`;

const FilterOptions = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const FilterTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-top: 0;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing.md};
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const FilterItem = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  background-color: ${({ theme, $selected }) => $selected ? theme.colors.primary + '30' : theme.colors.background};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.small};
  }
`;

const FilterPreview = styled.div`
  width: 70px;
  height: 70px;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  background-color: ${({ $baseColor }) => !$baseColor || $baseColor.startsWith('hsl') ? $baseColor || '#f0f0f0' : 'transparent'};
  background-image: ${({ $baseColor }) => $baseColor && $baseColor.startsWith('data:') ? `url(${$baseColor})` : 'none'};
  background-size: cover;
  background-position: center;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  position: relative;
  overflow: hidden;
`;

const FilterName = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textPrimary};
  text-align: center;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.background};
`;

const TabContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Tab = styled.div`
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  background-color: ${({ theme, $active }) => $active ? theme.colors.primary : theme.colors.background};
  color: ${({ theme, $active }) => $active ? 'white' : theme.colors.textSecondary};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ $active }) => $active ? 'bold' : 'normal'};
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background-color: ${({ theme, $active }) => $active ? theme.colors.primary : theme.colors.background}aa;
  }
`;

// Mock filters for the demo
const filters = [
  { id: 'normal', name: 'Normal', color: null, blendMode: 'normal' },
  { id: 'warm', name: 'Warm', color: '#FFB74D', blendMode: 'overlay' },
  { id: 'cool', name: 'Cool', color: '#81D4FA', blendMode: 'overlay' },
  { id: 'vintage', name: 'Vintage', color: '#A1887F', blendMode: 'multiply' },
  { id: 'bw', name: 'B&W', color: '#000000', blendMode: 'saturation' },
  { id: 'pink', name: 'Pink', color: '#F8BBD0', blendMode: 'soft-light' },
  { id: 'sepia', name: 'Sepia', color: '#D7CCC8', blendMode: 'color' },
  { id: 'dramatic', name: 'Dramatic', color: '#455A64', blendMode: 'overlay' },
  { id: 'vivid', name: 'Vivid', color: '#4CAF50', blendMode: 'color-dodge' },
  { id: 'neon', name: 'Neon', color: '#00E5FF', blendMode: 'hard-light' },
  { id: 'retro', name: 'Retro', color: '#FFEB3B', blendMode: 'color' },
  { id: 'dreamy', name: 'Dreamy', color: '#CE93D8', blendMode: 'soft-light' },
];

// Helper function to generate random colors for mock photos
const getRandomColor = () => {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 70 + Math.floor(Math.random() * 30); // 70-100%
  const lightness = 40 + Math.floor(Math.random() * 30); // 40-70%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

// Helper function to play sounds
const playSound = (soundName) => {
  try {
    let audio;
    
    if (soundName === '1') {
      audio = new Audio(sound1);
    } else if (soundName === '2') {
      audio = new Audio(sound2);
    } else if (soundName === '3') {
      audio = new Audio(sound3);
    } else if (soundName === 'smile') {
      audio = new Audio(smileSound);
    } else {
      console.error(`Unknown sound: ${soundName}`);
        return;
    }
    
    audio.volume = 0.5; // 50% volume for sound effects
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.error(`Error playing ${soundName} sound:`, error);
      });
    }
  } catch (error) {
    console.error(`Error creating ${soundName} audio:`, error);
  }
};

// Add a new styled component for the video element
const CameraVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block; /* Remove any default inline spacing */
  background-color: #000; /* Ensure black background if video is loading */
  transform: scaleX(-1); /* Flip the camera horizontally to correct the mirror effect */
`;

// Add a canvas element for capturing photos (hidden)
const CaptureCanvas = styled.canvas`
  display: none;
  position: absolute;
`;

const CapturePage = () => {
  const { 
    selectedQuantity, 
    capturedPhotos,
    capturePhoto,
    selectQuantity,
    resetSession,
    updateState,
    photoFilters,
    applyFilterToPhoto,
    photoTemplate,
    applyBeautificationToPhoto,
    getBeautificationSettings
  } = usePhotobooth();
  
  const [step, setStep] = useState('session-loading');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const loadingTimerRef = useRef(null);
  const captureInProgressRef = useRef(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraError, setCameraError] = useState(null);
  
  // State for the photo preview modal
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('normal');
  const [activeTab, setActiveTab] = useState('filters');
  const [beautificationSettings, setBeautificationSettings] = useState({
    smoothing: 0.5,
    skinTone: 0.2,
    brightness: 0.1,
    faceSlimming: 0.2,
  });
  const [isProcessingBeautification, setIsProcessingBeautification] = useState(false);
  const [previewImageData, setPreviewImageData] = useState(null);
  const [originalImageData, setOriginalImageData] = useState(null);

  // Determine the number of photos to capture based on template
  const isDuoTemplate = photoTemplate === 'vertical_duo' || photoTemplate === 'horizontal_duo';
  const totalPhotosToCapture = isDuoTemplate ? 4 : 8;
  
  // Add logging to diagnose the issue
  console.log('CapturePage rendering:', { 
    photoTemplate, 
    isDuoTemplate, 
    totalPhotosToCapture,
    selectedQuantity,
    step,
    capturedPhotosCount: capturedPhotos.length
  });
  
  // Initialize camera when entering capture step
  useEffect(() => {
    if (step === 'capture') {
      console.log('Capture step detected - initializing camera');
      
      // Set a small timeout to ensure DOM is ready
      const initTimer = setTimeout(() => {
        initCamera();
      }, 100);
      
      return () => {
        clearTimeout(initTimer);
      };
    }
    
    // Clean up function to stop the camera when unmounting or changing steps
    return () => {
      if (streamRef.current) {
        console.log('Cleaning up camera stream');
        const tracks = streamRef.current.getTracks();
        tracks.forEach(track => {
          console.log(`Stopping track: ${track.kind}`);
          track.stop();
        });
        streamRef.current = null;
        
        // Also clean up the video element
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      }
    };
  }, [step]);
  
  // Function to initialize the camera
  const initCamera = async () => {
    try {
      // Reset any previous error
      setCameraError(null);
      console.log("Initializing camera...");
      
      // Get user media - request camera access with moderate resolution
      // Using lower resolution for better performance
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 }, // Reduced from 1280
          height: { ideal: 480 }, // Reduced from 720
          facingMode: "user"
        },
        audio: false
      });
      
      console.log("Camera access granted, setting up video stream");
      
      // Store the stream for later cleanup
      streamRef.current = stream;
      
      // Set the stream as the source for the video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log("Video source object set");
      } else {
        console.error("Video ref is not available");
        setCameraError("Camera initialization failed - internal error");
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      
      // Provide more specific error messages
      if (error.name === 'NotAllowedError') {
        setCameraError("Camera access denied. Please allow camera access in your browser settings.");
      } else if (error.name === 'NotFoundError') {
        setCameraError("No camera found. Please connect a camera and try again.");
      } else if (error.name === 'NotReadableError') {
        setCameraError("Camera is in use by another application or not accessible.");
      } else {
        setCameraError(`Camera error: ${error.message || 'Unknown error'}`);
      }
    }
  };
  
  // Start loading timer when the component mounts
  useEffect(() => {
    // Start the 10-second loading timer
    const loadingDuration = 10; // 10 seconds
    const interval = 100; // Update every 100ms for smoother animation
    const totalSteps = loadingDuration * 1000 / interval;
    let currentStep = 0;
    
    loadingTimerRef.current = setInterval(() => {
      currentStep++;
      const newProgress = (currentStep / totalSteps) * 100;
      setLoadingProgress(newProgress);
      
      // When loading is complete (10 seconds)
      if (currentStep >= totalSteps) {
        clearInterval(loadingTimerRef.current);
      }
    }, interval);
    
    return () => {
      if (loadingTimerRef.current) {
        clearInterval(loadingTimerRef.current);
      }
    };
  }, []);
  
  const handleOk = () => {
    // Clear the loading timer and proceed immediately
    if (loadingTimerRef.current) {
      clearInterval(loadingTimerRef.current);
    }
    setStep('capture');
    // Don't call selectQuantity again, as it will override the template selection
  };
  
  const handleCancel = () => {
    // Clear the loading timer and go back
    if (loadingTimerRef.current) {
      clearInterval(loadingTimerRef.current);
    }
    // Go back to quantity page
    resetSession();
  };
  
  const handleCapture = () => {
    console.log("handleCapture called, isCapturing:", isCapturing, "captureInProgress:", captureInProgressRef.current);
    
    // Check if we've reached the maximum number of photos
    if (capturedPhotos.length >= totalPhotosToCapture) {
      console.log("Maximum number of photos reached:", totalPhotosToCapture);
      return;
    }
    
    // Double protection: check both the state and the ref
    if (isCapturing || captureInProgressRef.current) {
      console.log("Preventing duplicate handleCapture");
      return;
    }
    
    // Check if camera is available
    if (!videoRef.current || !videoRef.current.srcObject) {
      console.error("Camera not available");
      return;
    }
    
    // Set both the state and the ref
    setIsCapturing(true);
    captureInProgressRef.current = true;
    
    console.log("Capture started");
    
    // Play the "smile" sound when taking the photo
    playSound("smile");
    
    // Use requestAnimationFrame for better performance timing
    requestAnimationFrame(() => {
      try {
        console.log("Capturing from camera feed");
        
        // Take screenshot from the video feed
        const videoElem = videoRef.current;
        const canvasElem = canvasRef.current;
        
        if (!videoElem || !canvasElem) {
          throw new Error("Video or canvas element not available");
        }
        
        // Set canvas dimensions to match video with a slight resolution reduction
        const scale = 0.75; // Reduce resolution to 75% for better performance
        canvasElem.width = videoElem.videoWidth * scale;
        canvasElem.height = videoElem.videoHeight * scale;
        
        // Draw the current video frame to the canvas
        const ctx = canvasElem.getContext('2d', { alpha: false }); // Disable alpha for better performance
        
        // Apply same horizontal flip to the canvas as we did to the video
        // This ensures the captured photo matches what the user sees
        ctx.translate(canvasElem.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoElem, 0, 0, canvasElem.width, canvasElem.height);
        
        // Reset transformation matrix to not affect future drawing
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        
        // Get the image data as a data URL with reduced quality
        const photoData = canvasElem.toDataURL('image/jpeg', 0.7); // Reduced quality from 0.9 to 0.7
        
        console.log("Calling capturePhoto");
        // Use the original capturePhoto function
        capturePhoto(photoData);
        
        console.log("Capture complete");
      } catch (error) {
        console.error("Error during capture:", error);
        // Fallback to random color if camera capture fails
        capturePhoto(getRandomColor());
      } finally {
        // Always reset the capture states, even if there was an error
        setTimeout(() => {
        setIsCapturing(false);
        captureInProgressRef.current = false;
        console.log("Reset capture states");
        }, 100); // Short timeout to avoid visual flickering
      }
    });
  };
  
  // Add a handler for the Next button
  const handleNextStep = () => {
    // Navigate to the selection page
    updateState({ sessionStep: 'selection' });
  };
  
  // Function to open the preview modal
  const openPreviewModal = useCallback((index) => {
    if (capturedPhotos[index]) {
      // Reset processing state
      setIsProcessingBeautification(false);
      
      // Set modal data
      setSelectedPhotoIndex(index);
      setSelectedFilter(photoFilters[index] || 'normal');
      
      // Get beautification settings
      const settings = getBeautificationSettings(index);
      setBeautificationSettings(settings);
      
      // Set image data
      const photoData = capturedPhotos[index];
      setOriginalImageData(photoData);
      setPreviewImageData(photoData);
      
      // Open modal
      setPreviewModalOpen(true);
    }
  }, [capturedPhotos, photoFilters, getBeautificationSettings]);
  
  // Function to close the preview modal
  const closePreviewModal = useCallback(() => {
    // Cancel any pending beautification operations
    setIsProcessingBeautification(false);
    
    // Close the modal and reset state
    setPreviewModalOpen(false);
    setSelectedPhotoIndex(null);
    setPreviewImageData(null);
    setOriginalImageData(null);
  }, []);
  
  // Function to handle filter selection
  const handleFilterSelect = (filterId) => {
    setSelectedFilter(filterId);
    applyFilterToPhoto(selectedPhotoIndex, filterId);
  };
  
  // Create a debounce function for processing beautification changes
  const debounce = useCallback((func, delay) => {
    let timeoutId;
    return (...args) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  }, []);

  // Process beautification settings and apply to preview image
  const processBeautification = useCallback(async (settings) => {
    if (!originalImageData || activeTab !== 'beautification' || isProcessingBeautification) return;
    
    try {
      setIsProcessingBeautification(true);
      // Process the image with beautification effects
      const processedImageData = await applyBeautificationEffects(originalImageData, settings);
      if (processedImageData !== originalImageData) {
        setPreviewImageData(processedImageData);
      }
    } catch (error) {
      console.error('Error applying live beautification effects:', error);
    } finally {
      setIsProcessingBeautification(false);
    }
  }, [originalImageData, activeTab, isProcessingBeautification]);
  
  // Create a debounced version of the processing function
  const debouncedProcessBeautification = useMemo(() => 
    debounce(processBeautification, 500), 
  [debounce, processBeautification]);

  // Add function to handle beautification settings change
  const handleBeautificationChange = useCallback((settings) => {
    // Only update settings if they've actually changed
    setBeautificationSettings(prev => {
      // Check if any values are different
      const hasChanged = Object.keys(settings).some(key => settings[key] !== prev[key]);
      if (hasChanged) {
        debouncedProcessBeautification(settings);
        return settings;
      }
      return prev;
    });
  }, [debouncedProcessBeautification]);
  
  // Function to apply beautification effects
  const applyBeautificationEffectsToPhoto = useCallback(async (photoIndex) => {
    if (!capturedPhotos[photoIndex] || isProcessingBeautification) return;
    
    try {
      setIsProcessingBeautification(true);
      
      // Save the settings to context
      applyBeautificationToPhoto(photoIndex, beautificationSettings);
      
      // Use the already processed preview image data
      if (previewImageData) {
        // Update the photo
        capturePhoto(previewImageData, photoIndex);
        // Update the original image data to match the new processed image
        setOriginalImageData(previewImageData);
        // Close the modal after applying
        setPreviewModalOpen(false);
      }
      
    } catch (error) {
      console.error('Error applying beautification effects:', error);
    } finally {
      setIsProcessingBeautification(false);
    }
  }, [capturedPhotos, beautificationSettings, capturePhoto, isProcessingBeautification, applyBeautificationToPhoto, previewImageData]);
  
  return (
    <PageContainer>
      <AnimatePresence mode="wait">
        {step === 'session-loading' && (
          <StepContainer
            key="session-loading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <LoadingContainer>
              <LoadingText>Your session is starting</LoadingText>
              
              <LoadingBar>
                <LoadingProgress 
                  initial={{ width: '0%' }}
                  animate={{ width: `${loadingProgress}%` }}
                />
              </LoadingBar>
              
              <ButtonsContainer>
                <Button 
                  onClick={handleCancel}
                  variant="secondary"
                  size="large"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleOk}
                  variant="primary"
                  size="large"
                >
                  OK
                </Button>
              </ButtonsContainer>
            </LoadingContainer>
          </StepContainer>
        )}
        
        {step === 'capture' && (
          <StepContainer
            key="capture"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <Title>
              Take Your Photos!
              <br />
              <span style={{ fontSize: '24px', fontWeight: 'normal' }}>
                Click the button to take photos ({capturedPhotos.length}/{totalPhotosToCapture})
              </span>
            </Title>
            
            <CaptureLayout>
              {/* Left column - first half of photos */}
              <PreviewsColumn>
                {isDuoTemplate 
                  ? [0, 1].map((index) => (
                      <PhotoPreview 
                        key={`left-${index}`}
                        $color={capturedPhotos[index]}
                        $empty={!capturedPhotos[index]}
                        initial={capturedPhotos.length === index + 1 ? { scale: 0.8, opacity: 0 } : { scale: 1 }}
                        animate={capturedPhotos.length === index + 1 ? { scale: 1, opacity: 1 } : { scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        onClick={() => openPreviewModal(index)}
                        style={{ cursor: capturedPhotos[index] ? 'pointer' : 'default' }}
                      >
                        {capturedPhotos[index] && <PreviewNumber>{index + 1}</PreviewNumber>}
                        {!capturedPhotos[index] && (
                          <EmptyPreviewSlot>
                            {index + 1}
                          </EmptyPreviewSlot>
                        )}
                        {/* Show filter effect if applied */}
                        {capturedPhotos[index] && photoFilters[index] && photoFilters[index] !== 'normal' && (
                          <FilterOverlay 
                            $color={filters.find(f => f.id === photoFilters[index])?.color} 
                            $blendMode={filters.find(f => f.id === photoFilters[index])?.blendMode} 
                          />
                        )}
                      </PhotoPreview>
                    ))
                  : [0, 1, 2, 3].map((index) => (
                      <PhotoPreview 
                        key={`left-${index}`}
                        $color={capturedPhotos[index]}
                        $empty={!capturedPhotos[index]}
                        initial={capturedPhotos.length === index + 1 ? { scale: 0.8, opacity: 0 } : { scale: 1 }}
                        animate={capturedPhotos.length === index + 1 ? { scale: 1, opacity: 1 } : { scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        onClick={() => openPreviewModal(index)}
                        style={{ cursor: capturedPhotos[index] ? 'pointer' : 'default' }}
                      >
                        {capturedPhotos[index] && <PreviewNumber>{index + 1}</PreviewNumber>}
                        {!capturedPhotos[index] && (
                          <EmptyPreviewSlot>
                            {index + 1}
                          </EmptyPreviewSlot>
                        )}
                        {/* Show filter effect if applied */}
                        {capturedPhotos[index] && photoFilters[index] && photoFilters[index] !== 'normal' && (
                          <FilterOverlay 
                            $color={filters.find(f => f.id === photoFilters[index])?.color} 
                            $blendMode={filters.find(f => f.id === photoFilters[index])?.blendMode} 
                          />
                        )}
                      </PhotoPreview>
                    ))
                }
              </PreviewsColumn>
            
            <CameraViewfinder>
              <CameraFeed>
                {cameraError ? (
                  <MockCamera>
                    {cameraError}
                    <RetryButton 
                      onClick={() => initCamera()}
                      variant="primary"
                      size="small"
                    >
                      Retry Camera Access
                    </RetryButton>
                  </MockCamera>
                ) : (
                  <>
                    <CameraVideo 
                      ref={videoRef} 
                      autoPlay
                      playsInline
                      muted
                      onLoadedMetadata={() => {
                        console.log("Video metadata loaded, playing video");
                        if (videoRef.current) {
                          videoRef.current.play().catch(err => {
                            console.error("Error playing video:", err);
                          });
                        }
                      }}
                    />
                    <CaptureCanvas ref={canvasRef} />
                  </>
                )}
              </CameraFeed>
                
                <BubbleCaptureButton
                  onClick={handleCapture}
                  disabled={isCapturing || capturedPhotos.length >= totalPhotosToCapture || cameraError}
                  whileHover={{ scale: capturedPhotos.length >= totalPhotosToCapture ? 1.0 : 1.1 }}
                  whileTap={{ scale: capturedPhotos.length >= totalPhotosToCapture ? 1.0 : 0.9 }}
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: capturedPhotos.length >= totalPhotosToCapture || cameraError ? 0.5 : 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  style={{ cursor: capturedPhotos.length >= totalPhotosToCapture || cameraError ? 'not-allowed' : 'pointer' }}
                />
              
              <AnimatePresence>
                {isCapturing && (
                  <CaptureOverlay
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </AnimatePresence>
            </CameraViewfinder>
              
              {/* Right column - second half of photos */}
              <PreviewsColumn>
                {isDuoTemplate 
                  ? [2, 3].map((index) => (
                      <PhotoPreview 
                        key={`right-${index}`}
                        $color={capturedPhotos[index]}
                        $empty={!capturedPhotos[index]}
                        initial={capturedPhotos.length === index + 1 ? { scale: 0.8, opacity: 0 } : { scale: 1 }}
                        animate={capturedPhotos.length === index + 1 ? { scale: 1, opacity: 1 } : { scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        onClick={() => openPreviewModal(index)}
                        style={{ cursor: capturedPhotos[index] ? 'pointer' : 'default' }}
                      >
                        {capturedPhotos[index] && <PreviewNumber>{index + 1}</PreviewNumber>}
                        {!capturedPhotos[index] && (
                          <EmptyPreviewSlot>
                            {index + 1}
                          </EmptyPreviewSlot>
                        )}
                        {/* Show filter effect if applied */}
                        {capturedPhotos[index] && photoFilters[index] && photoFilters[index] !== 'normal' && (
                          <FilterOverlay 
                            $color={filters.find(f => f.id === photoFilters[index])?.color} 
                            $blendMode={filters.find(f => f.id === photoFilters[index])?.blendMode} 
                          />
                        )}
                      </PhotoPreview>
                    ))
                  : [4, 5, 6, 7].map((index) => (
                      <PhotoPreview 
                        key={`right-${index}`}
                        $color={capturedPhotos[index]}
                        $empty={!capturedPhotos[index]}
                        initial={capturedPhotos.length === index + 1 ? { scale: 0.8, opacity: 0 } : { scale: 1 }}
                        animate={capturedPhotos.length === index + 1 ? { scale: 1, opacity: 1 } : { scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        onClick={() => openPreviewModal(index)}
                        style={{ cursor: capturedPhotos[index] ? 'pointer' : 'default' }}
                      >
                        {capturedPhotos[index] && <PreviewNumber>{index + 1}</PreviewNumber>}
                        {!capturedPhotos[index] && (
                          <EmptyPreviewSlot>
                            {index + 1}
                          </EmptyPreviewSlot>
                        )}
                        {/* Show filter effect if applied */}
                        {capturedPhotos[index] && photoFilters[index] && photoFilters[index] !== 'normal' && (
                          <FilterOverlay 
                            $color={filters.find(f => f.id === photoFilters[index])?.color} 
                            $blendMode={filters.find(f => f.id === photoFilters[index])?.blendMode} 
                          />
                        )}
                      </PhotoPreview>
                    ))
                }
              </PreviewsColumn>
            </CaptureLayout>
            
            <PhotoInfo>
              Take {totalPhotosToCapture} photos and choose your {isDuoTemplate ? '2' : '4'} favorites for the final print.
              <br />
              <span style={{ fontSize: '14px', opacity: 0.7 }}>Tip: Click on any photo to apply filters and effects!</span>
            </PhotoInfo>
            
            {/* Add Next button that only appears after all photos are taken */}
            <AnimatePresence>
              {capturedPhotos.length >= totalPhotosToCapture && (
                <NextButtonContainer
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <NextButton
                    onClick={handleNextStep}
                    whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                  >
                    →
                  </NextButton>
                </NextButtonContainer>
              )}
            </AnimatePresence>
          </StepContainer>
        )}
      </AnimatePresence>
      
      {/* Photo Preview Modal */}
      <AnimatePresence>
        {previewModalOpen && selectedPhotoIndex !== null && (
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePreviewModal}
          >
            <ModalContent
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalHeader>
                <ModalTitle>Photo Preview & Effects</ModalTitle>
                <CloseButton onClick={closePreviewModal}>×</CloseButton>
              </ModalHeader>
              
              <ModalBody>
                <LargePreview style={{ opacity: isProcessingBeautification ? 0.7 : 1 }}>
                  <PreviewImage 
                    src={activeTab === 'beautification' ? previewImageData : capturedPhotos[selectedPhotoIndex]} 
                    alt="Preview"
                  />
                  {selectedFilter !== 'normal' && activeTab === 'filters' && (
                    <FilterOverlay 
                      $color={filters.find(f => f.id === selectedFilter)?.color} 
                      $blendMode={filters.find(f => f.id === selectedFilter)?.blendMode} 
                    />
                  )}
                  {isProcessingBeautification && activeTab === 'beautification' && (
                    <ProcessingOverlay>
                      <span>Processing...</span>
                    </ProcessingOverlay>
                  )}
                </LargePreview>
                
                <FilterOptions>
                  <TabContainer>
                    <Tab 
                      $active={activeTab === 'filters'} 
                      onClick={() => setActiveTab('filters')}
                    >
                      Filters
                    </Tab>
                    <Tab 
                      $active={activeTab === 'beautification'} 
                      onClick={() => setActiveTab('beautification')}
                    >
                      Beautification
                    </Tab>
                  </TabContainer>
                  
                  {activeTab === 'filters' && (
                    <>
                      <FilterTitle>Photo Effects</FilterTitle>
                      <FilterGrid>
                        {filters.map((filter) => (
                          <FilterItem 
                            key={filter.id}
                            $selected={selectedFilter === filter.id}
                            onClick={() => handleFilterSelect(filter.id)}
                          >
                            <FilterPreview $baseColor={capturedPhotos[selectedPhotoIndex]}>
                              {filter.id !== 'normal' && (
                                <FilterOverlay 
                                  $color={filter.color} 
                                  $blendMode={filter.blendMode} 
                                />
                              )}
                            </FilterPreview>
                            <FilterName>{filter.name}</FilterName>
                          </FilterItem>
                        ))}
                      </FilterGrid>
                    </>
                  )}
                  
                  {activeTab === 'beautification' && (
                    <BeautificationControls 
                      onChange={handleBeautificationChange} 
                      isProcessing={isProcessingBeautification}
                    />
                  )}
                </FilterOptions>
              </ModalBody>
              
              <ModalFooter>
                {activeTab === 'beautification' && (
                  <Button 
                    onClick={() => applyBeautificationEffectsToPhoto(selectedPhotoIndex)}
                    variant="secondary"
                    size="medium"
                    disabled={isProcessingBeautification}
                    style={{ marginRight: 'auto' }}
                  >
                    Save Effects
                  </Button>
                )}
                <Button 
                  onClick={closePreviewModal}
                  variant="primary"
                  size="medium"
                >
                  Save Changes
                </Button>
              </ModalFooter>
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </PageContainer>
  );
};

export default CapturePage; 