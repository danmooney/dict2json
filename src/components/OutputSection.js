import React from 'react';
import Toolbar from './Toolbar';

function OutputSection({ output, error, handleCopy }) {
  return (
    <div className="output">
      <div className="section-header">
        <h2>JSON Output</h2>
        <Toolbar onCopy={handleCopy} isOutput={true} />
      </div>
      <div className="editor-container">
        <div className="line-numbers">
          {(output || error || '').split('\n').map((_, i) => (
            <div key={i} className="line-number">{i + 1}</div>
          ))}
        </div>
        <textarea
          className="output-content"
          value={output || (error && `Error: ${error}`)}
          readOnly
          spellCheck="false"
        />
      </div>
    </div>
  );
}

export default OutputSection; 