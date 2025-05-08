import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import { usePhotobooth } from '../contexts/PhotoboothContext';

const IdleContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}20, ${({ theme }) => theme.colors.secondary}30);
  overflow: hidden;
  position: relative;
`;

const BoothName = styled(motion.h1)`
  font-size: ${({ theme }) => theme.fontSizes.huge};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  text-align: center;
  text-shadow: 3px 3px 0px ${({ theme }) => theme.colors.accent3}60;
  z-index: 2;
`;

const StartButton = styled(Button)`
  z-index: 2;
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.xxl}`};
  font-size: ${({ theme }) => theme.fontSizes.xl};
`;

const FloatingItems = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
`;

const FloatingItem = styled(motion.div)`
  position: absolute;
  border-radius: ${({ theme }) => theme.borderRadius.circle};
  background-color: ${({ theme, color }) => theme.colors[color] || theme.colors.primary}40;
  filter: blur(2px);
`;

const BottomText = styled(motion.p)`
  position: absolute;
  bottom: ${({ theme }) => theme.spacing.xl};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  width: 100%;
  z-index: 2;
`;

// Floating bubble animation items
const floatingItems = [
  { size: 100, color: 'primary', initialX: '10%', initialY: '20%', duration: 12 },
  { size: 150, color: 'secondary', initialX: '70%', initialY: '15%', duration: 15 },
  { size: 80, color: 'accent1', initialX: '40%', initialY: '80%', duration: 10 },
  { size: 120, color: 'accent2', initialX: '80%', initialY: '60%', duration: 18 },
  { size: 200, color: 'accent3', initialX: '20%', initialY: '60%', duration: 20 },
  { size: 60, color: 'primary', initialX: '60%', initialY: '30%', duration: 8 },
  { size: 90, color: 'secondary', initialX: '30%', initialY: '40%', duration: 14 },
];

const titleAnimation = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: { 
      type: 'spring',
      stiffness: 300,
      damping: 15,
      delay: 0.3
    }
  }
};

const buttonAnimation = {
  initial: { y: 50, opacity: 0 },
  animate: { 
    y: 0, 
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 15,
      delay: 0.6
    }
  },
  whileHover: { 
    scale: 1.05,
    transition: { 
      type: 'spring', 
      stiffness: 400, 
      damping: 10 
    } 
  },
  whileTap: { scale: 0.95 }
};

const IdlePage = () => {
  const { startSession } = usePhotobooth();

  return (
    <IdleContainer>
      <FloatingItems>
        {floatingItems.map((item, index) => (
          <FloatingItem
            key={index}
            color={item.color}
            style={{ 
              width: item.size, 
              height: item.size,
              left: item.initialX,
              top: item.initialY,
            }}
            animate={{
              x: [0, 30, -30, 0],
              y: [0, -30, 30, 0],
              scale: [1, 1.1, 0.9, 1],
            }}
            transition={{
              repeat: Infinity,
              duration: item.duration,
              ease: 'easeInOut',
              times: [0, 0.33, 0.66, 1]
            }}
          />
        ))}
      </FloatingItems>

      <BoothName
        variants={titleAnimation}
        initial="initial"
        animate="animate"
      >
        Cute Photo Booth
      </BoothName>

      <StartButton 
        size="large" 
        onClick={startSession}
        variants={buttonAnimation}
        initial="initial"
        animate="animate"
        whileHover="whileHover"
        whileTap="whileTap"
      >
        Tap to Begin
      </StartButton>

      <BottomText
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
      >
        Touch the screen to create your memories ✨
      </BottomText>
    </IdleContainer>
  );
};

export default IdlePage; 