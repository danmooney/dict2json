import React from 'react';

function Toast({ show }) {
  if (!show) return null;
  
  return (
    <div className="toast">
      Copied to clipboard!
    </div>
  );
}

export default Toast; 