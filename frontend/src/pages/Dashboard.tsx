import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnalysisResult } from '../types';
import skinAnalysisAPI from '../services/api';

const Dashboard: React.FC = () => {
  const [recentAnalyses, setRecentAnalyses] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentAnalyses = async () => {
      try {
        const analyses = await skinAnalysisAPI.getRecentAnalyses();
        setRecentAnalyses(analyses);
      } catch (error) {
        console.error('Error fetching recent analyses:', error);
        // Set dummy data for demonstration
        setRecentAnalyses([
          {
            id: '1',
            timestamp: new Date().toISOString(),
            issues: [],
            recommendations: ['Gentle Cleanser', 'Moisturizer'],
            severity: 'low',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentAnalyses();
  }, []);

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Boots Skin Care Analysis</h1>
        <p>AI-powered skin analysis with personalized product recommendations</p>
      </div>

      <div className="dashboard-grid">
        {/* Analyze Button Card */}
        <div className="card">
          <h3>Start Skin Analysis</h3>
          <p>Use our advanced AR technology to analyze your skin in real-time and detect common skin issues.</p>
          <Link to="/analysis" className="btn-primary">
            Analyze My Skin
          </Link>
        </div>

        {/* Products Button Card */}
        <div className="card">
          <h3>Browse Products</h3>
          <p>Explore our curated collection of skincare products designed to address various skin concerns.</p>
          <Link to="/recommendations/sample" className="btn-secondary">
            View All Products
          </Link>
        </div>
      </div>

      {/* Recent Analysis Section */}
      <div className="recent-analysis">
        <h3>Recent Analysis</h3>
        {loading ? (
          <p>Loading recent analyses...</p>
        ) : recentAnalyses.length > 0 ? (
          <div>
            {recentAnalyses.map((analysis) => (
              <div key={analysis.id} className="analysis-item">
                <div>
                  <div className="analysis-result">
                    Analysis #{analysis.id}
                  </div>
                  <div className="analysis-date">
                    {formatDate(analysis.timestamp)}
                  </div>
                </div>
                <div>
                  <span className={`severity-badge ${analysis.severity}`}>
                    {analysis.severity.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: '#666', fontSize: '1.1rem' }}>
              No analyses yet. Start your first skin analysis!
            </p>
            <Link to="/analysis" className="btn-primary">
              Analyze Now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
