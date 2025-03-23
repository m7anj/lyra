
import React, { useState } from 'react';
import Header from '@/components/Header';
import RecordButton from '@/components/RecordButton';
import SearchResults from '@/components/SearchResults';
import PlaylistCreator from '@/components/PlaylistCreator';
import Footer from '@/components/Footer';

const Index = () => {
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleSearchComplete = (results: any[]) => {
    setSearchResults(results);
    // Scroll to results after a short delay to allow for animation
    setTimeout(() => {
      window.scrollTo({
        top: window.innerHeight * 0.5,
        behavior: 'smooth'
      });
    }, 300);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Header />
          
          <main>
            <section className="py-16 md:py-24 flex flex-col items-center justify-center text-center">
              <div className="mb-10 md:mb-16 animate-fade-in">
                <h1 className="text-4xl md:text-6xl font-bold mb-6">
                  Find any song with <span className="gradient-text">your voice</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                  Can't remember a song name? Just sing or say the lyrics, and Lyra will find it instantly
                </p>
              </div>
              
              <div className="w-full max-w-lg mx-auto glass-card rounded-2xl p-10 shadow-soft animate-fade-in-up">
                <RecordButton onSearchComplete={handleSearchComplete} />
              </div>
            </section>
            
            {searchResults.length > 0 && (
              <SearchResults results={searchResults} />
            )}
            
            <PlaylistCreator />
            
            <section className="py-16 md:py-24 px-4 sm:px-6 max-w-6xl mx-auto" id="about">
              <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 order-2 md:order-1">
                  <span className="inline-block px-3 py-1 rounded-full bg-lyra-pink-light text-sm font-medium text-foreground mb-3">
                    About Lyra
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-semibold gradient-text mb-4">
                    Discover music more intuitively
                  </h2>
                  <p className="text-lg text-muted-foreground mb-6">
                    Unlike traditional music apps that require you to know song names, Lyra lets you find music naturally using your voice or lyrics. 
                  </p>
                  <p className="text-lg text-muted-foreground">
                    Powered by advanced speech recognition and natural language processing, Lyra makes discovering, curating, and building your music taste more intuitive than ever.
                  </p>
                </div>
                
                <div className="flex-1 order-1 md:order-2">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-lyra-pink-light to-lyra-orange-light rounded-2xl blur-3xl opacity-30 animate-pulse"></div>
                    <div className="relative w-full aspect-square max-w-md mx-auto rounded-2xl overflow-hidden shadow-lg">
                      <img 
                        src="https://png.pngtree.com/thumb_back/fw800/background/20220803/pngtree-a-young-man-enjoying-music-with-headphones-and-phone-photo-image_47881970.jpg" 
                        alt="Person enjoying music" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
