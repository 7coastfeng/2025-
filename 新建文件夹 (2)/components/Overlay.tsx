import React from 'react';
import { AppState } from '../types';

interface OverlayProps {
  appState: AppState;
  setAppState: (s: AppState) => void;
}

const Overlay: React.FC<OverlayProps> = ({ appState, setAppState }) => {
  const isTree = appState === AppState.TREE_SHAPE;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 md:p-12 z-10">
      {/* Header - Moved to Top Left with Responsive Sizing */}
      <header className="flex flex-col items-start pt-4 md:pt-6">
        <h1 className="font-serif-display text-4xl sm:text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-b from-[#FFFDD0] to-[#D4AF37] tracking-widest uppercase drop-shadow-[0_2px_10px_rgba(212,175,55,0.5)] leading-tight">
          TO DoubleU
        </h1>
        <p className="font-sans-body text-[#004D3A] text-xs sm:text-sm md:text-base tracking-[0.3em] mt-3 font-bold uppercase bg-[#D4AF37] px-3 py-1 rounded-sm shadow-lg shadow-[#D4AF37]/20">
          Merry Christmas
        </p>
      </header>

      {/* Controls */}
      <footer className="flex flex-col items-center pb-8 md:pb-12 pointer-events-auto w-full">
        <button
          onClick={() => setAppState(isTree ? AppState.SCATTERED : AppState.TREE_SHAPE)}
          className={`
            group relative px-8 py-3 md:px-12 md:py-4 border border-[#D4AF37] 
            overflow-hidden transition-all duration-500 ease-out
            bg-opacity-10 bg-black backdrop-blur-sm
          `}
        >
          {/* Fill effect */}
          <div className={`
            absolute inset-0 w-full h-full bg-[#D4AF37] origin-left transition-transform duration-500 ease-out
            ${isTree ? 'scale-x-0' : 'scale-x-100'}
            opacity-20 group-hover:opacity-40
          `} />
          
          <span className="relative z-10 font-serif-display text-[#D4AF37] text-sm md:text-xl tracking-widest uppercase group-hover:text-white transition-colors">
            {isTree ? 'Deconstruct' : 'Assemble'}
          </span>
          
          {/* Corner accents */}
          <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#D4AF37]" />
          <span className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#D4AF37]" />
          <span className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#D4AF37]" />
          <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#D4AF37]" />
        </button>

        <p className="mt-4 text-[#D4AF37] text-[10px] md:text-xs font-sans-body opacity-60 tracking-wider">
          {isTree ? '• A symbol of unity •' : '• Magic in the air •'}
        </p>
      </footer>
    </div>
  );
};

export default Overlay;