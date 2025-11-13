#!/usr/bin/env python3
"""
Simple API Test - Test if backend is working
"""

def test_components():
    """Test if all components work locally"""
    print("🧪 Testing Components...")
    
    try:
        from skin_analyzer_opencv import OpenCVSkinAnalyzer
        analyzer = OpenCVSkinAnalyzer()
        print("✅ Skin Analyzer: OK")
    except Exception as e:
        print(f"❌ Skin Analyzer: {e}")
        return False
    
    try:
        from database import Database
        db = Database()
        db.initialize_database()
        products = db.get_all_products()
        print(f"✅ Database: OK ({len(products)} products)")
    except Exception as e:
        print(f"❌ Database: {e}")
        return False
    
    try:
        from app import app
        with app.test_client() as client:
            response = client.get('/api/health')
            if response.status_code == 200:
                print("✅ Flask App: OK")
                return True
            else:
                print(f"❌ Flask App: Status {response.status_code}")
    except Exception as e:
        print(f"❌ Flask App: {e}")
        return False
    
    return True

def test_live_server():
    """Test live server if requests is available"""
    try:
        import requests
        response = requests.get('http://localhost:5000/api/health', timeout=3)
        if response.status_code == 200:
            print("✅ Live Server: Running")
            return True
        else:
            print(f"⚠️ Live Server: Status {response.status_code}")
    except ImportError:
        print("ℹ️ requests not installed - skipping live server test")
    except Exception:
        print("❌ Live Server: Not running")
    return False

def main():
    print("🔧 Boots Skin Care - Quick Test")
    print("=" * 35)
    
    if test_components():
        print("\n✅ All components working!")
        
        if test_live_server():
            print("✅ Backend is ready!")
        else:
            print("� To start server: python setup_and_start.py")
    else:
        print("\n❌ Some components failed")
        print("💡 Try: python setup_and_start.py")

if __name__ == "__main__":
    main()
