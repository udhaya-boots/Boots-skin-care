import axios, { AxiosError } from 'axios';
import { AnalysisResult, RecommendationResponse, Product } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      console.error('❌ Backend server is not running. Please start the Flask server.');
    } else if (error.response?.status === 500) {
      console.error('❌ Backend server error:', error.response.data);
    }
    throw error;
  }
);

export const skinAnalysisAPI = {
  // Health check to test backend connectivity
  healthCheck: async (): Promise<{ status: string; timestamp: string }> => {
    const response = await api.get('/health');
    return response.data;
  },

  // Analyze skin from camera frame
  analyzeSkinFrame: async (imageData: string): Promise<AnalysisResult> => {
    const response = await api.post('/analyze', {
      image: imageData,
    });
    return response.data;
  },

  // Get product recommendations based on analysis
  getRecommendations: async (analysisId: string): Promise<RecommendationResponse> => {
    console.log('🔍 API: Fetching recommendations for analysisId:', analysisId);
    
    try {
      const response = await api.get(`/recommendations/${analysisId}`);
      console.log('✅ API: Recommendations response received:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ API: Error fetching recommendations:', error);
      
      // Enhanced error logging
      if (axios.isAxiosError(error)) {
        console.error('❌ Axios error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url
        });
        
        if (error.response?.status === 404) {
          console.warn('⚠️ Analysis not found, might need to use sample data');
        }
      }
      
      throw error;
    }
  },

  // Get all products
  getProducts: async (): Promise<Product[]> => {
    const response = await api.get('/products');
    return response.data;
  },

  // Get recent analyses
  getRecentAnalyses: async (): Promise<AnalysisResult[]> => {
    const response = await api.get('/analyses/recent');
    return response.data;
  },
};

export default skinAnalysisAPI;
