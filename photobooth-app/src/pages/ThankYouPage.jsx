import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { usePhotobooth } from '../contexts/PhotoboothContext';

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

const ThankYouText = styled(motion.h1)`
  font-size: ${({ theme }) => theme.fontSizes.huge};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  text-align: center;
  z-index: 2;
`;

const Message = styled(motion.p)`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  max-width: 600px;
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
  z-index: 2;
`;

const CountdownText = styled(motion.div)`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: ${({ theme }) => theme.spacing.xxl};
  z-index: 2;
`;

const Confetti = styled(motion.div)`
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: ${({ $round }) => ($round ? '50%' : '2px')};
  background-color: ${({ color }) => color};
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
  background-color: ${({ theme, color }) => theme.colors[color] || theme.colors.primary}20;
  filter: blur(1px);
`;

// Generate confetti
const generateConfetti = (count) => {
  return Array.from({ length: count }).map((_, i) => {
    const colors = ['#FF9FD7', '#FFE5B4', '#BAF0FF', '#C1FFBA', '#D2BAFF'];
    return {
      id: i,
      x: Math.random() * 100 + '%',
      y: -20,
      size: Math.random() * 10 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      duration: Math.random() * 2 + 1,
      delay: Math.random() * 3,
      round: Math.random() > 0.5,
    };
  });
};

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

const ThankYouPage = () => {
  const { resetSession } = usePhotobooth();
  const [countdown, setCountdown] = useState(60);
  const [confetti] = useState(() => generateConfetti(40));
  
  // Countdown timer to return to idle
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          resetSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [resetSession]);

  return (
    <PageContainer>
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
      
      {confetti.map((conf) => (
        <Confetti
          key={conf.id}
          color={conf.color}
          $round={conf.round}
          style={{
            left: conf.x,
            top: conf.y,
            width: conf.size,
            height: conf.size,
          }}
          animate={{
            y: ['0vh', '100vh'],
            x: [conf.x, `calc(${conf.x} + ${(Math.random() * 200) - 100}px)`],
            rotate: [0, Math.random() * 360],
          }}
          transition={{
            duration: conf.duration,
            delay: conf.delay,
            ease: 'easeOut',
          }}
        />
      ))}

      <ThankYouText
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }}
      >
        Thank You!
      </ThankYouText>

      <Message
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        We hope you enjoyed your photo session! Have a wonderful day!
      </Message>
      
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 300, damping: 15 }}
        style={{ fontSize: '120px' }}
      >
        🎉
      </motion.div>

      <CountdownText
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        Returning to home in {countdown} seconds
      </CountdownText>
    </PageContainer>
  );
};

export default ThankYouPage; 