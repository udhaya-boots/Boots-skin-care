import sqlite3
import json
from datetime import datetime
from typing import List, Dict, Optional

class Database:
    def __init__(self, db_path: str = 'boots_skincare.db'):
        self.db_path = db_path
    
    def initialize_database(self):
        """Initialize the database with tables and sample data"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create analyses table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS analyses (
                id TEXT PRIMARY KEY,
                timestamp TEXT NOT NULL,
                issues TEXT NOT NULL,
                recommendations TEXT,
                severity TEXT NOT NULL
            )
        ''')
        
        # Create products table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS products (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT NOT NULL,
                price REAL NOT NULL,
                image_url TEXT,
                category TEXT NOT NULL,
                target_issues TEXT NOT NULL,
                rating REAL DEFAULT 4.0,
                brand TEXT NOT NULL
            )
        ''')
        
        # Insert sample products if table is empty
        cursor.execute('SELECT COUNT(*) FROM products')
        if cursor.fetchone()[0] == 0:
            self._insert_sample_products(cursor)
        
        conn.commit()
        conn.close()
    
    def _insert_sample_products(self, cursor):
        """Insert sample Boots skincare products"""
        sample_products = [
            {
                'id': 'boots-001',
                'name': 'Boots Expert Anti-Blemish Daily Cleanser',
                'description': 'A gentle daily cleanser formulated with salicylic acid to help prevent blemishes and unclog pores. Suitable for acne-prone and oily skin types.',
                'price': 12.99,
                'image_url': '/images/anti-blemish-cleanser.jpg',
                'category': 'Cleanser',
                'target_issues': json.dumps(['acne', 'oily_skin']),
                'rating': 4.5,
                'brand': 'Boots Expert'
            },
            {
                'id': 'boots-002',
                'name': 'Boots Ingredients Niacinamide 10% Serum',
                'description': 'A concentrated serum with 10% niacinamide to help minimize pores, control oil production, and reduce the appearance of blemishes.',
                'price': 8.99,
                'image_url': '/images/niacinamide-serum.jpg',
                'category': 'Treatment',
                'target_issues': json.dumps(['acne', 'dark_spots', 'oily_skin']),
                'rating': 4.7,
                'brand': 'Boots Ingredients'
            },
            {
                'id': 'boots-003',
                'name': 'Boots Protect Light Moisturiser SPF 30',
                'description': 'A lightweight daily moisturizer with broad-spectrum SPF 30 protection. Helps prevent dark spots and provides essential hydration.',
                'price': 15.99,
                'image_url': '/images/spf-moisturizer.jpg',
                'category': 'Moisturizer',
                'target_issues': json.dumps(['dryness', 'dark_spots']),
                'rating': 4.3,
                'brand': 'Boots Protect'
            },
            {
                'id': 'boots-004',
                'name': 'Boots Tea Tree & Witch Hazel Toner',
                'description': 'A purifying toner with tea tree oil and witch hazel to help reduce excess oil and minimize the appearance of pores.',
                'price': 6.99,
                'image_url': '/images/tea-tree-toner.jpg',
                'category': 'Toner',
                'target_issues': json.dumps(['acne', 'oily_skin']),
                'rating': 4.2,
                'brand': 'Boots Tea Tree'
            },
            {
                'id': 'boots-005',
                'name': 'Boots Sensitive Gentle Cleansing Cream',
                'description': 'A mild, soap-free cleansing cream designed for sensitive skin prone to redness and irritation.',
                'price': 9.99,
                'image_url': '/images/gentle-cleanser.jpg',
                'category': 'Cleanser',
                'target_issues': json.dumps(['redness', 'dryness']),
                'rating': 4.6,
                'brand': 'Boots Sensitive'
            },
            {
                'id': 'boots-006',
                'name': 'Boots Time Delay Vitamin C Brightening Serum',
                'description': 'A potent vitamin C serum that helps reduce dark spots, even skin tone, and boost radiance.',
                'price': 19.99,
                'image_url': '/images/vitamin-c-serum.jpg',
                'category': 'Treatment',
                'target_issues': json.dumps(['dark_spots']),
                'rating': 4.4,
                'brand': 'Boots Time Delay'
            },
            {
                'id': 'boots-007',
                'name': 'Boots Dry Skin Relief Night Cream',
                'description': 'An intensive overnight moisturizer enriched with hyaluronic acid and ceramides for deep hydration.',
                'price': 13.99,
                'image_url': '/images/night-cream.jpg',
                'category': 'Moisturizer',
                'target_issues': json.dumps(['dryness']),
                'rating': 4.5,
                'brand': 'Boots Dry Skin'
            },
            {
                'id': 'boots-008',
                'name': 'Boots Redness Relief Calming Gel',
                'description': 'A soothing gel with aloe vera and chamomile to calm irritated and red skin instantly.',
                'price': 11.99,
                'image_url': '/images/calming-gel.jpg',
                'category': 'Treatment',
                'target_issues': json.dumps(['redness']),
                'rating': 4.3,
                'brand': 'Boots Calming'
            },
            {
                'id': 'boots-009',
                'name': 'Boots Oil Control Mattifying Primer',
                'description': 'A lightweight primer that controls oil and shine while creating a smooth base for makeup application.',
                'price': 7.99,
                'image_url': '/images/oil-control-primer.jpg',
                'category': 'Primer',
                'target_issues': json.dumps(['oily_skin']),
                'rating': 4.1,
                'brand': 'Boots Oil Control'
            },
            {
                'id': 'boots-010',
                'name': 'Boots Hyaluronic Acid Hydrating Mask',
                'description': 'A weekly hydrating mask with hyaluronic acid to replenish moisture and plump the skin.',
                'price': 14.99,
                'image_url': '/images/hydrating-mask.jpg',
                'category': 'Mask',
                'target_issues': json.dumps(['dryness']),
                'rating': 4.6,
                'brand': 'Boots Hydration'
            }
        ]
        
        for product in sample_products:
            cursor.execute('''
                INSERT INTO products (id, name, description, price, image_url, category, target_issues, rating, brand)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                product['id'], product['name'], product['description'], product['price'],
                product['image_url'], product['category'], product['target_issues'],
                product['rating'], product['brand']
            ))
    
    def save_analysis(self, analysis: Dict):
        """Save an analysis result to the database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO analyses (id, timestamp, issues, recommendations, severity)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            analysis['id'],
            analysis['timestamp'],
            json.dumps(analysis['issues']),
            json.dumps(analysis['recommendations']),
            analysis['severity']
        ))
        
        conn.commit()
        conn.close()
    
    def get_analysis(self, analysis_id: str) -> Optional[Dict]:
        """Get an analysis by ID"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM analyses WHERE id = ?', (analysis_id,))
        row = cursor.fetchone()
        
        conn.close()
        
        if row:
            return {
                'id': row[0],
                'timestamp': row[1],
                'issues': json.loads(row[2]),
                'recommendations': json.loads(row[3]) if row[3] else [],
                'severity': row[4]
            }
        return None
    
    def get_recent_analyses(self, limit: int = 10) -> List[Dict]:
        """Get recent analyses"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM analyses 
            ORDER BY timestamp DESC 
            LIMIT ?
        ''', (limit,))
        
        rows = cursor.fetchall()
        conn.close()
        
        analyses = []
        for row in rows:
            analyses.append({
                'id': row[0],
                'timestamp': row[1],
                'issues': json.loads(row[2]),
                'recommendations': json.loads(row[3]) if row[3] else [],
                'severity': row[4]
            })
        
        return analyses
    
    def get_all_products(self) -> List[Dict]:
        """Get all products"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM products ORDER BY rating DESC')
        rows = cursor.fetchall()
        
        conn.close()
        
        products = []
        for row in rows:
            products.append({
                'id': row[0],
                'name': row[1],
                'description': row[2],
                'price': row[3],
                'image_url': row[4],
                'category': row[5],
                'target_issues': json.loads(row[6]),
                'rating': row[7],
                'brand': row[8]
            })
        
        return products
    
    def get_products_for_issues(self, issue_types: List[str]) -> List[Dict]:
        """Get products that target specific skin issues"""
        if not issue_types:
            return self.get_all_products()[:3]
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create a query to find products that target any of the detected issues
        products = self.get_all_products()
        
        # Score products based on how many detected issues they address
        scored_products = []
        for product in products:
            score = 0
            for issue in issue_types:
                if issue in product['target_issues']:
                    score += 1
            
            if score > 0:
                scored_products.append((product, score))
        
        # Sort by score (descending) then by rating (descending)
        scored_products.sort(key=lambda x: (x[1], x[0]['rating']), reverse=True)
        
        # Return top products
        return [product for product, score in scored_products]
