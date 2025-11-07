from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import mediapipe as mp
import numpy as np
import base64
from PIL import Image
import io
import sqlite3
import uuid
from datetime import datetime
import json
import sys
import os
from skin_analyzer import SkinAnalyzer
from database import Database

# Verify Python version
print(f"Running on Python {sys.version}")
if sys.version_info < (3, 8):
    raise RuntimeError("This application requires Python 3.8 or higher")

# Verify MediaPipe installation
try:
    print(f"MediaPipe version: {mp.__version__}")
except Exception as e:
    print(f"MediaPipe import error: {e}")
    raise

app = Flask(__name__)
CORS(app)

# Initialize components
db = Database()
skin_analyzer = SkinAnalyzer()

@app.route('/api/analyze', methods=['POST'])
def analyze_skin():
    try:
        data = request.get_json()
        image_data = data.get('image')
        
        if not image_data:
            return jsonify({'error': 'No image data provided'}), 400
        
        # Decode base64 image
        image_data = image_data.split(',')[1] if ',' in image_data else image_data
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert PIL image to OpenCV format
        opencv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        # Analyze skin issues
        issues = skin_analyzer.detect_skin_issues(opencv_image)
        
        # Create analysis result
        analysis_id = str(uuid.uuid4())
        timestamp = datetime.now().isoformat()
        
        # Determine severity based on number and confidence of issues
        severity = 'low'
        if len(issues) > 3:
            severity = 'high'
        elif len(issues) > 1:
            severity = 'medium'
        
        analysis_result = {
            'id': analysis_id,
            'timestamp': timestamp,
            'issues': issues,
            'recommendations': [],
            'severity': severity
        }
        
        # Save analysis to database
        db.save_analysis(analysis_result)
        
        return jsonify(analysis_result)
        
    except Exception as e:
        print(f"Analysis error: {str(e)}")
        return jsonify({'error': 'Analysis failed'}), 500

@app.route('/api/recommendations/<analysis_id>', methods=['GET'])
def get_recommendations(analysis_id):
    try:
        # Get analysis from database
        analysis = db.get_analysis(analysis_id)
        if not analysis:
            return jsonify({'error': 'Analysis not found'}), 404
        
        # Get recommended products based on detected issues
        issue_types = [issue['type'] for issue in analysis.get('issues', [])]
        products = db.get_products_for_issues(issue_types)
        
        # Limit to top 3 products
        top_products = products[:3]
        
        result = {
            'products': top_products,
            'analysis_id': analysis_id,
            'confidence_score': 0.85
        }
        
        return jsonify(result)
        
    except Exception as e:
        print(f"Recommendations error: {str(e)}")
        return jsonify({'error': 'Failed to get recommendations'}), 500

@app.route('/api/products', methods=['GET'])
def get_all_products():
    try:
        products = db.get_all_products()
        return jsonify(products)
    except Exception as e:
        print(f"Products error: {str(e)}")
        return jsonify({'error': 'Failed to get products'}), 500

@app.route('/api/analyses/recent', methods=['GET'])
def get_recent_analyses():
    try:
        analyses = db.get_recent_analyses(limit=10)
        return jsonify(analyses)
    except Exception as e:
        print(f"Recent analyses error: {str(e)}")
        return jsonify({'error': 'Failed to get recent analyses'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

if __name__ == '__main__':
    # Initialize database
    db.initialize_database()
    
    print("Starting Boots Skin Care Analysis Server...")
    print("Server will be available at http://localhost:5000")
    print("API endpoints:")
    print("- POST /api/analyze - Analyze skin from image")
    print("- GET /api/recommendations/<analysis_id> - Get product recommendations")
    print("- GET /api/products - Get all products")
    print("- GET /api/analyses/recent - Get recent analyses")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
