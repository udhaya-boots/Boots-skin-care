export interface SkinIssue {
  id: string;
  type: 'acne' | 'dark_spots' | 'wrinkles' | 'redness' | 'dryness' | 'oily_skin';
  confidence: number;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface AnalysisResult {
  id: string;
  timestamp: string;
  issues: SkinIssue[];
  recommendations: string[];
  severity: 'low' | 'medium' | 'high';
  sl_no:number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  target_issues: string[];
  rating: number;
  brand: string;
}

export interface RecommendationResponse {
  products: Product[];
  analysis_id: string;
  confidence_score: number;
}
