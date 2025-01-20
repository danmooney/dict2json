import React, { useState } from 'react';
import Toolbar from './Toolbar';

function InputSection({ input, setInput, handleFileUpload }) {
  const [currentLine, setCurrentLine] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  const handleCursorMove = (e) => {
    const text = e.target.value;
    const cursorPosition = e.target.selectionStart;
    const linesBeforeCursor = text.slice(0, cursorPosition).split('\n');
    setCurrentLine(linesBeforeCursor.length - 1);
  };

  return (
    <div className="input">
      <div className="section-header">
        <h2>Python Dictionary</h2>
      </div>
      <div className="editor-header">
        <Toolbar onFileUpload={handleFileUpload} />
      </div>
      <div 
        className={`editor-container ${isFocused ? 'focused' : ''}`}
        style={{
          '--current-line': currentLine,
          '--line-offset': `${10 + currentLine * 24}px`
        }}
      >
        <div className="line-numbers">
          {input.split('\n').map((_, i) => (
            <div key={i} className="line-number">
              {i + 1}
            </div>
          ))}
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyUp={handleCursorMove}
          onClick={handleCursorMove}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Enter Python dictionary"
          wrap="soft"
          spellCheck="false"
        />
      </div>
    </div>
  );
}

export default InputSection; 
