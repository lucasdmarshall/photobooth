import { useEffect } from 'react';

// Import the sound file to ensure it's included in the build
import bubbleClickSound from '../../public/music/bubble-click.mp3';

/**
 * Custom hook that adds bubble sound effect to all clickable elements globally.
 * When this hook is used in a parent component, all interactive elements in the 
 * application will play the bubble sound when clicked.
 */
const useGlobalClickSound = () => {
  useEffect(() => {
    // Function to play the bubble sound
    const playBubbleSound = () => {
      try {
        const audio = new Audio(bubbleClickSound);
        audio.volume = 0.3; // 30% volume
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('Error playing bubble sound:', error);
          });
        }
      } catch (error) {
        console.error('Error creating bubble sound:', error);
      }
    };

    // This function will handle all click events in the document
    const handleGlobalClick = (event) => {
      // Check if the clicked element is an interactive element (button, link, etc.)
      const isInteractive = 
        event.target.tagName === 'BUTTON' ||
        event.target.tagName === 'A' ||
        event.target.role === 'button' ||
        event.target.closest('button') ||
        event.target.closest('a') ||
        event.target.closest('[role="button"]') ||
        event.target.closest('[class*="button"]') ||
        event.target.closest('[class*="Button"]');
      
      if (isInteractive) {
        playBubbleSound();
      }
    };

    // Add the global event listener
    document.addEventListener('click', handleGlobalClick, true);
    
    // Cleanup function
    return () => {
      document.removeEventListener('click', handleGlobalClick, true);
    };
  }, []);
};

export default useGlobalClickSound; 