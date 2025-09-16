from google import genai
from google.genai import types
from PIL import Image
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import io

load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize Gemini client
client = genai.Client()

@app.route('/', methods=['GET'])
def home():
    return {'text': 'API is up and running'}

# ---- Topic-based poem ----
@app.route("/write", methods=['POST'])
def write():
    req = request.get_json()  # Extract JSON
    topic = req.get('topic')
    poet = req.get('poet')

    if not topic or not poet:
        return jsonify({'error': "Both 'topic' and 'poet' are required"}), 400

    response = client.models.generate_content(
        model="gemini-2.5-pro",
        config=types.GenerateContentConfig(
            temperature=0.7,
            thinking_config=types.ThinkingConfig(thinking_budget=-1),
            system_instruction=(
                "You are a literary expert. "
                "When the user gives you a topic and a poet, write a poem that could have been written by that poet. "
                "Carefully mimic their diction, themes, imagery, and rhythm."
            ),
        ),
        contents=f"Topic: {topic}\nPoet: {poet}"
    )

    poem = response.text.replace("*", "")
    return jsonify({'poem': poem})


# ---- Image-based poem ----
@app.route("/write-image", methods=['POST'])
def write_image():
    poet = request.form.get('poet') # text input
    image_file = request.files.get('image') # Uploaded image

    if not poet or not image_file:
        return jsonify({'error': "Both 'poet' and an image are required"}), 400

    try:
        # Open uploaded image
        image = Image.open(image_file)

        # Generate poem from image using Gemini API
        response = client.models.generate_content(
            model="gemini-2.5-pro",
            config=types.GenerateContentConfig(
                temperature=0.7,
                thinking_config=types.ThinkingConfig(thinking_budget=-1),
                system_instruction=(
                    "You are a literary expert. "
                    "When the user provides an image and a poet, write a poem in the style of that poet inspired by the image. "
                    "Carefully mimic their diction, themes, imagery, and rhythm."
                ),
            ),
            contents=[image, f"Generate a poem in the style of {poet} inspired by this image."]
        )

        poem = response.text.replace("*", "")
        return jsonify({'poem': poem})

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == "__main__":
    app.run(host='127.0.0.1', port=5000, debug=True)
