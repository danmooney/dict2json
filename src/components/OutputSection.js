import React, { useState } from 'react';
import Toolbar from './Toolbar';

function OutputSection({ output, error, handleCopy }) {
  const [currentLine, setCurrentLine] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  const handleCursorMove = (e) => {
    console.log("handleCursorMove output")
    const text = e.target.value;
    const cursorPosition = e.target.selectionStart;
    const linesBeforeCursor = text.slice(0, cursorPosition).split('\n');
    setCurrentLine(linesBeforeCursor.length - 1);
  };

  return (
    <div className="output">
      <div className="section-header">
        <h2>JSON Output</h2>
        <Toolbar onCopy={handleCopy} isOutput={true} />
      </div>
      <div
        className={`editor-container ${isFocused ? 'focused' : ''}`}
        style={{
          '--current-line': currentLine,
          '--line-offset': `${10 + currentLine * 24}px`
        }}
      >
        <div className="line-numbers">
          {(output || error || '').split('\n').map((_, i) => (
            <div key={i} className="line-number">
              {i + 1}
            </div>
          ))}
        </div>
        <textarea
          className="output-content"
          value={output || (error && `Error: ${error}`)}
          spellCheck="false"
          onKeyUp={handleCursorMove}
          onClick={handleCursorMove}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </div>
    </div>
  );
}

export default OutputSection; 
