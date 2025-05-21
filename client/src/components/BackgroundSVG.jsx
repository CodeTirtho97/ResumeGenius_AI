import React from 'react';
import { Box } from '@mui/material';

const BackgroundSVG = () => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        overflow: 'hidden',
      }}
    >
      {/* Main background gradient */}
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0A192F" />
            <stop offset="100%" stopColor="#102A43" />
          </linearGradient>
          <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="rgba(0, 224, 255, 0.2)" />
            <stop offset="100%" stopColor="rgba(0, 224, 255, 0)" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bgGradient)" />
        <circle cx="70%" cy="20%" r="300" fill="url(#glowGradient)" opacity="0.6" />
        <circle cx="30%" cy="80%" r="250" fill="url(#glowGradient)" opacity="0.4" />
      </svg>

      {/* Circuit board pattern */}
      <svg
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', top: 0, left: 0, opacity: 0.1 }}
      >
        <pattern
          id="circuitPattern"
          x="0"
          y="0"
          width="100"
          height="100"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(5)"
        >
          <path
            d="M10 10h80M10 50h80M50 10v80M10 10l40 40M90 10l-40 40M10 90l40-40M90 90l-40-40"
            stroke="#00E0FF"
            strokeWidth="0.5"
            fill="none"
          />
          <circle cx="10" cy="10" r="3" fill="#00E0FF" />
          <circle cx="90" cy="10" r="3" fill="#00E0FF" />
          <circle cx="10" cy="90" r="3" fill="#00E0FF" />
          <circle cx="90" cy="90" r="3" fill="#00E0FF" />
          <circle cx="50" cy="50" r="3" fill="#06d6a0" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#circuitPattern)" />
      </svg>

      {/* Particles */}
      <svg
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {Array.from({ length: 30 }).map((_, i) => (
          <circle
            key={i}
            cx={`${Math.random() * 100}%`}
            cy={`${Math.random() * 100}%`}
            r={Math.random() * 2 + 0.5}
            fill={Math.random() > 0.5 ? '#00E0FF' : '#06d6a0'}
            opacity={Math.random() * 0.5 + 0.2}
          >
            <animate
              attributeName="opacity"
              values={`${Math.random() * 0.3 + 0.2};${Math.random() * 0.7 + 0.3};${Math.random() * 0.3 + 0.2}`}
              dur={`${Math.random() * 5 + 3}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </svg>

      {/* AI-themed decorative elements - REMOVED TOP LEFT FIGURE */}
      <svg
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', top: 0, left: 0, opacity: 0.3 }}
      >
        {/* Document with Checkmarks - repositioned */}
        <g transform="translate(90%, 75%) scale(0.1)">
          <rect x="50" y="50" width="200" height="300" rx="10" fill="none" stroke="#06d6a0" strokeWidth="6" />
          <line x1="80" y1="100" x2="220" y2="100" stroke="#06d6a0" strokeWidth="6" />
          <line x1="80" y1="150" x2="220" y2="150" stroke="#06d6a0" strokeWidth="6" opacity="0.7" />
          <line x1="80" y1="200" x2="220" y2="200" stroke="#06d6a0" strokeWidth="6" opacity="0.5" />
          <line x1="80" y1="250" x2="220" y2="250" stroke="#06d6a0" strokeWidth="6" opacity="0.3" />
          <path d="M260,120 L290,150 L350,90" fill="none" stroke="#00E0FF" strokeWidth="8" strokeLinecap="round" />
        </g>

        {/* Binary numbers scattered */}
        <g opacity="0.15">
          <text x="15%" y="30%" fill="#ffffff" fontFamily="monospace" fontSize="12">10110011</text>
          <text x="25%" y="45%" fill="#ffffff" fontFamily="monospace" fontSize="12">01101001</text>
          <text x="75%" y="65%" fill="#ffffff" fontFamily="monospace" fontSize="12">11001010</text>
          <text x="60%" y="25%" fill="#ffffff" fontFamily="monospace" fontSize="12">00101101</text>
          <text x="40%" y="85%" fill="#ffffff" fontFamily="monospace" fontSize="12">10010110</text>
        </g>
      </svg>

      {/* Lens flare effect */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          right: '20%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(0, 224, 255, 0.15) 0%, rgba(0, 224, 255, 0) 70%)',
          borderRadius: '50%',
          filter: 'blur(20px)',
          opacity: 0.7,
        }}
      />

      {/* Mobile responsive adjustments */}
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          position: 'absolute',
          top: '50%',
          left: '10%',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(6, 214, 160, 0.1) 0%, rgba(6, 214, 160, 0) 70%)',
          borderRadius: '50%',
          filter: 'blur(20px)',
        }}
      />
    </Box>
  );
};

export default BackgroundSVG;