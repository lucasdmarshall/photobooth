import React from 'react';
import Button from './Button';

/**
 * Button component that uses the global bubble sound effect when clicked
 * This component now just forwards to the standard Button component
 * since we have a global click sound handler
 */
const BubbleButton = (props) => {
  return (
    <Button {...props} />
  );
};

export default BubbleButton; 