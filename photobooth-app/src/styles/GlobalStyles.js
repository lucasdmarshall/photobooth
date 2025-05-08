import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  /* Reset */
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  html, body, #root {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    font-family: ${({ theme }) => theme.fonts.primary};
    background-color: ${({ theme }) => theme.colors.background};
    overflow: hidden;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
  
  /* Improved fullscreen experience */
  html {
    background-color: black;
  }
  
  body {
    color: ${({ theme }) => theme.colors.textPrimary};
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  /* Windows touchscreen specific optimizations */
  * {
    /* Disable all touch selection behaviors */
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    
    /* Prevent touch callouts */
    -webkit-touch-callout: none;
    
    /* Prevent highlight on tap */
    -webkit-tap-highlight-color: transparent;
    
    /* Prevent double-tap to zoom */
    touch-action: manipulation;
    
    /* Prevent context menu on long press */
    -webkit-touch-action: none;
    
    /* Prevent drag operations */
    -webkit-user-drag: none;
    user-drag: none;
  }
  
  /* Disable double-tap zoom and selection on Windows touch devices */
  html, body {
    touch-action: none;
    -ms-touch-action: none;
    -ms-content-zooming: none;
    -ms-content-zoom-chaining: none;
    -ms-content-zoom-limit: 100%;
    -ms-overflow-style: none;
  }
  
  /* Prevent text selection on double-tap */
  p, h1, h2, h3, h4, h5, h6, span, div {
    -ms-user-select: none;
    user-select: none;
  }
  
  /* Allow selection in input fields only */
  input, textarea {
    user-select: text;
    -webkit-user-select: text;
    -moz-user-select: text;
    -ms-user-select: text;
    touch-action: auto;
    -ms-touch-action: auto;
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-family: ${({ theme }) => theme.fonts.secondary};
    font-weight: bold;
    color: ${({ theme }) => theme.colors.textPrimary};
  }
  
  h1 {
    font-size: ${({ theme }) => theme.fontSizes.xxl};
  }
  
  h2 {
    font-size: ${({ theme }) => theme.fontSizes.xl};
  }
  
  h3 {
    font-size: ${({ theme }) => theme.fontSizes.lg};
  }
  
  button {
    cursor: pointer;
    border: none;
    outline: none;
    background: none;
    
    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  img {
    max-width: 100%;
    pointer-events: none;
  }

  /* For kiosk/touch interfaces */
  @media (pointer: coarse) {
    button, a, input[type="button"], input[type="submit"] {
      min-height: 44px;
      min-width: 44px;
    }
  }
`;

export default GlobalStyles; 