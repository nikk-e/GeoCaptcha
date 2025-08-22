from flask import Flask, jsonify, request
from pathlib import Path
import pandas as pd

app = Flask(__name__)

def get_captcha():
    df = pd.read_csv(Path(__file__).parent.parent.resolve() / "database.txt")
    return df.iloc[0].to_dict()

def check_captcha(id, answer) -> bool:
    df = pd.read_csv(Path(__file__).parent.parent.resolve() / "database.txt")
    return df.loc[df["id"] == id, "captcha"].eq(answer).any()

@app.route("/get_captcha", methods=["GET"])
def api_get_captcha():
    return jsonify(get_captcha())

@app.route("/check_captcha", methods=["POST"])
def api_check_captcha():
    data = request.json
    id = data.get("id")
    answer = data.get("answer")
    result = check_captcha(id, answer)
    return jsonify({"result": result})

if __name__ == "__main__":
    app.run(debug=True)