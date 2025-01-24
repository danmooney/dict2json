import React, { useState } from 'react';
import Toolbar from './Toolbar';

function OutputSection({ output, error, handleCopy }) {
  const [currentLine, setCurrentLine] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ start: 0, end: 0 });

  const handleCursorMove = (e) => {
    const text = e.target.value;
    const start = e.target.selectionStart;
    const end = e.target.selectionEnd;
    const linesBeforeCursor = text.slice(0, start).split('\n');
    setCurrentLine(linesBeforeCursor.length - 1);
    setCursorPosition({ start, end });
  };

  const handleKeyDown = (e) => {
    // Navigation keys that should always be allowed
    const navigationKeys = [
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End', 'PageUp', 'PageDown',
      'Tab', 'Shift', 'Control', 'Alt', 'Meta'
    ];

    // Store current selection before any changes
    const currentSelection = {
      start: e.target.selectionStart,
      end: e.target.selectionEnd
    };

    // If it's a navigation key, allow it
    if (navigationKeys.includes(e.key)) {
      return;
    }

    // For any other key, require Ctrl/Cmd modifier
    if (!e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      e.target.setSelectionRange(currentSelection.start, currentSelection.end);
      return;
    }

    // If we get here, we have Ctrl/Cmd pressed. Only allow specific keys
    if (!['c', 'v', 'x', 'a'].includes(e.key)) {
      e.preventDefault();
      e.target.setSelectionRange(currentSelection.start, currentSelection.end);
    }
  };

  return (
    <div className="output">
      <div className="section-header">
        <h2>JSON Output</h2>
      </div>
      <div className="editor-header">
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
          data-testid="json-output"
          value={error ? `Error: ${error}` : output}
          spellCheck="false"
          onKeyDown={handleKeyDown}
          onClick={handleCursorMove}
          onMouseUp={handleCursorMove}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </div>
    </div>
  );
}

export default OutputSection; 
