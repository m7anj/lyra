from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests
import tempfile
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Get Deepgram API key from environment
DEEPGRAM_ACCESS_TOKEN = os.getenv('DEEPGRAM_ACCESS_TOKEN')

# Add this test route to verify your API key works
@app.route('/api/test-deepgram', methods=['GET'])
def test_deepgram():
    headers = {
        "Authorization": f"Token {DEEPGRAM_ACCESS_TOKEN}"
    }
    try:
        # Simple API call to test authentication
        response = requests.get("https://api.deepgram.com/v1/projects", headers=headers)
        if response.status_code == 200:
            return jsonify({"status": "Deepgram API key is valid"})
        else:
            return jsonify({"error": f"Deepgram API error: {response.text}"})
    except Exception as e:
        return jsonify({"error": str(e)})

@app.route('/api/transcribe', methods=['POST'])
def transcribe_audio():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400
    
    audio_file = request.files['audio']
    
    # Save the audio file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as temp_file:
        audio_file.save(temp_file.name)
        temp_filename = temp_file.name
    
    try:
        # Send audio to Deepgram API
        with open(temp_filename, 'rb') as audio:
            # Deepgram API endpoint
            url = "https://api.deepgram.com/v1/listen?model=nova-2&language=en&detect_language=false"
            
            headers = {
                "Authorization": f"Token {DEEPGRAM_ACCESS_TOKEN}",
                "Content-Type": "audio/webm"
            }
            
            # Send the request to Deepgram
            response = requests.post(url, headers=headers, data=audio)
            
            if response.status_code != 200:
                return jsonify({"error": f"Deepgram API error: {response.text}"}), response.status_code
            
            # Parse the response
            result = response.json()
            
            # Extract the transcription
            if not result.get('results', {}).get('channels', [{}])[0].get('alternatives', [{}])[0].get('transcript'):
                return jsonify({"error": "Could not transcribe audio"}), 400
            
            transcription = result['results']['channels'][0]['alternatives'][0]['transcript']
            
            return jsonify({"transcription": transcription})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    finally:
        # Clean up temporary file
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

if __name__ == '__main__':
    app.run(debug=True)