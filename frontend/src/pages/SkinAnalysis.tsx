import React, { useRef, useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { SkinIssue, AnalysisResult } from '../types';
import skinAnalysisAPI from '../services/api';

const SkinAnalysis: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const navigate = useNavigate();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedIssues, setDetectedIssues] = useState<SkinIssue[]>([]);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [showRecommendationButton, setShowRecommendationButton] = useState(false);
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string>('');
  const [countdown, setCountdown] = useState(0);

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
    setCountdown(10);

    // Simulate 10-second analysis countdown
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

    // Simulate progress
    const progressInterval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 1000);

    // Simulate real-time issue detection during analysis
    setTimeout(() => {
      const mockIssues: SkinIssue[] = [
        {
          id: '1',
          type: 'acne',
          confidence: 0.85,
          bbox: { x: 200, y: 150, width: 40, height: 40 },
        },
        {
          id: '2',
          type: 'dark_spots',
          confidence: 0.72,
          bbox: { x: 350, y: 200, width: 25, height: 25 },
        },
      ];
      setDetectedIssues(mockIssues);
    }, 3000);

  }, []);

  const performAnalysis = async () => {
    try {
      if (webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
          const result = await skinAnalysisAPI.analyzeSkinFrame(imageSrc);
          setCurrentAnalysisId(result.id);
          setDetectedIssues(result.issues);
        }
      }
    } catch (error) {
      console.error('Analysis error:', error);
      // Use mock data on error
      setCurrentAnalysisId('mock-analysis-' + Date.now());
    }
    
    setIsAnalyzing(false);
    setShowRecommendationButton(true);
  };

  const goToRecommendations = () => {
    navigate(`/recommendations/${currentAnalysisId}`);
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

  return (
    <div className="container">
      <div className="header">
        <h1>Live Skin Analysis</h1>
        <p>Position your face in the camera frame and click analyze</p>
      </div>

      <div className="camera-container">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          style={{ width: '100%', height: 'auto' }}
        />
        
        {/* Detection Overlays */}
        <div className="camera-overlay">
          {detectedIssues.map((issue) => (
            <div
              key={issue.id}
              className="detection-box"
              style={{
                left: `${issue.bbox.x}px`,
                top: `${issue.bbox.y}px`,
                width: `${issue.bbox.width}px`,
                height: `${issue.bbox.height}px`,
                borderColor: getIssueColor(issue.type),
                backgroundColor: `${getIssueColor(issue.type)}20`,
              }}
            >
              <div
                className="detection-label"
                style={{ backgroundColor: getIssueColor(issue.type) }}
              >
                {getIssueLabel(issue.type)} ({Math.round(issue.confidence * 100)}%)
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analysis Status */}
      <div className="analysis-status">
        {!isAnalyzing && !showRecommendationButton && (
          <button className="btn-primary" onClick={startAnalysis}>
            Start Analysis
          </button>
        )}

        {isAnalyzing && (
          <div>
            <h3>Analyzing... {countdown > 0 ? `${countdown}s` : 'Processing'}</h3>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${analysisProgress}%` }}
              ></div>
            </div>
            <p>Detecting skin issues in real-time...</p>
          </div>
        )}

        {showRecommendationButton && (
          <div>
            <h3>Analysis Complete!</h3>
            <p>
              {detectedIssues.length > 0
                ? `Found ${detectedIssues.length} skin concern(s)`
                : 'Your skin looks great!'}
            </p>
            <button className="btn-primary" onClick={goToRecommendations}>
              Get Product Recommendations
            </button>
            <button
              className="btn-secondary"
              onClick={() => {
                setShowRecommendationButton(false);
                setDetectedIssues([]);
                setAnalysisProgress(0);
              }}
              style={{ marginLeft: '10px' }}
            >
              Analyze Again
            </button>
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button
          className="btn-secondary"
          onClick={() => navigate('/')}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default SkinAnalysis;
