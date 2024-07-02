import React, { useState } from 'react';
import './DownloadTooltip.css'; // Import your custom tooltip styles

const Tooltip = ({ text, children }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleMouseEnter = () => {
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <div className="download-tooltip-container" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {children}
      {showTooltip && <div className="download-tooltip">{text}</div>}
    </div>
  );
};

export default Tooltip;
