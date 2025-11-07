import cv2
import mediapipe as mp
import numpy as np
from typing import List, Dict, Tuple

class SkinAnalyzer:
    def __init__(self):
        try:
            # Initialize MediaPipe Face Detection and Face Mesh
            self.mp_face_detection = mp.solutions.face_detection
            self.mp_face_mesh = mp.solutions.face_mesh
            self.mp_drawing = mp.solutions.drawing_utils
            
            self.face_detection = self.mp_face_detection.FaceDetection(
                model_selection=0, min_detection_confidence=0.5
            )
            self.face_mesh = self.mp_face_mesh.FaceMesh(
                static_image_mode=True,
                max_num_faces=1,
                refine_landmarks=True,
                min_detection_confidence=0.5,
                min_tracking_confidence=0.5
            )
            print("✅ MediaPipe initialized successfully")
        except Exception as e:
            print(f"❌ MediaPipe initialization error: {e}")
            raise RuntimeError(f"Failed to initialize MediaPipe: {e}")
        
    def detect_skin_issues(self, image: np.ndarray) -> List[Dict]:
        """
        Detect various skin issues in the given image using computer vision techniques.
        This is a simplified implementation that uses color analysis and texture detection.
        """
        issues = []
        
        # Convert image to RGB for MediaPipe
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Detect face
        face_results = self.face_detection.process(rgb_image)
        
        if face_results.detections:
            for detection in face_results.detections:
                bbox = detection.location_data.relative_bounding_box
                h, w, _ = image.shape
                
                # Convert relative coordinates to absolute
                x = int(bbox.xmin * w)
                y = int(bbox.ymin * h)
                width = int(bbox.width * w)
                height = int(bbox.height * h)
                
                # Extract face region
                face_region = image[y:y+height, x:x+width]
                
                if face_region.size > 0:
                    # Detect various skin issues
                    acne_issues = self._detect_acne(face_region, x, y)
                    dark_spot_issues = self._detect_dark_spots(face_region, x, y)
                    redness_issues = self._detect_redness(face_region, x, y)
                    oily_issues = self._detect_oily_skin(face_region, x, y)
                    
                    issues.extend(acne_issues)
                    issues.extend(dark_spot_issues)
                    issues.extend(redness_issues)
                    issues.extend(oily_issues)
        
        return issues
    
    def _detect_acne(self, face_region: np.ndarray, offset_x: int, offset_y: int) -> List[Dict]:
        """Detect acne-like spots using color and texture analysis"""
        issues = []
        
        # Convert to HSV for better color analysis
        hsv = cv2.cvtColor(face_region, cv2.COLOR_BGR2HSV)
        
        # Define HSV range for reddish/inflamed skin (acne indicators)
        lower_red1 = np.array([0, 50, 50])
        upper_red1 = np.array([10, 255, 255])
        lower_red2 = np.array([170, 50, 50])
        upper_red2 = np.array([180, 255, 255])
        
        mask1 = cv2.inRange(hsv, lower_red1, upper_red1)
        mask2 = cv2.inRange(hsv, lower_red2, upper_red2)
        red_mask = cv2.bitwise_or(mask1, mask2)
        
        # Find contours
        contours, _ = cv2.findContours(red_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        for contour in contours:
            area = cv2.contourArea(contour)
            if 10 < area < 500:  # Filter by reasonable acne spot size
                x, y, w, h = cv2.boundingRect(contour)
                
                # Calculate confidence based on color intensity and size
                confidence = min(0.95, (area / 300) * 0.8 + 0.4)
                
                issues.append({
                    'id': f"acne_{len(issues)}_{x}_{y}",
                    'type': 'acne',
                    'confidence': confidence,
                    'bbox': {
                        'x': offset_x + x,
                        'y': offset_y + y,
                        'width': w,
                        'height': h
                    }
                })
        
        return issues
    
    def _detect_dark_spots(self, face_region: np.ndarray, offset_x: int, offset_y: int) -> List[Dict]:
        """Detect dark spots and hyperpigmentation"""
        issues = []
        
        # Convert to grayscale for dark spot detection
        gray = cv2.cvtColor(face_region, cv2.COLOR_BGR2GRAY)
        
        # Apply Gaussian blur to reduce noise
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        
        # Threshold for dark regions
        _, dark_mask = cv2.threshold(blurred, 80, 255, cv2.THRESH_BINARY_INV)
        
        # Find contours
        contours, _ = cv2.findContours(dark_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        for contour in contours:
            area = cv2.contourArea(contour)
            if 15 < area < 800:  # Filter by reasonable dark spot size
                x, y, w, h = cv2.boundingRect(contour)
                
                # Calculate confidence based on darkness and size
                roi = gray[y:y+h, x:x+w]
                avg_darkness = 255 - np.mean(roi) if roi.size > 0 else 0
                confidence = min(0.9, (avg_darkness / 255) * 0.7 + 0.3)
                
                issues.append({
                    'id': f"dark_spot_{len(issues)}_{x}_{y}",
                    'type': 'dark_spots',
                    'confidence': confidence,
                    'bbox': {
                        'x': offset_x + x,
                        'y': offset_y + y,
                        'width': w,
                        'height': h
                    }
                })
        
        return issues
    
    def _detect_redness(self, face_region: np.ndarray, offset_x: int, offset_y: int) -> List[Dict]:
        """Detect general skin redness and irritation"""
        issues = []
        
        # Split into color channels
        b, g, r = cv2.split(face_region)
        
        # Calculate redness ratio (R channel dominance)
        redness_ratio = r.astype(np.float32) / (g.astype(np.float32) + b.astype(np.float32) + 1)
        
        # Threshold for high redness
        redness_mask = (redness_ratio > 1.2).astype(np.uint8) * 255
        
        # Apply morphological operations to clean up the mask
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        redness_mask = cv2.morphologyEx(redness_mask, cv2.MORPH_CLOSE, kernel)
        
        # Find contours
        contours, _ = cv2.findContours(redness_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        for contour in contours:
            area = cv2.contourArea(contour)
            if 50 < area < 2000:  # Filter by reasonable redness area size
                x, y, w, h = cv2.boundingRect(contour)
                
                # Calculate confidence based on redness intensity
                roi = redness_ratio[y:y+h, x:x+w]
                avg_redness = np.mean(roi) if roi.size > 0 else 0
                confidence = min(0.85, (avg_redness - 1.0) * 0.8 + 0.4)
                
                if confidence > 0.5:  # Only add if confidence is reasonable
                    issues.append({
                        'id': f"redness_{len(issues)}_{x}_{y}",
                        'type': 'redness',
                        'confidence': confidence,
                        'bbox': {
                            'x': offset_x + x,
                            'y': offset_y + y,
                            'width': w,
                            'height': h
                        }
                    })
        
        return issues
    
    def _detect_oily_skin(self, face_region: np.ndarray, offset_x: int, offset_y: int) -> List[Dict]:
        """Detect oily skin areas based on shine/reflection analysis"""
        issues = []
        
        # Convert to LAB color space for better luminance analysis
        lab = cv2.cvtColor(face_region, cv2.COLOR_BGR2LAB)
        l_channel = lab[:, :, 0]
        
        # Detect high luminance areas (shine/oil)
        _, shine_mask = cv2.threshold(l_channel, 200, 255, cv2.THRESH_BINARY)
        
        # Apply morphological operations
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
        shine_mask = cv2.morphologyEx(shine_mask, cv2.MORPH_CLOSE, kernel)
        
        # Find contours
        contours, _ = cv2.findContours(shine_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        for contour in contours:
            area = cv2.contourArea(contour)
            if 100 < area < 3000:  # Filter by reasonable oily area size
                x, y, w, h = cv2.boundingRect(contour)
                
                # Calculate confidence based on luminance intensity
                roi = l_channel[y:y+h, x:x+w]
                avg_luminance = np.mean(roi) if roi.size > 0 else 0
                confidence = min(0.8, ((avg_luminance - 180) / 75) * 0.6 + 0.4)
                
                if confidence > 0.5:  # Only add if confidence is reasonable
                    issues.append({
                        'id': f"oily_{len(issues)}_{x}_{y}",
                        'type': 'oily_skin',
                        'confidence': confidence,
                        'bbox': {
                            'x': offset_x + x,
                            'y': offset_y + y,
                            'width': w,
                            'height': h
                        }
                    })
        
        return issues
