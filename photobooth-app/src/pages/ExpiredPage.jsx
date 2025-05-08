import React, { useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { usePhotobooth } from '../contexts/PhotoboothContext';
import Button from '../components/ui/Button';

const PageContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.xl};
`;

const ExpiredCard = styled(motion.div)`
  background-color: white;
  border-radius: ${({ theme }) => theme.borderRadius.large};
  padding: ${({ theme }) => theme.spacing.xxl};
  box-shadow: ${({ theme }) => theme.shadows.large};
  max-width: 500px;
  width: 90%;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Icon = styled(motion.div)`
  font-size: 80px;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.error};
`;

const Title = styled(motion.h1)`
  font-size: ${({ theme }) => theme.fontSizes.xxl};
  color: ${({ theme }) => theme.colors.error};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Message = styled(motion.p)`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  line-height: 1.5;
`;

const ExpiredPage = () => {
  const { resetSession } = usePhotobooth();
  
  // Automatically reset session after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      resetSession();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [resetSession]);
  
  // Card animation variants
  const cardVariants = {
    hidden: { 
      scale: 0.8,
      opacity: 0 
    },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: 'spring',
        stiffness: 300,
        damping: 20,
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  // Children animation variants
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 20 }
    }
  };
  
  return (
    <PageContainer>
      <ExpiredCard
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <Icon
          variants={itemVariants}
          animate={{ 
            rotate: [0, 10, -10, 10, -10, 0],
            transition: { 
              repeat: 2,
              duration: 0.5, 
              delay: 0.3 
            }
          }}
        >
          ⏰
        </Icon>
        <Title variants={itemVariants}>
          Session Expired
        </Title>
        <Message variants={itemVariants}>
          Your session time has expired. Please start a new session to continue creating your photos.
        </Message>
        <Button 
          onClick={resetSession}
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Return to Home
        </Button>
      </ExpiredCard>
    </PageContainer>
  );
};

export default ExpiredPage; 