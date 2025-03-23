import React, { useState } from 'react';
import { Loader2, Music, PlayCircle, ExternalLink, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PlaylistCreatorProps {
  songData?: any;
}

const PlaylistCreator = ({ songData }: PlaylistCreatorProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [playlist, setPlaylist] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [artistName, setArtistName] = useState<string | null>(null);

  const handleCreatePlaylist = async () => {
    if (!songData) {
      setError("No song selected. Please identify a song first.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const trackId = songData.spotifyId || songData.trackId;

    if (!trackId) {
      setError("No Spotify track ID available for this song.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/artist-tracks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trackId: trackId,
          limit: 12 
        }),
      });

      if (!response.ok) {
        let errorMessage = `Server error (${response.status})`;
        
        try {
          const errorData = await response.json();
          if (errorData && errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (jsonError) {
          errorMessage = `Server error: ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (!data.playlist || !Array.isArray(data.playlist) || data.playlist.length === 0) {
        throw new Error('No tracks found for this artist');
      }
      
      setPlaylist(data.playlist);
      setArtistName(data.artistName || songData.artist || (songData.primary_artist ? songData.primary_artist.name : null));
      
      setTimeout(() => {
        const playlistSection = document.getElementById('playlist-section');
        if (playlistSection) {
          playlistSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    } catch (err: any) {
      console.error('Error creating playlist:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const displayArtistName = artistName || songData?.artist || (songData?.primary_artist ? songData.primary_artist.name : "the artist");

  return (
    <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto" id="how-it-works">
      <div className="text-center mb-12">
        <span className="inline-block px-3 py-1 rounded-full bg-lyra-pink-light text-sm font-medium text-foreground mb-3">
          How It Works
        </span>
        <h2 className="text-3xl sm:text-4xl font-semibold gradient-text mb-4">Create playlists in seconds</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Lyra helps you find songs and create personalized playlists instantly with just your voice
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-card rounded-xl p-6 text-center animate-fade-in">
          <div className="w-16 h-16 bg-lyra-pink-light rounded-full flex items-center justify-center mx-auto mb-5">
            <span className="text-xl font-bold gradient-text">1</span>
          </div>
          <h3 className="text-xl font-medium mb-3">Sing or speak lyrics</h3>
          <p className="text-muted-foreground">
            Just tap the microphone button and sing a portion of the song or speak the lyrics you remember
          </p>
        </div>
        
        <div className="glass-card rounded-xl p-6 text-center animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="w-16 h-16 bg-lyra-pink-light rounded-full flex items-center justify-center mx-auto mb-5">
            <span className="text-xl font-bold gradient-text">2</span>
          </div>
          <h3 className="text-xl font-medium mb-3">Find your song</h3>
          <p className="text-muted-foreground">
            Lyra's advanced algorithms will identify the song from your voice or the lyrics you provided
          </p>
        </div>
        
        <div className="glass-card rounded-xl p-6 text-center animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <div className="w-16 h-16 bg-lyra-pink-light rounded-full flex items-center justify-center mx-auto mb-5">
            <span className="text-xl font-bold gradient-text">3</span>
          </div>
          <h3 className="text-xl font-medium mb-3">Create a playlist</h3>
          <p className="text-muted-foreground">
            With one click, generate a playlist of songs by the same artist
          </p>
        </div>
      </div>

      {}
      {songData && (
        <div className="mt-12 text-center">
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Ready to create a playlist based on "{songData.title || songData.name}" by {displayArtistName}
            </p>
          </div>
          
          <Button
            onClick={handleCreatePlaylist}
            disabled={isLoading}
            className="btn-primary px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium inline-flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creating Artist Playlist...
              </>
            ) : (
              <>
                <Music className="mr-2 h-5 w-5" />
                Create Playlist of {displayArtistName} Songs
              </>
            )}
          </Button>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg max-w-xl mx-auto">
              <p className="font-medium">Error creating playlist:</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}
        </div>
      )}

      {}
      {playlist && playlist.length > 0 && (
        <div id="playlist-section" className="mt-16">
          <h3 className="text-2xl font-semibold text-center mb-6 gradient-text">
            More songs by {displayArtistName}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {playlist.map((track) => (
              <div key={track.id} className="glass-card p-4 rounded-lg flex flex-col h-full">
                <div className="aspect-square overflow-hidden rounded-md mb-3">
                  <img 
                    src={track.albumArt || `https://via.placeholder.com/300?text=${encodeURIComponent(track.album || 'Album')}`}
                    alt={`${track.name} album art`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="font-medium line-clamp-1">{track.name}</h4>
                <p className="text-sm text-muted-foreground line-clamp-1">{track.album}</p>
                <div className="mt-auto pt-3 flex justify-between items-center">
                  {track.previewUrl ? (
                    <a 
                      href={track.previewUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-purple-500 hover:text-purple-700"
                    >
                      <PlayCircle className="w-4 h-4 mr-1" /> Preview
                    </a>
                  ) : (
                    <span className="text-sm text-muted-foreground">No preview</span>
                  )}
                  <a 
                    href={track.externalUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-purple-500 hover:text-purple-700"
                  >
                    Spotify <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default PlaylistCreator;