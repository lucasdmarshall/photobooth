import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { initBeautificationTools } from '../utils/BeautificationUtils';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ControlRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const Label = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textPrimary};
  flex: 1;
  margin-right: ${({ theme }) => theme.spacing.sm};
`;

const SliderContainer = styled.div`
  flex: 2;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const Slider = styled.input`
  width: 100%;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: ${({ theme }) => theme.colors.background};
  outline: none;
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primary};
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  }
`;

const ValueLabel = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  min-width: 32px;
  text-align: center;
`;

const LoadingIndicator = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.primary};
`;

const SectionTitle = styled.h4`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: ${({ theme }) => theme.spacing.sm} 0;
`;

const ProcessingOverlay = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
`;

const ProcessingIndicator = styled(motion.div)`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 3px solid transparent;
  border-top-color: ${({ theme }) => theme.colors.primary};
  border-right-color: ${({ theme }) => theme.colors.primary};
`;

const ProcessingText = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: 500;
`;

// This component provides controls for adjusting beautification settings
const BeautificationControls = ({ onChange, isProcessing }) => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    smoothing: 0.5,
    skinTone: 0.2,
    brightness: 0.1,
    faceSlimming: 0.2,
  });

  // Initialize beautification tools when component mounts
  useEffect(() => {
    const initTools = async () => {
      try {
        await initBeautificationTools();
        setLoading(false);
      } catch (error) {
        console.error('Error initializing beautification tools:', error);
        setLoading(false);
      }
    };

    initTools();
  }, []);

  // Notify parent of settings changes
  useEffect(() => {
    if (onChange) {
      onChange(settings);
    }
  }, [settings, onChange]);

  const handleChange = (setting, value) => {
    setSettings(prev => {
      const newSettings = {
        ...prev,
        [setting]: value
      };
      return newSettings;
    });
  };
  
  // Determine if controls should be disabled during processing
  const controlsDisabled = isProcessing || loading;

  if (loading) {
    return (
      <LoadingIndicator
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        Loading beautification tools...
      </LoadingIndicator>
    );
  }

  return (
    <Container style={{ position: 'relative' }}>
      {isProcessing && (
        <ProcessingOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <ProcessingIndicator animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} />
          <ProcessingText>Applying effects...</ProcessingText>
        </ProcessingOverlay>
      )}
      <SectionTitle>Face Beautification</SectionTitle>
      
      <ControlRow>
        <Label>Skin Smoothing</Label>
        <SliderContainer>
          <Slider
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.smoothing}
            onChange={(e) => handleChange('smoothing', parseFloat(e.target.value))}
            disabled={controlsDisabled}
            style={{ opacity: controlsDisabled ? 0.7 : 1 }}
          />
          <ValueLabel>{Math.round(settings.smoothing * 100)}%</ValueLabel>
        </SliderContainer>
      </ControlRow>
      
      <ControlRow>
        <Label>Skin Tone</Label>
        <SliderContainer>
          <Slider
            type="range"
            min="0"
            max="0.5"
            step="0.05"
            value={settings.skinTone}
            onChange={(e) => handleChange('skinTone', parseFloat(e.target.value))}
            disabled={controlsDisabled}
            style={{ opacity: controlsDisabled ? 0.7 : 1 }}
          />
          <ValueLabel>{Math.round(settings.skinTone * 100)}%</ValueLabel>
        </SliderContainer>
      </ControlRow>
      
      <ControlRow>
        <Label>Brightness</Label>
        <SliderContainer>
          <Slider
            type="range"
            min="0"
            max="0.3"
            step="0.05"
            value={settings.brightness}
            onChange={(e) => handleChange('brightness', parseFloat(e.target.value))}
            disabled={controlsDisabled}
            style={{ opacity: controlsDisabled ? 0.7 : 1 }}
          />
          <ValueLabel>{Math.round(settings.brightness * 100)}%</ValueLabel>
        </SliderContainer>
      </ControlRow>
      
      <ControlRow>
        <Label>Face Slimming</Label>
        <SliderContainer>
          <Slider
            type="range"
            min="0"
            max="0.5"
            step="0.05"
            value={settings.faceSlimming}
            onChange={(e) => handleChange('faceSlimming', parseFloat(e.target.value))}
            disabled={controlsDisabled}
            style={{ opacity: controlsDisabled ? 0.7 : 1 }}
          />
          <ValueLabel>{Math.round(settings.faceSlimming * 100)}%</ValueLabel>
        </SliderContainer>
      </ControlRow>
    </Container>
  );
};

export default BeautificationControls; 