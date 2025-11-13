# 🧴 Boots Skin Care Analysis - Premium AI Application

A sophisticated skin analysis application combining AI-powered computer vision with personalized product recommendations from Boots.

## ✨ Features

- **🔬 AI Skin Analysis**: Real-time skin analysis using OpenCV computer vision
- **🎯 Personalized Recommendations**: Curated Boots product suggestions based on detected skin issues
- **🎨 Premium UI**: Modern glassmorphism design with smooth animations
- **📱 Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **💾 Analysis History**: Track your skin health journey over time
- **🛍️ E-commerce Ready**: Integration-ready for Boots online store

## 🚀 Quick Start

### One-Click Development Setup (Windows)
Double-click `start-development.bat` to automatically start both frontend and backend servers.

### Manual Setup

#### Backend (Python Flask)
```bash
cd backend

# Automated setup and start
python setup_and_start.py

# OR manual start (if dependencies installed)
python app.py
```

#### Frontend (React)
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

## 🔧 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Server health check |
| `/api/analyze` | POST | Analyze skin image |
| `/api/recommendations/<id>` | GET | Get product recommendations |
| `/api/products` | GET | Get all products |
| `/api/analyses/recent` | GET | Get recent analyses |

## 🧪 Testing

### Backend Testing
```bash
cd backend
python test.py
```

### Manual Testing
1. Start both servers
2. Open browser to `http://localhost:3000`
3. Grant camera permissions
4. Position face in detection frame
5. Click "Start Analysis"
6. Review detected issues and product recommendations

## �️ Troubleshooting

### Backend Issues
```bash
# Use automated setup
python setup_and_start.py

# Check Python version (needs 3.8+)
python --version

# Test components
python test.py
```

### Frontend Issues
```bash
# Install dependencies
npm install

# Clear cache if needed
npm cache clean --force

# Full reset
rm -rf node_modules && npm install
```

### Common Solutions
- **500 Errors**: Backend now provides fallback mock data
- **404 Errors**: Mock analysis IDs handled properly
- **Camera Issues**: Grant browser permissions, try Chrome
- **Connection Errors**: Ensure backend runs on port 5000

## 📊 Architecture

### Backend (Python/Flask)
- **Flask**: Web framework with CORS support
- **OpenCV**: Computer vision for skin analysis (Haar cascades)
- **SQLite**: Database for analysis history and products
- **NumPy**: Numerical computations for image processing

### Frontend (React/TypeScript)
- **React 18**: Modern UI with TypeScript
- **Framer Motion**: Smooth animations and transitions
- **Axios**: HTTP client with error handling
- **React Webcam**: Camera integration

## 🔍 Skin Analysis Technology

### Detection Capabilities
- **Acne Detection**: HSV color analysis for inflamed areas
- **Dark Spots**: LAB color space for hyperpigmentation
- **Redness**: Irritated skin area identification
- **Oily Skin**: Texture and shine analysis
- **Dryness**: Rough/flaky texture detection
- **Wrinkles**: Edge detection for fine lines

## 🎨 UI Features

- **Glassmorphism Effects**: Semi-transparent backdrop blur
- **Real-time Status**: Backend connectivity indicator
- **Progressive Loading**: Multi-stage analysis timing
- **Interactive Cards**: Product recommendations with rankings
- **Smooth Animations**: Framer Motion micro-interactions

## � Fixes Applied

### Backend ✅
- JSON serialization for NumPy types
- Comprehensive error handling
- OpenCV-only implementation (no compilation)
- Mock data fallbacks
- Better logging and debugging

### Frontend ✅
- React Router future flags
- TypeScript Framer Motion variants
- Enhanced error handling
- Connection status monitoring
- Premium UI animations

## 📁 Project Structure
```
Boots-skin-care/
├── backend/
│   ├── app.py                    # Flask application
│   ├── database.py              # SQLite management
│   ├── skin_analyzer_opencv.py  # OpenCV analysis
│   ├── setup_and_start.py       # Automated setup
│   └── requirements.txt         # Dependencies
├── frontend/
│   ├── src/
│   │   ├── pages/              # Dashboard, Analysis, Products
│   │   ├── services/           # API communication
│   │   ├── types/              # TypeScript definitions
│   │   └── App.css             # Premium styling
│   └── package.json
└── start-development.bat        # Windows quick start
```

---


Backend: `http://localhost:5000` | Frontend: `http://localhost:3000`
