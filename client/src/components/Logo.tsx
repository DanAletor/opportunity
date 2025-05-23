interface LogoProps {
  className?: string;
}

export default function Logo({ className = "" }: LogoProps) {
  return (
    <div className={`logo-container ${className}`}>
      <a href="#" className="tasck-logo">
        TASCK
      </a>
    </div>
  );
}
