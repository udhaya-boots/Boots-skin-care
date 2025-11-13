import cv2
import numpy as np
from typing import List, Dict, Tuple

class OpenCVSkinAnalyzer:
    """
    Pure OpenCV skin analyzer - no external dependencies that require compilation
    Works immediately on any Python installation with OpenCV
    """
    
    def __init__(self):
        try:
            # Initialize OpenCV's Haar cascade face detector
            # This is built into OpenCV, no additional files needed
            self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
            
            # Use only Haar cascade for reliability (DNN models not always available)
            self.use_dnn = False
            print("✅ OpenCV Haar cascade face detector loaded (good accuracy)")
            
        except Exception as e:
            print(f"❌ OpenCV initialization error: {e}")
            raise RuntimeError(f"Failed to initialize OpenCV face detection: {e}")
        
    def detect_skin_issues(self, image: np.ndarray) -> List[Dict]:
        """
        Detect various skin issues in the given image using pure OpenCV techniques.
        """
        issues = []
        
        # Detect faces
        faces = self._detect_faces(image)
        
        for i, (x, y, w, h) in enumerate(faces):
            # Ensure coordinates are within image bounds
            x = max(0, x)
            y = max(0, y)
            w = min(w, image.shape[1] - x)
            h = min(h, image.shape[0] - y)
            
            # Extract face region
            face_region = image[y:y+h, x:x+w]
            
            if face_region.size > 0:
                # Detect various skin issues
                acne_issues = self._detect_acne(face_region, x, y)
                dark_spot_issues = self._detect_dark_spots(face_region, x, y)
                redness_issues = self._detect_redness(face_region, x, y)
                oily_issues = self._detect_oily_skin(face_region, x, y)
                dryness_issues = self._detect_dry_skin(face_region, x, y)
                wrinkle_issues = self._detect_wrinkles(face_region, x, y)
                
                issues.extend(acne_issues)
                issues.extend(dark_spot_issues)
                issues.extend(redness_issues)
                issues.extend(oily_issues)
                issues.extend(dryness_issues)
                issues.extend(wrinkle_issues)
        
        return issues
    
    def _detect_faces(self, image: np.ndarray) -> List[Tuple[int, int, int, int]]:
        """Detect faces using OpenCV Haar cascade"""
        try:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Use Haar cascade method (reliable and fast)
            faces = self.face_cascade.detectMultiScale(
                gray, 
                scaleFactor=1.1, 
                minNeighbors=5, 
                minSize=(30, 30),
                maxSize=(300, 300)  # Add max size for better performance
            )
            return faces.tolist() if len(faces) > 0 else []
        except Exception as e:
            print(f"Face detection error: {e}")
            return []
    
    def _detect_acne(self, face_region: np.ndarray, offset_x: int, offset_y: int) -> List[Dict]:
        """Detect acne-like spots using color and texture analysis"""
        issues = []
        
        # Convert to HSV for better color analysis
        hsv = cv2.cvtColor(face_region, cv2.COLOR_BGR2HSV)
        
        # Define HSV range for reddish/inflamed skin (acne indicators)
        lower_red1 = np.array([0, 40, 40])
        upper_red1 = np.array([10, 255, 255])
        lower_red2 = np.array([170, 40, 40])
        upper_red2 = np.array([180, 255, 255])
        
        mask1 = cv2.inRange(hsv, lower_red1, upper_red1)
        mask2 = cv2.inRange(hsv, lower_red2, upper_red2)
        red_mask = cv2.bitwise_or(mask1, mask2)
        
        # Apply morphological operations to clean up noise
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
        red_mask = cv2.morphologyEx(red_mask, cv2.MORPH_OPEN, kernel)
        red_mask = cv2.morphologyEx(red_mask, cv2.MORPH_CLOSE, kernel)
        
        # Find contours
        contours, _ = cv2.findContours(red_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        for i, contour in enumerate(contours):
            area = cv2.contourArea(contour)
            if 8 < area < 600:  # Filter by reasonable acne spot size
                x, y, w, h = cv2.boundingRect(contour)
                
                # Calculate confidence based on color intensity, size, and circularity
                perimeter = cv2.arcLength(contour, True)
                if perimeter > 0:
                    circularity = 4 * np.pi * area / (perimeter ** 2)
                    circularity_score = min(1.0, circularity * 2)  # Boost circular shapes
                else:
                    circularity_score = 0.5
                
                size_score = min(1.0, area / 300)
                confidence = min(0.95, size_score * 0.4 + circularity_score * 0.4 + 0.2)
                
                if confidence > 0.3:
                    issues.append({
                        'id': f"acne_{i}_{x}_{y}",
                        'type': 'acne',
                        'confidence': float(confidence),
                        'bbox': {
                            'x': int(offset_x + x),
                            'y': int(offset_y + y),
                            'width': int(w),
                            'height': int(h)
                        }
                    })
        
        return issues
    
    def _detect_dark_spots(self, face_region: np.ndarray, offset_x: int, offset_y: int) -> List[Dict]:
        """Detect dark spots and hyperpigmentation"""
        issues = []
        
        # Convert to LAB color space for better analysis
        lab = cv2.cvtColor(face_region, cv2.COLOR_BGR2LAB)
        l_channel = lab[:, :, 0]
        
        # Create mask for dark regions using multiple methods
        # Method 1: Simple threshold
        _, dark_mask1 = cv2.threshold(l_channel, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
        
        # Method 2: Adaptive threshold for local darkness
        dark_mask2 = cv2.adaptiveThreshold(
            l_channel, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 11, 5
        )
        
        # Combine masks
        dark_mask = cv2.bitwise_and(dark_mask1, dark_mask2)
        
        # Clean up the mask
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
        dark_mask = cv2.morphologyEx(dark_mask, cv2.MORPH_OPEN, kernel)
        dark_mask = cv2.morphologyEx(dark_mask, cv2.MORPH_CLOSE, kernel)
        
        # Find contours
        contours, _ = cv2.findContours(dark_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        for i, contour in enumerate(contours):
            area = cv2.contourArea(contour)
            if 12 < area < 1000:  # Filter by reasonable size
                x, y, w, h = cv2.boundingRect(contour)
                
                # Calculate confidence based on darkness and shape
                roi = l_channel[y:y+h, x:x+w]
                if roi.size > 0:
                    avg_darkness = 255 - np.mean(roi)
                    darkness_score = min(1.0, avg_darkness / 128)
                    
                    # Shape analysis for more accurate detection
                    perimeter = cv2.arcLength(contour, True)
                    if perimeter > 0:
                        circularity = 4 * np.pi * area / (perimeter ** 2)
                        shape_score = min(1.0, circularity * 1.5)
                    else:
                        shape_score = 0.3
                    
                    confidence = min(0.92, darkness_score * 0.6 + shape_score * 0.3 + 0.1)
                    
                    if confidence > 0.35:
                        issues.append({
                            'id': f"dark_spot_{i}_{x}_{y}",
                            'type': 'dark_spots',
                            'confidence': float(confidence),
                            'bbox': {
                                'x': int(offset_x + x),
                                'y': int(offset_y + y),
                                'width': int(w),
                                'height': int(h)
                            }
                        })
        
        return issues
    
    def _detect_redness(self, face_region: np.ndarray, offset_x: int, offset_y: int) -> List[Dict]:
        """Detect skin redness and irritation"""
        issues = []
        
        # Multi-method redness detection
        hsv = cv2.cvtColor(face_region, cv2.COLOR_BGR2HSV)
        lab = cv2.cvtColor(face_region, cv2.COLOR_BGR2LAB)
        
        # Method 1: HSV red detection
        red_mask1 = cv2.inRange(hsv, np.array([0, 30, 30]), np.array([10, 255, 255]))
        red_mask2 = cv2.inRange(hsv, np.array([170, 30, 30]), np.array([180, 255, 255]))
        hsv_red = cv2.bitwise_or(red_mask1, red_mask2)
        
        # Method 2: LAB A-channel (red-green axis)
        a_channel = lab[:, :, 1]
        _, lab_red = cv2.threshold(a_channel, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Method 3: RGB ratio analysis
        b, g, r = cv2.split(face_region)
        red_dominance = cv2.divide(r.astype(np.float32), 
                                 (g.astype(np.float32) + b.astype(np.float32) + 1))
        _, ratio_mask = cv2.threshold((red_dominance * 255).astype(np.uint8), 
                                    150, 255, cv2.THRESH_BINARY)
        
        # Combine all methods
        combined_mask = cv2.bitwise_and(hsv_red, lab_red)
        combined_mask = cv2.bitwise_and(combined_mask, ratio_mask)
        
        # Clean up
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        combined_mask = cv2.morphologyEx(combined_mask, cv2.MORPH_CLOSE, kernel)
        combined_mask = cv2.morphologyEx(combined_mask, cv2.MORPH_OPEN, kernel)
        
        # Find contours
        contours, _ = cv2.findContours(combined_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        for i, contour in enumerate(contours):
            area = cv2.contourArea(contour)
            if 50 < area < 2500:  # Reasonable size for redness areas
                x, y, w, h = cv2.boundingRect(contour)
                
                # Calculate confidence
                roi_a = a_channel[y:y+h, x:x+w]
                if roi_a.size > 0:
                    redness_intensity = np.mean(roi_a)
                    intensity_score = min(1.0, max(0, (redness_intensity - 128) / 64))
                    
                    area_score = min(1.0, area / 1000)
                    confidence = min(0.88, intensity_score * 0.7 + area_score * 0.2 + 0.1)
                    
                    if confidence > 0.4:
                        issues.append({
                            'id': f"redness_{i}_{x}_{y}",
                            'type': 'redness',
                            'confidence': float(confidence),
                            'bbox': {
                                'x': int(offset_x + x),
                                'y': int(offset_y + y),
                                'width': int(w),
                                'height': int(h)
                            }
                        })
        
        return issues
    
    def _detect_oily_skin(self, face_region: np.ndarray, offset_x: int, offset_y: int) -> List[Dict]:
        """Detect oily/shiny skin areas"""
        issues = []
        
        # Convert to different color spaces for shine detection
        lab = cv2.cvtColor(face_region, cv2.COLOR_BGR2LAB)
        hsv = cv2.cvtColor(face_region, cv2.COLOR_BGR2HSV)
        
        l_channel = lab[:, :, 0]
        v_channel = hsv[:, :, 2]
        
        # Combine L and V channels for better shine detection
        combined = cv2.addWeighted(l_channel, 0.6, v_channel, 0.4, 0)
        
        # Apply Gaussian blur to reduce noise
        blurred = cv2.GaussianBlur(combined, (5, 5), 0)
        
        # Detect bright/shiny areas
        _, shine_mask = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Morphological operations
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
        shine_mask = cv2.morphologyEx(shine_mask, cv2.MORPH_CLOSE, kernel)
        shine_mask = cv2.morphologyEx(shine_mask, cv2.MORPH_OPEN, kernel)
        
        # Find contours
        contours, _ = cv2.findContours(shine_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        for i, contour in enumerate(contours):
            area = cv2.contourArea(contour)
            if 80 < area < 4000:  # Reasonable size for oily areas
                x, y, w, h = cv2.boundingRect(contour)
                
                # Calculate confidence
                roi = combined[y:y+h, x:x+w]
                if roi.size > 0:
                    avg_brightness = np.mean(roi)
                    brightness_score = min(1.0, max(0, (avg_brightness - 150) / 105))
                    
                    area_score = min(1.0, area / 2000)
                    confidence = min(0.85, brightness_score * 0.6 + area_score * 0.3 + 0.1)
                    
                    if confidence > 0.35:
                        issues.append({
                            'id': f"oily_{i}_{x}_{y}",
                            'type': 'oily_skin',
                            'confidence': float(confidence),
                            'bbox': {
                                'x': int(offset_x + x),
                                'y': int(offset_y + y),
                                'width': int(w),
                                'height': int(h)
                            }
                        })
        
        return issues
    
    def _detect_dry_skin(self, face_region: np.ndarray, offset_x: int, offset_y: int) -> List[Dict]:
        """Detect dry skin areas using texture analysis"""
        issues = []
        
        # Convert to grayscale for texture analysis
        gray = cv2.cvtColor(face_region, cv2.COLOR_BGR2GRAY)
        
        # Multiple texture analysis methods
        # Method 1: Laplacian (edge detection)
        laplacian = cv2.Laplacian(gray, cv2.CV_64F)
        laplacian_abs = cv2.convertScaleAbs(laplacian)
        
        # Method 2: Sobel gradients
        sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
        sobel_combined = cv2.magnitude(sobelx, sobely)
        sobel_abs = cv2.convertScaleAbs(sobel_combined)
        
        # Combine texture measures
        texture_map = cv2.addWeighted(laplacian_abs, 0.5, sobel_abs, 0.5, 0)
        
        # Threshold for high texture areas (rough/dry skin)
        _, dry_mask = cv2.threshold(texture_map, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Clean up
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
        dry_mask = cv2.morphologyEx(dry_mask, cv2.MORPH_CLOSE, kernel)
        
        # Find contours
        contours, _ = cv2.findContours(dry_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        for i, contour in enumerate(contours):
            area = cv2.contourArea(contour)
            if 150 < area < 6000:  # Reasonable size for dry areas
                x, y, w, h = cv2.boundingRect(contour)
                
                # Calculate confidence
                roi = texture_map[y:y+h, x:x+w]
                if roi.size > 0:
                    avg_roughness = np.mean(roi)
                    roughness_score = min(1.0, avg_roughness / 255)
                    
                    area_score = min(1.0, area / 3000)
                    confidence = min(0.78, roughness_score * 0.6 + area_score * 0.2 + 0.1)
                    
                    if confidence > 0.3:
                        issues.append({
                            'id': f"dryness_{i}_{x}_{y}",
                            'type': 'dryness',
                            'confidence': float(confidence),
                            'bbox': {
                                'x': int(offset_x + x),
                                'y': int(offset_y + y),
                                'width': int(w),
                                'height': int(h)
                            }
                        })
        
        return issues
    
    def _detect_wrinkles(self, face_region: np.ndarray, offset_x: int, offset_y: int) -> List[Dict]:
        """Detect wrinkles and fine lines"""
        issues = []
        
        # Convert to grayscale
        gray = cv2.cvtColor(face_region, cv2.COLOR_BGR2GRAY)
        
        # Apply Gaussian blur to reduce noise
        blurred = cv2.GaussianBlur(gray, (3, 3), 0)
        
        # Use Hough Line Transform to detect line-like structures (wrinkles)
        edges = cv2.Canny(blurred, 50, 150, apertureSize=3)
        
        # Detect lines
        lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=30, 
                               minLineLength=20, maxLineGap=5)
        
        if lines is not None:
            for i, line in enumerate(lines):
                x1, y1, x2, y2 = line[0]
                
                # Calculate line length and angle
                length = np.sqrt((x2-x1)**2 + (y2-y1)**2)
                
                if length > 15:  # Minimum wrinkle length
                    # Create bounding box around the line
                    x = min(x1, x2) - 5
                    y = min(y1, y2) - 5
                    w = abs(x2 - x1) + 10
                    h = abs(y2 - y1) + 10
                    
                    # Ensure bounds
                    x = max(0, x)
                    y = max(0, y)
                    w = min(w, face_region.shape[1] - x)
                    h = min(h, face_region.shape[0] - y)
                    
                    # Calculate confidence based on line properties
                    length_score = min(1.0, length / 50)
                    confidence = min(0.75, length_score * 0.7 + 0.2)
                    
                    if confidence > 0.4 and w > 0 and h > 0:
                        issues.append({
                            'id': f"wrinkles_{i}_{x}_{y}",
                            'type': 'wrinkles',
                            'confidence': float(confidence),
                            'bbox': {
                                'x': int(offset_x + x),
                                'y': int(offset_y + y),
                                'width': int(w),
                                'height': int(h)
                            }
                        })
        
        return issues
