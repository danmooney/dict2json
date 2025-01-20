import React from 'react';

function OutputSection({ output, error, handleCopy }) {
  return (
    <div className="output">
      <h2>JSON Output</h2>
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
      <div className="actions">
        <button onClick={handleCopy}>Copy to Clipboard</button>
      </div>
    </div>
  );
}

export default OutputSection; 