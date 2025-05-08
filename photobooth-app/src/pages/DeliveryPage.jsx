import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { usePhotobooth } from '../contexts/PhotoboothContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Timer from '../components/ui/Timer';

const PageContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.xl};
  position: relative;
`;

const Title = styled(motion.h1)`
  font-size: ${({ theme }) => theme.fontSizes.xxl};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  text-align: center;
`;

const OptionsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xl};
  margin-top: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const OptionCard = styled(Card)`
  width: 300px;
  padding: ${({ theme }) => theme.spacing.xl};
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.medium};
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${({ theme }) => theme.shadows.large};
  }
`;

const OptionIcon = styled.div`
  font-size: 64px;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const OptionTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const OptionDescription = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const QRCodeContainer = styled(motion.div)`
  width: 300px;
  height: 300px;
  background-color: white;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

const QRCode = styled.div`
  width: 200px;
  height: 200px;
  background-color: #000;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  
  /* Fake QR code pattern */
  background-image: linear-gradient(
    to right,
    transparent 0%, transparent 40%,
    white 40%, white 60%,
    transparent 60%, transparent 100%
  ),
  linear-gradient(
    to bottom,
    transparent 0%, transparent 40%,
    white 40%, white 60%,
    transparent 60%, transparent 100%
  );
  background-size: 20px 20px;
  position: relative;
  
  &:before, &:after {
    content: '';
    position: absolute;
    width: 60px;
    height: 60px;
    background-color: #000;
    border: 8px solid white;
  }
  
  &:before {
    top: 10px;
    left: 10px;
  }
  
  &:after {
    top: 10px;
    right: 10px;
  }
`;

const QRInstructions = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
`;

const PrintingMessage = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.xxl};
`;

const PrintingIcon = styled(motion.div)`
  font-size: 64px;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const PrintingText = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const PrintingSpinner = styled(motion.div)`
  width: 40px;
  height: 40px;
  border: 4px solid ${({ theme }) => theme.colors.primary}30;
  border-top: 4px solid ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  margin: ${({ theme }) => theme.spacing.md} 0;
`;

const DeliveryPage = () => {
  const { 
    sessionStep, 
    deliveryMethod, 
    qrCodeUrl, 
    selectDeliveryMethod,
    sessionTimeRemaining
  } = usePhotobooth();
  
  // Render different content based on the current delivery step
  const renderContent = () => {
    if (sessionStep === 'delivery') {
      return (
        <>
          <Title
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            Choose Delivery Method
          </Title>
          
          <OptionsContainer>
            <OptionCard
              as={motion.div}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => selectDeliveryMethod('print')}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <OptionIcon>🖨️</OptionIcon>
              <OptionTitle>Print Photos</OptionTitle>
              <OptionDescription>
                Get physical copies of your photos to take home
              </OptionDescription>
              <Button>Print (2 copies)</Button>
            </OptionCard>
            
            <OptionCard
              as={motion.div}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => selectDeliveryMethod('qr')}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <OptionIcon>📱</OptionIcon>
              <OptionTitle>Digital Copy</OptionTitle>
              <OptionDescription>
                Scan QR code to download digital copies to your phone
              </OptionDescription>
              <Button variant="outline">Get QR Code</Button>
            </OptionCard>
          </OptionsContainer>
        </>
      );
    } else if (sessionStep === 'printing') {
      return (
        <PrintingMessage
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <PrintingIcon
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            🖨️
          </PrintingIcon>
          <PrintingText>Please Wait</PrintingText>
          <p>Your photos are printing...</p>
          <PrintingSpinner
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </PrintingMessage>
      );
    } else if (sessionStep === 'qr') {
      return (
        <>
          <Title
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            Scan QR Code
          </Title>
          
          <QRCodeContainer
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <QRCode />
            <QRInstructions>
              Scan with your smartphone camera to download your photos
            </QRInstructions>
          </QRCodeContainer>
          
          <Button
            onClick={() => selectDeliveryMethod('print')}
            style={{ marginTop: '32px' }}
            variant="outline"
          >
            I'd like to print too
          </Button>
        </>
      );
    }
  };
  
  return (
    <PageContainer>
      <Timer initialTime={sessionTimeRemaining} />
      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>
    </PageContainer>
  );
};

export default DeliveryPage; 