import React from 'react';
import { Heart } from 'lucide-react';

interface DoubleTapHeartProps {
  show: boolean;
}

export const DoubleTapHeart: React.FC<DoubleTapHeartProps> = ({ show }) => {
  if (!show) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
      <div className="animate-heart-burst drop-shadow-2xl">
        <Heart 
          className="w-28 h-28 text-white fill-white filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]" 
        />
      </div>
    </div>
  );
};
