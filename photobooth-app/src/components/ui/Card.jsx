import React from 'react';
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';

const CardWrapper = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: ${({ theme, $padding }) => 
    $padding === 'large' ? theme.spacing.xxl :
    $padding === 'small' ? theme.spacing.md :
    theme.spacing.lg
  };
  box-shadow: ${({ theme, $elevated }) => 
    $elevated === 'high' ? theme.shadows.large :
    $elevated === 'low' ? theme.shadows.small :
    theme.shadows.medium
  };
  
  /* Touch-specific optimizations */
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  
  ${({ $variant, theme }) => {
    switch($variant) {
      case 'outline':
        return css`
          border: 2px solid ${theme.colors.primary};
          box-shadow: none;
        `;
      case 'filled':
        return css`
          background-color: ${theme.colors.primary};
          color: white;
        `;
      case 'pastel':
        return css`
          background-color: ${theme.colors.background};
          border: 2px dashed ${theme.colors.primary};
        `;
      default:
        return css``;
    }
  }}
  
  width: ${({ $fullWidth }) => $fullWidth ? '100%' : 'auto'};
  height: ${({ $fullHeight }) => $fullHeight ? '100%' : 'auto'};
  
  display: flex;
  flex-direction: ${({ $direction }) => $direction || 'column'};
  position: relative;
  overflow: ${({ $overflow }) => $overflow || 'visible'};
`;

const Card = ({
  children,
  variant,
  padding = 'medium',
  elevated = 'medium',
  fullWidth = false,
  fullHeight = false,
  direction,
  overflow,
  ...props
}) => {
  return (
    <CardWrapper
      $variant={variant}
      $padding={padding}
      $elevated={elevated}
      $fullWidth={fullWidth}
      $fullHeight={fullHeight}
      $direction={direction}
      $overflow={overflow}
      {...props}
    >
      {children}
    </CardWrapper>
  );
};

export default Card; 