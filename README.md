# Boots Skin Care - AR Skin Analysis Platform

A comprehensive web application that uses AI and AR technology to analyze skin conditions in real-time and provide personalized product recommendations from Boots' skincare range.

## Features

### 🎯 Core Functionality
- **Dashboard**: Clean interface with analysis button, products button, and recent analysis history
- **Live AR Analysis**: Real-time skin analysis using camera with 10-second analysis period
- **AI Detection**: Automatic detection of common skin issues (acne, dark spots, redness, oily skin, dryness)
- **Product Recommendations**: Top 3 personalized product suggestions based on analysis results
- **Product Database**: Comprehensive database of Boots skincare products with easy update capability

### 🔬 Technology Stack

#### Frontend (React + TypeScript)
- React 18 with TypeScript for type safety
- React Router for navigation
- React Webcam for camera integration
- Styled components and CSS for modern UI
- Responsive design for mobile and desktop

#### Backend (Python Flask)
- Flask web framework with CORS support
- OpenCV for computer vision processing
- MediaPipe for face detection and analysis
- SQLite database for easy deployment and updates
- RESTful API design

#### AI/ML Components
- **Face Detection**: MediaPipe face detection for precise face location
- **Skin Analysis**: Computer vision algorithms for:
  - Acne detection using color and texture analysis
  - Dark spot identification through luminance analysis
  - Redness detection using color channel analysis
  - Oily skin detection through shine/reflection analysis
- **Confidence Scoring**: ML confidence scores for each detected issue

## Project Structure

```
Boots Skin Care Project/
├── frontend/                 # React TypeScript application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Main application pages
│   │   │   ├── Dashboard.tsx
│   │   │   ├── SkinAnalysis.tsx
│   │   │   └── ProductRecommendations.tsx
│   │   ├── services/       # API integration
│   │   │   └── api.ts
│   │   ├── types/          # TypeScript type definitions
│   │   │   └── index.ts
│   │   ├── App.tsx         # Main app component
│   │   ├── App.css         # Styling
│   │   └── index.tsx       # Entry point
│   ├── public/             # Static assets
│   └── package.json        # Dependencies and scripts
├── backend/                 # Python Flask API
│   ├── app.py              # Main Flask application
│   ├── skin_analyzer.py    # Computer vision skin analysis
│   ├── database.py         # Database operations
│   ├── requirements.txt    # Python dependencies
│   └── boots_skincare.db   # SQLite database (auto-created)
├── package.json            # Root package.json for scripts
└── README.md              # This file
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- **Python 3.12.x** (MediaPipe compatibility requirement)
  - ⚠️ **IMPORTANT**: MediaPipe does NOT support Python 3.13+
  - Download Python 3.12.8: https://www.python.org/downloads/release/python-3128/
- npm or yarn package manager
- pip (Python package installer)

### Quick Start

**⚠️ IMPORTANT: Ensure you have Python 3.12.x installed (NOT 3.13+)**

1. **Auto-detect and setup Python 3.12**:
   ```batch
   detect_python12.bat
   ```

2. **Or manually install dependencies**:
   ```bash
   npm run install-all
   ```

3. **Start the application**:
   ```bash
   npm run dev
   ```

This will start both the React frontend (http://localhost:3000) and Python backend (http://localhost:5000) concurrently.

### Python Version Compatibility

**MediaPipe Requirements:**
- ✅ Python 3.8, 3.9, 3.10, 3.11, 3.12
- ❌ Python 3.13+ (NOT supported by MediaPipe)

**If you have Python 3.13:**
1. Install Python 3.12.8 alongside (don't uninstall 3.13)
2. Use the `detect_python12.bat` script to auto-detect and setup
3. Or manually use `py -3.12` command if you have py launcher

**Download Python 3.12.8:**
https://www.python.org/downloads/release/python-3128/

### Manual Setup

#### Frontend Setup
```bash
cd frontend
npm install
npm start
```

#### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python app.py
```

## Usage

### 1. Dashboard
- Main landing page with overview of features
- Quick access to skin analysis
- View recent analysis history
- Browse product catalog

### 2. Skin Analysis
- Click "Analyze My Skin" to start camera
- Position face in camera frame
- Click "Start Analysis" for 10-second live analysis
- Real-time detection boxes appear over identified issues
- Get analysis results with confidence scores

### 3. Product Recommendations
- Automatic redirection after analysis
- Top 3 products tailored to detected issues
- Product details, pricing, and ratings
- Direct purchase integration ready

## API Endpoints

### Backend REST API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analyze` | Analyze skin from base64 image |
| GET | `/api/recommendations/<analysis_id>` | Get product recommendations |
| GET | `/api/products` | Get all available products |
| GET | `/api/analyses/recent` | Get recent analysis history |
| GET | `/api/health` | Health check endpoint |

### Example API Usage

```javascript
// Analyze skin
const response = await fetch('/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ image: base64ImageData })
});

// Get recommendations
const recommendations = await fetch(`/api/recommendations/${analysisId}`);
```

## Database Schema

### Products Table
```sql
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price REAL NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL,
  target_issues TEXT NOT NULL,  -- JSON array
  rating REAL DEFAULT 4.0,
  brand TEXT NOT NULL
);
```

### Analyses Table
```sql
CREATE TABLE analyses (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  issues TEXT NOT NULL,        -- JSON array
  recommendations TEXT,        -- JSON array
  severity TEXT NOT NULL       -- low/medium/high
);
```

## Development

### Adding New Products
Products can be easily added through the database:

```python
new_product = {
    'id': 'boots-011',
    'name': 'New Product Name',
    'description': 'Product description',
    'price': 29.99,
    'category': 'Treatment',
    'target_issues': ['acne', 'dark_spots'],
    'rating': 4.5,
    'brand': 'Boots'
}
db.add_product(new_product)
```

### Extending Skin Analysis
Add new skin issue detection by extending `skin_analyzer.py`:

```python
def _detect_new_issue(self, face_region, offset_x, offset_y):
    # Implement new detection algorithm
    # Return list of detected issues
    pass
```

### Customizing UI
The frontend uses CSS classes for easy customization:
- `.card`: Product and feature cards
- `.btn-primary`: Main action buttons
- `.camera-container`: Camera display area
- `.detection-box`: AR detection overlays

## Production Deployment

### Frontend Build
```bash
cd frontend
npm run build
```

### Backend Production
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Environment Variables
Set these for production:
- `FLASK_ENV=production`
- `DATABASE_URL` (if using external DB)
- `CORS_ORIGINS` (allowed frontend domains)

## Future Enhancements

### Planned Features
- [ ] Advanced skin aging analysis
- [ ] Skin tone and undertone detection
- [ ] Integration with Boots loyalty program
- [ ] Multi-language support
- [ ] Mobile app version
- [ ] Professional consultation booking

### Technical Improvements
- [ ] Real-time streaming analysis
- [ ] Machine learning model training
- [ ] Cloud deployment support
- [ ] Advanced AR effects
- [ ] Performance optimization

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For technical support or questions:
- Create an issue in the project repository
- Contact the development team
- Check the documentation wiki

---

**Note**: This is a demonstration project showcasing AR skin analysis technology. The AI models and product recommendations are for educational purposes and should not replace professional dermatological advice.
