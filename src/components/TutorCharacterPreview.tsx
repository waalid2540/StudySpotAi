import React, { useState, useEffect } from 'react';
import { CharacterAppearance } from '../types/tutorCharacter';

interface TutorCharacterPreviewProps {
  appearance: CharacterAppearance;
  emotion?: 'happy' | 'thinking' | 'excited' | 'proud';
  animate?: boolean;
  size?: 'small' | 'medium' | 'large';
  aiImageUrl?: string; // If provided, show AI image instead of SVG
}

export const TutorCharacterPreview: React.FC<TutorCharacterPreviewProps> = ({
  appearance,
  emotion = 'happy',
  animate = true,
  size = 'medium',
  aiImageUrl,
}) => {
  const [bounce, setBounce] = useState(false);
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    if (animate) {
      const bounceInterval = setInterval(() => {
        setBounce(true);
        setTimeout(() => setBounce(false), 500);
      }, 3000);

      const blinkInterval = setInterval(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 150);
      }, 4000);

      return () => {
        clearInterval(bounceInterval);
        clearInterval(blinkInterval);
      };
    }
  }, [animate]);

  const sizeClasses = {
    small: 'w-24 h-24',
    medium: 'w-40 h-40',
    large: 'w-64 h-64',
  };

  // If AI image is provided, show that instead of SVG
  if (aiImageUrl) {
    return (
      <div className={`${sizeClasses[size]} flex items-center justify-center`}>
        <div className={`w-full h-full rounded-full overflow-hidden ${animate ? 'animate-float' : ''}`}>
          <img
            src={aiImageUrl}
            alt="AI-generated character"
            className="w-full h-full object-cover"
          />
        </div>
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  // Cartoon character with chibi/anime style proportions
  return (
    <div className={`${sizeClasses[size]} flex items-center justify-center`}>
      <svg
        viewBox="0 0 200 200"
        className={`w-full h-full transition-transform duration-300 ${
          bounce ? 'scale-110' : 'scale-100'
        } ${animate ? 'animate-float' : ''}`}
      >
        <defs>
          {/* Gradients for depth */}
          <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={appearance.primaryColor} stopOpacity="1" />
            <stop offset="100%" stopColor={appearance.primaryColor} stopOpacity="0.7" />
          </linearGradient>

          <linearGradient id="hairGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={appearance.secondaryColor} stopOpacity="1" />
            <stop offset="100%" stopColor={appearance.secondaryColor} stopOpacity="0.8" />
          </linearGradient>

          <radialGradient id="blushGradient">
            <stop offset="0%" stopColor="#FF6B9D" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#FF6B9D" stopOpacity="0" />
          </radialGradient>

          {/* Shadow filter */}
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
            <feOffset dx="0" dy="2" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.2"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Ground shadow */}
        <ellipse
          cx="100"
          cy="185"
          rx="35"
          ry="8"
          fill="black"
          opacity="0.15"
        />

        {/* BODY - Chibi style (large head, small body) */}
        {appearance.bodyType === 'round' && (
          <g filter="url(#shadow)">
            {/* Head (larger for chibi style) */}
            <ellipse cx="100" cy="85" rx="45" ry="50" fill="url(#bodyGradient)" stroke="#2D3748" strokeWidth="2" />

            {/* Neck */}
            <rect x="90" y="125" width="20" height="12" fill={appearance.primaryColor} opacity="0.8" />

            {/* Body (smaller than head) */}
            <ellipse cx="100" cy="155" rx="35" ry="30" fill="url(#bodyGradient)" stroke="#2D3748" strokeWidth="2" />

            {/* Arms */}
            <ellipse cx="70" cy="150" rx="12" ry="25" fill={appearance.primaryColor} stroke="#2D3748" strokeWidth="1.5" transform="rotate(-20 70 150)" />
            <ellipse cx="130" cy="150" rx="12" ry="25" fill={appearance.primaryColor} stroke="#2D3748" strokeWidth="1.5" transform="rotate(20 130 150)" />

            {/* Hands */}
            <circle cx="65" cy="170" r="8" fill={appearance.primaryColor} stroke="#2D3748" strokeWidth="1.5" />
            <circle cx="135" cy="170" r="8" fill={appearance.primaryColor} stroke="#2D3748" strokeWidth="1.5" />

            {/* Legs (short for chibi) */}
            <ellipse cx="88" cy="180" rx="10" ry="15" fill={appearance.primaryColor} stroke="#2D3748" strokeWidth="1.5" />
            <ellipse cx="112" cy="180" rx="10" ry="15" fill={appearance.primaryColor} stroke="#2D3748" strokeWidth="1.5" />
          </g>
        )}

        {appearance.bodyType === 'tall' && (
          <g filter="url(#shadow)">
            {/* Head */}
            <ellipse cx="100" cy="70" rx="35" ry="38" fill="url(#bodyGradient)" stroke="#2D3748" strokeWidth="2" />

            {/* Neck */}
            <rect x="92" y="100" width="16" height="15" fill={appearance.primaryColor} opacity="0.8" />

            {/* Body (taller) */}
            <path d="M80 115 L120 115 L115 175 L85 175 Z" fill="url(#bodyGradient)" stroke="#2D3748" strokeWidth="2" />

            {/* Arms (longer) */}
            <path d="M80 120 L70 165" stroke={appearance.primaryColor} strokeWidth="15" strokeLinecap="round" />
            <path d="M120 120 L130 165" stroke={appearance.primaryColor} strokeWidth="15" strokeLinecap="round" />

            {/* Hands */}
            <circle cx="70" cy="170" r="7" fill={appearance.primaryColor} stroke="#2D3748" strokeWidth="1.5" />
            <circle cx="130" cy="170" r="7" fill={appearance.primaryColor} stroke="#2D3748" strokeWidth="1.5" />

            {/* Legs */}
            <rect x="85" y="175" width="12" height="20" fill={appearance.primaryColor} stroke="#2D3748" strokeWidth="1.5" />
            <rect x="103" y="175" width="12" height="20" fill={appearance.primaryColor} stroke="#2D3748" strokeWidth="1.5" />
          </g>
        )}

        {appearance.bodyType === 'small' && (
          <g filter="url(#shadow)">
            {/* Extra large head for cute small character */}
            <circle cx="100" cy="100" r="50" fill="url(#bodyGradient)" stroke="#2D3748" strokeWidth="2" />

            {/* Tiny body */}
            <ellipse cx="100" cy="165" rx="25" ry="20" fill="url(#bodyGradient)" stroke="#2D3748" strokeWidth="2" />

            {/* Small arms */}
            <ellipse cx="78" cy="160" rx="8" ry="18" fill={appearance.primaryColor} stroke="#2D3748" strokeWidth="1.5" />
            <ellipse cx="122" cy="160" rx="8" ry="18" fill={appearance.primaryColor} stroke="#2D3748" strokeWidth="1.5" />

            {/* Tiny legs */}
            <ellipse cx="90" cy="185" rx="8" ry="12" fill={appearance.primaryColor} stroke="#2D3748" strokeWidth="1.5" />
            <ellipse cx="110" cy="185" rx="8" ry="12" fill={appearance.primaryColor} stroke="#2D3748" strokeWidth="1.5" />
          </g>
        )}

        {appearance.bodyType === 'robot' && (
          <g filter="url(#shadow)">
            {/* Robot head (screen style) */}
            <rect x="65" y="50" width="70" height="60" rx="8" fill="url(#bodyGradient)" stroke="#2D3748" strokeWidth="2" />
            <rect x="75" y="60" width="50" height="40" rx="4" fill="#1a1a2e" opacity="0.8" />

            {/* Antenna */}
            <line x1="100" y1="50" x2="100" y2="35" stroke={appearance.secondaryColor} strokeWidth="3" strokeLinecap="round" />
            <circle cx="100" cy="32" r="5" fill={appearance.secondaryColor} />

            {/* Robot body */}
            <rect x="70" y="120" width="60" height="50" rx="5" fill="url(#bodyGradient)" stroke="#2D3748" strokeWidth="2" />

            {/* Panel details */}
            <circle cx="90" cy="145" r="4" fill={appearance.secondaryColor} />
            <circle cx="110" cy="145" r="4" fill={appearance.secondaryColor} />
            <rect x="85" y="155" width="30" height="3" rx="1.5" fill="#4FD1C5" />

            {/* Arms (mechanical) */}
            <rect x="55" y="125" width="12" height="35" rx="3" fill={appearance.primaryColor} stroke="#2D3748" strokeWidth="1.5" />
            <rect x="133" y="125" width="12" height="35" rx="3" fill={appearance.primaryColor} stroke="#2D3748" strokeWidth="1.5" />

            {/* Clamps/Hands */}
            <rect x="55" y="162" width="12" height="8" fill={appearance.primaryColor} stroke="#2D3748" strokeWidth="1.5" />
            <rect x="133" y="162" width="12" height="8" fill={appearance.primaryColor} stroke="#2D3748" strokeWidth="1.5" />

            {/* Legs (treads) */}
            <rect x="75" y="175" width="20" height="15" rx="7" fill={appearance.primaryColor} stroke="#2D3748" strokeWidth="1.5" />
            <rect x="105" y="175" width="20" height="15" rx="7" fill={appearance.primaryColor} stroke="#2D3748" strokeWidth="1.5" />
          </g>
        )}

        {/* FACE (only for non-robot) */}
        {appearance.bodyType !== 'robot' && (
          <g>
            {/* Anime-style eyes */}
            {appearance.eyeStyle === 'normal' && !blink && (
              <>
                {/* Left eye */}
                <ellipse cx="85" cy="80" rx="12" ry="15" fill="white" stroke="#2D3748" strokeWidth="2" />
                <circle cx="87" cy="82" r="8" fill="#2D3748" />
                <circle cx="89" cy="79" r="4" fill="white" />

                {/* Right eye */}
                <ellipse cx="115" cy="80" rx="12" ry="15" fill="white" stroke="#2D3748" strokeWidth="2" />
                <circle cx="113" cy="82" r="8" fill="#2D3748" />
                <circle cx="111" cy="79" r="4" fill="white" />
              </>
            )}

            {appearance.eyeStyle === 'sparkle' && !blink && (
              <>
                {/* Left eye with sparkles */}
                <ellipse cx="85" cy="80" rx="13" ry="16" fill="white" stroke="#2D3748" strokeWidth="2" />
                <circle cx="87" cy="82" r="9" fill="#2D3748" />
                <circle cx="90" cy="78" r="5" fill="white" />
                <circle cx="83" cy="85" r="2" fill="white" opacity="0.8" />

                {/* Right eye with sparkles */}
                <ellipse cx="115" cy="80" rx="13" ry="16" fill="white" stroke="#2D3748" strokeWidth="2" />
                <circle cx="113" cy="82" r="9" fill="#2D3748" />
                <circle cx="110" cy="78" r="5" fill="white" />
                <circle cx="117" cy="85" r="2" fill="white" opacity="0.8" />

                {/* Sparkle effects */}
                <path d="M78 72 L79 74 L81 73 L80 75 L82 76 L80 77 L81 79 L79 78 L78 80 L77 78 L75 79 L76 77 L74 76 L76 75 L75 73 L77 74 Z" fill="#FFD700" opacity="0.8" />
                <path d="M122 72 L123 74 L125 73 L124 75 L126 76 L124 77 L125 79 L123 78 L122 80 L121 78 L119 79 L120 77 L118 76 L120 75 L119 73 L121 74 Z" fill="#FFD700" opacity="0.8" />
              </>
            )}

            {appearance.eyeStyle === 'glasses' && !blink && (
              <>
                {/* Eyes */}
                <circle cx="85" cy="80" r="8" fill="#2D3748" />
                <circle cx="87" cy="78" r="3" fill="white" />
                <circle cx="115" cy="80" r="8" fill="#2D3748" />
                <circle cx="113" cy="78" r="3" fill="white" />

                {/* Glasses */}
                <circle cx="85" cy="80" r="15" fill="none" stroke="#2D3748" strokeWidth="2.5" />
                <circle cx="115" cy="80" r="15" fill="none" stroke="#2D3748" strokeWidth="2.5" />
                <line x1="100" y1="80" x2="100" y2="80" stroke="#2D3748" strokeWidth="2.5" />
                <path d="M70 80 L65 75" stroke="#2D3748" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M130 80 L135 75" stroke="#2D3748" strokeWidth="2.5" strokeLinecap="round" />
              </>
            )}

            {appearance.eyeStyle === 'cool' && (
              <>
                {/* Sunglasses */}
                <rect x="72" y="75" width="28" height="12" rx="6" fill="#2D3748" />
                <rect x="100" y="75" width="28" height="12" rx="6" fill="#2D3748" />
                <rect x="100" y="79" width="2" height="4" fill="#2D3748" />
                <line x1="70" y1="81" x2="65" y2="78" stroke="#2D3748" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="130" y1="81" x2="135" y2="78" stroke="#2D3748" strokeWidth="2.5" strokeLinecap="round" />

                {/* Reflection glint */}
                <rect x="75" y="77" width="8" height="3" rx="1.5" fill="white" opacity="0.6" />
                <rect x="103" y="77" width="8" height="3" rx="1.5" fill="white" opacity="0.6" />
              </>
            )}

            {/* Blinking animation */}
            {blink && appearance.eyeStyle !== 'cool' && (
              <>
                <path d="M 73 80 Q 85 82 97 80" stroke="#2D3748" strokeWidth="3" fill="none" strokeLinecap="round" />
                <path d="M 103 80 Q 115 82 127 80" stroke="#2D3748" strokeWidth="3" fill="none" strokeLinecap="round" />
              </>
            )}

            {/* Nose (simple anime style) */}
            <path d="M 100 95 L 102 100" stroke="#2D3748" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />

            {/* Mouth expressions */}
            {appearance.mouthStyle === 'smile' && (
              <path d="M 80 105 Q 100 115 120 105" fill="none" stroke="#2D3748" strokeWidth="3" strokeLinecap="round" />
            )}

            {appearance.mouthStyle === 'grin' && (
              <>
                <path d="M 80 105 Q 100 118 120 105" fill="#FF6B9D" stroke="#2D3748" strokeWidth="3" strokeLinecap="round" />
                {/* Teeth */}
                <line x1="95" y1="110" x2="95" y2="112" stroke="white" strokeWidth="2" />
                <line x1="100" y1="111" x2="100" y2="113" stroke="white" strokeWidth="2" />
                <line x1="105" y1="110" x2="105" y2="112" stroke="white" strokeWidth="2" />
              </>
            )}

            {appearance.mouthStyle === 'determined' && (
              <path d="M 80 108 L 120 108" stroke="#2D3748" strokeWidth="3.5" strokeLinecap="round" />
            )}

            {appearance.mouthStyle === 'cute' && (
              <>
                <ellipse cx="100" cy="108" rx="8" ry="6" fill="#FF6B9D" opacity="0.8" />
                <path d="M 90 108 Q 100 113 110 108" fill="none" stroke="#2D3748" strokeWidth="2" strokeLinecap="round" />
              </>
            )}

            {/* Blush cheeks */}
            {(appearance.mouthStyle === 'smile' || appearance.mouthStyle === 'cute' || emotion === 'excited') && (
              <>
                <ellipse cx="70" cy="95" rx="10" ry="8" fill="url(#blushGradient)" />
                <ellipse cx="130" cy="95" rx="10" ry="8" fill="url(#blushGradient)" />
              </>
            )}

            {/* Hair/Top of head decoration */}
            <g>
              {/* Bangs/Hair strands */}
              <path d="M 60 60 Q 65 50 75 55 Q 85 50 100 55 Q 115 50 125 55 Q 135 50 140 60" fill="url(#hairGradient)" stroke="#2D3748" strokeWidth="2" />
              <path d="M 75 55 Q 80 45 85 55" fill="url(#hairGradient)" stroke="#2D3748" strokeWidth="1.5" />
              <path d="M 100 50 Q 100 40 105 50" fill="url(#hairGradient)" stroke="#2D3748" strokeWidth="1.5" />
              <path d="M 125 55 Q 120 45 115 55" fill="url(#hairGradient)" stroke="#2D3748" strokeWidth="1.5" />
            </g>
          </g>
        )}

        {/* ROBOT FACE */}
        {appearance.bodyType === 'robot' && (
          <g>
            {/* Digital display eyes */}
            {!blink && (
              <>
                <rect x="80" y="75" width="15" height="15" rx="2" fill="#4FD1C5" />
                <rect x="105" y="75" width="15" height="15" rx="2" fill="#4FD1C5" />

                {emotion === 'happy' && (
                  <>
                    <path d="M 82 80 Q 87.5 85 93 80" fill="none" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" />
                    <path d="M 107 80 Q 112.5 85 118 80" fill="none" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" />
                  </>
                )}
              </>
            )}

            {/* Mouth display */}
            <rect x="85" y="95" width="30" height="8" rx="4" fill="#4FD1C5" />

            {emotion === 'happy' && (
              <path d="M 88 99 L 93 99 L 96 96 L 99 99 L 104 99 L 107 99 L 110 99 L 112 99" fill="none" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" />
            )}
          </g>
        )}

        {/* ACCESSORIES */}
        {appearance.accessory === 'hat' && (
          <g>
            <ellipse cx="100" cy={appearance.bodyType === 'small' ? '55' : '45'} rx="35" ry="8" fill={appearance.secondaryColor} stroke="#2D3748" strokeWidth="2" />
            <path d="M 75 45 L 80 25 L 120 25 L 125 45 Z" fill={appearance.secondaryColor} stroke="#2D3748" strokeWidth="2" />
            <circle cx="100" cy="25" r="6" fill="#FFD700" stroke="#2D3748" strokeWidth="1.5" />
          </g>
        )}

        {appearance.accessory === 'bow' && (
          <g transform={`translate(${appearance.bodyType === 'small' ? '0,-15' : '0,-25'})`}>
            <path d="M 55 55 Q 45 55 45 65 Q 45 75 55 75 L 70 65 Z" fill={appearance.secondaryColor} stroke="#2D3748" strokeWidth="2" />
            <path d="M 145 55 Q 155 55 155 65 Q 155 75 145 75 L 130 65 Z" fill={appearance.secondaryColor} stroke="#2D3748" strokeWidth="2" />
            <circle cx="100" cy="65" r="8" fill={appearance.secondaryColor} stroke="#2D3748" strokeWidth="2" />
            <circle cx="100" cy="65" r="4" fill="#FFD700" />
          </g>
        )}

        {appearance.accessory === 'headphones' && (
          <g>
            <path d="M 60 70 Q 60 40 100 35 Q 140 40 140 70" fill="none" stroke={appearance.secondaryColor} strokeWidth="6" strokeLinecap="round" />
            <circle cx="60" cy="75" r="12" fill={appearance.secondaryColor} stroke="#2D3748" strokeWidth="2" />
            <circle cx="140" cy="75" r="12" fill={appearance.secondaryColor} stroke="#2D3748" strokeWidth="2" />
            <circle cx="60" cy="75" r="6" fill="#2D3748" />
            <circle cx="140" cy="75" r="6" fill="#2D3748" />
          </g>
        )}

        {appearance.accessory === 'crown' && (
          <g transform={`translate(0,${appearance.bodyType === 'small' ? '-20' : '-30'})`}>
            <path d="M 65 55 L 75 40 L 82 55 L 90 38 L 100 35 L 110 38 L 118 55 L 125 40 L 135 55 L 130 65 L 70 65 Z" fill="#FFD700" stroke="#F59E0B" strokeWidth="2" />
            <circle cx="75" cy="42" r="4" fill="#EF4444" stroke="#B91C1C" strokeWidth="1" />
            <circle cx="100" cy="37" r="5" fill="#EF4444" stroke="#B91C1C" strokeWidth="1" />
            <circle cx="125" cy="42" r="4" fill="#EF4444" stroke="#B91C1C" strokeWidth="1" />
            {/* Shine effect */}
            <path d="M 75 50 L 77 53 L 75 56" stroke="#FEF08A" strokeWidth="2" strokeLinecap="round" />
            <path d="M 125 50 L 123 53 L 125 56" stroke="#FEF08A" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}

        {appearance.accessory === 'book' && (
          <g transform="translate(140, 145) rotate(15)">
            <rect x="0" y="0" width="25" height="20" rx="2" fill={appearance.secondaryColor} stroke="#2D3748" strokeWidth="2" />
            <rect x="2" y="2" width="21" height="16" rx="1" fill="#F7FAFC" />
            <line x1="12.5" y1="2" x2="12.5" y2="18" stroke={appearance.secondaryColor} strokeWidth="1" />
            <line x1="5" y1="7" x2="10" y2="7" stroke="#2D3748" strokeWidth="0.5" />
            <line x1="5" y1="10" x2="10" y2="10" stroke="#2D3748" strokeWidth="0.5" />
            <line x1="15" y1="7" x2="20" y2="7" stroke="#2D3748" strokeWidth="0.5" />
            <line x1="15" y1="10" x2="20" y2="10" stroke="#2D3748" strokeWidth="0.5" />
          </g>
        )}

        {/* EMOTION EFFECTS */}
        {emotion === 'excited' && (
          <g>
            <path d="M 40 60 L 42 58 L 44 60 L 42 62 Z" fill="#FFD700" opacity="0.8">
              <animateTransform attributeName="transform" type="rotate" from="0 42 60" to="360 42 60" dur="2s" repeatCount="indefinite"/>
            </path>
            <path d="M 156 60 L 158 58 L 160 60 L 158 62 Z" fill="#FFD700" opacity="0.8">
              <animateTransform attributeName="transform" type="rotate" from="0 158 60" to="360 158 60" dur="2s" repeatCount="indefinite"/>
            </path>
            <circle cx="35" cy="100" r="3" fill="#FF6B9D" opacity="0.6">
              <animate attributeName="opacity" values="0.6;0.2;0.6" dur="1s" repeatCount="indefinite" />
            </circle>
            <circle cx="165" cy="100" r="3" fill="#FF6B9D" opacity="0.6">
              <animate attributeName="opacity" values="0.6;0.2;0.6" dur="1s" repeatCount="indefinite" />
            </circle>
          </g>
        )}

        {emotion === 'thinking' && (
          <g>
            <circle cx="145" cy="50" r="5" fill="#94A3B8" opacity="0.4" />
            <circle cx="155" cy="40" r="7" fill="#94A3B8" opacity="0.3" />
            <circle cx="168" cy="30" r="9" fill="#94A3B8" opacity="0.2" />
          </g>
        )}

        {emotion === 'proud' && (
          <g>
            <path d="M 85 40 L 88 30 L 91 40 Z" fill="#FFD700">
              <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" />
            </path>
            <path d="M 109 40 L 112 30 L 115 40 Z" fill="#FFD700">
              <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" />
            </path>
            <circle cx="40" cy="90" r="2.5" fill="#FFD700" opacity="0.8" />
            <circle cx="160" cy="90" r="2.5" fill="#FFD700" opacity="0.8" />
          </g>
        )}
      </svg>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
