import React from 'react';
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';

const ButtonWrapper = styled(motion.button)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme, $size }) => 
    $size === 'large' ? `${theme.spacing.md} ${theme.spacing.xl}` :
    $size === 'small' ? `${theme.spacing.xs} ${theme.spacing.md}` :
    `${theme.spacing.sm} ${theme.spacing.lg}`
  };
  border-radius: ${({ theme, $rounded }) => 
    $rounded === 'pill' ? '50px' :
    $rounded === 'circle' ? '50%' :
    theme.borderRadius.medium
  };
  font-size: ${({ theme, $size }) => 
    $size === 'large' ? theme.fontSizes.lg :
    $size === 'small' ? theme.fontSizes.xs :
    theme.fontSizes.md
  };
  font-weight: 600;
  transition: all ${({ theme }) => theme.transitions.medium};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  position: relative;
  overflow: hidden;
  min-width: ${({ $size }) => 
    $size === 'large' ? '180px' :
    $size === 'small' ? '100px' :
    '140px'
  };
  
  /* Touch-specific optimizations */
  min-height: ${({ $size }) => 
    $size === 'large' ? '60px' :
    $size === 'small' ? '44px' :
    '52px'
  };
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  
  ${({ $variant, theme }) => {
    switch($variant) {
      case 'primary':
        return css`
          background-color: ${theme.colors.primary};
          color: white;
          &:hover {
            background-color: #FF84C8;
            transform: translateY(-2px);
            box-shadow: ${theme.shadows.large};
          }
          &:active {
            transform: translateY(1px);
            box-shadow: ${theme.shadows.small};
          }
          &::before {
            content: '';
            position: absolute;
            top: -10%;
            left: -10%;
            width: 120%;
            height: 120%;
            background: linear-gradient(
              45deg,
              rgba(255, 255, 255, 0.1),
              rgba(255, 255, 255, 0.5)
            );
            transform: rotate(25deg) translateX(-120%);
            transition: transform 0.5s ease;
          }
          &:hover::before {
            transform: rotate(25deg) translateX(120%);
          }
        `;
      case 'secondary':
        return css`
          background-color: ${theme.colors.secondary};
          color: ${theme.colors.textPrimary};
          &:hover {
            background-color: #FFD79B;
            transform: translateY(-2px);
            box-shadow: ${theme.shadows.large};
          }
          &:active {
            transform: translateY(1px);
            box-shadow: ${theme.shadows.small};
          }
        `;
      case 'accent':
        return css`
          background-color: ${theme.colors.accent3};
          color: white;
          &:hover {
            background-color: #C4A5FF;
            transform: translateY(-2px);
            box-shadow: ${theme.shadows.large};
          }
          &:active {
            transform: translateY(1px);
            box-shadow: ${theme.shadows.small};
          }
        `;
      case 'outline':
        return css`
          background-color: transparent;
          border: 2px solid ${theme.colors.primary};
          color: ${theme.colors.primary};
          box-shadow: none;
          &:hover {
            background-color: ${theme.colors.primary}10;
            transform: translateY(-2px);
          }
          &:active {
            transform: translateY(1px);
          }
        `;
      default:
        return css`
          background-color: ${theme.colors.primary};
          color: white;
          &:hover {
            background-color: #FF84C8;
            transform: translateY(-2px);
            box-shadow: ${theme.shadows.large};
          }
          &:active {
            transform: translateY(1px);
            box-shadow: ${theme.shadows.small};
          }
        `;
    }
  }}

  ${({ $fullWidth }) => $fullWidth && css`
    width: 100%;
  `}
`;

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  rounded = 'default',
  fullWidth = false,
  whileTap = { scale: 0.95 },
  ...props 
}) => {
  return (
    <ButtonWrapper
      $variant={variant}
      $size={size}
      $rounded={rounded}
      $fullWidth={fullWidth}
      whileTap={whileTap}
      {...props}
    >
      {children}
    </ButtonWrapper>
  );
};

export default Button; 