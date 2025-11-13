import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import SkinAnalysis from './pages/SkinAnalysis';
import ProductRecommendations from './pages/ProductRecommendations';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <div className="App">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/analysis" element={<SkinAnalysis />} />
            <Route path="/recommendations/:analysisId" element={<ProductRecommendations />} />
            <Route path="/recommendations" element={<ProductRecommendations />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
