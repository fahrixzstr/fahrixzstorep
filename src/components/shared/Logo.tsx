export default function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="900"
      height="900"
      viewBox="0 0 900 900"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Glow Effect */}
      <circle cx="450" cy="450" r="320" fill="#7C3AED" opacity="0.14"/>
      <circle cx="450" cy="450" r="220" fill="#A855F7" opacity="0.08"/>

      {/* Main Logo Container */}
      <rect
        x="230"
        y="230"
        width="440"
        height="440"
        rx="140"
        fill="#120A1F"
      />

      {/* FZ Core Shape */}
      <path
        d="M340 340 H560
           M340 450 H500
           M340 340 V560
           M500 450 V560"
        stroke="#FFFFFF"
        strokeWidth="50"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Main Purple Slash */}
      <path
        d="M575 320 L430 570"
        stroke="#A855F7"
        strokeWidth="42"
        strokeLinecap="round"
      />

      {/* Secondary Accent Slash */}
      <path
        d="M520 320 L400 520"
        stroke="#7C3AED"
        strokeWidth="14"
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* Node Dot */}
      <circle cx="575" cy="580" r="14" fill="#A855F7"/>
      <circle cx="575" cy="580" r="5" fill="#FFFFFF"/>

      {/* Premium Frame */}
      <rect
        x="210"
        y="210"
        width="480"
        height="480"
        rx="150"
        fill="none"
        stroke="#A855F7"
        strokeOpacity="0.08"
        strokeWidth="2"
      />
    </svg>
  );
}