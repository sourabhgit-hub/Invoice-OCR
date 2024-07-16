from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import cv2
import numpy as np
import os
import json
from ImageProcessor import ImageProcessor


app = Flask(__name__)
CORS(app)

# Define the folder where images will be saved
IMAGE_FOLDER = 'static'

# Ensure the folder exists
os.makedirs(IMAGE_FOLDER, exist_ok=True)

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

@app.route('/', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400

    file = request.files['image']
    img = np.frombuffer(file.read(), np.uint8)
    img = cv2.imdecode(img, cv2.IMREAD_COLOR)
    
    # Generate a unique filename and save the image to the specified folder
    image_filename = 'uploaded_image.jpg'
    saved_image_path = os.path.join(IMAGE_FOLDER, image_filename)
    cv2.imwrite(saved_image_path, img)
    
    # data={'a':1}
    data = main(saved_image_path)
    # print("sourabh")
    # print(data)

    # return jsonify(data)
    return render_template('output.html');

@app.route('/submit', methods=['POST'])
def principle6():
    try:
        # Get the JSON data from the request
        data = request.get_json()
        print(data)
        # Extract the text values from the JSON
        text_values = data.get('texts', [])
        print(text_values)

        # Process each text value as needed
        # for text in text_values:
        #     print(f"Received text: {text}")

            # Example processing: Save to a file or database (not shown here)
            # with open('output.txt', 'a') as f:
            #     f.write(f"{text}\n")

        # Return a success response
        return jsonify({'message': 'Texts received successfully', 'texts': text_values}), 200
    except Exception as e:
        return jsonify({'message': 'Error processing request', 'error': str(e)}), 500

    except Exception as e:
        # Handle any errors that may occur
        print(f"Error: {e}")
        return jsonify({'message': 'An error occurred', 'error': str(e)}), 500
    
def main(img_path):
    image = ImageProcessor(img_path)
    image.preprocess_image()
    all_data = image.get_rect_data()
    file_path = 'static/rectangles.json'
    with open(file_path, 'w') as f:
        json.dump(all_data, f, indent=2)

    return all_data

if __name__ == '__main__':
    app.run(debug=True)
