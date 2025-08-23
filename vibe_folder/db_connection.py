from flask import Flask, jsonify, request
from flask_cors import CORS
from pathlib import Path
import pandas as pd

from coordinate_check import calculate_distance

app = Flask(__name__)
CORS(app)

def get_captcha():
    df = pd.read_csv(Path(__file__).parent.parent.resolve() / "database.txt")
    d = df.iloc[0].to_dict()
    # Convert all numpy types to native Python types
    for k, v in d.items():
        if hasattr(v, 'item'):
            d[k] = v.item()
    return d

def check_captcha(id, old_code, new_code) -> bool:
    print(id, old_code, new_code)
    df = pd.read_csv(Path(__file__).parent.parent.resolve() / "database.txt")

    result = df.loc[df["id"] == id, "captcha"].eq(old_code.lower()).any()
    print(old_code.lower(), new_code.lower(), result)
    if hasattr(result, 'item'):
        result = result.item()
    if result and new_code:
        df.loc[df["id"] == id, "captcha"] = new_code.lower()
        df.to_csv(Path(__file__).parent.parent.resolve() / "database.txt", index=False)
    return result

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
    print(f"Captcha check for ID {id} with old code '{old_code}' and new code '{new_code}': {result}")
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