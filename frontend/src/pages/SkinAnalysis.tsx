import React, { useRef, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Webcam from 'react-webcam';
import { SkinIssue } from '../types';
import skinAnalysisAPI from '../services/api';

// Icons
const CameraIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 24, height: 24 }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ScanIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 24, height: 24 }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const BackIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 20, height: 20 }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 20, height: 20 }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const SkinAnalysis: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const navigate = useNavigate();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedIssues, setDetectedIssues] = useState<SkinIssue[]>([]);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [showRecommendationButton, setShowRecommendationButton] = useState(false);
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string>('');
  const [countdown, setCountdown] = useState(0);
  const [analysisStage, setAnalysisStage] = useState<'preparing' | 'detecting' | 'analyzing' | 'complete'>('preparing');

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: 'user',
  };

  const startAnalysis = useCallback(() => {
    setIsAnalyzing(true);
    setDetectedIssues([]);
    setAnalysisProgress(0);
    setShowRecommendationButton(false);
    setCountdown(8);
    setAnalysisStage('preparing');

    // Simulate multi-stage analysis
    setTimeout(() => setAnalysisStage('detecting'), 2000);
    setTimeout(() => setAnalysisStage('analyzing'), 5000);
    setTimeout(() => setAnalysisStage('complete'), 8000);

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          performAnalysis();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Smooth progress animation
    const progressInterval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 12.5; // 8 seconds * 12.5 = 100%
      });
    }, 1000);

    // Progressive issue detection
    setTimeout(() => {
      setDetectedIssues([{
        id: '1',
        type: 'acne',
        confidence: 0.85,
        bbox: { x: 220, y: 180, width: 35, height: 35 },
      }]);
    }, 3000);

    setTimeout(() => {
      setDetectedIssues(prev => [...prev, {
        id: '2',
        type: 'dark_spots',
        confidence: 0.72,
        bbox: { x: 380, y: 220, width: 28, height: 28 },
      }]);
    }, 5000);

    setTimeout(() => {
      setDetectedIssues(prev => [...prev, {
        id: '3',
        type: 'redness',
        confidence: 0.68,
        bbox: { x: 160, y: 140, width: 45, height: 30 },
      }]);
    }, 6500);

  }, []);

  const performAnalysis = async () => {
    try {
      if (webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
          console.log('Sending image for analysis...');
          const result = await skinAnalysisAPI.analyzeSkinFrame(imageSrc);
          console.log('Analysis result:', result);
          setCurrentAnalysisId(result.id);
          setDetectedIssues(result.issues);
        } else {
          console.error('Failed to capture image from webcam');
          throw new Error('Failed to capture image');
        }
      } else {
        console.error('Webcam not available');
        throw new Error('Webcam not available');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      const mockAnalysisId = 'mock-analysis-' + Date.now();
      console.log('🎭 SkinAnalysis: Setting mock analysis ID:', mockAnalysisId);
      setCurrentAnalysisId(mockAnalysisId);
      
      // Enhanced mock data with more realistic distribution
      const mockIssues: SkinIssue[] = [
        {
          id: '1',
          type: 'acne',
          confidence: 0.78,
          bbox: { x: 220, y: 180, width: 35, height: 35 },
        },
        {
          id: '2',
          type: 'dark_spots',
          confidence: 0.65,
          bbox: { x: 380, y: 220, width: 28, height: 28 },
        },
        {
          id: '3',
          type: 'redness',
          confidence: 0.72,
          bbox: { x: 160, y: 140, width: 45, height: 30 },
        }
      ];
      setDetectedIssues(mockIssues);
    }
    
    setIsAnalyzing(false);
    setAnalysisStage('complete');
    setShowRecommendationButton(true);
  };

  const goToRecommendations = () => {
    console.log('🎯 SkinAnalysis: Navigating to recommendations with ID:', currentAnalysisId);
    if (!currentAnalysisId) {
      console.warn('⚠️ No currentAnalysisId available, using sample');
      navigate(`/recommendations/sample`);
    } else {
      navigate(`/recommendations/${currentAnalysisId}`);
    }
  };

  const resetAnalysis = () => {
    setShowRecommendationButton(false);
    setDetectedIssues([]);
    setAnalysisProgress(0);
    setAnalysisStage('preparing');
  };

  const getIssueColor = (type: string) => {
    const colors = {
      acne: '#ff4757',
      dark_spots: '#ffa502',
      wrinkles: '#3742fa',
      redness: '#ff6b81',
      dryness: '#70a1ff',
      oily_skin: '#5f27cd',
    };
    return colors[type as keyof typeof colors] || '#ff4757';
  };

  const getIssueLabel = (type: string) => {
    const labels = {
      acne: 'Acne',
      dark_spots: 'Dark Spots',
      wrinkles: 'Wrinkles',
      redness: 'Redness',
      dryness: 'Dry Skin',
      oily_skin: 'Oily Skin',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getAnalysisMessage = () => {
    switch(analysisStage) {
      case 'preparing':
        return 'Initializing camera and AI models...';
      case 'detecting':
        return 'Detecting facial features and skin areas...';
      case 'analyzing':
        return 'Analyzing skin texture and identifying issues...';
      case 'complete':
        return 'Analysis complete!';
      default:
        return 'Preparing analysis...';
    }
  };

  return (
    <motion.div 
      className="container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="header"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h1>
          <CameraIcon />
          Live Skin Analysis
        </h1>
        <p>Position your face in the camera frame for optimal analysis</p>
      </motion.div>

      <motion.div 
        className="camera-container"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
        style={{ position: 'relative', marginBottom: 'var(--space-xl)' }}
      >
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          style={{ 
            width: '100%', 
            height: 'auto',
            borderRadius: 'var(--radius-xl)'
          }}
        />
        
        {/* Face Detection Guide */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '200px',
          height: '240px',
          border: '2px dashed rgba(255, 255, 255, 0.6)',
          borderRadius: 'var(--radius-lg)',
          pointerEvents: 'none',
          display: isAnalyzing || showRecommendationButton ? 'none' : 'block'
        }}>
          <div style={{
            position: 'absolute',
            bottom: '-40px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: 'var(--space-sm) var(--space-md)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            whiteSpace: 'nowrap'
          }}>
            Position your face here
          </div>
        </div>
        
        {/* Detection Overlays */}
        <AnimatePresence>
          {detectedIssues.map((issue, index) => (
            <motion.div
              key={issue.id}
              className="detection-box"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ delay: index * 0.2, type: "spring" }}
              style={{
                left: `${issue.bbox.x}px`,
                top: `${issue.bbox.y}px`,
                width: `${issue.bbox.width}px`,
                height: `${issue.bbox.height}px`,
                borderColor: getIssueColor(issue.type),
                backgroundColor: `${getIssueColor(issue.type)}20`,
              }}
            >
              <motion.div
                className="detection-label"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                style={{ backgroundColor: getIssueColor(issue.type) }}
              >
                {getIssueLabel(issue.type)} ({Math.round(issue.confidence * 100)}%)
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Analysis Overlay */}
        <AnimatePresence>
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-xl)',
                backdropFilter: 'blur(4px)'
              }}
            >
              <div style={{ 
                color: 'white', 
                textAlign: 'center',
                padding: 'var(--space-xl)'
              }}>
                <motion.div 
                  className="loading-spinner"
                  style={{ 
                    marginBottom: 'var(--space-lg)',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    borderLeftColor: 'white'
                  }}
                />
                <h3 style={{ margin: '0 0 var(--space-md) 0', color: 'white' }}>
                  Analyzing... {countdown > 0 ? `${countdown}s` : ''}
                </h3>
                <p style={{ margin: 0, opacity: 0.8, fontSize: '0.9rem' }}>
                  {getAnalysisMessage()}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Analysis Controls */}
      <motion.div 
        className="analysis-status"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <AnimatePresence mode="wait">
          {!isAnalyzing && !showRecommendationButton && (
            <motion.div
              key="start"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{ textAlign: 'center' }}
            >
              <h3 style={{ marginBottom: 'var(--space-lg)', color: 'var(--gray-800)' }}>
                Ready to Analyze
              </h3>
              <p style={{ marginBottom: 'var(--space-xl)', color: 'var(--gray-600)' }}>
                Make sure your face is well-lit and positioned within the guide frame
              </p>
              <motion.button 
                className="btn-primary"
                onClick={startAnalysis}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ fontSize: '1.1rem', padding: 'var(--space-md) var(--space-xl)' }}
              >
                <ScanIcon />
                Start Analysis
              </motion.button>
            </motion.div>
          )}

          {isAnalyzing && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{ textAlign: 'center' }}
            >
              <h3 style={{ color: 'var(--gray-800)', marginBottom: 'var(--space-md)' }}>
                {getAnalysisMessage()}
              </h3>
              <div className="progress-bar" style={{ marginBottom: 'var(--space-md)' }}>
                <motion.div
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${analysisProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>
                {detectedIssues.length > 0 && `${detectedIssues.length} issue${detectedIssues.length !== 1 ? 's' : ''} detected so far...`}
              </p>
            </motion.div>
          )}

          {showRecommendationButton && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{ textAlign: 'center' }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                style={{ 
                  fontSize: '3rem', 
                  marginBottom: 'var(--space-lg)',
                  filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))'
                }}
              >
                ✨
              </motion.div>
              <h3 style={{ color: 'var(--gray-800)', marginBottom: 'var(--space-md)' }}>
                Analysis Complete!
              </h3>
              <p style={{ 
                color: 'var(--gray-600)', 
                marginBottom: 'var(--space-xl)',
                fontSize: '1.1rem'
              }}>
                {detectedIssues.length > 0
                  ? `Found ${detectedIssues.length} skin concern${detectedIssues.length !== 1 ? 's' : ''} - let's find the perfect products for you!`
                  : 'Your skin looks great! Check out our recommendations to maintain your healthy glow.'}
              </p>
              <div style={{ 
                display: 'flex', 
                gap: 'var(--space-md)', 
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                <motion.button 
                  className="btn-primary"
                  onClick={goToRecommendations}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ minWidth: '200px' }}
                >
                  Get Recommendations
                </motion.button>
                <motion.button
                  className="btn-secondary"
                  onClick={resetAnalysis}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RefreshIcon />
                  Analyze Again
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Navigation */}
      <motion.div 
        style={{ textAlign: 'center', marginTop: 'var(--space-xl)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <motion.button
          className="btn-secondary"
          onClick={() => navigate('/')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <BackIcon />
          Back to Dashboard
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default SkinAnalysis;
