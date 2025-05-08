import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { usePhotobooth } from '../contexts/PhotoboothContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const PageContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xl};
  background-color: ${({ theme }) => theme.colors.background};
`;

const PaymentCard = styled(Card)`
  max-width: 600px;
  width: 90%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xxl};
`;

const Title = styled(motion.h1)`
  font-size: ${({ theme }) => theme.fontSizes.xxl};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  text-align: center;
`;

const Amount = styled(motion.div)`
  font-size: ${({ theme }) => theme.fontSizes.huge};
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
  margin: ${({ theme }) => theme.spacing.xxl} 0;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:before {
    content: '$';
    font-size: ${({ theme }) => theme.fontSizes.xl};
    margin-right: ${({ theme }) => theme.spacing.xxs};
    align-self: flex-start;
    margin-top: ${({ theme }) => theme.spacing.xs};
  }
`;

const Instructions = styled(motion.p)`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  text-align: center;
  line-height: 1.5;
`;

const PaymentMethods = styled(motion.div)`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin: ${({ theme }) => theme.spacing.lg} 0;
`;

const PaymentMethod = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  background-color: ${({ theme }) => theme.colors.background};
  border: 2px solid ${({ theme }) => theme.colors.primary}60;
  width: 100px;
  height: 100px;
`;

const PaymentIcon = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const PaymentLabel = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textPrimary};
  text-align: center;
`;

const SuccessMessage = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const SuccessIcon = styled(motion.div)`
  font-size: 72px;
  color: ${({ theme }) => theme.colors.success};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const SuccessText = styled(motion.h2)`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  color: ${({ theme }) => theme.colors.success};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  text-align: center;
`;

// For demonstration purposes - simulate payment
const simulatePayment = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 2000);
  });
};

const PaymentPage = () => {
  const { selectedQuantity, getPrice, processPayment } = usePhotobooth();
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  const price = getPrice(selectedQuantity);
  
  const handlePayment = async () => {
    setProcessing(true);
    
    // Simulate payment process
    const success = await simulatePayment();
    
    if (success) {
      setPaymentSuccess(true);
      
      // Wait a moment to show success message before proceeding
      setTimeout(() => {
        processPayment(true);
      }, 1500);
    } else {
      setProcessing(false);
      // Handle payment failure
    }
  };
  
  return (
    <PageContainer>
      <PaymentCard>
        <AnimatePresence mode="wait">
          {!paymentSuccess ? (
            <motion.div
              key="payment"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <Title
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                Payment
              </Title>
              
              <Amount
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {price.toFixed(2)}
              </Amount>
              
              <Instructions
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Please insert cash or check to begin your photo session.
                <br />
                Your package includes {selectedQuantity} final photos.
              </Instructions>
              
              <PaymentMethods
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <PaymentMethod
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <PaymentIcon>💵</PaymentIcon>
                  <PaymentLabel>Cash</PaymentLabel>
                </PaymentMethod>
                
                <PaymentMethod
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <PaymentIcon>🧾</PaymentIcon>
                  <PaymentLabel>Check</PaymentLabel>
                </PaymentMethod>
              </PaymentMethods>
              
              {/* This button is for demo purposes only, in a real booth this would be triggered by the hardware */}
              <Button 
                onClick={handlePayment}
                disabled={processing}
                style={{ marginTop: '32px' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {processing ? 'Processing...' : 'Simulate Payment'}
              </Button>
            </motion.div>
          ) : (
            <SuccessMessage
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <SuccessIcon
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                ✅
              </SuccessIcon>
              <SuccessText>Payment Successful!</SuccessText>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                style={{ textAlign: 'center', color: '#666' }}
              >
                Getting your photo session ready...
              </motion.p>
            </SuccessMessage>
          )}
        </AnimatePresence>
      </PaymentCard>
    </PageContainer>
  );
};

export default PaymentPage; 