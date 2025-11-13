#!/usr/bin/env python3
"""
Boots Skin Care - Simple Setup & Start Script
Installs dependencies and starts the backend server
"""

import sys
import subprocess
import importlib.util

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    print(f"🐍 Python version: {version.major}.{version.minor}.{version.micro}")
    
    if version.major == 3 and version.minor >= 8:
        print("✅ Python version is compatible!")
        return True
    else:
        print("❌ Python version too old. Please upgrade to Python 3.8+")
        return False

def install_package(package_name):
    """Install a package using pip"""
    try:
        print(f"📦 Installing {package_name}...")
        subprocess.check_call([
            sys.executable, "-m", "pip", "install", package_name, "--upgrade", "--quiet"
        ])
        return True
    except subprocess.CalledProcessError:
        return False

def check_and_install_dependencies():
    """Check and install required packages"""
    packages = ["Flask", "Flask-CORS", "opencv-python", "numpy", "Pillow"]
    
    print("🔍 Checking dependencies...")
    missing_packages = []
    
    for package in packages:
        import_name = "cv2" if package == "opencv-python" else package.lower().replace("-", "_")
        if package == "Flask-CORS":
            import_name = "flask_cors"
        
        try:
            importlib.import_module(import_name)
            print(f"✅ {package}: Already installed")
        except ImportError:
            print(f"❌ {package}: Missing")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\n📦 Installing missing packages: {', '.join(missing_packages)}")
        for package in missing_packages:
            if not install_package(package):
                print(f"❌ Failed to install {package}")
                return False
        print("✅ All dependencies installed!")
    else:
        print("✅ All dependencies are already installed!")
    
    return True

def test_imports():
    """Test if all components can be imported"""
    try:
        from skin_analyzer_opencv import OpenCVSkinAnalyzer
        analyzer = OpenCVSkinAnalyzer()
        print("✅ Skin analyzer: Ready")
        
        from database import Database
        db = Database()
        print("✅ Database: Ready")
        
        return True
    except Exception as e:
        print(f"❌ Component test failed: {e}")
        return False

def start_server():
    """Start the Flask server"""
    try:
        print("\n🚀 Starting Boots Skin Care Backend Server...")
        print("🌐 Server will be available at: http://localhost:5000")
        print("📝 Press Ctrl+C to stop the server")
        print("-" * 50)
        
        subprocess.run([sys.executable, "app.py"])
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except Exception as e:
        print(f"\n❌ Server error: {e}")
        return False
    return True

def main():
    print("🚀 Boots Skin Care - Backend Setup & Start")
    print("=" * 50)
    
    # Check Python version
    if not check_python_version():
        return 1
    
    # Install dependencies
    if not check_and_install_dependencies():
        print("❌ Dependency installation failed")
        return 1
    
    # Test components
    if not test_imports():
        print("❌ Component testing failed")
        return 1
    
    # Start server
    start_server()
    return 0

if __name__ == "__main__":
    sys.exit(main())
