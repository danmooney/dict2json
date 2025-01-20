import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('input');
  const [isMobile, setIsMobile] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const outputRef = useRef(null);

  useEffect(() => {
    convertToJson();
  }, [input]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const convertToJson = () => {
    if (input.trim() === '') {
      setOutput('');
      setError('');
      return;
    }

    let errorLine = -1;
    let errorChar = -1;

    try {
      const lines = input.split('\n');

      // Track quotes and brackets
      let stack = [];
      let inString = null; // tracks current string quote type (' or ")

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        for (let j = 0; j < line.length; j++) {
          const char = line[j];

          // Handle string detection
          if ((char === '"' || char === "'") &&
              (j === 0 || line[j-1] !== '\\')) {
            if (!inString) {
              inString = char;
              // Store position where string started
              if (!stack.length || stack[stack.length - 1].type !== 'string') {
                stack.push({ type: 'string', char: inString, line: i, pos: j });
              }
            } else if (char === inString) {
              inString = null;
              // Remove the string marker if it matches
              if (stack.length && stack[stack.length - 1].type === 'string') {
                stack.pop();
              }
            }
            continue;
          }

          // Skip other characters if we're in a string
          if (inString) continue;

          // Track brackets and braces
          if (char === '{' || char === '[') {
            stack.push({ type: 'bracket', char, line: i, pos: j });
          } else if (char === '}' || char === ']') {
            const last = stack.length ? stack.pop() : null;
            const lastChar = last ? last.char : null;
            if (!last ||
                (char === '}' && lastChar !== '{') ||
                (char === ']' && lastChar !== '[')) {
              errorLine = i;
              errorChar = j;
              throw new Error(`Unmatched closing ${char === '}' ? 'brace' : 'bracket'}`);
            }
          }

          // Check for invalid quote pairs
          if (char === ':') {
            let beforeColon = '';
            let k = j - 1;
            while (k >= 0 && /\s/.test(line[k])) k--; // skip whitespace
            if (k >= 0) {
              let quoteChar = null;
              if (line[k] === '"' || line[k] === "'") {
                quoteChar = line[k];
                k--;
                while (k >= 0 && line[k] !== quoteChar) k--;
                if (k < 0) {
                  errorLine = i;
                  errorChar = j;
                  throw new Error('Unterminated string');
                }
              }
            }
          }
        }
      }

      // Check for unclosed elements
      if (stack.length > 0) {
        const last = stack[stack.length - 1];
        errorLine = last.line;
        errorChar = last.pos;
        if (last.type === 'string') {
          throw new Error(`Unclosed string starting with ${last.char}`);
        } else {
          throw new Error(`Unclosed ${last.char === '{' ? 'brace' : 'bracket'} '${last.char}'`);
        }
      }

      try {
        const json = JSON.stringify(eval(`(${input})`), null, 2);
        setOutput(json);
        setError('');
      } catch (err) {
        // Try to determine the position of the syntax error
        const match = err.message.match(/at position (\d+)/);
        if (match) {
          const pos = parseInt(match[1]);
          let currentPos = 0;
          for (let i = 0; i < lines.length; i++) {
            if (currentPos + lines[i].length >= pos) {
              errorLine = i;
              errorChar = pos - currentPos;
              break;
            }
            currentPos += lines[i].length + 1; // +1 for newline
          }
        }
        throw new Error(`Invalid Python dictionary syntax: ${err.message}`);
      }
    } catch (err) {
      const errorMessage = formatError(input, err.message, errorLine, errorChar);
      setError(errorMessage);
      setOutput('');
    }
  };

  const formatError = (input, message, lineNum, charNum) => {
    const lines = input.split('\n');
    const errorLine = lineNum >= 0 ? lineNum : 0;
    const errorChar = charNum >= 0 ? charNum : 0;

    let errorDisplay = 'Syntax Error: ' + message + '\n\n';

    const start = Math.max(0, errorLine - 3);
    const end = Math.min(lines.length, errorLine + 4);

    for (let i = start; i < end; i++) {
      const lineNumber = String(i + 1).padStart(4, ' ');
      const lineContent = lines[i];
      errorDisplay += `${lineNumber} | ${lineContent}\n`;

      if (i === errorLine) {
        // Calculate exact position for the caret
        const caretPos = lineContent.slice(0, errorChar).length;
        errorDisplay += '     | ' + ' '.repeat(caretPos) + '^\n';
        errorDisplay += '     | ' + ' '.repeat(caretPos) + message + '\n';
      }
    }

    return errorDisplay;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setShowToast(true);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      setInput(event.target.result);
    };

    reader.readAsText(file);
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  return (
    <div className={`app ${isFullScreen ? 'full-screen' : ''}`}>
      <h1>Python Dict to JSON Converter</h1>
      {showToast && (
        <div className="toast">
          Copied to clipboard!
        </div>
      )}
      {isMobile && (
        <div className="tabs">
          <button
            className={activeTab === 'input' ? 'active' : ''}
            onClick={() => setActiveTab('input')}
          >
            Input
          </button>
          <button
            className={activeTab === 'output' ? 'active' : ''}
            onClick={() => setActiveTab('output')}
          >
            Output
          </button>
        </div>
      )}
      <div className={`converter ${isMobile ? 'mobile' : ''}`}>
        {(!isMobile || activeTab === 'input') && (
          <div className="input">
            <h2>Python Dictionary</h2>
            <div className="editor-container">
              <div className="line-numbers">
                {input.split('\n').map((_, i) => (
                  <div key={i} className="line-number">{i + 1}</div>
                ))}
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter Python dictionary"
                wrap="soft"
                spellCheck="false"
              />
            </div>
            <div className="actions">
              <label htmlFor="file-upload" className="file-upload-label">
                Upload File
              </label>
              <input
                id="file-upload"
                type="file"
                onChange={handleFileUpload}
              />
            </div>
          </div>
        )}
        {(!isMobile || activeTab === 'output') && (
          <div className="output">
            <h2>JSON Output</h2>
            <div className="editor-container">
              <div className="line-numbers">
                {(output || error || '').split('\n').map((_, i) => (
                  <div key={i} className="line-number">{i + 1}</div>
                ))}
              </div>
              <textarea
                ref={outputRef}
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
        )}
      </div>
      <button className="full-screen-btn" onClick={toggleFullScreen}>
        {isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
      </button>
    </div>
  );
}

export default App;
