import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { usePhotobooth } from '../contexts/PhotoboothContext';
import Button from '../components/ui/Button';

// Page container
const PageContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.xl};
  position: relative;
  overflow: hidden;
`;

// Title styles
const Title = styled(motion.h1)`
  font-size: ${({ theme }) => theme.fontSizes.xxl};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  text-align: center;
`;

// Subtitle styles
const Subtitle = styled(motion.p)`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
  text-align: center;
  max-width: 700px;
`;

// Carousel container
const CarouselContainer = styled.div`
  width: 100%;
  max-width: 1000px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

// Carousel controls
const CarouselControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  gap: ${({ theme }) => theme.spacing.xl};
`;

// Carousel button
const CarouselButton = styled.button`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  font-size: ${({ theme }) => theme.fontSizes.xl};
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: ${({ theme }) => theme.shadows.large};
  }
  
  &:disabled {
    background-color: ${({ theme }) => theme.colors.textSecondary};
    opacity: 0.5;
    cursor: not-allowed;
    transform: scale(1);
    box-shadow: none;
  }
`;

// Template name
const TemplateName = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0;
  text-align: center;
`;

// Preview section
const PreviewSection = styled.div`
  width: 100%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

// Preview container
const Preview = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
`;

// Next button container
const NextButtonContainer = styled(motion.div)`
  position: fixed;
  bottom: ${({ theme }) => theme.spacing.xl};
  right: ${({ theme }) => theme.spacing.xl};
  z-index: 10;
`;

// Next button
const NextButton = styled(motion.button)`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  font-size: ${({ theme }) => theme.fontSizes.xxl};
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.large};
  transition: all 0.2s ease;
`;

// Add floating animation and Hello Kitty styles
const FloatingStyles = createGlobalStyle`
  @keyframes float {
    0% {
      transform: translateY(0px) rotate3d(0, 1, 1, 0deg);
    }
    50% {
      transform: translateY(-10px) rotate3d(0, 1, 1, 2deg);
    }
    100% {
      transform: translateY(0px) rotate3d(0, 1, 1, 0deg);
    }
  }
  
  @keyframes twinkle {
    0% { opacity: 0.7; }
    50% { opacity: 1; }
    100% { opacity: 0.7; }
  }
  
  .floating-container {
    perspective: 1000px;
    transform-style: preserve-3d;
    animation: float 6s ease-in-out infinite;
  }
  
  .hello-kitty-star {
    animation: twinkle 2s ease-in-out infinite;
  }
  
  .hello-kitty-heart {
    animation: twinkle 3s ease-in-out infinite;
  }
`;

// Define available filters
const filters = [
  { id: 'normal', name: 'Normal', color: null, blendMode: 'normal' },
  { id: 'bw', name: 'B&W', color: '#000000', blendMode: 'saturation' },
];

// Define available templates
const templates = {
  // Templates for 1x4 layout (4 photos vertically)
  '1x4': [
    { id: 'standard_strip', name: 'Black and White', layout: '1x4', color: '#000000', image: null },
    { id: 'blue_mood', name: 'Blue Mood', layout: '1x4', color: '#e3f2fd', image: null },
  ],
  
  // Templates for 1x2 layout (2 photos vertically)
  '1x2': [
    { id: 'vertical_duo', name: 'Vertical Duo', layout: '1x2', color: '#f8f8f8', image: null },
  ],
  
  // Templates for 2x1 layout (2 photos horizontally)
  '2x1': [
    { id: 'horizontal_duo', name: 'Horizontal Duo', layout: '2x1', color: '#f8f8f8', image: null },
  ]
};

// Animation variants
const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

const slideUpVariants = {
  hidden: { y: -30, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

// Photo Strip Component
const PhotoStrip = memo(({ photos, photoCount, templateId, photoFilters = [], selectedPhotos = [] }) => {
  // Determine if we're showing a half strip (2 photos) or full strip (4 photos)
  const isHalfStrip = photoCount === 2;
  
  // Convert inches to pixels (assuming 96 DPI for screen display)
  const stripWidth = 192; // 2 inches at 96 DPI
  const stripHeight = isHalfStrip ? 288 : 576; // 3 or 6 inches at 96 DPI
  
  // Render a photo with its filter
  const renderPhoto = (photo, index) => {
    const photoIndex = selectedPhotos[index] || index;
    const appliedFilter = photoFilters[photoIndex];
    const isBlackAndWhite = templateId === 'standard_strip' || appliedFilter === 'bw';
    
    return (
      <div 
        key={index} 
        style={{
          flex: '1',
          width: '100%',
          position: 'relative',
          backgroundColor: '#000000',
          overflow: 'hidden'
        }}
      >
        {photo && (
          <img 
            src={photo}
            alt={`Photo ${index + 1}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              filter: isBlackAndWhite ? 'grayscale(100%)' : 'none'
            }}
          />
        )}
        
        {/* Photo number indicator */}
        <div style={{
          position: 'absolute',
          bottom: '5px',
          right: '5px',
          backgroundColor: 'rgba(0,0,0,0.5)',
          color: 'white',
          borderRadius: '50%',
          width: '20px',
          height: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          {index + 1}
        </div>
      </div>
    );
  };

  // Hello Kitty border elements
  const renderHelloKittyBorder = () => {
    return (
      <>
        {/* Top left corner - Hello Kitty face */}
        <div style={{
          position: 'absolute',
          top: '-20px',
          left: '-20px',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: 'white',
          border: '2px solid #FF69B4',
          zIndex: 10,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden'
        }}>
          {/* Hello Kitty face */}
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {/* Eyes */}
            <div style={{
              position: 'absolute',
              top: '12px',
              left: '8px',
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              backgroundColor: 'black'
            }} />
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '8px',
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              backgroundColor: 'black'
            }} />
            {/* Nose */}
            <div style={{
              position: 'absolute',
              top: '18px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              backgroundColor: '#FFCC00'
            }} />
            {/* Whiskers */}
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '6px',
              width: '8px',
              height: '1px',
              backgroundColor: 'black'
            }} />
            <div style={{
              position: 'absolute',
              top: '22px',
              left: '6px',
              width: '8px',
              height: '1px',
              backgroundColor: 'black'
            }} />
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '6px',
              width: '8px',
              height: '1px',
              backgroundColor: 'black'
            }} />
            <div style={{
              position: 'absolute',
              top: '22px',
              right: '6px',
              width: '8px',
              height: '1px',
              backgroundColor: 'black'
            }} />
          </div>
        </div>
        
        {/* Top right corner - Bow */}
        <div style={{
          position: 'absolute',
          top: '-15px',
          right: '-15px',
          width: '30px',
          height: '30px',
          zIndex: 10,
        }}>
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '5px',
            width: '20px',
            height: '10px',
            backgroundColor: '#FF69B4',
            borderRadius: '5px',
            transform: 'rotate(45deg)'
          }} />
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '5px',
            width: '20px',
            height: '10px',
            backgroundColor: '#FF69B4',
            borderRadius: '5px',
            transform: 'rotate(-45deg)'
          }} />
          <div style={{
            position: 'absolute',
            top: '15px',
            left: '12px',
            width: '6px',
            height: '6px',
            backgroundColor: '#FFCC00',
            borderRadius: '50%',
          }} />
        </div>
        
        {/* Bottom corners - Hearts */}
        <div style={{
          position: 'absolute',
          bottom: '-15px',
          left: '-15px',
          width: '30px',
          height: '30px',
          zIndex: 10,
        }}>
          <div style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            color: '#FF69B4',
            fontSize: '24px',
            textAlign: 'center',
            lineHeight: '30px'
          }}>♥</div>
        </div>
        
        <div style={{
          position: 'absolute',
          bottom: '-15px',
          right: '-15px',
          width: '30px',
          height: '30px',
          zIndex: 10,
        }}>
          <div style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            color: '#FF69B4',
            fontSize: '24px',
            textAlign: 'center',
            lineHeight: '30px'
          }}>♥</div>
        </div>
        
        {/* Border decorations */}
        {[0, 1, 2, 3].map(index => (
          <div key={`star-${index}`} style={{
            position: 'absolute',
            top: `${25 + (index * 25)}%`,
            right: '-12px',
            color: '#FFCC00',
            fontSize: '16px',
            zIndex: 10,
          }}>★</div>
        ))}
        
        {[0, 1, 2, 3].map(index => (
          <div key={`heart-${index}`} style={{
            position: 'absolute',
            top: `${25 + (index * 25)}%`,
            left: '-12px',
            color: '#FF69B4',
            fontSize: '16px',
            zIndex: 10,
          }}>♥</div>
        ))}
      </>
    );
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      width: `${stripWidth}px`,
      height: `${stripHeight}px`,
      gap: '2px',
      position: 'relative',
      border: templateId === 'standard_strip' ? '8px solid #FFC0CB' : '8px solid #FFC0CB',
      borderImage: 'linear-gradient(45deg, #FF69B4, #FFC0CB, #FFCCFF, #FFC0CB, #FF69B4) 1',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25), 0 6px 10px rgba(0, 0, 0, 0.22)',
      transform: 'translateY(-5px)',
      transition: 'all 0.3s cubic-bezier(.25,.8,.25,1)',
      backgroundColor: templateId === 'standard_strip' ? '#000' : '#fff',
      padding: '2px'
    }}>
      {renderHelloKittyBorder()}
      {/* Photos */}
      {Array.from({ length: photoCount }).map((_, index) => renderPhoto(photos[index], index))}
      
      {/* Footer text */}
      <div style={{
        position: 'absolute',
        bottom: '5px',
        left: 0,
        right: 0,
        textAlign: 'center',
        color: 'white',
        fontSize: '8px',
        padding: '2px',
        textShadow: '0 1px 2px rgba(0,0,0,0.3)'
      }}>
        {isHalfStrip ? 'Two pieces of life' : 'Four pieces of life'}
      </div>
    </div>
  );
});

// Main component
const TemplateSelectionPage = () => {
  const { capturedPhotos, selectedPhotos, completeTemplateSelection, photoTemplate, photoFilters } = usePhotobooth();
  
  // Get the layout type based on the template
  const getLayoutType = useCallback(() => {
    // Check if it's a duo template
    if (photoTemplate === 'vertical_duo') {
      return '1x2';
    } else if (photoTemplate === 'horizontal_duo') {
      return '2x1';
    } else if (photoTemplate === 'classic_strip' || photoTemplate === 'standard_strip') {
      return '1x4';
    } else if (photoTemplate === 'horizontal_strip') {
      return '4x1';
    }
    
    // Default to 1x4 layout (vertical strip) 
    return '1x4';
  }, [photoTemplate]);
  
  // Determine if we're using duo templates (2 photos) or regular templates (4 photos)
  const isDuoTemplate = useMemo(() => 
    photoTemplate === 'vertical_duo' || photoTemplate === 'horizontal_duo',
    [photoTemplate]
  );
  
  // Get the number of photos to use based on the template
  const photoCount = useMemo(() => isDuoTemplate ? 2 : 4, [isDuoTemplate]);
  
  const layoutType = useMemo(() => getLayoutType(), [getLayoutType]);
  const availableTemplates = useMemo(() => 
    templates[layoutType] || templates['1x4'],
    [layoutType]
  );
  
  const [currentTemplateIndex, setCurrentTemplateIndex] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showNextButton, setShowNextButton] = useState(true);
  
  // Get the photos that were selected by the user
  const photosToUse = useMemo(() => {
    // Only use the first 'photoCount' selected photos
    return selectedPhotos
      .slice(0, photoCount)
      .map(index => capturedPhotos[index]);
  }, [selectedPhotos, capturedPhotos, photoCount]);
  
  // Initialize selected template when component mounts or templates change
  useEffect(() => {
    if (availableTemplates && availableTemplates.length > 0) {
      setSelectedTemplate(availableTemplates[0]);
      setCurrentTemplateIndex(0);
    }
  }, [availableTemplates]);
  
  // Function to navigate to the next template
  const nextTemplate = useCallback(() => {
    if (currentTemplateIndex < availableTemplates.length - 1) {
      setCurrentTemplateIndex(prev => prev + 1);
      setSelectedTemplate(availableTemplates[currentTemplateIndex + 1]);
    }
  }, [currentTemplateIndex, availableTemplates]);
  
  // Function to navigate to the previous template
  const prevTemplate = useCallback(() => {
    if (currentTemplateIndex > 0) {
      setCurrentTemplateIndex(prev => prev - 1);
      setSelectedTemplate(availableTemplates[currentTemplateIndex - 1]);
    }
  }, [currentTemplateIndex, availableTemplates]);
  
  // Function to continue to the delivery page
  const handleContinue = useCallback(() => {
    if (selectedTemplate) {
      completeTemplateSelection(selectedTemplate.id, selectedTemplate.layout);
    }
  }, [selectedTemplate, completeTemplateSelection]);
  
  // Don't render until we have selected a template
  if (!selectedTemplate) return null;
  
  return (
    <PageContainer>
      <FloatingStyles />
      <Title
        variants={slideUpVariants}
        initial="hidden"
        animate="visible"
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        Choose Your Photo Template
      </Title>
      
      <Subtitle
        variants={fadeInVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Select a template for your {photoCount} photos
        {isDuoTemplate && <span style={{ display: 'block', fontSize: '0.8em', marginTop: '5px' }}>2" x 3" photo strip</span>}
        {!isDuoTemplate && <span style={{ display: 'block', fontSize: '0.8em', marginTop: '5px' }}>2" x 6" photo strip</span>}
      </Subtitle>
      
      <CarouselContainer>
        <CarouselControls>
          <CarouselButton 
            onClick={prevTemplate}
            disabled={currentTemplateIndex === 0}
          >
            ←
          </CarouselButton>
          
          <TemplateName>{selectedTemplate.name}</TemplateName>
          
          <CarouselButton 
            onClick={nextTemplate}
            disabled={currentTemplateIndex === availableTemplates.length - 1}
          >
            →
          </CarouselButton>
        </CarouselControls>
        
        <Preview>
          <div className="floating-container">
            <PhotoStrip
              photos={photosToUse}
              photoCount={photoCount}
              templateId={selectedTemplate.id}
              photoFilters={photoFilters}
              selectedPhotos={selectedPhotos}
            />
          </div>
          
          <div style={{ marginTop: '20px', textAlign: 'center', color: '#666' }}>
            {selectedTemplate.name}
          </div>
        </Preview>
      </CarouselContainer>
      
      <AnimatePresence>
        {showNextButton && (
          <NextButtonContainer
            variants={fadeInVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <NextButton
              onClick={handleContinue}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              →
            </NextButton>
          </NextButtonContainer>
        )}
      </AnimatePresence>
    </PageContainer>
  );
};

export default TemplateSelectionPage;
