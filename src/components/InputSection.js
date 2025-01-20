import React from 'react';
import Toolbar from './Toolbar';

function InputSection({ input, setInput, handleFileUpload }) {
  return (
    <div className="input">
      <div className="section-header">
        <h2>Python Dictionary</h2>
        <Toolbar onFileUpload={handleFileUpload} />
      </div>
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
    </div>
  );
}

export default InputSection; 