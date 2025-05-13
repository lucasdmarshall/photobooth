import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { usePhotobooth } from '../contexts/PhotoboothContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { QRCode } from 'react-qrcode-logo';

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

const QRCodeWrapper = styled.div`
  width: 200px;
  height: 200px;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  padding: 10px;
  border-radius: 8px;
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

// Function to generate a unique download ID
const generateDownloadId = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Function to convert photos to a downloadable format
const createDownloadablePhotos = (photos, templateId) => {
  // In a real implementation, this would upload the photos to a server
  // and return a URL to download them
  const downloadId = generateDownloadId();
  
  // Create multiple download options
  return {
    id: downloadId,
    // Direct data URL for QR code
    dataUrl: `data:text/plain;base64,${btoa(JSON.stringify({id: downloadId, timestamp: Date.now()}))}`,
    // Short URL for sharing
    url: `https://pbth.io/${downloadId}`,
    // Local URL for direct download on the same device
    localUrl: `${window.location.origin}/download.html?id=${downloadId}`,
    // Expiration date
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
  };
};

const DeliveryPage = () => {
  const { 
    sessionStep, 
    deliveryMethod,
    capturedPhotos,
    selectedPhotos,
    photoTemplate,
    selectDeliveryMethod
  } = usePhotobooth();
  
  const [downloadInfo, setDownloadInfo] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Generate QR code URL when the component mounts
  useEffect(() => {
    if (sessionStep === 'qr' && !downloadInfo) {
      setIsGenerating(true);
      
      // Simulate server processing
      setTimeout(() => {
        const photosToDownload = selectedPhotos.map(index => capturedPhotos[index]);
        const downloadData = createDownloadablePhotos(photosToDownload, photoTemplate);
        
        // Create a full URL for the QR code
        const baseUrl = window.location.origin;
        const fullUrl = `${baseUrl}/download.html?id=${downloadData.id}`;
        
        setDownloadInfo({
          ...downloadData,
          fullUrl,
          expiresText: new Date(downloadData.expiresAt).toLocaleString()
        });
        
        setIsGenerating(false);
      }, 1500);
    }
  }, [sessionStep, capturedPhotos, selectedPhotos, photoTemplate, downloadInfo]);
  
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
            Scan QR Code to Download
          </Title>
          
          <QRCodeContainer
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {isGenerating ? (
              <>
                <PrintingSpinner
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                <QRInstructions>
                  Generating your download link...
                </QRInstructions>
              </>
            ) : downloadInfo ? (
              <>
                <QRCodeWrapper>
                  <QRCode 
                    value={downloadInfo.dataUrl} // Use data URL for direct download
                    size={180}
                    qrStyle="dots"
                    eyeRadius={5}
                    logoImage="/logo.png"
                    removeQrCodeBehindLogo={true}
                    logoPadding={5}
                    logoWidth={40}
                    ecLevel="H"
                  />
                </QRCodeWrapper>
                <QRInstructions>
                  Scan with your smartphone camera to download your photos
                </QRInstructions>
                <QRInstructions style={{ marginTop: '10px', fontWeight: 'bold' }}>
                  Link expires: {downloadInfo.expiresText}
                </QRInstructions>
                
                {/* Direct download code for easy access */}
                <div style={{ 
                  marginTop: '20px', 
                  padding: '10px', 
                  backgroundColor: '#f0f0f0', 
                  borderRadius: '8px',
                  maxWidth: '250px',
                  margin: '20px auto 0'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Download Code:</div>
                  <div style={{ 
                    fontFamily: 'monospace', 
                    fontSize: '18px',
                    padding: '8px',
                    backgroundColor: '#fff',
                    borderRadius: '4px',
                    border: '1px dashed #ccc'
                  }}>
                    {downloadInfo.id.substring(0, 8).toUpperCase()}
                  </div>
                </div>
              </>
            ) : (
              <QRInstructions>
                Error generating QR code. Please try again.
              </QRInstructions>
            )}
          </QRCodeContainer>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '32px', maxWidth: '500px', margin: '32px auto 0' }}>
            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
              <h3>Download Options</h3>
              <p style={{ fontSize: '14px', color: '#666' }}>Choose the option that works best for your device</p>
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
              <Button
                onClick={() => {
                  if (downloadInfo) {
                    // Create a temporary anchor element to trigger download
                    const a = document.createElement('a');
                    a.href = downloadInfo.localUrl;
                    a.target = '_blank';
                    a.rel = 'noopener noreferrer';
                    a.click();
                  }
                }}
                disabled={!downloadInfo || isGenerating}
                style={{ flex: '1', minWidth: '200px' }}
              >
                <span role="img" aria-label="Computer">💻</span> Download on This Device
              </Button>
              
              <Button
                onClick={() => {
                  // Generate a text message with the download link
                  const smsBody = `Download your photobooth photos with code: ${downloadInfo?.id.substring(0, 8).toUpperCase()}`;
                  window.open(`sms:?&body=${encodeURIComponent(smsBody)}`);
                }}
                disabled={!downloadInfo || isGenerating}
                style={{ flex: '1', minWidth: '200px' }}
                variant="outline"
              >
                <span role="img" aria-label="Phone">📱</span> Text Link to Phone
              </Button>
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginTop: '10px' }}>
              <Button
                onClick={() => {
                  // Create a mailto link with the download info
                  const emailBody = `Download your photobooth photos with this link: ${downloadInfo?.url} or use code: ${downloadInfo?.id.substring(0, 8).toUpperCase()}`;
                  window.open(`mailto:?subject=Your%20Photobooth%20Photos&body=${encodeURIComponent(emailBody)}`);
                }}
                disabled={!downloadInfo || isGenerating}
                style={{ flex: '1', minWidth: '200px' }}
                variant="outline"
              >
                <span role="img" aria-label="Email">📧</span> Email Link to Yourself
              </Button>
              
              <Button
                onClick={() => selectDeliveryMethod('print')}
                style={{ flex: '1', minWidth: '200px' }}
              >
                <span role="img" aria-label="Print">🖨️</span> Print Photos Instead
              </Button>
            </div>
          </div>
        </>
      );
    }
  };
  
  return (
    <PageContainer>
      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>
    </PageContainer>
  );
};

export default DeliveryPage; 