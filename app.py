from flask import Flask, render_template, jsonify
import sqlite3
from datetime import datetime
import random
import os

app = Flask(__name__)

DATABASE = 'iot_data.db'

# Database Function

def get_db_connection():
    """Create database connection"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row # Access columns by name
    return conn

def init_db():
    """Initialize database with schema"""
    if not os.path.exists(DATABASE):
        conn = get_db_connection()
        conn.execute('''
            CREATE TABLE sensor_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                temperature REAL NOT NULL,
                humidity REAL NOT NULL,
                light INTEGER NOT NULL
            )                     
        ''')
        conn.commit()
        conn.close()
        print("Database Initialyzed")

def get_sensor_reading():
    """Simulate sensor reading (random values for now)"""
    return {
        'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'temperature': round(random.uniform(20, 30), 1),
        'humidity': round(random.uniform(40, 70), 1),
        'light': random.randint(0, 100)
    }

def store_reading(data):
    """Store sensor reading to database"""
    conn = get_db_connection()
    conn.execute(
        'INSERT INTO sensor_data (timestamp, temperature, humidity, light) VALUES (?, ?, ?, ?)',
        (data['timestamp'], data['temperature'], data['humidity'], data['light'])
    )
    conn.commit()
    conn.close()

def get_latest_readings(limit=50):
    """Get last N readings from database"""
    conn = get_db_connection()
    readings = conn.execute(
        'SELECT * FROM sensor_data ORDER BY id DESC LIMIT ?',
        (limit,)
    ).fetchall()
    conn.close()

    # Convert to list of dicts (reverse to chronological order)
    return [dict(row) for row in readings][::-1]

# Routes

@app.route('/')
def index():
    """Main dashboard page"""
    return render_template('index.html')

@app.route('/api/current')
def api_current():
    """API: Get current sensor reading"""
    data = get_sensor_reading()
    store_reading(data) # Save to database
    return jsonify(data)

@app.route('/api/history')
def api_history():
    """API: Get historical data"""
    readings = get_latest_readings(50)
    return jsonify(readings)

# Startup

if __name__ == '__main__':
    init_db() # Create database if doesn't exists
    print("="*50)
    print("IoT Dashboard Server Starting...")
    print("Open browser: http://localhost:5000")
    print("API endpoints:")
    print("   - /api/current (current reading)")
    print("   - /api/history (last 50 reading)")
    print("="*50)
    app.run(debug=True, host='0.0.0.0', port=5000)