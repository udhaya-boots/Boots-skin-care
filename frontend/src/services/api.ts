import axios from 'axios';
import { AnalysisResult, RecommendationResponse, Product } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const skinAnalysisAPI = {
  // Analyze skin from camera frame
  analyzeSkinFrame: async (imageData: string): Promise<AnalysisResult> => {
    const response = await api.post('/analyze', {
      image: imageData,
    });
    return response.data;
  },

  // Get product recommendations based on analysis
  getRecommendations: async (analysisId: string): Promise<RecommendationResponse> => {
    const response = await api.get(`/recommendations/${analysisId}`);
    return response.data;
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
