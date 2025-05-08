import { useCallback, useEffect, useRef } from 'react';

// Import the sound file to ensure it's included in the build
import bubbleClickSound from '../../public/music/bubble-click.mp3';

/**
 * Custom hook for playing a bubble sound effect
 * @param {number} volume - Volume level from 0 to 1 (default: 0.3)
 * @returns {Function} - Function to trigger the bubble sound
 */
const useBubbleSound = (volume = 0.3) => {
  const audioRef = useRef(null);
  
  // Initialize audio on first render
  useEffect(() => {
    // Create audio element and preload it
    const audio = new Audio(bubbleClickSound);
    audio.volume = volume;
    audio.preload = 'auto';
    audioRef.current = audio;
    
    // Clean up on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, [volume]);
  
  // Function to play the bubble sound
  const playBubbleSound = useCallback(() => {
    try {
      if (audioRef.current) {
        // Reset the audio to start (in case it was already playing)
        audioRef.current.currentTime = 0;
        
        // Play the sound
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('Error playing bubble sound:', error);
          });
        }
      }
    } catch (error) {
      console.error('Error playing bubble sound:', error);
    }
  }, []);
  
  return playBubbleSound;
};

export default useBubbleSound; 