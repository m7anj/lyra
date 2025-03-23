
import React from 'react';

const PlaylistCreator = () => {
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
            With one click, generate a playlist of similar songs that match your music taste
          </p>
        </div>
      </div>
    </section>
  );
};

export default PlaylistCreator;
