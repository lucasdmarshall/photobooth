import React, { useEffect, useRef } from 'react';

// Import the background music file to ensure it's included in the build
import backgroundMusic from '../../../public/music/bubblegum-pop-bubblegum-delight-20-214875.mp3';

// Background music component that plays looping audio at 10% volume
const BackgroundMusic = () => {
  const audioRef = useRef(null);

  useEffect(() => {
    // Create audio element programmatically
    const audio = new Audio(backgroundMusic);
    audioRef.current = audio;
    
    // Configure audio settings
    audio.loop = true;
    audio.volume = 0.1; // 10% volume
    
    // Start audio on first user interaction
    const handleUserInteraction = () => {
      try {
        console.log('User interaction detected, attempting to play audio');
        // We need to try to play within the event handler
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
          playPromise.then(() => {
            console.log('Audio playback started successfully');
            // Remove event listeners after successful playback
            document.removeEventListener('click', handleUserInteraction, true);
            document.removeEventListener('touchstart', handleUserInteraction, true);
            document.removeEventListener('keydown', handleUserInteraction, true);
          }).catch(error => {
            console.error('Audio playback failed:', error);
          });
        }
      } catch (e) {
        console.error('Audio playback attempt failed:', e);
      }
    };
    
    // Add event listeners with capture to ensure they fire first
    document.addEventListener('click', handleUserInteraction, true);
    document.addEventListener('touchstart', handleUserInteraction, true);
    document.addEventListener('keydown', handleUserInteraction, true);
    
    // Cleanup
    return () => {
      document.removeEventListener('click', handleUserInteraction, true);
      document.removeEventListener('touchstart', handleUserInteraction, true);
      document.removeEventListener('keydown', handleUserInteraction, true);
      
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);
  
  return null;
};

export default BackgroundMusic;