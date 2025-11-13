import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Product } from '../types';
import skinAnalysisAPI from '../services/api';

// Icons
const ShoppingBagIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 20, height: 20 }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

const StarIcon = ({ filled = true }: { filled?: boolean }) => (
  <svg className="w-4 h-4" fill={filled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" style={{ width: 16, height: 16 }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
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

const TrophyIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" style={{ width: 20, height: 20 }}>
    <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM6 10a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
  </svg>
);

const ProductRecommendations: React.FC = () => {
  const { analysisId } = useParams<{ analysisId: string }>();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [confidenceScore, setConfidenceScore] = useState<number>(0);

  // Debug logging
  console.log('🚀 ProductRecommendations component mounted with analysisId:', analysisId);

  // Safety check - if component fails to render, this will help debug
  useEffect(() => {
    console.log('🔄 ProductRecommendations useEffect triggered');
  }, []);

  // Enhanced mock products with premium Boots branding
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Boots Expert Anti-Blemish Daily Cleanser',
      description: 'A gentle daily cleanser formulated with salicylic acid to help prevent blemishes and unclog pores. Dermatologically tested and suitable for sensitive skin.',
      price: 12.99,
      image_url: '/images/cleanser.jpg',
      category: 'Cleanser',
      target_issues: ['acne', 'oily_skin'],
      rating: 4.5,
      brand: 'Boots Expert',
    },
    {
      id: '2',
      name: 'Boots Ingredients Niacinamide 10% + Zinc Serum',
      description: 'A concentrated serum with 10% niacinamide and zinc to help minimize pores, control oil production, and improve skin texture.',
      price: 8.99,
      image_url: '/images/serum.jpg',
      category: 'Treatment',
      target_issues: ['acne', 'dark_spots', 'oily_skin'],
      rating: 4.7,
      brand: 'Boots Ingredients',
    },
    {
      id: '3',
      name: 'Boots Protect Light Moisturiser SPF 30',
      description: 'A lightweight daily moisturizer with broad-spectrum SPF 30 protection. Non-comedogenic formula perfect for daily use and suitable for all skin types.',
      price: 15.99,
      image_url: '/images/moisturizer.jpg',
      category: 'Moisturizer',
      target_issues: ['dryness', 'dark_spots'],
      rating: 4.3,
      brand: 'Boots Protect',
    },
  ];

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        console.log('🔍 ProductRecommendations: Starting fetch for analysisId:', analysisId);
        setLoading(true);
        setError('');
        
        if (analysisId && analysisId !== 'sample') {
          console.log('🔍 Making API call to get recommendations for:', analysisId);
          const response = await skinAnalysisAPI.getRecommendations(analysisId);
          console.log('✅ API response received:', response);
          
          if (response && response.products) {
            setProducts(response.products);
            setConfidenceScore(response.confidence_score || 0.85);
          } else {
            console.warn('⚠️ Invalid API response, using mock data');
            setProducts(mockProducts);
            setConfidenceScore(0.85);
          }
        } else {
          console.log('📦 Using mock data for analysisId:', analysisId);
          // Use mock data for demonstration
          setProducts(mockProducts);
        }
      } catch (err) {
        console.error('❌ Error fetching recommendations:', err);
        setError(`Failed to load recommendations: ${err instanceof Error ? err.message : 'Unknown error'}`);
        // Fallback to mock data to prevent blank page
        console.log('📦 Falling back to mock data due to error');
        setProducts(mockProducts);
        setConfidenceScore(0.75);
      } finally {
        setLoading(false);
        console.log('🏁 ProductRecommendations: Fetch completed');
      }
    };

    // Add safety check
    if (!analysisId) {
      console.warn('⚠️ No analysisId provided, using sample data');
      setProducts(mockProducts);
      setConfidenceScore(0.80);
      setLoading(false);
      return;
    }

    fetchRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysisId]);

  const handleBuyNow = (product: Product) => {
    // In a real app, this would integrate with Boots' e-commerce system
    alert(`Redirecting to purchase ${productId}...`);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="header">
          <h1>⚠️ Loading Error</h1>
          <p>Something went wrong. Redirecting to dashboard...</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <button 
            className="btn-primary"
            onClick={() => navigate('/')}
          >
            Back to Dashboard
          </button>
        </div>
      </div>

    )
  }

  if (error) {
    return (
      <div className="container">
        <div className="header">
          <h1>😔 Oops! Something went wrong</h1>
          <p>{error}</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <motion.button 
            className="btn-primary"
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <BackIcon />
            Back to Dashboard
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="header" variants={itemVariants}>
        <h1>
          <TrophyIcon />
          Your Personalized Recommendations
        </h1>
        <p>Based on your skin analysis, here are our top {products.length} premium Boots products tailored just for you</p>
        
        {/* Confidence Score */}
        <motion.div 
          style={{
            background: 'rgba(102, 126, 234, 0.1)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-md) var(--space-lg)',
            marginTop: 'var(--space-lg)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-sm)'
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
        >
          <div style={{ 
            background: 'var(--primary-gradient)',
            borderRadius: '50%',
            width: '8px',
            height: '8px'
          }} />
          <span style={{ 
            color: 'var(--gray-700)', 
            fontWeight: 600,
            fontSize: '0.9rem'
          }}>
            {Math.round(confidenceScore * 100)}% Confidence Match
          </span>
        </motion.div>
      </motion.div>

      <div className="product-grid">
        {products.map((product, index) => (
          <div key={product.id} className="product-card">
            <div
              className="product-image"
              style={{
                backgroundColor: '#f8f9fa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                color: '#666',
              }}
            >
              Product Image Placeholder
            </div>
            
            <div className="product-info">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <h3 className="product-title">{product.name}</h3>
                <span style={{
                  background: '#667eea',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}>
                  #{index + 1}
                </span>
              </div>
              
              <p className="product-description">{product.description}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <span className="product-price">£{product.price}</span>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ color: '#ffa502', marginRight: '5px' }}>★</span>
                  <span>{product.rating}</span>
                </div>
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <strong>Target Issues:</strong>
                <div style={{ marginTop: '5px' }}>
                  {product.target_issues.map((issue) => (
                    <span
                      key={issue}
                      style={{
                        display: 'inline-block',
                        background: '#f0f0f0',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        marginRight: '5px',
                        marginBottom: '5px',
                      }}
                    >
                      {issue.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
              
              <button
                className="btn-primary"
                onClick={() => handleBuyNow(product.id)}
                style={{ width: '100%' }}
              >
                Buy Now - £{product.price}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <button
          className="btn-secondary"
          onClick={() => navigate('/analysis')}
          style={{ marginRight: '10px' }}
        >
          Analyze Again
        </button>
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

export default ProductRecommendations;
