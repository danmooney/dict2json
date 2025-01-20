import React from 'react';

function InputSection({ input, setInput, handleFileUpload }) {
  return (
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
  );
}

export default InputSection; 