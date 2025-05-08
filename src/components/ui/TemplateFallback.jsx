import React from 'react';

const TemplateFallback = ({ template, onClick, isSelected }) => {
  // Generate CSS class name for the layout
  const getLayoutClass = () => {
    switch (template.layout) {
      case '2x2': return 'template-grid-2x2';
      case '4x1': return 'template-grid-4x1';
      case '1x4': return 'template-grid-1x4';
      default: return 'template-grid-custom';
    }
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
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(255, 159, 215, 0.2)',
        transition: 'all 0.3s ease',
        border: isSelected ? '3px solid #FF9FD7' : '3px solid transparent',
        backgroundColor: isSelected ? 'rgba(255, 159, 215, 0.1)' : '#ffffff',
      }}
    >
      <div className="template-preview-fallback">
        <div className={`template-grid ${getLayoutClass()}`}>
          {template.slots.map((slot, index) => (
            <div
              key={index}
              className="photo-block"
              style={{
                backgroundColor: slot.color,
              }}
            >
              {index + 1}
            </div>
          ))}
        </div>
      </div>
      
      <h3 style={{ 
        fontSize: '1.25rem',
        color: '#5E4B56',
        marginBottom: '12px',
      }}>
        {template.name}
      </h3>
      
      <p style={{ 
        fontSize: '1rem',
        color: '#9B7B8A',
        flexGrow: 1,
      }}>
        {template.description}
      </p>
      
      <div style={{ 
        marginTop: '12px',
        padding: '8px 16px',
        borderRadius: '50px',
        backgroundColor: 'rgba(255, 159, 215, 0.2)',
        color: '#FF9FD7',
        fontWeight: 'bold',
        fontSize: '1rem',
      }}>
        ${template.price.toFixed(2)}
      </div>
    </div>
  );
};

export default TemplateFallback; 