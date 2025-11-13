import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import { AnalysisResult } from '../types';
import skinAnalysisAPI from '../services/api';

// Icons (you can replace these with actual icon components)
const ScanIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 24, height: 24 }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ProductIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 24, height: 24 }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

const HistoryIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 24, height: 24 }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const SparkleIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" style={{ width: 20, height: 20 }}>
    <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 18.5 8.134a1 1 0 010 1.732l-4.354.934-1.179 4.456a1 1 0 01-1.934 0L9.854 10.8 5.5 9.866a1 1 0 010-1.732l4.354-.934L11.033 2.744A1 1 0 0112 2z" clipRule="evenodd" />
  </svg>
);

const Dashboard: React.FC = () => {
  const [recentAnalyses, setRecentAnalyses] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null);
  const [stats, setStats] = useState({
    totalAnalyses: 0,
    avgSeverity: 'low' as 'low' | 'medium' | 'high',
    lastAnalysis: null as string | null
  });

  useEffect(() => {
    const checkBackendConnection = async () => {
      try {
        await skinAnalysisAPI.healthCheck();
        setBackendConnected(true);
        console.log('✅ Backend connection established');
      } catch (error) {
        setBackendConnected(false);
        console.log('❌ Backend connection failed:', error);
      }
    };

    const fetchRecentAnalyses = async () => {
      try {
        const analyses = await skinAnalysisAPI.getRecentAnalyses();
        setRecentAnalyses(analyses);
        
        // Calculate stats
        if (analyses.length > 0) {
          const severityScores = analyses.map(a => {
            switch(a.severity) {
              case 'high': return 3;
              case 'medium': return 2;
              case 'low': return 1;
              default: return 1;
            }
          });
          const avgScore = severityScores.reduce((a, b) => a + b, 0) / severityScores.length;
          const avgSeverity = avgScore > 2.5 ? 'high' : avgScore > 1.5 ? 'medium' : 'low';
          
          setStats({
            totalAnalyses: analyses.length,
            avgSeverity,
            lastAnalysis: analyses[0]?.timestamp || null
          });
        }
      } catch (error) {
        console.error('Error fetching recent analyses:', error);
        // Set dummy data for demonstration when backend is not available
        setRecentAnalyses([
          {
            id: '1',
            timestamp: new Date().toISOString(),
            issues: [
              { id: '1', type: 'acne', confidence: 0.8, bbox: { x: 100, y: 100, width: 30, height: 30 } }
            ],
            recommendations: ['Gentle Cleanser', 'Moisturizer'],
            severity: 'low',
          },
        ]);
        setStats({
          totalAnalyses: 1,
          avgSeverity: 'low',
          lastAnalysis: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    };

    checkBackendConnection();
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

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100
      }
    }
  };

  return (
    <motion.div 
      className="container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="header" variants={itemVariants}>
        <h1>
          <SparkleIcon />
          Boots Skin Care Analysis
        </h1>
        <p>AI-powered skin analysis with personalized product recommendations from Boots</p>
        
        {/* Connection Status */}
        {backendConnected !== null && (
          <motion.div 
            style={{
              background: backendConnected ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-sm) var(--space-md)',
              marginTop: 'var(--space-md)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-sm)'
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            <div style={{ 
              background: backendConnected ? '#4CAF50' : '#F44336',
              borderRadius: '50%',
              width: '8px',
              height: '8px'
            }} />
            <span style={{ 
              color: backendConnected ? '#4CAF50' : '#F44336', 
              fontWeight: 600,
              fontSize: '0.85rem'
            }}>
              {backendConnected ? ' Online' : 'Offline'}
            </span>
          </motion.div>
        )}
      </motion.div>

      {/* Stats Cards */}
      <motion.div className="dashboard-grid" variants={itemVariants} style={{ marginBottom: 'var(--space-xl)' }}>
        <motion.div className="card" whileHover={{ y: -8, scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
            <div style={{ 
              background: 'var(--accent-gradient)', 
              padding: 'var(--space-md)', 
              borderRadius: 'var(--radius-md)',
              color: 'white',
              display: 'flex',
              alignItems: 'center'
            }}>
              <ScanIcon />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>
                {stats.totalAnalyses}
              </h3>
              <p style={{ margin: 0, color: 'var(--gray-500)', fontSize: '0.9rem' }}>Total Analyses</p>
            </div>
          </div>
        </motion.div>

        <motion.div className="card" whileHover={{ y: -8, scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
            <div style={{ 
              background: 'var(--success-gradient)', 
              padding: 'var(--space-md)', 
              borderRadius: 'var(--radius-md)',
              color: 'white',
              display: 'flex',
              alignItems: 'center'
            }}>
              <HistoryIcon />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, textTransform: 'capitalize' }}>
                {stats.avgSeverity} Risk
              </h3>
              <p style={{ margin: 0, color: 'var(--gray-500)', fontSize: '0.9rem' }}>
                {stats.lastAnalysis ? formatRelativeTime(stats.lastAnalysis) : 'No recent analysis'}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Main Action Cards */}
      <motion.div className="dashboard-grid" variants={itemVariants}>
        <motion.div 
          className="card" 
          whileHover={{ y: -8, scale: 1.02 }} 
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
            <div style={{ 
              background: 'var(--primary-gradient)', 
              padding: 'var(--space-lg)', 
              borderRadius: 'var(--radius-md)',
              color: 'white',
              display: 'flex',
              alignItems: 'center'
            }}>
              <ScanIcon />
            </div>
            <div>
              <h3>AI Skin Analysis</h3>
              <p style={{ margin: 0 }}>Get instant AI-powered analysis of your skin</p>
            </div>
          </div>
          <p>Use our advanced computer vision technology to analyze your skin in real-time and detect common skin issues including acne, dark spots, redness, and more.</p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/analysis" className="btn-primary">
              <ScanIcon />
              Start Analysis
            </Link>
          </motion.div>
        </motion.div>

        <motion.div 
          className="card" 
          whileHover={{ y: -8, scale: 1.02 }} 
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
            <div style={{ 
              background: 'var(--secondary-gradient)', 
              padding: 'var(--space-lg)', 
              borderRadius: 'var(--radius-md)',
              color: 'white',
              display: 'flex',
              alignItems: 'center'
            }}>
              <ProductIcon />
            </div>
            <div>
              <h3>Product Recommendations</h3>
              <p style={{ margin: 0 }}>Discover personalized skincare solutions</p>
            </div>
          </div>
          <p>Browse our curated collection of Boots skincare products, carefully selected and recommended based on your specific skin concerns and analysis results.</p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/recommendations/sample" className="btn-secondary">
              <ProductIcon />
              Browse Products
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Recent Analysis Section */}
      <motion.div className="recent-analysis" variants={itemVariants}>
        <h3>
          <HistoryIcon />
          Recent Analysis History
        </h3>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-3xl)' }}>
            <div className="loading-spinner"></div>
          </div>
        ) : recentAnalyses.length > 0 ? (
          <div>
            {recentAnalyses.map((analysis, index) => (
              <motion.div 
                key={analysis.id} 
                className="analysis-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div>
                  <div className="analysis-result">
                    Analysis #{analysis.id.slice(0, 8)}
                    <span style={{ 
                      marginLeft: 'var(--space-md)', 
                      fontSize: '0.9rem', 
                      color: 'var(--gray-500)' 
                    }}>
                      {analysis.issues?.length || 0} issues detected
                    </span>
                  </div>
                  <div className="analysis-date">
                    {formatDate(analysis.timestamp)} • {formatRelativeTime(analysis.timestamp)}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                  <span className={`severity-badge ${analysis.severity}`}>
                    {analysis.severity}
                  </span>
                  <motion.button 
                    style={{ 
                      background: 'var(--primary-gradient)',
                      color: 'white',
                      border: 'none',
                      padding: 'var(--space-sm) var(--space-md)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.location.href = `/recommendations/${analysis.id}`}
                  >
                    View Results
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div 
            className="empty-state"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div style={{ 
              fontSize: '3rem', 
              marginBottom: 'var(--space-lg)', 
              opacity: 0.5 
            }}>
              🔬
            </div>
            <h4>No analyses yet</h4>
            <p>Start your first skin analysis to begin tracking your skin health journey!</p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/analysis" className="btn-primary">
                <ScanIcon />
                Start Your First Analysis
              </Link>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
