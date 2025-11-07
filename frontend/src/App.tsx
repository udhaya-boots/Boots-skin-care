import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import SkinAnalysis from './pages/SkinAnalysis';
import ProductRecommendations from './pages/ProductRecommendations';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analysis" element={<SkinAnalysis />} />
          <Route path="/recommendations/:analysisId" element={<ProductRecommendations />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
