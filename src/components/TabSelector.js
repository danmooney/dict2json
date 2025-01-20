import React from 'react';

function TabSelector({ activeTab, setActiveTab }) {
  return (
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
  );
}

export default TabSelector; 