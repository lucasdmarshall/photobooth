import React from 'react';

const TemplateFallback = ({ template, onClick, isSelected }) => {
  // Generate CSS class name for the layout
  const getLayoutClass = () => {
    switch (template.layout) {
      case '2x2': 
        if (template.id === 'banga_green_quad') return 'layout-banga-quad banga-green-quad';
        return template.id.includes('banga') ? 'layout-banga-quad' : 'layout-2x2';
      case '4x1': 
        return template.id.includes('banga') ? 'layout-banga-4up' : 'layout-4x1';
      case '1x4': 
        return template.id.includes('banga') ? 'layout-banga-filmstrip' : 'layout-1x4';
      default:
        if (template.id === 'banga_filmstrip') return 'layout-banga-filmstrip filmstrip-frame';
        if (template.id === 'banga_strip_trio') return 'layout-banga-filmstrip banga-strip-trio';
        if (template.id === 'banga_photo_booth') return 'layout-banga-filmstrip banga-photo-booth film-strip-container';
        if (template.id === 'banga_special') return 'layout-banga-special';
        if (template.id === 'banga_royal_frames') return 'layout-banga-special banga-royal-frames';
        return 'layout-custom';
    }
  };

  // Define BANGA branding overlay if needed
  const renderBangaBranding = () => {
    if (template.id.includes('banga')) {
      return (
        <div className="banga-branding">
          BANGA
        </div>
      );
    }
    return null;
  };

  // Render timer if needed (shown in the reference)
  const renderTimerDisplay = () => {
    if (template.id.includes('banga')) {
      return (
        <div className="banga-timer">
          8 seconds left...
        </div>
      );
    }
    return null;
  };

  // Render KORE text if needed (shown in the reference)
  const renderKoreText = () => {
    if (template.id.includes('banga')) {
      return (
        <div className="kore-counter">
          KORE
        </div>
      );
    }
    return null;
  };

  // Add decorative frame to slots for certain templates
  const getSlotStyle = (slot, index) => {
    const baseStyle = {
      gridColumn: slot.gridColumn || 'auto',
      gridRow: slot.gridRow || 'auto',
      backgroundColor: slot.color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '24px',
      opacity: 0.8,
      borderRadius: '8px'
    };

    // Add decorative frame for royal frames template
    if (template.id === 'banga_royal_frames') {
      return {
        ...baseStyle,
        border: '3px solid #ffcc00',
        boxShadow: '0 0 5px rgba(255, 204, 0, 0.8)'
      };
    }

    return baseStyle;
  };

  // Return a pure HTML/CSS based template preview
  return (
    <div 
      className={`template-card ${isSelected ? 'template-selected' : ''}`}
      onClick={onClick}
      style={{
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '16px',
        height: '100%',
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(255, 159, 215, 0.2)',
        transition: 'all 0.3s ease',
        border: isSelected ? '3px solid #FF9FD7' : '3px solid transparent',
        backgroundColor: isSelected ? 'rgba(255, 159, 215, 0.1)' : '#ffffff',
      }}
    >
      <div 
        className={`template-preview ${getLayoutClass()}`}
        style={{
          width: '100%',
          aspectRatio: '4/3',
          backgroundColor: '#f8f8f8',
          borderRadius: '8px',
          overflow: 'hidden',
          marginBottom: '16px',
          position: 'relative',
          display: 'grid',
          gap: '4px',
          padding: '4px',
          gridTemplateColumns: template.layout === '2x2' ? 'repeat(2, 1fr)' : 
            template.layout === '4x1' ? 'repeat(4, 1fr)' : 
            template.layout === '2-1-1' ? '2fr 1fr 1fr' :
            template.layout === '1-2-1' ? '1fr 2fr 1fr' :
            template.layout === '1-1-2' ? '1fr 1fr 2fr' :
            template.layout === '3x1' ? 'repeat(3, 1fr)' :
            'repeat(2, 1fr)',
          gridTemplateRows: template.layout === '2x2' ? 'repeat(2, 1fr)' : 
            template.layout === '1x4' ? 'repeat(4, 1fr)' :
            template.layout === '3-1' ? '3fr 1fr' :
            template.layout === '1-3' ? '1fr 3fr' :
            'repeat(1, 1fr)'
        }}
      >
        {renderBangaBranding()}
        {renderKoreText()}
        {renderTimerDisplay()}
        {template.slots.map((slot, index) => (
          <div 
            key={index}
            className="photo-slot"
            style={getSlotStyle(slot, index)}
          >
            {index + 1}
          </div>
        ))}
      </div>
      <h3 style={{ fontSize: '18px', color: '#333', marginBottom: '8px' }}>
        {template.name}
      </h3>
      <p style={{ fontSize: '14px', color: '#666', flexGrow: 1 }}>
        {template.description}
      </p>
    </div>
  );
};

export default TemplateFallback;
