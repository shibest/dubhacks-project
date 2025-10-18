export default function MyceliumLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Define gradients */}
      <defs>
        <linearGradient id="myceliumGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#6D28D9" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Center block */}
      <rect
        x="75"
        y="75"
        width="50"
        height="50"
        fill="url(#myceliumGradient)"
        rx="8"
        filter="url(#glow)"
      />

      {/* Top block */}
      <rect
        x="75"
        y="25"
        width="50"
        height="40"
        fill="#A78BFA"
        rx="8"
        opacity="0.8"
      />

      {/* Left block */}
      <rect
        x="25"
        y="75"
        width="40"
        height="50"
        fill="#A78BFA"
        rx="8"
        opacity="0.8"
      />

      {/* Right block */}
      <rect
        x="135"
        y="75"
        width="40"
        height="50"
        fill="#A78BFA"
        rx="8"
        opacity="0.8"
      />

      {/* Bottom block */}
      <rect
        x="75"
        y="135"
        width="50"
        height="40"
        fill="#A78BFA"
        rx="8"
        opacity="0.8"
      />

      {/* Top-left diagonal block */}
      <rect
        x="35"
        y="35"
        width="30"
        height="30"
        fill="#8B5CF6"
        rx="6"
        opacity="0.6"
      />

      {/* Top-right diagonal block */}
      <rect
        x="135"
        y="35"
        width="30"
        height="30"
        fill="#8B5CF6"
        rx="6"
        opacity="0.6"
      />

      {/* Bottom-left diagonal block */}
      <rect
        x="35"
        y="135"
        width="30"
        height="30"
        fill="#8B5CF6"
        rx="6"
        opacity="0.6"
      />

      {/* Bottom-right diagonal block */}
      <rect
        x="135"
        y="135"
        width="30"
        height="30"
        fill="#8B5CF6"
        rx="6"
        opacity="0.6"
      />
    </svg>
  );
}
