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
  justify-content: center;
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
    id: 'vertical_duo',
    name: 'Vertical Duo',
    description: '2 photos stacked vertically',
    layout: '1x2',
    slots: [
      { gridRow: '1', color: 'hsl(340, 82%, 76%)' },
      { gridRow: '2', color: 'hsl(290, 69%, 70%)' },
    ],
    price: 5.00
  },
  {
    id: 'horizontal_duo',
    name: 'Horizontal Duo',
    description: '2 photos side by side',
    layout: '2x1',
    slots: [
      { gridColumn: '1', color: 'hsl(316, 73%, 66%)' },
      { gridColumn: '2', color: 'hsl(262, 80%, 77%)' },
    ],
    price: 5.00
  },
  {
    id: 'classic_strip',
    name: 'Classic Strip',
    description: 'Traditional 4-photo vertical strip',
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
    id: 'horizontal_strip',
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
      // Check if this is a duo template that needs 2 photos
      const isDuoTemplate = selectedTemplate.id === 'vertical_duo' || selectedTemplate.id === 'horizontal_duo';
      // Pass the correct quantity (2 for duo templates, 4 for others)
      
      // Add logging to see what's being passed
      console.log('QuantityPage selected template:', {
        templateId: selectedTemplate.id,
        isDuoTemplate,
        quantity: isDuoTemplate ? 2 : 4,
        layout: selectedTemplate.layout
      });
      
      selectQuantity(isDuoTemplate ? 2 : 4, selectedTemplate.id, selectedTemplate.layout);
    }
  };

  // Get the appropriate subtitle text based on selected template
  const getSubtitleText = () => {
    if (!selectedTemplate) return "Select a template to continue";
    
    const isDuoTemplate = selectedTemplate.id === 'vertical_duo' || selectedTemplate.id === 'horizontal_duo';
    return isDuoTemplate 
      ? "You'll take 4 photos and select your favorite 2 for this template"
      : "You'll take 8 photos and select your favorite 4 for this template";
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
        {selectedTemplate 
          ? getSubtitleText()
          : "You'll take photos and select your favorites for this template"}
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