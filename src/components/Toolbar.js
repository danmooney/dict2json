import React, { useState } from 'react';

function Toolbar({ onFileUpload, onCopy, isOutput = false }) {
  const [activeTooltip, setActiveTooltip] = useState(null);

  return (
    <div className="toolbar">
      {!isOutput ? (
        <label 
          htmlFor="file-upload" 
          className="toolbar-button"
          onMouseEnter={() => setActiveTooltip('upload')}
          onMouseLeave={() => setActiveTooltip(null)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <input
            id="file-upload"
            type="file"
            onChange={onFileUpload}
            style={{ display: 'none' }}
          />
          {activeTooltip === 'upload' && (
            <span className="tooltip" data-testid="upload-tooltip">Upload File</span>
          )}
        </label>
      ) : (
        <button 
          className="toolbar-button"
          onClick={onCopy}
          onMouseEnter={() => setActiveTooltip('copy')}
          onMouseLeave={() => setActiveTooltip(null)}
          data-testid="copy-button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          {activeTooltip === 'copy' && (
            <span className="tooltip" data-testid="copy-tooltip">Copy to Clipboard</span>
          )}
        </button>
      )}
    </div>
  );
}

export default Toolbar; 