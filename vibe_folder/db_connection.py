from flask import Flask, jsonify, request
from flask_cors import CORS
from pathlib import Path
import pandas as pd
import os
import base64
from dotenv import load_dotenv
from openai import OpenAI

from coordinate_check import calculate_distance

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize OpenAI client
openai_client = None
if os.getenv('API_KEY'):
    openai_client = OpenAI(api_key=os.getenv('API_KEY'))
    print("OpenAI API configured: True")
else:
    print("Warning: OpenAI API key not found in environment variables")

def get_captcha():
    df = pd.read_csv(Path(__file__).parent.parent.resolve() / "database.txt")
    d = df.iloc[0].to_dict()
    # Convert all numpy types to native Python types
    for k, v in d.items():
        if hasattr(v, 'item'):
            d[k] = v.item()
    return d

def check_captcha(id, old_code, new_code) -> bool:
    df = pd.read_csv(Path(__file__).parent.parent.resolve() / "database.txt")

    # Only works with numbers
    result = df.loc[df["id"] == id, "captcha"].astype(str).eq(old_code.lower()).any()
    if hasattr(result, 'item'):
        result = result.item()
    if result and new_code:
        df.loc[df["id"] == id, "captcha"] = new_code.lower()
        df.to_csv(Path(__file__).parent.parent.resolve() / "database.txt", index=False)
    return result

def analyze_image_for_location(image_data, target_lat, target_lon):
    """
    Analyze an image using OpenAI to determine if it was taken at the target location
    """
    if not openai_client:
        return {
            "success": False,
            "message": "AI verification service not available",
            "confidence": 0.0
        }
    
    try:
        # Create a prompt for location verification
        prompt = f"""
        Analyze this image to determine if it was likely taken at coordinates {target_lat}, {target_lon}.
        
        Consider the following factors:
        1. Visible landmarks, buildings, or geographic features
        2. Urban vs rural setting appropriateness for the coordinates
        3. Architecture style that might match the region
        4. Any text, signs, or license plates visible
        5. Overall environmental context
        
        Respond with a JSON object containing:
        - "success": boolean (true if the image likely matches the location)
        - "message": string (explanation of your assessment)
        - "confidence": number between 0.0 and 1.0 (confidence in your assessment)
        
        Be somewhat lenient but look for obvious mismatches (like tropical scenes in arctic coordinates).
        """
        
        response = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_data}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=300
        )
        
        # Parse the response
        response_text = response.choices[0].message.content.strip()
        
        # Try to extract JSON from the response
        try:
            import json
            # Look for JSON in the response
            start = response_text.find('{')
            end = response_text.rfind('}') + 1
            if start != -1 and end != 0:
                json_str = response_text[start:end]
                result = json.loads(json_str)
                return result
        except:
            pass
        
        # Fallback: simple text analysis
        response_lower = response_text.lower()
        if any(word in response_lower for word in ['yes', 'likely', 'matches', 'consistent', 'plausible']):
            return {
                "success": True,
                "message": f"AI analysis suggests the image matches the target location. {response_text[:100]}...",
                "confidence": 0.7
            }
        else:
            return {
                "success": False,
                "message": f"AI analysis suggests the image does not match the target location. {response_text[:100]}...",
                "confidence": 0.3
            }
            
    except Exception as e:
        print(f"Error in AI analysis: {str(e)}")
        return {
            "success": False,
            "message": f"Error during AI analysis: {str(e)}",
            "confidence": 0.0
        }

@app.route("/verify_photo", methods=["POST"])
def api_verify_photo():
    """
    Verify a photo was taken at the target location using AI
    """
    try:
        # Check if photo file is provided
        if 'photo' not in request.files:
            return jsonify({"success": False, "message": "No photo file provided"}), 400
        
        photo = request.files['photo']
        if photo.filename == '':
            return jsonify({"success": False, "message": "No photo selected"}), 400
        
        # Get coordinates
        try:
            latitude = float(request.form.get('latitude'))
            longitude = float(request.form.get('longitude'))
        except (TypeError, ValueError):
            return jsonify({"success": False, "message": "Invalid coordinates provided"}), 400
        
        # Read and encode the image
        photo_data = photo.read()
        image_base64 = base64.b64encode(photo_data).decode('utf-8')
        
        # Analyze the image
        result = analyze_image_for_location(image_base64, latitude, longitude)
        
        return jsonify(result)
        
    except Exception as e:
        print(f"Error in photo verification: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"Server error during photo verification: {str(e)}",
            "confidence": 0.0
        }), 500

@app.route("/get_captcha", methods=["GET"])
def api_get_captcha():
    return jsonify(get_captcha())

@app.route("/check_captcha", methods=["POST"])
def api_check_captcha():
    data = request.json
    id = data.get("id") or data.get("locationID")
    old_code = data.get("old_code")
    new_code = data.get("new_code")
    result = check_captcha(id, old_code, new_code)
  
    return jsonify({"result": result})

@app.route("/get_random_coordinates", methods=["GET"])
def api_get_random_coordinates():
    try:
        lat = float(request.args.get("lat"))
        lon = float(request.args.get("lon"))
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid or missing parameters"}), 400

    max_distance = 5000
    df = pd.read_csv(Path(__file__).parent.parent.resolve() / "database.txt")
    df["distance"] = df.apply(lambda row: calculate_distance(lat, lon, row["latitude"], row["longitude"]), axis=1)
    suitable = df[(df["distance"] <= max_distance)]

    
    if suitable.shape[0] < 1:
        return jsonify({"error": f"Only found {suitable.shape[0]} suitable coordinates."}), 404
    random_coord = suitable.sample(1).iloc[0].to_dict()
    # Convert all numpy types to native Python types
    for k, v in random_coord.items():
        if hasattr(v, 'item'):
            random_coord[k] = v.item()
    return jsonify(random_coord)

if __name__ == "__main__":
    app.run(debug=True)