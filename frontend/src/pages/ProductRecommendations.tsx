import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import skinAnalysisAPI from '../services/api';

const ProductRecommendations: React.FC = () => {
  const { analysisId } = useParams<{ analysisId: string }>();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Mock products data - will be replaced by API call
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Boots Expert Anti-Blemish Daily Cleanser',
      description: 'A gentle daily cleanser formulated with salicylic acid to help prevent blemishes and unclog pores.',
      price: 12.99,
      image_url: '/images/cleanser.jpg',
      category: 'Cleanser',
      target_issues: ['acne', 'oily_skin'],
      rating: 4.5,
      brand: 'Boots Expert',
    },
    {
      id: '2',
      name: 'Boots Ingredients Niacinamide Serum',
      description: 'A concentrated serum with 10% niacinamide to help minimize pores and control oil production.',
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
      description: 'A lightweight daily moisturizer with broad-spectrum SPF 30 protection suitable for all skin types.',
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
        setLoading(true);
        if (analysisId && analysisId !== 'sample') {
          const response = await skinAnalysisAPI.getRecommendations(analysisId);
          setProducts(response.products);
        } else {
          // Use mock data for demonstration
          const getproducts = await skinAnalysisAPI.getProducts();
          setProducts(getproducts);
        }
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError('Failed to load recommendations');
        // Fallback to mock data
        setProducts(mockProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [analysisId]);

  const handleBuyNow = (productId: string) => {
    // In a real app, this would integrate with Boots' e-commerce system
    alert(`Redirecting to purchase ${productId}...`);
  };
  {
    loading && (
      <div className="container">
        <div className="header">
          <h1>Loading Recommendations...</h1>
        </div>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div className="progress-bar" style={{ maxWidth: '300px', margin: '0 auto' }}>
            <div className="progress-fill" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>

    )
  }
  {
    error &&
    (
      <div className="container">
        <div className="header">
          <h1>Error</h1>
          <p>{error}</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <button className="btn-primary" onClick={() => navigate('/')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Recommended Products</h1>
        <p>Based on your skin analysis, here are our top 3 product recommendations</p>
      </div>

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
