import React, { useState, useEffect } from 'react';
import InputSection from './components/InputSection';
import OutputSection from './components/OutputSection';
import TabSelector from './components/TabSelector';
import Toast from './components/Toast';
import { convertToJson } from './utils/converter';
import './styles/variables.css';
import './styles/layout.css';
import './styles/editor.css';
import './styles/toolbar.css';
import './styles/components.css';
import './styles/responsive.css';

function App() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('input');
  const [isMobile, setIsMobile] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const { output, error } = convertToJson(input);
    setOutput(output);
    setError(error);
  }, [input]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleCopy = () => {
    const contentToCopy = error ? `Error: ${error}` : output;
    navigator.clipboard.writeText(contentToCopy);
    setShowToast(true);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => setInput(event.target.result);
    reader.readAsText(file);
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  return (
    <div className={`app ${isFullScreen ? 'full-screen' : ''}`}>
      <h1>Python Dict to JSON Converter</h1>
      <Toast show={showToast} />
      
      {isMobile && (
        <TabSelector activeTab={activeTab} setActiveTab={setActiveTab} />
      )}
      
      <div className={`converter ${isMobile ? 'mobile' : ''}`}>
        {(!isMobile || activeTab === 'input') && (
          <InputSection
            input={input}
            setInput={setInput}
            handleFileUpload={handleFileUpload}
            error={error}
          />
        )}
        
        {(!isMobile || activeTab === 'output') && (
          <OutputSection
            output={output}
            error={error}
            handleCopy={handleCopy}
          />
        )}
      </div>
      
      <button className="full-screen-btn" onClick={toggleFullScreen}>
        {isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
      </button>
    </div>
  );
}

export default App;
