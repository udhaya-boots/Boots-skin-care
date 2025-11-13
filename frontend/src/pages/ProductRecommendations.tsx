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
          setConfidenceScore(0.87);
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
    const message = `🛍️ Redirecting to purchase ${product.name} for £${product.price}...`;
    alert(message);
    // Example: window.open(`https://boots.com/products/${product.id}`, '_blank');
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <StarIcon key={index} filled={index < Math.floor(rating)} />
    ));
  };

  const getIssueColor = (issue: string) => {
    const colors = {
      acne: '#ff4757',
      dark_spots: '#ffa502',
      wrinkles: '#3742fa',
      redness: '#ff6b81',
      dryness: '#70a1ff',
      oily_skin: '#5f27cd',
    };
    return colors[issue as keyof typeof colors] || '#667eea';
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

  // Safety fallback for any rendering issues
  if (!products && !loading && !error) {
    console.error('🚨 Component in invalid state - resetting to mock data');
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
    );
  }

  if (loading) {
    return (
      <motion.div 
        className="container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="header">
          <h1>✨ Curating Your Perfect Match...</h1>
          <p>Our AI is analyzing your skin to find the best Boots products for you</p>
        </div>
        <motion.div 
          style={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center', 
            padding: 'var(--space-3xl)',
            textAlign: 'center'
          }}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
        >
          <div className="loading-spinner" style={{ marginBottom: 'var(--space-lg)' }}></div>
          <h3 style={{ color: 'var(--gray-700)', marginBottom: 'var(--space-md)' }}>
            Analyzing your skin profile...
          </h3>
          <div className="progress-bar" style={{ maxWidth: '400px', margin: '0 auto' }}>
            <motion.div 
              className="progress-fill" 
              initial={{ width: '0%' }}
              animate={{ width: '85%' }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          </div>
          <p style={{ color: 'var(--gray-500)', marginTop: 'var(--space-md)' }}>
            Finding the perfect products from our premium collection...
          </p>
        </motion.div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        className="container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
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

      <motion.div className="product-grid" variants={itemVariants}>
        <AnimatePresence>
          {products.map((product, index) => (
            <motion.div 
              key={product.id} 
              className="product-card"
              variants={itemVariants}
              whileHover={{ 
                y: -12, 
                scale: 1.03,
                transition: { type: "spring", stiffness: 300, damping: 20 }
              }}
              layout
            >
              {/* Rank Badge */}
              <motion.div
                style={{
                  position: 'absolute',
                  top: 'var(--space-md)',
                  right: 'var(--space-md)',
                  background: index === 0 ? 'var(--primary-gradient)' : 
                             index === 1 ? 'var(--secondary-gradient)' : 'var(--accent-gradient)',
                  color: 'white',
                  padding: 'var(--space-xs) var(--space-md)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  zIndex: 10,
                  boxShadow: 'var(--shadow-md)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: index * 0.2 + 0.3 }}
              >
                {index === 0 ? '🏆 Best Match' : 
                 index === 1 ? '🥈 Great Choice' : '🥉 Recommended'}
              </motion.div>
              
              {/* Product Image */}
              <motion.div
                className="product-image"
                style={{
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  color: 'var(--gray-500)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                <div style={{ 
                  textAlign: 'center',
                  padding: 'var(--space-lg)'
                }}>
                  <div style={{ 
                    fontSize: '3rem',
                    marginBottom: 'var(--space-md)',
                    opacity: 0.7 
                  }}>
                    🧴
                  </div>
                  <p style={{ margin: 0, fontWeight: 600 }}>
                    {product.brand}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8 }}>
                    {product.category}
                  </p>
                </div>
              </motion.div>
              
              <div className="product-info">
                <motion.div 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start', 
                    marginBottom: 'var(--space-md)' 
                  }}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.4 }}
                >
                  <h3 className="product-title" style={{ marginRight: 'var(--space-md)' }}>
                    {product.name}
                  </h3>
                </motion.div>
                
                <motion.p 
                  className="product-description"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                >
                  {product.description}
                </motion.p>
                
                {/* Price and Rating */}
                <motion.div 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: 'var(--space-lg)' 
                  }}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.6 }}
                >
                  <span className="product-price">£{product.price}</span>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 'var(--space-xs)',
                    color: '#ffa502'
                  }}>
                    {renderStars(product.rating)}
                    <span style={{ 
                      marginLeft: 'var(--space-xs)',
                      color: 'var(--gray-600)',
                      fontSize: '0.9rem',
                      fontWeight: 600
                    }}>
                      {product.rating}
                    </span>
                  </div>
                </motion.div>
                
                {/* Target Issues */}
                <motion.div 
                  style={{ marginBottom: 'var(--space-lg)' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.7 }}
                >
                  <div style={{ 
                    color: 'var(--gray-700)', 
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    marginBottom: 'var(--space-sm)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    🎯 Targets
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)' }}>
                    {product.target_issues.map((issue) => (
                      <motion.span
                        key={issue}
                        style={{
                          background: `${getIssueColor(issue)}20`,
                          border: `1px solid ${getIssueColor(issue)}40`,
                          color: getIssueColor(issue),
                          padding: 'var(--space-xs) var(--space-sm)',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          textTransform: 'capitalize'
                        }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.8 }}
                        whileHover={{ scale: 1.1 }}
                      >
                        {issue.replace('_', ' ')}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
                
                {/* Buy Button */}
                <motion.button
                  className="btn-primary"
                  onClick={() => handleBuyNow(product)}
                  style={{ 
                    width: '100%',
                    fontSize: '1rem',
                    fontWeight: 700
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.9, type: "spring" }}
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: `0 8px 25px ${getIssueColor(product.target_issues[0])}40`
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ShoppingBagIcon />
                  Buy Now - £{product.price}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-3xl)',
          marginTop: 'var(--space-3xl)',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: 'var(--shadow-lg)'
        }}
        variants={itemVariants}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, type: "spring" }}
          style={{ fontSize: '3rem', marginBottom: 'var(--space-lg)' }}
        >
          ✨
        </motion.div>
        <h3 style={{ 
          color: 'var(--gray-800)', 
          marginBottom: 'var(--space-md)',
          fontFamily: 'var(--font-serif)'
        }}>
          Love your skin journey!
        </h3>
        <p style={{ 
          color: 'var(--gray-600)', 
          marginBottom: 'var(--space-xl)',
          maxWidth: '500px',
          margin: '0 auto var(--space-xl) auto'
        }}>
          Track your progress and discover new products by running another analysis in a few weeks
        </p>
        
        <div style={{ 
          display: 'flex', 
          gap: 'var(--space-md)', 
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <motion.button
            className="btn-primary"
            onClick={() => navigate('/analysis')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshIcon />
            Analyze Again
          </motion.button>
          <motion.button
            className="btn-secondary"
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <BackIcon />
            Back to Dashboard
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProductRecommendations;
