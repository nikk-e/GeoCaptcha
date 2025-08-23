from openai import OpenAI
from dotenv import load_dotenv
import os
import base64

with open("Monke.jpeg", "rb") as img_file:
    base64_image = base64.b64encode(img_file.read()).decode('utf-8')

load_dotenv()

client = OpenAI(api_key=os.getenv("API_KEY"))

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "Evaluate and describe the given image. Then evaluate in probability from 0.0 to 1.0 how likely the picture is taken from the given coordinates. Coordinates: 48.8588443, 2.2943506"},
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{base64_image}"
                    }
                }
            ],
        }
    ],
)

output = response.choices[0].message.content.strip()
if "\n" in output:
    description, probability = output.split("\n", 1)
    print("Description:", description.strip())
    print("Probability:", probability.strip())
else:
    print("Error: Unexpected output format.")