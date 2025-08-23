from openai import OpenAI
from dotenv import load_dotenv
import os
import base64

with open("Monke.jpeg", "rb") as img_file:
    base64_image = base64.b64encode(img_file.read()).decode('utf-8')

load_dotenv()

client = OpenAI(api_key=os.getenv("API_KEY"))

response = client.chat.completions.create(
    model="gpt-4o",  # or gpt-4-turbo with vision
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "Describe this image."},
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

print(response.choices[0].message.content)