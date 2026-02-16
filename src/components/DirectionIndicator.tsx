import React from 'react';

interface Props {
  direction: 1 | -1;
}

export const DirectionIndicator: React.FC<Props> = ({ direction }) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      {/* Wrapper handles the Direction Flip (Mirroring) */}
      <div className={direction === -1 ? 'scale-x-[-1]' : ''}>
        {/* SVG handles the Continuous Spin */}
        <svg 
          width="500" 
          height="500" 
          viewBox="0 0 500 500" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="animate-spin opacity-70"
          style={{ animationDuration: '10s' }}
        >
          {/* Arrow 1 - Top arc with gap */}
          <path 
            d="M 400 150 A 200 200 0 0 1 350 400" 
            stroke="#FACC15" 
            strokeWidth="10" 
            fill="none" 
            strokeLinecap="round"
            markerEnd="url(#arrowhead)"
          />
          
          {/* Arrow 2 - Bottom arc with gap */}
          <path 
            d="M 100 350 A 200 200 0 0 1 150 100" 
            stroke="#FACC15" 
            strokeWidth="10" 
            fill="none" 
            strokeLinecap="round"
            markerEnd="url(#arrowhead)"
          />

          {/* Small Clean Arrowhead */}
          <marker 
            id="arrowhead" 
            markerWidth="8" 
            markerHeight="8" 
            refX="7" 
            refY="4" 
            orient="auto"
          >
            <polygon 
              points="0 0, 8 4, 0 8" 
              fill="#FACC15" 
            />
          </marker>
        </svg>
      </div>
    </div>
  );
};
