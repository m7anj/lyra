import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, Music, Loader2 } from 'lucide-react';

import { API_URL } from '@/config';

interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  year: string;
  coverArt: string;
  spotifyId?: string;
  spotifyUrl?: string;
}

interface PlaylistTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  albumArt: string;
  previewUrl: string | null;
  externalUrl: string;
}

const SearchResults = ({ results }: { results: Song[] }) => {
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);
  const [playlistCreated, setPlaylistCreated] = useState(false);
  const [playlistError, setPlaylistError] = useState<string | null>(null);
  const [playlist, setPlaylist] = useState<PlaylistTrack[]>([]);
  
  const handleCreatePlaylist = async () => {
    setCreatingPlaylist(true);
    setPlaylistError(null);
    setPlaylist([]);
    
    try {
      if (!results[0].spotifyId) {
        throw new Error('Spotify data not available for this song');
      }
      
      // Call the backend API to create a playlist
      const response = await fetch('/api/create-playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trackId: results[0].spotifyId,
          limit: 10
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create playlist');
      }

      const data = await response.json();
      setPlaylist(data.playlist);
      setPlaylistCreated(true);
      
      // Scroll to the playlist section
      setTimeout(() => {
        const playlistSection = document.getElementById('playlist-section');
        if (playlistSection) {
          playlistSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    } catch (err: any) {
      console.error('Error creating playlist:', err);
      setPlaylistError(err.message || 'Failed to create playlist');
    } finally {
      setCreatingPlaylist(false);
    }
  };
  
  const handleListenNow = (song: Song) => {
    if (song.spotifyId) {
      // Spotify embed
      const container = document.createElement('div');
      
      const iframe = document.createElement('iframe');
      iframe.src = `https://open.spotify.com/embed/track/${song.spotifyId}`;
      iframe.width = "100%";
      iframe.height = "80";
      iframe.frameBorder = "0";
      iframe.allow = "encrypted-media";
      iframe.setAttribute('allowTransparency', 'true'); 
      
      container.appendChild(iframe);
      
      
      let playerContainer = document.getElementById('spotify-player-container');
      if (!playerContainer) {
        playerContainer = document.createElement('div');
        playerContainer.id = 'spotify-player-container';
        playerContainer.className = 'mt-4 w-full';
        
        // Insert after the button row
        const buttonRow = document.querySelector('.mt-6.flex.flex-wrap.gap-3');
        if (buttonRow) {
          buttonRow.parentNode?.insertBefore(playerContainer, buttonRow.nextSibling);
        }
      }
      
      
      playerContainer.innerHTML = '';
      playerContainer.appendChild(container.firstChild as Node);
    } else if (song.spotifyUrl) {
      // If no spotifyId is available
      window.open(song.spotifyUrl, '_blank');
    }
  };
  
  if (results.length === 0) return null;
  
  return (
    <div className="w-full max-w-3xl mx-auto mt-12 animate-fade-in-up">
      <h2 className="text-2xl font-semibold mb-6 gradient-text">Found Songs</h2>
      
      <div className="glass-card rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-6 items-center mb-6">
          <div className="w-40 h-40 rounded-lg overflow-hidden shadow-md">
            <img 
              src={results[0].coverArt || "https://via.placeholder.com/200"} 
              alt={`${results[0].title} by ${results[0].artist}`}
              className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
            />
          </div>
          
          <div className="flex-1">
            <h3 className="text-xl font-medium">{results[0].title}</h3>
            <p className="text-lg text-muted-foreground">{results[0].artist}</p>
            <p className="text-sm text-muted-foreground mt-1">{results[0].album} • {results[0].year}</p>
            
            <div className="mt-6 flex flex-wrap gap-3">
              <Button 
                onClick={handleCreatePlaylist}
                disabled={creatingPlaylist || !results[0].spotifyId}
                className="bg-gradient-to-r from-lyra-pink to-lyra-orange text-white hover:opacity-90 transition-opacity rounded-full px-6"
              >
                {creatingPlaylist ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating playlist...
                  </>
                ) : (
                  <>
                    <Music className="mr-2 h-5 w-5" />
                    Create similar songs playlist
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                className="rounded-full border-lyra-pink text-foreground hover:bg-lyra-pink hover:text-foreground"
                onClick={() => handleListenNow(results[0])}
                disabled={!results[0].spotifyUrl}
              >
                Listen Now
                {results[0].spotifyUrl && <ExternalLink className="ml-2 h-4 w-4" />}
              </Button>
            </div>
            
            {playlistError && (
              <p className="mt-2 text-sm text-destructive">{playlistError}</p>
            )}
            
            {/* Spotify Player Container */}
            {results[0].spotifyId && (
              <div id="spotify-player-container" className="mt-4 w-full">
                <iframe 
                  src={`https://open.spotify.com/embed/track/${results[0].spotifyId}`}
                  width="100%" 
                  height="80" 
                  frameBorder="0" 
                  allowTransparency={true} 
                  allow="encrypted-media">
                </iframe>
              </div>
            )}
          </div>
        </div>
        
        {results.length > 1 && (
          <>
            <div className="h-px bg-gradient-to-r from-transparent via-lyra-pink-light to-transparent my-6"></div>
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-4">Other possible matches</h4>
              
              <div className="space-y-4">
                {results.slice(1).map((song) => (
                  <div 
                    key={song.id}
                    className="staggered-item flex items-center gap-4 p-3 rounded-lg hover:bg-lyra-pink-light transition-colors"
                  >
                    <div className="w-12 h-12 rounded overflow-hidden shadow-sm">
                      <img 
                        src={song.coverArt || "https://via.placeholder.com/200"} 
                        alt={`${song.title} by ${song.artist}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-medium truncate">{song.title}</h5>
                      <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-muted-foreground hover:text-foreground hover:bg-transparent"
                      onClick={() => {
                        // Directly open in Spotify
                        if (song.spotifyUrl) {
                          window.open(song.spotifyUrl, '_blank');
                        } else {
                          handleListenNow(song);
                        }
                      }}
                      disabled={!song.spotifyUrl && !song.spotifyId}
                    >
                      Listen
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Generated Playlist Section */}
      {playlist.length > 0 && (
        <div id="playlist-section" className="mt-12 animate-fade-in">
          <h3 className="text-2xl font-semibold mb-6 gradient-text">Your Personalized Playlist</h3>
          
          <div className="glass-card rounded-xl p-6 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {playlist.map((track) => (
                <div key={track.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-lyra-pink-light transition-colors">
                  <div className="w-16 h-16 rounded overflow-hidden shadow-sm">
                    <img 
                      src={track.albumArt || "https://via.placeholder.com/200"} 
                      alt={`${track.name} album art`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-medium truncate">{track.name}</h5>
                    <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                    <div className="flex items-center gap-3 mt-1">
                      {track.previewUrl && (
                        <a 
                          href={track.previewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-lyra-pink hover:underline flex items-center"
                        >
                          Preview
                        </a>
                      )}
                      <a 
                        href={track.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-lyra-pink hover:underline flex items-center"
                      >
                        Spotify <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResults;