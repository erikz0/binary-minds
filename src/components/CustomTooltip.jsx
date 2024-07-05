import React, { useState } from 'react';
import './CustomTooltip.css'; // Import your custom tooltip styles

const CustomTooltip = ({ text, children }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleMouseEnter = () => {
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <div className="sidebar-tooltip-container" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {children}
      {showTooltip && <div className="sidebar-tooltip">{text}</div>}
    </div>
  );
};

export default CustomTooltip;
