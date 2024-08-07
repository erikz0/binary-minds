import React, { useState } from 'react';
import './CopyTooltip.css'; // Import your custom tooltip styles

const Tooltip = ({ text, children }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleMouseEnter = () => {
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <div className="custom-tooltip-container" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {children}
      {showTooltip && <div className="custom-tooltip">{text}</div>}
    </div>
  );
};

export default Tooltip;
