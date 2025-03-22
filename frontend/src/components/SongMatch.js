import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SongMatch = ({ lyrics }) => {
  const [isSearching, setIsSearching] = useState(false);
  const [songResult, setSongResult] = useState(null);
  const [error, setError] = useState('');
  const [spotifyTrack, setSpotifyTrack] = useState(null);

  useEffect(() => {
    // Search for the song when lyrics are provided
    if (lyrics && lyrics.trim() !== '') {
      searchSong(lyrics);
    }
  }, [lyrics]);

  const searchSong = async (lyrics) => {
    setIsSearching(true);
    setError('');
    setSongResult(null);
    setSpotifyTrack(null);
    
    try {
      // Call backend to search for the song using Genius API
      const response = await axios.post('http://localhost:5000/api/search-song', { 
        lyrics: lyrics 
      });
      
      if (response.data && !response.data.error) {
        setSongResult(response.data);
        // If song found, search for it on Spotify
        searchSpotify(response.data.title, response.data.primary_artist.name);
      } else {
        setError(response.data.error || 'No song found matching those lyrics');
      }
    } catch (err) {
      console.error('Error searching for song:', err);
      setError(err.response?.data?.error || 'Failed to search for song');
    } finally {
      setIsSearching(false);
    }
  };

  const searchSpotify = async (title, artist) => {
    try {
      // Call backend to search for the song on Spotify
      const response = await axios.post('http://localhost:5000/api/search-spotify', {
        title: title,
        artist: artist
      });
      
      if (response.data && response.data.trackId) {
        setSpotifyTrack(response.data);
      }
    } catch (err) {
      console.error('Error searching Spotify:', err);
      // Don't set error for Spotify, as we still have Genius results
    }
  };

  if (isSearching) {
    return <div className="song-match-container">Searching for song...</div>;
  }

  if (error) {
    return (
      <div className="song-match-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="song-match-container">
      {songResult && (
        <div className="song-result">
          <h2>Found Song</h2>
          
          <div className="song-details">
            {songResult.song_art_image_url && (
              <img 
                src={songResult.song_art_image_url} 
                alt={`${songResult.title} artwork`}
                className="song-artwork"
              />
            )}
            
            <div className="song-info">
              <h3>{songResult.title}</h3>
              <p>by {songResult.primary_artist.name}</p>
              
              {songResult.release_date_for_display && (
                <p>Released: {songResult.release_date_for_display}</p>
              )}
              
              <a 
                href={songResult.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="genius-link"
              >
                View on Genius
              </a>
            </div>
          </div>
          
          {spotifyTrack && (
            <div className="spotify-player">
              <h3>Listen on Spotify</h3>
              <iframe
                src={`https://open.spotify.com/embed/track/${spotifyTrack.trackId}`}
                width="100%"
                height="80"
                frameBorder="0"
                allowtransparency="true"
                allow="encrypted-media"
                title="Spotify Player"
              ></iframe>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SongMatch;