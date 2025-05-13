import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { usePhotobooth } from '../contexts/PhotoboothContext';
import Button from '../components/ui/Button';

const PageContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => `${theme.spacing.lg} ${theme.spacing.xl} ${theme.spacing.xl}`};
  position: relative;
  overflow-y: auto;
`;

const Title = styled(motion.h1)`
  font-size: ${({ theme }) => theme.fontSizes.xxl};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  text-align: center;
`;

const Subtitle = styled(motion.p)`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  text-align: center;
`;

const EditorContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  flex: 1;
  overflow: hidden;
`;

const ToolPanel = styled(motion.div)`
  width: 100%;
  max-width: 800px;
  background-color: white;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const ToolsRow = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: center;
`;

const ToolSection = styled.div`
  flex: 1;
  min-width: 200px;
`;

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  padding-bottom: ${({ theme }) => theme.spacing.xs};
  border-bottom: 1px solid ${({ theme }) => theme.colors.primary}30;
`;

const OptionsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  justify-content: center;
`;

const OptionItem = styled(motion.div)`
  width: 60px;
  height: 60px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  overflow: hidden;
  cursor: pointer;
  border: 3px solid ${({ theme, selected }) => selected ? theme.colors.primary : 'transparent'};
  transition: all ${({ theme }) => theme.transitions.medium};
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ color }) => color || '#f0f0f0'};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.medium};
  }
`;

const PreviewArea = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const PhotoPreview = styled(motion.div)`
  width: 80%;
  max-width: 600px;
  aspect-ratio: 4/3;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  overflow: hidden;
  position: relative;
  box-shadow: ${({ theme }) => theme.shadows.large};
  border: 10px solid white;
`;

const PhotoImage = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${({ color }) => color || '#f0f0f0'};
`;

const FilterOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${({ color }) => color || 'transparent'};
  opacity: 0.4;
  mix-blend-mode: ${({ $blendMode }) => $blendMode || 'normal'};
`;

const BackgroundLayer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${({ color }) => color || 'transparent'};
  background-image: ${({ pattern }) => pattern ? `url(${pattern})` : 'none'};
  background-size: cover;
  background-position: center;
  z-index: -1;
`;

const TemplateFrame = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: ${({ $border }) => $border || 'none'};
  &:before {
    content: ${({ $decoration }) => $decoration ? `'${$decoration}'` : 'none'};
    position: absolute;
    bottom: 10px;
    right: 10px;
    font-size: 40px;
  }
`;

const NavigationButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

const PhotoThumbnails = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.lg};
  max-width: 600px;
`;

const Thumbnail = styled(motion.div)`
  width: 60px;
  height: 50px;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  overflow: hidden;
  cursor: pointer;
  border: 2px solid ${({ theme, selected }) => selected ? theme.colors.primary : 'white'};
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const ThumbnailImage = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${({ color }) => color || '#f0f0f0'};
`;

// Mock data for demonstration
const filters = [
  { id: 'normal', name: 'Normal', color: null, blendMode: 'normal' },
  { id: 'warm', name: 'Warm', color: '#FFB74D', blendMode: 'overlay' },
  { id: 'cool', name: 'Cool', color: '#81D4FA', blendMode: 'overlay' },
  { id: 'vintage', name: 'Vintage', color: '#A1887F', blendMode: 'multiply' },
  { id: 'bw', name: 'B&W', color: '#000000', blendMode: 'saturation' },
  { id: 'pink', name: 'Pink', color: '#F8BBD0', blendMode: 'soft-light' },
];

const backgrounds = [
  { id: 'none', name: 'None', color: null, pattern: null },
  { id: 'pink', name: 'Pink', color: '#FFC0CB', pattern: null },
  { id: 'blue', name: 'Blue', color: '#ADD8E6', pattern: null },
  { id: 'yellow', name: 'Yellow', color: '#FFFACD', pattern: null },
  { id: 'green', name: 'Green', color: '#E0F2F1', pattern: null },
  { id: 'purple', name: 'Purple', color: '#E1BEE7', pattern: null },
];

const templates = [
  { id: 'none', name: 'None', border: 'none', decoration: null },
  { id: 'border1', name: 'Simple', border: '5px solid #FF9FD7', decoration: null },
  { id: 'border2', name: 'Dashed', border: '5px dashed #FF9FD7', decoration: null },
  { id: 'border3', name: 'Dotted', border: '5px dotted #FF9FD7', decoration: null },
  { id: 'border4', name: 'Double', border: '5px double #FF9FD7', decoration: null },
  { id: 'decoration1', name: 'Hearts', border: '5px solid #FF9FD7', decoration: '❤️' },
];

const EditingPage = () => {
  const { capturedPhotos, selectedPhotos, completeEditing } = usePhotobooth();
  
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState('normal');
  const [selectedBackground, setSelectedBackground] = useState('none');
  const [selectedTemplate, setSelectedTemplate] = useState('none');
  
  // Get the photos to be edited (selected from captured)
  const photosToEdit = selectedPhotos.map(index => capturedPhotos[index]);
  
  // Get the current selected filter, background, template
  const filter = filters.find(f => f.id === selectedFilter);
  const background = backgrounds.find(b => b.id === selectedBackground);
  const template = templates.find(t => t.id === selectedTemplate);
  
  const handleNext = () => {
    if (currentPhotoIndex < photosToEdit.length - 1) {
      setCurrentPhotoIndex(prev => prev + 1);
    } else {
      // All photos edited, complete editing
      completeEditing();
    }
  };
  
  const handlePrevious = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(prev => prev - 1);
    }
  };
  
  return (
    <PageContainer>
      <Title
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        Edit Your Photos
      </Title>
      
      <Subtitle
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Customize with filters, backgrounds, and templates
      </Subtitle>
      
      <EditorContainer>
        <ToolPanel
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 20 }}
        >
          <ToolsRow>
            <ToolSection>
              <SectionTitle>Filters</SectionTitle>
              <OptionsList>
                {filters.map(filter => (
                  <OptionItem
                    key={filter.id}
                    selected={selectedFilter === filter.id}
                    onClick={() => setSelectedFilter(filter.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    color={filter.color || '#f0f0f0'}
                  >
                    {filter.name}
                  </OptionItem>
                ))}
              </OptionsList>
            </ToolSection>
          </ToolsRow>
          
          <ToolsRow>
            <ToolSection>
              <SectionTitle>Backgrounds</SectionTitle>
              <OptionsList>
                {backgrounds.map(bg => (
                  <OptionItem
                    key={bg.id}
                    selected={selectedBackground === bg.id}
                    onClick={() => setSelectedBackground(bg.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    color={bg.color || '#DDDDDD'}
                  >
                    {bg.name}
                  </OptionItem>
                ))}
              </OptionsList>
            </ToolSection>
          </ToolsRow>
          
          <ToolsRow>
            <ToolSection>
              <SectionTitle>Templates</SectionTitle>
              <OptionsList>
                {templates.map(tmpl => (
                  <OptionItem
                    key={tmpl.id}
                    selected={selectedTemplate === tmpl.id}
                    onClick={() => setSelectedTemplate(tmpl.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ 
                      border: tmpl.border || 'none',
                      backgroundColor: '#FFFFFF'
                    }}
                  >
                    {tmpl.decoration || tmpl.name}
                  </OptionItem>
                ))}
              </OptionsList>
            </ToolSection>
          </ToolsRow>
        </ToolPanel>
        
        <PreviewArea>
          <AnimatePresence mode="wait">
            <PhotoPreview
              key={currentPhotoIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <BackgroundLayer color={background?.color} pattern={background?.pattern} />
              <PhotoImage color={photosToEdit[currentPhotoIndex]} />
              <FilterOverlay color={filter?.color} $blendMode={filter?.blendMode} />
              <TemplateFrame $border={template?.border} $decoration={template?.decoration} />
            </PhotoPreview>
          </AnimatePresence>
          
          <PhotoThumbnails>
            {photosToEdit.map((photo, index) => (
              <Thumbnail 
                key={index}
                selected={index === currentPhotoIndex}
                onClick={() => setCurrentPhotoIndex(index)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <ThumbnailImage color={photo} />
              </Thumbnail>
            ))}
          </PhotoThumbnails>
          
          <NavigationButtons>
            <Button 
              onClick={handlePrevious}
              disabled={currentPhotoIndex === 0}
              variant="outline"
            >
              Previous
            </Button>
            
            <Button 
              onClick={handleNext}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {currentPhotoIndex === photosToEdit.length - 1 ? 'Finish Editing' : 'Next Photo'}
            </Button>
          </NavigationButtons>
        </PreviewArea>
      </EditorContainer>
    </PageContainer>
  );
};

export default EditingPage; 