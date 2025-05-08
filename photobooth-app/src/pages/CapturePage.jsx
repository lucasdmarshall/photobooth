import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { usePhotobooth } from '../contexts/PhotoboothContext';
import Button from '../components/ui/Button';
import BubbleButton from '../components/ui/BubbleButton';
import Card from '../components/ui/Card';
import Timer from '../components/ui/Timer';

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
  margin-bottom: ${({ theme }) => theme.spacing.lg};
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

const CaptureMethodsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xl};
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

const CaptureMethod = styled(Card)`
  width: 250px;
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  text-align: center;
  transition: all ${({ theme }) => theme.transitions.medium};
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${({ theme }) => theme.shadows.large};
  }
`;

const MethodIcon = styled.div`
  font-size: 64px;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const MethodTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const MethodDescription = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const TimerOptionsContainer = styled(motion.div)`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

const TimerOption = styled(BubbleButton)`
  min-width: 80px;
`;

const CameraViewfinder = styled(motion.div)`
  width: 80vw;
  height: 60vh;
  max-width: 900px;
  max-height: 600px;
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
  }
`;

const MockCamera = styled.div`
  color: white;
  font-size: ${({ theme }) => theme.fontSizes.lg};
  text-align: center;
  opacity: 0.5;
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

const PhotoCount = styled.span`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
`;

// Demo purposes - simulate camera with random colored backgrounds
const getRandomColor = () => {
  const colors = [
    'hsl(340, 82%, 76%)',
    'hsl(316, 73%, 66%)',
    'hsl(290, 69%, 70%)',
    'hsl(262, 80%, 77%)',
    'hsl(231, 67%, 74%)',
    'hsl(207, 67%, 68%)',
    'hsl(199, 69%, 72%)',
    'hsl(152, 53%, 68%)',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Function to play sound effects
const playSound = (soundName) => {
  try {
    let audioSrc;
    
    // Use the imported sound files
    switch(soundName) {
      case '1':
        audioSrc = sound1;
        break;
      case '2':
        audioSrc = sound2;
        break;
      case '3':
        audioSrc = sound3;
        break;
      case 'smile':
        audioSrc = smileSound;
        break;
      default:
        console.error(`Sound file for ${soundName} not found`);
        return;
    }
    
    const audio = new Audio(audioSrc);
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

const CapturePage = () => {
  const { 
    selectedQuantity, 
    captureMethod, 
    timerDuration, 
    capturedPhotos,
    selectCaptureMethod, 
    capturePhoto,
    sessionTimeRemaining
  } = usePhotobooth();
  
  const [step, setStep] = useState(captureMethod ? 'capture' : 'select-method');
  const [showTimerOptions, setShowTimerOptions] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const countdownRef = useRef(null);
  
  // Add a ref to track if a capture is in progress
  const captureInProgressRef = useRef(false);
  // Add a ref to track the previous countdown value
  const prevCountdownRef = useRef(null);
  
  // Always capture exactly 8 photos regardless of selected quantity
  const totalPhotosToCapture = 8;
  
  // Effect to play sounds based on countdown value
  useEffect(() => {
    // Only play sound if the countdown is active and has changed
    if (countdown > 0 && countdown !== prevCountdownRef.current) {
      // Play the countdown sound (3, 2, 1)
      if (countdown <= 3) {
        playSound(countdown.toString());
      }
    }
    
    // Update the previous countdown value
    prevCountdownRef.current = countdown;
  }, [countdown]);
  
  const handleSelectMethod = (method) => {
    if (method === 'manual') {
      selectCaptureMethod('manual');
      setStep('capture');
    } else if (method === 'timer') {
      setShowTimerOptions(true);
    }
  };
  
  const handleSelectTimer = (duration) => {
    selectCaptureMethod('timer', duration);
    setShowTimerOptions(false);
    setStep('capture');
  };
  
  const startCapture = () => {
    console.log("startCapture called, isCapturing:", isCapturing, "timerActive:", timerActive, "captureInProgress:", captureInProgressRef.current);
    
    // Use the ref to ensure we don't start multiple captures
    if (isCapturing || timerActive || captureInProgressRef.current) {
      console.log("Preventing duplicate startCapture");
      return;
    }
    
    if (captureMethod === 'manual') {
      // For manual capture, just take a photo immediately
      handleCapture();
    } else if (captureMethod === 'timer' && timerDuration) {
      // For timer, start countdown
      setTimerActive(true);
      setCountdown(timerDuration);
      
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
      
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          console.log("Countdown:", prev);
          if (prev <= 1) {
            console.log("Countdown complete, clearing interval");
            clearInterval(countdownRef.current);
            
            // We need to make sure we only call handleCapture once
            if (!captureInProgressRef.current) {
              console.log("Initiating capture from countdown");
              handleCapture();
            } else {
              console.log("Capture already in progress, skipping");
            }
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };
  
  const handleCapture = () => {
    console.log("handleCapture called, isCapturing:", isCapturing, "captureInProgress:", captureInProgressRef.current);
    
    // Double protection: check both the state and the ref
    if (isCapturing || captureInProgressRef.current) {
      console.log("Preventing duplicate handleCapture");
      return;
    }
    
    // Set both the state and the ref
    setIsCapturing(true);
    captureInProgressRef.current = true;
    
    console.log("Capture started");
    
    // Play the "smile" sound when taking the photo
    playSound("smile");
    
    // Simulate camera capture flash and delay
    setTimeout(() => {
      try {
        console.log("Creating photo");
        // Create a fake photo (in real app, this would be from the camera)
        const photoData = getRandomColor();
        
        console.log("Calling capturePhoto");
        capturePhoto(photoData);
        
        console.log("Capture complete");
      } catch (error) {
        console.error("Error during capture:", error);
      } finally {
        // Always reset the capture states, even if there was an error
        setIsCapturing(false);
        setTimerActive(false);
        captureInProgressRef.current = false;
        console.log("Reset capture states");
      }
    }, 500);
  };
  
  // Clean up countdown timer on unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);
  
  return (
    <PageContainer>
      <Timer initialTime={sessionTimeRemaining} />
      
      <AnimatePresence mode="wait">
        {step === 'select-method' && (
          <StepContainer
            key="select-method"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <Title>How would you like to take photos?</Title>
            
            <CaptureMethodsContainer>
              <CaptureMethod
                as={motion.div}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSelectMethod('manual')}
              >
                <MethodIcon>📸</MethodIcon>
                <MethodTitle>Manual Capture</MethodTitle>
                <MethodDescription>
                  Press the button whenever you're ready to take a photo
                </MethodDescription>
              </CaptureMethod>
              
              <CaptureMethod
                as={motion.div}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSelectMethod('timer')}
              >
                <MethodIcon>⏱️</MethodIcon>
                <MethodTitle>Timer</MethodTitle>
                <MethodDescription>
                  Set a timer to automatically take photos after countdown
                </MethodDescription>
              </CaptureMethod>
            </CaptureMethodsContainer>
            
            <AnimatePresence>
              {showTimerOptions && (
                <TimerOptionsContainer
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                >
                  <TimerOption onClick={() => handleSelectTimer(3)}>3s</TimerOption>
                  <TimerOption onClick={() => handleSelectTimer(5)}>5s</TimerOption>
                  <TimerOption onClick={() => handleSelectTimer(10)}>10s</TimerOption>
                </TimerOptionsContainer>
              )}
            </AnimatePresence>
          </StepContainer>
        )}
        
        {step === 'capture' && (
          <StepContainer
            key="capture"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <Title>Let's take some photos!</Title>
            
            <CameraViewfinder>
              <CameraFeed>
                <MockCamera>Camera Preview</MockCamera>
              </CameraFeed>
              
              <AnimatePresence>
                {isCapturing && (
                  <CaptureOverlay
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
                
                {countdown > 0 && (
                  <CountdownOverlay
                    key="countdown"
                    initial={{ scale: 1.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                  >
                    {countdown}
                  </CountdownOverlay>
                )}
              </AnimatePresence>
            </CameraViewfinder>
            
            <PhotoInfo>
              <PhotoCount>{capturedPhotos.length}</PhotoCount> of <PhotoCount>{totalPhotosToCapture}</PhotoCount> photos taken
            </PhotoInfo>
            
            {captureMethod === 'manual' && (
              <BubbleCaptureButton
                onClick={startCapture}
                disabled={isCapturing}
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.1 }}
              />
            )}
            
            {captureMethod === 'timer' && capturedPhotos.length < totalPhotosToCapture && countdown === 0 && (
              <BubbleButton
                onClick={startCapture}
                style={{ marginTop: '32px' }}
                disabled={isCapturing || timerActive}
              >
                Start {timerDuration}s Timer
              </BubbleButton>
            )}
          </StepContainer>
        )}
      </AnimatePresence>
    </PageContainer>
  );
};

export default CapturePage; 