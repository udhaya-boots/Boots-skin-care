<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Boots Skin Care AR Analysis Project

This is a full-stack web application that combines React TypeScript frontend with Python Flask backend for AI-powered skin analysis using computer vision and AR technology.

## Project Context
- **Frontend**: React 18 + TypeScript with camera integration using react-webcam
- **Backend**: Python Flask API with OpenCV, MediaPipe for skin analysis
- **Database**: SQLite with Boots skincare products and analysis history
- **AI/ML**: Computer vision algorithms for detecting acne, dark spots, redness, and oily skin
- **UI/UX**: Modern, responsive design with AR overlays for real-time detection

## Code Guidelines
- Use TypeScript for all React components with proper type definitions
- Follow React hooks patterns and functional components
- Implement proper error handling for camera and API calls
- Use CSS classes for consistent styling across components
- Write clean, documented Python code for computer vision algorithms
- Maintain RESTful API design patterns
- Use proper database migrations and schema management

## Key Features to Maintain
- Real-time camera analysis with AR detection boxes
- 10-second analysis countdown with progress tracking
- Confidence scoring for detected skin issues
- Product recommendation algorithm based on detected issues
- Responsive design for mobile and desktop
- Clean, professional UI matching Boots branding

## Development Patterns
- Component-based architecture in React
- Service layer for API communications
- Modular Python classes for skin analysis
- Database abstraction layer for easy updates
- Error boundaries and loading states
- Accessibility considerations for camera permissions
