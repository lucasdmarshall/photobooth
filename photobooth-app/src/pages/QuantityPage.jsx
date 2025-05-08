import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { usePhotobooth } from '../contexts/PhotoboothContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import TemplateFallback from '../components/ui/TemplateFallback';
// Import the direct CSS file
import './TemplateStyles.css';

// Add direct CSS as a fallback
const GridStyles = () => (
  <style jsx="true">{`
    .template-preview {
      display: grid !important;
      gap: 4px !important;
      padding: 4px !important;
      width: 100% !important;
      aspect-ratio: 4/3 !important;
    }
    
    .photo-slot {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      color: white !important;
      font-size: 24px !important;
      opacity: 0.8 !important;
      border-radius: 8px !important;
    }
  `}</style>
);

const PageContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: ${({ theme }) => theme.spacing.xl};
  background-color: ${({ theme }) => theme.colors.background};
  overflow-y: auto;
`;

const Title = styled(motion.h1)`
  font-size: ${({ theme }) => theme.fontSizes.xxl};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  text-align: center;
`;

const Subtitle = styled(motion.p)`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  text-align: center;
`;

const TemplatesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  width: 100%;
  max-width: 1200px;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const TemplateCard = styled(motion(Card))`
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: ${({ theme }) => theme.spacing.md};
  height: 100%;
  border: 3px solid transparent;
  transition: all ${({ theme }) => theme.transitions.medium};
  
  ${({ $selected, theme }) => $selected && `
    border-color: ${theme.colors.primary};
    background-color: ${theme.colors.primary}10;
  `}
`;

const TemplatePreview = styled.div`
  width: 100%;
  aspect-ratio: 4/3;
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  overflow: hidden;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  position: relative;
  
  display: grid !important;
  grid-template-columns: ${({ $layout }) => 
    $layout === '2x2' ? 'repeat(2, 1fr) !important' : 
    $layout === '4x1' ? 'repeat(4, 1fr) !important' : 
    $layout === '2-1-1' ? '2fr 1fr 1fr !important' :
    $layout === '1-2-1' ? '1fr 2fr 1fr !important' :
    $layout === '1-1-2' ? '1fr 1fr 2fr !important' :
    $layout === '3x1' ? 'repeat(3, 1fr) !important' :
    'repeat(2, 1fr) !important'
  };
  grid-template-rows: ${({ $layout }) => 
    $layout === '2x2' ? 'repeat(2, 1fr) !important' : 
    $layout === '1x4' ? 'repeat(4, 1fr) !important' :
    $layout === '3-1' ? '3fr 1fr !important' :
    $layout === '1-3' ? '1fr 3fr !important' :
    'repeat(1, 1fr) !important'
  };
  gap: 4px;
  padding: 4px;
`;

const PhotoSlot = styled.div`
  background-color: ${({ $color, theme }) => $color || theme.colors.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  grid-column: ${({ $gridColumn }) => $gridColumn || 'auto'} !important;
  grid-row: ${({ $gridRow }) => $gridRow || 'auto'} !important;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  opacity: 0.8;
`;

const TemplateName = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const TemplateDescription = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  flex-grow: 1;
`;

const TemplatePrice = styled.div`
  margin-top: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
  border-radius: 50px;
  background-color: ${({ theme }) => theme.colors.primary}20;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: bold;
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const ContinueButton = styled(Button)`
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

// Template definitions
const templates = [
  {
    id: 'classic',
    name: 'Classic Strip',
    description: 'Traditional 4-photo strip with equal sizing',
    layout: '1x4',
    slots: [
      { gridRow: '1', color: 'hsl(340, 82%, 76%)' },
      { gridRow: '2', color: 'hsl(290, 69%, 70%)' },
      { gridRow: '3', color: 'hsl(231, 67%, 74%)' },
      { gridRow: '4', color: 'hsl(199, 69%, 72%)' },
    ],
    price: 5.00
  },
  {
    id: 'grid',
    name: 'Photo Grid',
    description: '2x2 grid of equal-sized photos',
    layout: '2x2',
    slots: [
      { gridColumn: '1', gridRow: '1', color: 'hsl(316, 73%, 66%)' },
      { gridColumn: '2', gridRow: '1', color: 'hsl(262, 80%, 77%)' },
      { gridColumn: '1', gridRow: '2', color: 'hsl(207, 67%, 68%)' },
      { gridColumn: '2', gridRow: '2', color: 'hsl(152, 53%, 68%)' },
    ],
    price: 5.00
  },
  {
    id: 'horizontal',
    name: 'Horizontal Strip',
    description: 'Row of 4 horizontal photos',
    layout: '4x1',
    slots: [
      { gridColumn: '1', color: 'hsl(340, 82%, 76%)' },
      { gridColumn: '2', color: 'hsl(290, 69%, 70%)' },
      { gridColumn: '3', color: 'hsl(231, 67%, 74%)' },
      { gridColumn: '4', color: 'hsl(199, 69%, 72%)' },
    ],
    price: 5.00
  },
  {
    id: 'bigTop',
    name: 'Feature Top',
    description: 'Large top photo with 3 smaller below',
    layout: 'custom',
    slots: [
      { gridColumn: '1 / span 4', gridRow: '1', color: 'hsl(316, 73%, 66%)' },
      { gridColumn: '1', gridRow: '2', color: 'hsl(262, 80%, 77%)' },
      { gridColumn: '2', gridRow: '2', color: 'hsl(207, 67%, 68%)' },
      { gridColumn: '3 / span 2', gridRow: '2', color: 'hsl(152, 53%, 68%)' },
    ],
    price: 7.00
  },
  {
    id: 'bigCenter',
    name: 'Feature Center',
    description: 'Large center photo with smaller on sides',
    layout: 'custom',
    slots: [
      { gridColumn: '1', gridRow: '1', color: 'hsl(340, 82%, 76%)' },
      { gridColumn: '2 / span 2', gridRow: '1 / span 2', color: 'hsl(290, 69%, 70%)' },
      { gridColumn: '4', gridRow: '1', color: 'hsl(231, 67%, 74%)' },
      { gridColumn: '1 / span 2', gridRow: '2', color: 'hsl(199, 69%, 72%)' },
    ],
    price: 7.00
  },
  {
    id: 'polaroid',
    name: 'Polaroid Style',
    description: 'Classic polaroid film look with 4 photos',
    layout: '2x2',
    slots: [
      { gridColumn: '1', gridRow: '1', color: 'hsl(316, 73%, 66%)' },
      { gridColumn: '2', gridRow: '1', color: 'hsl(262, 80%, 77%)' },
      { gridColumn: '1', gridRow: '2', color: 'hsl(207, 67%, 68%)' },
      { gridColumn: '2', gridRow: '2', color: 'hsl(152, 53%, 68%)' },
    ],
    price: 5.00
  },
  {
    id: 'collage',
    name: 'Photo Collage',
    description: 'Artistic arrangement with varied sizes',
    layout: 'custom',
    slots: [
      { gridColumn: '1 / span 2', gridRow: '1', color: 'hsl(340, 82%, 76%)' },
      { gridColumn: '3 / span 2', gridRow: '1', color: 'hsl(290, 69%, 70%)' },
      { gridColumn: '1', gridRow: '2', color: 'hsl(231, 67%, 74%)' },
      { gridColumn: '2 / span 3', gridRow: '2', color: 'hsl(199, 69%, 72%)' },
    ],
    price: 7.00
  },
  {
    id: 'modern',
    name: 'Modern Split',
    description: 'Contemporary layout with asymmetrical design',
    layout: 'custom',
    slots: [
      { gridColumn: '1', gridRow: '1 / span 2', color: 'hsl(316, 73%, 66%)' },
      { gridColumn: '2 / span 2', gridRow: '1', color: 'hsl(262, 80%, 77%)' },
      { gridColumn: '2', gridRow: '2', color: 'hsl(207, 67%, 68%)' },
      { gridColumn: '3', gridRow: '2', color: 'hsl(152, 53%, 68%)' },
    ],
    price: 7.00
  },
  {
    id: 'filmstrip',
    name: 'Film Strip',
    description: 'Classic cinema film strip arrangement',
    layout: 'custom',
    slots: [
      { gridColumn: '1', gridRow: '1', color: 'hsl(340, 82%, 76%)' },
      { gridColumn: '1', gridRow: '2', color: 'hsl(290, 69%, 70%)' },
      { gridColumn: '2', gridRow: '1', color: 'hsl(231, 67%, 74%)' },
      { gridColumn: '2', gridRow: '2', color: 'hsl(199, 69%, 72%)' },
    ],
    price: 5.00
  },
  {
    id: 'staggered',
    name: 'Staggered Grid',
    description: 'Offset grid layout for visual interest',
    layout: 'custom',
    slots: [
      { gridColumn: '1 / span 2', gridRow: '1', color: 'hsl(316, 73%, 66%)' },
      { gridColumn: '3 / span 2', gridRow: '1', color: 'hsl(262, 80%, 77%)' },
      { gridColumn: '2 / span 2', gridRow: '2', color: 'hsl(207, 67%, 68%)' },
      { gridColumn: '4', gridRow: '2', color: 'hsl(152, 53%, 68%)' },
    ],
    price: 7.00
  },
  {
    id: 'diagonal',
    name: 'Diagonal Flow',
    description: 'Dynamic diagonal arrangement',
    layout: 'custom',
    slots: [
      { gridColumn: '1', gridRow: '1', color: 'hsl(340, 82%, 76%)' },
      { gridColumn: '2', gridRow: '1', color: 'hsl(290, 69%, 70%)' },
      { gridColumn: '3', gridRow: '2', color: 'hsl(231, 67%, 74%)' },
      { gridColumn: '4', gridRow: '2', color: 'hsl(199, 69%, 72%)' },
    ],
    price: 7.00
  },
  {
    id: 'panorama',
    name: 'Panoramic View',
    description: 'Widescreen aspect ratio for dramatic shots',
    layout: 'custom',
    slots: [
      { gridColumn: '1 / span 4', gridRow: '1', color: 'hsl(316, 73%, 66%)' },
      { gridColumn: '1 / span 2', gridRow: '2', color: 'hsl(262, 80%, 77%)' },
      { gridColumn: '3', gridRow: '2', color: 'hsl(207, 67%, 68%)' },
      { gridColumn: '4', gridRow: '2', color: 'hsl(152, 53%, 68%)' },
    ],
    price: 7.00
  }
];

const QuantityPage = () => {
  const { selectQuantity } = usePhotobooth();
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Animation variants
  const containerAnimation = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemAnimation = {
    hidden: { y: 20, opacity: 0 },
    show: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20
      }
    }
  };

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
  };

  const handleContinue = () => {
    if (selectedTemplate) {
      // We're always selecting 4 photos for these templates
      selectQuantity(4, selectedTemplate.id, selectedTemplate.layout);
    }
  };

  return (
    <PageContainer>
      {/* Add direct CSS styles */}
      <GridStyles />
      
      <Title
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          type: 'spring',
          stiffness: 300,
          damping: 20
        }}
      >
        Choose Your Photo Style
      </Title>
      
      <Subtitle
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        You'll take 8 photos and select your favorite 4 for this template
      </Subtitle>
      
      <TemplatesGrid
        as={motion.div}
        variants={containerAnimation}
        initial="hidden"
        animate="show"
      >
        {templates.map((template) => (
          <motion.div
            key={template.id}
            variants={itemAnimation}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            style={{ height: '100%' }}
          >
            <TemplateFallback 
              template={template}
              onClick={() => handleSelectTemplate(template)}
              isSelected={selectedTemplate?.id === template.id}
            />
          </motion.div>
        ))}
      </TemplatesGrid>
      
      <AnimatePresence>
        {selectedTemplate && (
          <ContinueButton
            size="large"
            onClick={handleContinue}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Continue with {selectedTemplate.name}
          </ContinueButton>
        )}
      </AnimatePresence>
    </PageContainer>
  );
};

export default QuantityPage; 