import requests
import os 
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def search_song_by_lyrics(lyrics, access_token=None):
    """
    Search for a song on Genius based on lyrics.
    
    Args:
        lyrics (str): The lyrics to search for
        access_token (str, optional): Your Genius API access token. If None, will attempt to load from environment.
        
    Returns:
        dict: Information about the matching song, if found
    """
    # If no access token provided, get from environment
    if access_token is None:
        access_token = os.getenv("GENIUS_ACCESS_TOKEN")
        if not access_token:
            return {"error": "No Genius API access token provided or found in environment"}
    
    base_url = "https://api.genius.com"
    search_url = f"{base_url}/search"
    
    # Clean the lyrics - remove extra whitespace and limit to ~10 words for search
    lyrics = lyrics.strip()
    search_query = " ".join(lyrics.split()[:10])
    
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    
    params = {
        "q": search_query
    }
    
    try:
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
    except Exception as e:
        return {"error": f"Exception occurred: {str(e)}"}

# Example usage as standalone script
def main():
    # Get lyrics from command line or user input
    import sys
    
    if len(sys.argv) > 1:
        # Get lyrics from command line arguments
        lyrics = " ".join(sys.argv[1:])
    else:
        # Prompt user for lyrics
        print("Enter lyrics to search for:")
        lyrics = input()
    
    access_token = os.getenv("GENIUS_ACCESS_TOKEN")
    
    if not access_token:
        print("Error: GENIUS_ACCESS_TOKEN not found in environment variables")
        return
    
    result = search_song_by_lyrics(lyrics, access_token)
    
    if "error" not in result:
        print(f"Found song: {result.get('title')} by {result.get('primary_artist', {}).get('name')}")
        print(f"Genius URL: {result.get('url')}")
    else:
        print(result["error"])

if __name__ == "__main__":
    main()