import React from 'react';
import DataMatrixScanner from './DataMatrixScanner';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="App">
      <h1>Mobile Data Matrix Scanner</h1>
      <DataMatrixScanner />
    </div>
  );
};

export default App;
