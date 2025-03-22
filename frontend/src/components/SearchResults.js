import React, { useState } from 'react';
import axios from 'axios';

const SearchResults = ({ results }) => {
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);
  const [playlistCreated, setPlaylistCreated] = useState(false);
  const [playlist, setPlaylist] = useState([]);
  const [error, setError] = useState('');
  
  const handleCreatePlaylist = async () => {
    if (!results || results.length === 0 || !results[0].spotify_id) {
      setError('No Spotify track ID available to create playlist');
      return;
    }
    
    setCreatingPlaylist(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:5000/api/create-playlist', {
        trackId: results[0].spotify_id
      });
      
      setPlaylist(response.data.playlist);
      setPlaylistCreated(true);
      
      // Reset after 3 seconds
      setTimeout(() => {
        setPlaylistCreated(false);
      }, 3000);
    } catch (err) {
      console.error('Error creating playlist:', err);
      setError(err.response?.data?.error || 'Failed to create playlist');
    } finally {
      setCreatingPlaylist(false);
    }
  };

  if (!results || results.length === 0) return null;

  return (
    <div className="w-full max-w-3xl mx-auto mt-12 animate-fade-in-up">
      <h2 className="text-2xl font-semibold mb-6 gradient-text">Found Songs</h2>
      
      <div className="glass-card rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-6 items-center mb-6">
          <div className="w-40 h-40 rounded-lg overflow-hidden shadow-md">
            <img 
              src={results[0].coverArt} 
              alt={`${results[0].title} by ${results[0].artist}`}
              className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
            />
          </div>
          
          <div className="flex-1">
            <h3 className="text-xl font-medium">{results[0].title}</h3>
            <p className="text-lg text-muted-foreground">{results[0].artist}</p>
            <p className="text-sm text-muted-foreground mt-1">{results[0].album} • {results[0].year}</p>
            
            {results[0].transcription && (
              <div className="mt-3 bg-lyra-pink-light/50 p-3 rounded-lg">
                <p className="text-sm italic">"{results[0].transcription}"</p>
              </div>
            )}
            
            <div className="mt-6 flex flex-wrap gap-3">
              {playlistCreated ? (
                <div className="bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium animate-fade-in">
                  Playlist created successfully!
                </div>
              ) : (
                <button 
                  onClick={handleCreatePlaylist}
                  disabled={creatingPlaylist}
                  className="bg-gradient-to-r from-lyra-pink to-lyra-orange text-white hover:opacity-90 transition-opacity rounded-full px-6 py-2"
                >
                  {creatingPlaylist ? (
                    <>
                      <span className="mr-2">Creating playlist</span>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></div>
                    </>
                  ) : "Create similar songs playlist"}
                </button>
              )}
              
              {results[0].preview_url && (
                <button 
                  onClick={() => {
                    const audio = new Audio(results[0].preview_url);
                    audio.play();
                  }}
                  className="rounded-full border border-lyra-pink text-foreground hover:bg-lyra-pink hover:text-foreground px-6 py-2"
                >
                  Listen Now
                </button>
              )}
              
              {results[0].external_url && (
                <a 
                  href={results[0].external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-lyra-pink text-foreground hover:bg-lyra-pink hover:text-foreground px-6 py-2"
                >
                  Open in Spotify
                </a>
              )}
            </div>
            
            {error && (
              <div className="mt-3 text-destructive text-sm">
                {error}
              </div>
            )}
          </div>
        </div>
        
        {playlist.length > 0 && (
          <>
            <div className="h-px bg-gradient-to-r from-transparent via-lyra-pink-light to-transparent my-6"></div>
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-4">Similar songs playlist</h4>
              
              <div className="space-y-4">
                {playlist.map((song, index) => (
                    <div 
                    key={song.id}
                    className="staggered-item flex items-center gap-4 p-3 rounded-lg hover:bg-lyra-pink-light transition-colors"
                  >
                    <div className="w-12 h-12 rounded overflow-hidden shadow-sm">
                      <img 
                        src={song.coverArt} 
                        alt={`${song.title} by ${song.artist}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-medium truncate">{song.title}</h5>
                      <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                    </div>
                    
                    {song.preview_url && (
                      <button 
                        className="text-muted-foreground hover:text-foreground hover:bg-transparent"
                        onClick={() => {
                          const audio = new Audio(song.preview_url);
                          audio.play();
                        }}
                      >
                        Listen
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SearchResults;