import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MyceliumLogo from "@/components/MyceliumLogo";

export default function Intro() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        navigate("/auth");
      }, 500);
    }, 3500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-[hsl(260,40%,15%)] via-[hsl(210,14%,11%)] to-[hsl(260,30%,12%)] flex items-center justify-center transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="flex flex-col items-center justify-center gap-8">
        {/* Logo with pulse animation */}
        <div className="w-32 h-32 md:w-48 md:h-48 pulse-glow">
          <MyceliumLogo className="text-[hsl(var(--primary))] drop-shadow-2xl" />
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-bold text-center bg-gradient-to-r from-[hsl(260,80%,60%)] to-[hsl(280,90%,70%)] bg-clip-text text-transparent animate-pulse">
          Mycelius
        </h1>

        {/* Subtitle */}
        <p className="text-sm md:text-lg text-[hsl(var(--muted-foreground))] text-center max-w-xs md:max-w-md">
          Connect. Explore. Grow.
        </p>
      </div>
    </div>
  );
}
