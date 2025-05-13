import React, { useState, useEffect, useCallback, memo } from 'react';
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
  justify-content: flex-start;
  background-color: ${({ theme }) => theme.colors.background};
  position: relative;
  padding: ${({ theme }) => `${theme.spacing.xl} ${theme.spacing.xl} ${theme.spacing.xl}`};
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

const PhotoSelectionContainer = styled.div`
  display: flex;
  width: 100%;
  max-width: 1000px;
  gap: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const PhotoColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const ColumnTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  text-align: center;
`;

const PhotoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing.md};
`;

const PhotoItem = styled(motion.div)`
  position: relative;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  overflow: hidden;
  cursor: pointer;
  aspect-ratio: 4/3;
  height: 120px; /* Fixed height to make photos smaller */
  box-shadow: ${({ theme }) => theme.shadows.medium};
  border: 3px solid ${({ theme, $selected }) => $selected ? theme.colors.primary : 'white'};
  transition: all ${({ theme }) => theme.transitions.medium};
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${({ theme }) => theme.shadows.large};
  }
`;

const PhotoThumb = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${({ color }) => !color || color.startsWith('hsl') ? color || '#f0f0f0' : 'transparent'};
  background-image: ${({ color }) => color && color.startsWith('data:') ? `url(${color})` : 'none'};
  background-size: cover;
  background-position: center;
  position: relative;
`;

const FilterEffect = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${({ $color }) => $color || 'transparent'};
  opacity: 0.4;
  mix-blend-mode: ${({ $blendMode }) => $blendMode || 'normal'};
  pointer-events: none; /* Make sure clicks pass through to the preview */
`;

const SelectionIndicator = styled(motion.div)`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  box-shadow: ${({ theme }) => theme.shadows.medium};
`;

const ActionBar = styled(motion.div)`
  width: 100%;
  display: flex;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.md};
  position: sticky;
  bottom: 0;
`;

const SelectionCounter = styled.div`
  background-color: ${({ theme }) => theme.colors.primary}20;
  color: ${({ theme }) => theme.colors.primary};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  font-weight: bold;
  display: inline-block;
`;

const ErrorMessage = styled(motion.div)`
  color: ${({ theme }) => theme.colors.error};
  margin-top: ${({ theme }) => theme.spacing.md};
  font-weight: 500;
`;

const PreviewSection = styled(motion.div)`
  margin-top: ${({ theme }) => theme.spacing.md};
  width: 100%;
  max-width: 800px;
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.background}aa;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  text-align: center;
`;

const PreviewTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

// Define filters array at the component level
const filters = [
  { id: 'normal', name: 'Normal', color: null, blendMode: 'normal' },
  { id: 'warm', name: 'Warm', color: '#FFB74D', blendMode: 'overlay' },
  { id: 'cool', name: 'Cool', color: '#81D4FA', blendMode: 'overlay' },
  { id: 'vintage', name: 'Vintage', color: '#A1887F', blendMode: 'multiply' },
  { id: 'bw', name: 'B&W', color: '#000000', blendMode: 'saturation' },
  { id: 'pink', name: 'Pink', color: '#F8BBD0', blendMode: 'soft-light' },
  { id: 'sepia', name: 'Sepia', color: '#D7CCC8', blendMode: 'color' },
  { id: 'dramatic', name: 'Dramatic', color: '#455A64', blendMode: 'overlay' },
  { id: 'vivid', name: 'Vivid', color: '#4CAF50', blendMode: 'color-dodge' },
  { id: 'neon', name: 'Neon', color: '#00E5FF', blendMode: 'hard-light' },
  { id: 'retro', name: 'Retro', color: '#FFEB3B', blendMode: 'color' },
  { id: 'dreamy', name: 'Dreamy', color: '#CE93D8', blendMode: 'soft-light' },
];

// Create memoized photo item component to prevent unnecessary re-renders
const MemoizedPhotoItem = memo(({ 
  index, 
  photo, 
  isSelected, 
  selectionIndex, 
  onSelect, 
  filterDetails 
}) => {
  return (
    <PhotoItem
      $selected={isSelected}
      onClick={() => onSelect(index)}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      <PhotoThumb color={photo}>
        {filterDetails && (
          <FilterEffect 
            $color={filterDetails.color}
            $blendMode={filterDetails.blendMode}
          />
        )}
      </PhotoThumb>
      <AnimatePresence>
        {isSelected && (
          <SelectionIndicator
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
          >
            {selectionIndex + 1}
          </SelectionIndicator>
        )}
      </AnimatePresence>
    </PhotoItem>
  );
});

// Define simplified animation variants to reduce JS calculations
const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

const slideUpVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const SelectionPage = () => {
  const { 
    capturedPhotos, 
    photoTemplate,
    templateLayout,
    selectPhotos,
    selectedQuantity,
    photoFilters
  } = usePhotobooth();
  
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState('');
  
  // Determine required photos based on template type
  const isDuoTemplate = photoTemplate === 'vertical_duo' || photoTemplate === 'horizontal_duo';
  const requiredPhotos = isDuoTemplate ? 2 : 4;
  
  // Reset selection if photos change
  useEffect(() => {
    setSelected([]);
    setError('');
  }, [capturedPhotos]);
  
  const toggleSelect = useCallback((index) => {
    setSelected(prev => {
      // If already selected, remove it
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      }
      
      // If we already have the max number of selections
      if (prev.length >= requiredPhotos) {
        setError(`You can only select ${requiredPhotos} photos`);
        setTimeout(() => setError(''), 3000);
        return prev;
      }
      
      // Add to selection
      const newSelection = [...prev, index];
      setError('');
      return newSelection;
    });
  }, [requiredPhotos]);
  
  const handleContinue = useCallback(() => {
    if (selected.length !== requiredPhotos) {
      setError(`Please select exactly ${requiredPhotos} photos`);
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    selectPhotos(selected);
  }, [selected, requiredPhotos, selectPhotos]);
  
  // Determine the total photos to display based on template
  const totalPhotosToShow = isDuoTemplate ? 4 : 8;
  
  // Split photos into left and right columns
  const leftPhotos = capturedPhotos.slice(0, Math.ceil(totalPhotosToShow / 2));
  const rightPhotos = capturedPhotos.slice(Math.ceil(totalPhotosToShow / 2), totalPhotosToShow);
  
  // Memoize filter lookup for better performance
  const getFilterDetails = useCallback((photoIndex) => {
    const appliedFilter = photoFilters[photoIndex];
    if (!appliedFilter || appliedFilter === 'normal') return null;
    
    return filters.find(f => f.id === appliedFilter);
  }, [photoFilters]);
  
  return (
    <PageContainer>
      <Title
        variants={slideUpVariants}
        initial="hidden"
        animate="visible"
      >
        Choose Your Favorite Photos
      </Title>
      
      <Subtitle
        variants={fadeInVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.2 }}
      >
        Select exactly {requiredPhotos} photos from the {totalPhotosToShow} you've taken for your final output
      </Subtitle>
      
      <SelectionCounter>
        Selected: {selected.length} / {requiredPhotos}
      </SelectionCounter>
      
      <PhotoSelectionContainer>
        <PhotoColumn>
          <ColumnTitle>Photos {isDuoTemplate ? '1-2' : '1-4'}</ColumnTitle>
          <PhotoGrid>
            {leftPhotos.map((photo, originalIndex) => {
              const index = originalIndex;
              const isSelected = selected.includes(index);
              const selectionIndex = selected.indexOf(index);
              const filterDetails = getFilterDetails(index);
              
              return (
                <MemoizedPhotoItem
                  key={index}
                  index={index}
                  photo={photo}
                  isSelected={isSelected}
                  selectionIndex={selectionIndex}
                  onSelect={toggleSelect}
                  filterDetails={filterDetails}
                />
              );
            })}
          </PhotoGrid>
        </PhotoColumn>
        
        <PhotoColumn>
          <ColumnTitle>Photos {isDuoTemplate ? '3-4' : '5-8'}</ColumnTitle>
          <PhotoGrid>
            {rightPhotos.map((photo, originalIndex) => {
              // Only display photos that exist
              if (photo) {
                const index = originalIndex + Math.ceil(totalPhotosToShow / 2); // Offset for the right column
                const isSelected = selected.includes(index);
                const selectionIndex = selected.indexOf(index);
                const filterDetails = getFilterDetails(index);
                
                return (
                  <MemoizedPhotoItem
                    key={index}
                    index={index}
                    photo={photo}
                    isSelected={isSelected}
                    selectionIndex={selectionIndex}
                    onSelect={toggleSelect}
                    filterDetails={filterDetails}
                  />
                );
              }
              return null;
            })}
          </PhotoGrid>
        </PhotoColumn>
      </PhotoSelectionContainer>
      
      <AnimatePresence>
        {error && (
          <ErrorMessage
            variants={slideUpVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {error}
          </ErrorMessage>
        )}
      </AnimatePresence>
      
      {photoTemplate && (
        <PreviewSection
          variants={fadeInVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
        >
          <PreviewTitle>Your Photos Will Appear in the "{photoTemplate}" Template</PreviewTitle>
        </PreviewSection>
      )}
      
      <ActionBar>
        <Button 
          onClick={handleContinue}
          disabled={selected.length !== requiredPhotos}
          size="large"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Continue to Delivery
        </Button>
      </ActionBar>
    </PageContainer>
  );
};

export default SelectionPage; 