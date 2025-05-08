import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { usePhotobooth } from '../../contexts/PhotoboothContext';
import useFullscreen from '../../hooks/useFullscreen';

const OverlayContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${({ theme }) => theme.spacing.xl};
  text-align: center;
`;

const IndicatorButton = styled(motion.button)`
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.xl}`};
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: bold;
  margin-top: ${({ theme }) => theme.spacing.xl};
  gap: ${({ theme }) => theme.spacing.md};
  /* Touch-specific styles */
  min-height: 60px;
  min-width: 200px;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
`;

const FullscreenIcon = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xl};
`;

const Title = styled(motion.h2)`
  color: white;
  font-size: ${({ theme }) => theme.fontSizes.xxl};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Description = styled(motion.p)`
  color: white;
  font-size: ${({ theme }) => theme.fontSizes.md};
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
  max-width: 600px;
`;

const FullscreenIndicator = () => {
  const { isFullscreen } = usePhotobooth();
  const { enterFullscreen } = useFullscreen();

  // Don't show if we're already in fullscreen
  if (isFullscreen) return null;

  return (
    <OverlayContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Title
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Fullscreen Mode Required
      </Title>
      
      <Description
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        For the best photobooth experience, this application needs to run in fullscreen mode. 
        Tap the button below to continue in fullscreen.
      </Description>
      
      <IndicatorButton
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6, type: 'spring', stiffness: 300 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={enterFullscreen}
      >
        <FullscreenIcon>⤢</FullscreenIcon>
        <span>Enter Fullscreen</span>
      </IndicatorButton>
    </OverlayContainer>
  );
};

export default FullscreenIndicator; 