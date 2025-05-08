import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { usePhotobooth } from '../contexts/PhotoboothContext';
import Button from '../components/ui/Button';
import Timer from '../components/ui/Timer';

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
  background-color: ${({ color }) => color || '#f0f0f0'};
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

const SelectionPage = () => {
  const { 
    capturedPhotos, 
    photoTemplate,
    templateLayout,
    selectPhotos,
    sessionTimeRemaining
  } = usePhotobooth();
  
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState('');
  
  // Required photos (always 4 now regardless of original selection)
  const requiredPhotos = 4;
  
  // Reset selection if photos change
  useEffect(() => {
    setSelected([]);
    setError('');
  }, [capturedPhotos]);
  
  const toggleSelect = (index) => {
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
  };
  
  const handleContinue = () => {
    if (selected.length !== requiredPhotos) {
      setError(`Please select exactly ${requiredPhotos} photos`);
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    selectPhotos(selected);
  };
  
  // Split photos into left and right columns
  const leftPhotos = capturedPhotos.slice(0, 4);
  const rightPhotos = capturedPhotos.slice(4, 8);
  
  return (
    <PageContainer>
      <Timer initialTime={sessionTimeRemaining} />
      
      <Title
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        Choose Your Favorite Photos
      </Title>
      
      <Subtitle
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Select exactly 4 photos from the 8 you've taken for your final output
      </Subtitle>
      
      <SelectionCounter>
        Selected: {selected.length} / {requiredPhotos}
      </SelectionCounter>
      
      <PhotoSelectionContainer>
        <PhotoColumn>
          <ColumnTitle>Photos 1-4</ColumnTitle>
          <PhotoGrid>
            {leftPhotos.map((photo, originalIndex) => {
              const index = originalIndex;
              return (
                <PhotoItem
                  key={index}
                  $selected={selected.includes(index)}
                  onClick={() => toggleSelect(index)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <PhotoThumb color={photo} />
                  <AnimatePresence>
                    {selected.includes(index) && (
                      <SelectionIndicator
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                      >
                        {selected.indexOf(index) + 1}
                      </SelectionIndicator>
                    )}
                  </AnimatePresence>
                </PhotoItem>
              );
            })}
          </PhotoGrid>
        </PhotoColumn>
        
        <PhotoColumn>
          <ColumnTitle>Photos 5-8</ColumnTitle>
          <PhotoGrid>
            {rightPhotos.map((photo, originalIndex) => {
              const index = originalIndex + 4; // Offset by 4 for the right column
              return (
                <PhotoItem
                  key={index}
                  $selected={selected.includes(index)}
                  onClick={() => toggleSelect(index)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <PhotoThumb color={photo} />
                  <AnimatePresence>
                    {selected.includes(index) && (
                      <SelectionIndicator
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                      >
                        {selected.indexOf(index) + 1}
                      </SelectionIndicator>
                    )}
                  </AnimatePresence>
                </PhotoItem>
              );
            })}
          </PhotoGrid>
        </PhotoColumn>
      </PhotoSelectionContainer>
      
      <AnimatePresence>
        {error && (
          <ErrorMessage
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            {error}
          </ErrorMessage>
        )}
      </AnimatePresence>
      
      {photoTemplate && (
        <PreviewSection
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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
          Continue to Editing
        </Button>
      </ActionBar>
    </PageContainer>
  );
};

export default SelectionPage; 