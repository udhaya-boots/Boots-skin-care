#!/usr/bin/env python3
"""
Python Environment Checker for Boots Skin Care Project
Verifies Python 12.x and MediaPipe compatibility
"""

import sys
import subprocess
import importlib.util

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    print(f"🐍 Current Python version: {version.major}.{version.minor}.{version.micro}")
    
    if version.major == 3 and version.minor == 12:
        print("✅ Python 12.x detected - Perfect for MediaPipe!")
        return True
    elif version.major == 3 and version.minor >= 8:
        print("⚠️  Python version is compatible but 12.x is recommended for MediaPipe")
        return True
    else:
        print("❌ Python version too old. Please upgrade to Python 12.x")
        return False

def check_package(package_name, install_name=None):
    """Check if a package is installed"""
    if install_name is None:
        install_name = package_name
    
    spec = importlib.util.find_spec(package_name)
    if spec is not None:
        try:
            module = importlib.import_module(package_name)
            version = getattr(module, '__version__', 'Unknown')
            print(f"✅ {package_name}: {version}")
            return True
        except ImportError:
            print(f"❌ {package_name}: Import failed")
            return False
    else:
        print(f"❌ {package_name}: Not installed")
        return False

def install_package(package_name):
    """Install a package using pip"""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", package_name])
        return True
    except subprocess.CalledProcessError:
        return False

def main():
    print("🔍 Checking Python Environment for Boots Skin Care Project...")
    print("=" * 60)
    
    # Check Python version
    if not check_python_version():
        return 1
    
    print("\n📦 Checking Required Packages...")
    
    # List of required packages
    packages = [
        ("cv2", "opencv-python"),
        ("mediapipe", "mediapipe"),
        ("numpy", "numpy"),
        ("PIL", "Pillow"),
        ("flask", "Flask"),
        ("flask_cors", "Flask-CORS")
    ]
    
    missing_packages = []
    
    for package_name, install_name in packages:
        if not check_package(package_name, install_name):
            missing_packages.append(install_name)
    
    if missing_packages:
        print(f"\n⚠️  Missing packages: {', '.join(missing_packages)}")
        print("\n💡 To install missing packages:")
        print(f"   pip install {' '.join(missing_packages)}")
        
        # Auto-install if requested
        install = input("\n🤔 Would you like to install missing packages now? (y/n): ")
        if install.lower() == 'y':
            print("\n📦 Installing packages...")
            for package in missing_packages:
                print(f"Installing {package}...")
                if install_package(package):
                    print(f"✅ {package} installed successfully")
                else:
                    print(f"❌ Failed to install {package}")
    else:
        print("\n🎉 All required packages are installed!")
    
    print("\n" + "=" * 60)
    print("🚀 Environment check completed!")
    
    # Test MediaPipe specifically
    print("\n🧪 Testing MediaPipe initialization...")
    try:
        import mediapipe as mp
        face_detection = mp.solutions.face_detection.FaceDetection()
        print("✅ MediaPipe face detection initialized successfully!")
        face_detection.close()
    except Exception as e:
        print(f"❌ MediaPipe test failed: {e}")
        print("💡 Try: pip install --upgrade mediapipe")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
