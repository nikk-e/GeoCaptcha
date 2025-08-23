from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
from dotenv import load_dotenv
import os
import base64
import json
import random
import math

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("API_KEY"))

# Constants for location generation
OTANIEMI_LAT = 60.18414
OTANIEMI_LON = 24.830084
EARTH_RADIUS = 6371000  # Earth's radius in meters

def generate_random_location(center_lat, center_lon, radius_meters=5000):
    """Generate a random location within radius of center point"""
    # Generate random offsets in meters
    delta_north = random.uniform(-radius_meters, radius_meters)
    delta_east = random.uniform(-radius_meters, radius_meters)
    
    # Convert meter offsets to degrees
    new_lat = center_lat + (delta_north / EARTH_RADIUS) * (180 / math.pi)
    new_lon = center_lon + (delta_east / (EARTH_RADIUS * math.cos(math.radians(center_lat)))) * (180 / math.pi)
    
    return new_lat, new_lon

def analyze_image_for_location(image_base64, target_lat, target_lon):
    """Use OpenAI to analyze if image was taken at target location"""
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text", 
                            "text": f"Analyze this image and determine if it was taken at coordinates {target_lat}, {target_lon}. "
                                   f"Look for recognizable landmarks, buildings, or features that would indicate this specific location. "
                                   f"Respond with a probability score from 0.0 to 1.0 (where 1.0 means definitely taken at this location) "
                                   f"followed by a brief explanation. Format: SCORE: 0.X\\nEXPLANATION: your explanation"
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_base64}"
                            }
                        }
                    ],
                }
            ],
            max_tokens=300
        )
        
        output = response.choices[0].message.content.strip()
        
        # Parse the response
        if "SCORE:" in output and "EXPLANATION:" in output:
            score_part = output.split("SCORE:")[1].split("EXPLANATION:")[0].strip()
            explanation_part = output.split("EXPLANATION:")[1].strip()
            
            try:
                score = float(score_part)
                return score, explanation_part
            except ValueError:
                return 0.0, "Could not parse AI response"
        else:
            return 0.0, f"Unexpected AI response format: {output}"
            
    except Exception as e:
        return 0.0, f"Error analyzing image: {str(e)}"

@app.route('/get_random_coordinates', methods=['GET'])
def get_random_coordinates():
    """Get a random location near the provided coordinates"""
    lat = float(request.args.get('lat', OTANIEMI_LAT))
    lon = float(request.args.get('lon', OTANIEMI_LON))
    
    # Generate a random location within 5km
    new_lat, new_lon = generate_random_location(lat, lon)
    
    # Generate a random hint
    hints = [
        "Look for a QR code or sign with your verification code",
        "Check nearby building entrances for posted codes",
        "Search for a GeoCaptcha marker in this area",
        "Look for a small sign with alphanumeric code",
        "Check lamp posts or utility poles for verification codes"
    ]
    
    return jsonify({
        "id": f"loc_{random.randint(1000, 9999)}",
        "latitude": new_lat,
        "longitude": new_lon,
        "hint": random.choice(hints)
    })

@app.route('/check_captcha', methods=['POST'])
def check_captcha():
    """Verify captcha with either code or photo"""
    data = request.get_json()
    
    location_id = data.get('id')
    old_code = data.get('old_code', '')
    new_code = data.get('new_code', '')
    
    # Mock code verification (replace with your actual logic)
    if old_code and len(old_code) >= 4:
        return jsonify({"result": True, "method": "code"})
    else:
        return jsonify({"result": False, "method": "code"})

@app.route('/verify_photo', methods=['POST'])
def verify_photo():
    """Verify location using uploaded photo with AI analysis"""
    try:
        # Check if photo was uploaded
        if 'photo' not in request.files:
            return jsonify({"result": False, "error": "No photo uploaded"})
        
        photo = request.files['photo']
        if photo.filename == '':
            return jsonify({"result": False, "error": "No photo selected"})
        
        # Get target coordinates
        target_lat = float(request.form.get('latitude'))
        target_lon = float(request.form.get('longitude'))
        
        # Convert image to base64
        image_data = photo.read()
        image_base64 = base64.b64encode(image_data).decode('utf-8')
        
        # Analyze image with AI
        score, explanation = analyze_image_for_location(image_base64, target_lat, target_lon)
        
        # Consider verification successful if score > 0.6
        success = score > 0.6
        
        return jsonify({
            "result": success,
            "method": "photo",
            "score": score,
            "explanation": explanation,
            "threshold": 0.6
        })
        
    except Exception as e:
        return jsonify({"result": False, "error": f"Server error: {str(e)}"})

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "ai_available": bool(os.getenv("API_KEY"))})

if __name__ == '__main__':
    print("Starting GeoCaptcha backend...")
    print(f"OpenAI API configured: {bool(os.getenv('API_KEY'))}")
    app.run(debug=True, host='0.0.0.0', port=5000)
