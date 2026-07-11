import React, { useState } from 'react';

interface ZYesButtonProps {
  onConfirm: () => void;
  disabled?: boolean;
  label?: string;
}

export const ZYesButton: React.FC<ZYesButtonProps> = ({
  onConfirm,
  disabled = false,
  label = "Z-YES"
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleMouseDown = () => {
    if (!disabled) setIsPressed(true);
  };

  const handleMouseUp = () => {
    if (!disabled && isPressed) {
      setIsPressed(false);
      onConfirm();
    }
  };

  return (
    <div className="relative inline-block select-none">
      {/* 3D Depth Shadow Layer */}
      <div 
        className={`absolute inset-0 rounded-xl bg-emerald-800 transition-all duration-100 ${
          disabled ? 'opacity-50' : 'translate-y-1.5 shadow-md'
        }`}
      />
      
      {/* Interactive Top Face Layer */}
      <button
        type="button"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => setIsPressed(false)}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        disabled={disabled}
        className={`relative block px-8 py-4 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-500 text-white font-black text-xl tracking-wider rounded-xl border border-emerald-400 transition-transform duration-75 active:translate-y-1.5 ${
          isPressed ? 'translate-y-1.5' : 'translate-y-0'
        } ${disabled ? 'opacity-50 cursor-not-allowed translate-y-1.5' : 'cursor-pointer'}`}
        style={{
          textShadow: '0 2px 4px rgba(0,0,0,0.2)',
        }}
      >
        <span className="flex items-center justify-center gap-2">
          <svg className="w-6 h-6 fill-current animate-pulse" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
          {label}
        </span>
      </button>
    </div>
  );
};