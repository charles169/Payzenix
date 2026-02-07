interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo = ({ className = '', size = 40 }: LogoProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* P Letter - Modern Design */}
      <path
        d="M50 40 L50 160 L90 160 L90 140 L70 140 L70 100 L120 100 C135 100 145 90 145 75 C145 60 135 50 120 50 L70 50 L70 40 Z M70 70 L115 70 C120 70 125 75 125 80 C125 85 120 90 115 90 L70 90 Z"
        fill="currentColor"
        className="text-white"
      />
      
      {/* Curved accent - represents payroll flow */}
      <path
        d="M130 60 Q160 80 160 120 Q160 160 130 180"
        stroke="currentColor"
        strokeWidth="12"
        strokeLinecap="round"
        fill="none"
        className="text-white opacity-80"
      />
      
      {/* Small dots - representing data/money */}
      <circle cx="145" cy="75" r="4" fill="currentColor" className="text-white opacity-60" />
      <circle cx="155" cy="100" r="4" fill="currentColor" className="text-white opacity-60" />
      <circle cx="155" cy="140" r="4" fill="currentColor" className="text-white opacity-60" />
      <circle cx="145" cy="165" r="4" fill="currentColor" className="text-white opacity-60" />
    </svg>
  );
};
