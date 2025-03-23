
import React from 'react';
import { Music } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="py-12 px-4 sm:px-6 mt-12 border-t border-lyra-pink-light">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-6 md:mb-0">
            <div className="w-8 h-8 bg-gradient-to-br from-lyra-pink to-lyra-orange rounded-full flex items-center justify-center">
              <Music className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-semibold gradient-text">Lyra</span>
          </div>
          
          <nav className="mb-6 md:mb-0">
            <ul className="flex space-x-8">
              <li>
                <a 
                  href="#how-it-works" 
                  className="text-foreground/70 hover:text-foreground transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-lyra-pink hover:after:w-full after:transition-all"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a 
                  href="#about" 
                  className="text-foreground/70 hover:text-foreground transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-lyra-pink hover:after:w-full after:transition-all"
                >
                  About
                </a>
              </li>
            </ul>
          </nav>
          
          <div className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Lyra. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
