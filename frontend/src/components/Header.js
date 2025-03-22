import React from 'react';
import { Music } from 'lucide-react';

const Header = () => {
  return (
    <header className="w-full py-6 px-4 sm:px-6 flex justify-between items-center animate-fade-in">
      <div className="flex items-center space-x-2">
        <div className="w-10 h-10 bg-gradient-to-br from-lyra-pink to-lyra-orange rounded-full flex items-center justify-center shadow-soft">
          <Music className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-2xl font-semibold gradient-text">Lyra</h1>
      </div>
      <nav>
        <ul className="flex space-x-8">
          <li>
            <a 
              href="#how-it-works" 
              className="text-foreground/80 hover:text-foreground transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-lyra-pink hover:after:w-full after:transition-all"
            >
              How It Works
            </a>
          </li>
          <li>
            <a 
              href="#about" 
              className="text-foreground/80 hover:text-foreground transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-lyra-pink hover:after:w-full after:transition-all"
            >
              About
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;