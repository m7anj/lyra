import requests
import os 
from dotenv import load_dotenv

load_dotenv()

def search_song_by_lyrics(lyrics, access_token):
    """
    Search for a song on Genius based on lyrics.
    
    Args:
        lyrics (str): The lyrics to search for
        access_token (str): Your Genius API access token
        
    Returns:
        dict: Information about the matching song, if found
    """
    base_url = "https://api.genius.com"
    search_url = f"{base_url}/search"
    
    # Use the first few words of the lyrics as the search query
    # Limit to ~10 words to improve search accuracy
    search_query = " ".join(lyrics.split()[:10])
    
    headers = {
        "Authorization": f"Bearer {access_token}"
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
            return hits[0].get("result")
        else:
            return {"error": "No songs found matching those lyrics"}
    else:
        return {"error": f"API request failed with status code {response.status_code}"}

# Example usage
def main():
    lyrics = "I get those goosebumps everytime"
    access_token = os.getenv("GENIUS_ACCESS_TOKEN")
    
    result = search_song_by_lyrics(lyrics, access_token)
    
    if "error" not in result:
        print(f"Found song: {result.get('title')} by {result.get('primary_artist', {}).get('name')}")
        print(f"Genius URL: {result.get('url')}")
    else:
        print(result["error"])

if __name__ == "__main__":
    main()