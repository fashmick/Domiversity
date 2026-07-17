import React from 'react';

interface DormiversityLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  textSize?: string;
  textColor?: string;
}

export default function DormiversityLogo({
  size = 40,
  className = '',
  showText = false,
  textSize = 'text-lg',
  textColor = 'text-wood-900'
}: DormiversityLogoProps) {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* High-fidelity SVG of the Dormiversity "D" Wood Logo */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-sm transition-transform duration-300 hover:scale-105"
      >
        {/* Main "D" shape with stylized wood grains and internal cutouts */}
        {/* Outer D body */}
        <path
          d="M120 50 C240 50, 410 70, 410 240 C410 410, 240 430, 120 430 L120 410 C140 410, 160 410, 160 390 L160 90 C160 70, 140 70, 120 70 Z"
          fill="#52301e" /* Deep Wood-800 */
        />
        <path
          d="M140 60 C250 60, 390 80, 390 240 C390 400, 250 420, 140 420 L140 410 L160 410 L160 390 L160 90 L140 90 Z"
          fill="#7b4c31" /* Wood-600 */
        />
        
        {/* Inner Cutout Backdrop - lighter wood grain cream */}
        <path
          d="M190 90 L190 390 C200 390, 220 390, 250 370 C280 350, 350 300, 350 240 C350 180, 280 130, 250 110 C220 90, 200 90, 190 90 Z"
          fill="#faf1e6" /* Wood-100 */
          stroke="#e8c49e" /* Wood-300 */
          strokeWidth="4"
        />

        {/* Central Hostels/Buildings in the "D" backdrop */}
        {/* Left Hostel Tower */}
        <path d="M210 220 L240 190 L240 370 L210 370 Z" fill="#52301e" />
        <rect x="218" y="240" width="4" height="6" fill="#fdfbf7" />
        <rect x="218" y="260" width="4" height="6" fill="#fdfbf7" />
        <rect x="218" y="280" width="4" height="6" fill="#fdfbf7" />
        <rect x="218" y="300" width="4" height="6" fill="#fdfbf7" />

        {/* Middle Main Hostel Tower with Gabled Roof & Door */}
        <path d="M245 180 L280 145 L315 180 L315 380 L245 380 Z" fill="#7b4c31" />
        {/* Gable trim */}
        <path d="M241 182 L280 142 L319 182" stroke="#52301e" strokeWidth="6" strokeLinecap="round" />
        {/* Windows */}
        <rect x="258" y="200" width="10" height="10" rx="1" fill="#fdfbf7" />
        <rect x="258" y="220" width="10" height="10" rx="1" fill="#fdfbf7" />
        <rect x="290" y="200" width="10" height="10" rx="1" fill="#fdfbf7" />
        <rect x="290" y="220" width="10" height="10" rx="1" fill="#fdfbf7" />
        {/* Door */}
        <rect x="270" y="310" width="20" height="70" rx="2" fill="#faf1e6" stroke="#52301e" strokeWidth="2" />
        <circle cx="275" cy="345" r="2.5" fill="#52301e" />

        {/* Right Building Silhouette */}
        <path d="M320 230 L345 260 L345 360 L320 360 Z" fill="#422617" />

        {/* Left Icon: Graduation Cap (Mortarboard) - beautiful cream white with gold tassel */}
        <g transform="translate(140, 270) scale(0.6)">
          {/* Cap diamond */}
          <path d="M50 15 L95 35 L50 55 L5 35 Z" fill="#fdfbf7" stroke="#8c5a3c" strokeWidth="6" strokeLinejoin="round" />
          {/* Cap base skull */}
          <path d="M25 41 L25 60 C25 70, 75 70, 75 60 L75 41" fill="#fdfbf7" stroke="#8c5a3c" strokeWidth="6" strokeLinejoin="round" />
          {/* Tassel */}
          <path d="M50 35 L85 50 L85 75" fill="none" stroke="#dba374" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="85" cy="78" r="4" fill="#dba374" />
        </g>

        {/* Right Icon: Inspection Checklist Clipboard with a bold checkmark */}
        <g transform="translate(325, 270) scale(0.6)">
          {/* Board */}
          <rect x="10" y="15" width="70" height="85" rx="8" fill="#fdfbf7" stroke="#8c5a3c" strokeWidth="6" />
          {/* Metal Clip */}
          <rect x="30" y="5" width="30" height="15" rx="3" fill="#e8c49e" stroke="#8c5a3c" strokeWidth="5" />
          {/* Checkmark */}
          <path d="M25 55 L40 70 L65 35" fill="none" stroke="#7b4c31" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
      {showText && (
        <span className={`font-brand font-bold tracking-normal ${textSize} ${textColor}`}>
          Dormiversity
        </span>
      )}
    </div>
  );
}
