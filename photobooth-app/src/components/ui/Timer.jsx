import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const TimerContainer = styled(motion.div)`
  position: fixed;
  top: ${({ theme }) => theme.spacing.md};
  right: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme, $warning }) => 
    $warning ? theme.colors.warning : theme.colors.primary};
  color: white;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
  font-weight: bold;
  font-size: ${({ theme }) => theme.fontSizes.md};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  z-index: 100;
  transition: background-color 0.3s ease;
`;

const TimerText = styled.span`
  display: flex;
  align-items: center;
`;

const TimerIcon = styled.span`
  margin-right: ${({ theme }) => theme.spacing.xs};
  display: inline-block;
  ${({ $pulse }) => $pulse && `
    animation: pulse 1s infinite;
  `}
  
  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.3;
    }
    100% {
      opacity: 1;
    }
  }
`;

const formatTime = (seconds) => {
  return String(seconds);
};

const Timer = ({ 
  initialTime = 300, 
  onTimeUp,
  isActive = true,
  ...props 
}) => {
  const [time, setTime] = useState(initialTime);
  const [isPulsing, setIsPulsing] = useState(false);
  
  // Reset timer if initialTime changes
  useEffect(() => {
    setTime(initialTime);
  }, [initialTime]);
  
  useEffect(() => {
    let interval;
    
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime(prevTime => {
          const newTime = prevTime - 1;
          // Start pulsing in the last 30 seconds
          if (newTime <= 30 && !isPulsing) {
            setIsPulsing(true);
          }
          return newTime;
        });
      }, 1000);
    } else if (time === 0 && onTimeUp) {
      onTimeUp();
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [time, isActive, onTimeUp, isPulsing]);

  // Show warning color when less than 60 seconds remaining
  const isWarning = time <= 60;
  
  return (
    <TimerContainer 
      $warning={isWarning}
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -50, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      {...props}
    >
      <TimerText>
        <TimerIcon $pulse={isPulsing}>⏱️</TimerIcon>
        {formatTime(time)}
      </TimerText>
    </TimerContainer>
  );
};

export default Timer; 