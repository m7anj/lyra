from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests
import tempfile
import base64
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Get API keys from environment
DEEPGRAM_ACCESS_TOKEN = os.getenv('DEEPGRAM_ACCESS_TOKEN')
GENIUS_ACCESS_TOKEN = os.getenv('GENIUS_ACCESS_TOKEN')
SPOTIFY_CLIENT_ID = os.getenv('SPOTIFY_CLIENT_ID')
SPOTIFY_CLIENT_TOKEN = os.getenv('SPOTIFY_CLIENT_TOKEN')

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

@app.route('/api/search-song', methods=['POST'])
def search_song():
    if not request.json or 'lyrics' not in request.json:
        return jsonify({"error": "No lyrics provided"}), 400
    
    lyrics = request.json['lyrics']
    
    if not lyrics or not lyrics.strip():
        return jsonify({"error": "Empty lyrics provided"}), 400
    
    try:
        # Use the Genius API to search for the song
        base_url = "https://api.genius.com"
        search_url = f"{base_url}/search"
        
        # Use the first few words of the lyrics as the search query
        # Limit to ~10 words to improve search accuracy
        search_query = " ".join(lyrics.split()[:10])
        
        headers = {
            "Authorization": f"Bearer {GENIUS_ACCESS_TOKEN}"
        }
        
        params = {
            "q": search_query
        }
        
        response = requests.get(search_url, headers=headers, params=params)
        
        if response.status_code == 200:
            data = response.json()
            hits = data.get("response", {}).get("hits", [])
            
            if hits:
                # Return the first hit (most relevant match)
                return jsonify(hits[0].get("result"))
            else:
                return jsonify({"error": "No songs found matching those lyrics"}), 404
        else:
            return jsonify({"error": f"Genius API error: {response.status_code}"}), response.status_code
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/search-spotify', methods=['POST'])
def search_spotify():
    if not request.json or 'title' not in request.json or 'artist' not in request.json:
        return jsonify({"error": "Title and artist required"}), 400
    
    title = request.json['title']
    artist = request.json['artist']
    
    try:
        # Get Spotify access token
        auth_url = "https://accounts.spotify.com/api/token"
        auth_header = base64.b64encode(f"{SPOTIFY_CLIENT_ID}:{SPOTIFY_CLIENT_TOKEN}".encode()).decode()
        
        auth_response = requests.post(
            auth_url,
            headers={"Authorization": f"Basic {auth_header}"},
            data={"grant_type": "client_credentials"}
        )
        
        auth_data = auth_response.json()
        
        if 'access_token' not in auth_data:
            return jsonify({"error": "Failed to authenticate with Spotify"}), 500
        
        access_token = auth_data['access_token']
        
        # Search for the track
        search_url = "https://api.spotify.com/v1/search"
        search_query = f"track:{title} artist:{artist}"
        
        search_response = requests.get(
            search_url,
            headers={"Authorization": f"Bearer {access_token}"},
            params={"q": search_query, "type": "track", "limit": 1}
        )
        
        search_data = search_response.json()
        
        # Check if any tracks were found
        if search_data.get('tracks', {}).get('items', []):
            track = search_data['tracks']['items'][0]
            
            return jsonify({
                "trackId": track['id'],
                "trackUrl": track['external_urls']['spotify'],
                "name": track['name'],
                "artist": track['artists'][0]['name'],
                "album": track['album']['name'],
                "albumArt": track['album']['images'][0]['url'] if track['album']['images'] else None
            })
        else:
            return jsonify({"error": "No matching track found on Spotify"}), 404
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)