import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flame, Zap, Sparkles } from "lucide-react";

export default function HotTakesAnim() {
  const navigate = useNavigate();
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    // Animation sequence
    const timer1 = setTimeout(() => setAnimationStep(1), 500);
    const timer2 = setTimeout(() => setAnimationStep(2), 1500);
    const timer3 = setTimeout(() => setAnimationStep(3), 2500);
    const timer4 = setTimeout(() => navigate("/games/hottakes/chat"), 4000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-orange-800 to-yellow-600 flex items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-4 h-4 bg-yellow-300 rounded-full animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Fire particles */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={`fire-${i}`}
            className="absolute w-2 h-6 bg-gradient-to-t from-red-500 to-yellow-300 rounded-full animate-bounce"
            style={{
              left: `${20 + Math.random() * 60}%`,
              bottom: `${Math.random() * 30}%`,
              animationDelay: `${Math.random() * 1.5}s`,
              animationDuration: `${1 + Math.random() * 0.5}s`,
              transform: `rotate(${Math.random() * 60 - 30}deg)`
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="text-center z-10">
        {/* Step 1: Flame icon appears */}
        <div className={`transition-all duration-1000 ${animationStep >= 1 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
          <div className="relative mb-8">
            <Flame size={120} className="text-yellow-300 drop-shadow-2xl animate-pulse mx-auto" />
            <div className="absolute -top-4 -right-4">
              <Sparkles size={40} className="text-orange-300 animate-spin" />
            </div>
          </div>
        </div>

        {/* Step 2: Title appears */}
        <div className={`transition-all duration-1000 ${animationStep >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-4 drop-shadow-2xl animate-bounce">
            HOT TAKES
          </h1>
          <div className="flex justify-center items-center gap-4 mb-8">
            <Zap size={40} className="text-yellow-300 animate-ping" />
            <span className="text-2xl md:text-3xl font-bold text-orange-200">DEBATE ZONE</span>
            <Zap size={40} className="text-yellow-300 animate-ping" />
          </div>
        </div>

        {/* Step 3: Subtitle and loading */}
        <div className={`transition-all duration-1000 ${animationStep >= 3 ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
          <p className="text-xl md:text-2xl text-orange-200 mb-8 font-semibold">
            🔥 Get ready to share your controversial opinions! 🔥
          </p>

          {/* Loading animation */}
          <div className="flex justify-center items-center gap-2">
            <div className="w-3 h-3 bg-yellow-300 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-3 h-3 bg-orange-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-red-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <span className="text-white font-bold ml-4">Loading debate arena...</span>
          </div>
        </div>
      </div>

      {/* Comic-style speech bubbles */}
      <div className="absolute top-20 left-10 animate-bounce" style={{ animationDelay: '1s' }}>
        <div className="bg-white rounded-2xl p-3 shadow-lg relative">
          <div className="text-sm font-bold text-gray-800">This game is lit! 🔥</div>
          <div className="absolute -bottom-2 left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white"></div>
        </div>
      </div>

      <div className="absolute top-32 right-10 animate-bounce" style={{ animationDelay: '1.5s' }}>
        <div className="bg-white rounded-2xl p-3 shadow-lg relative">
          <div className="text-sm font-bold text-gray-800">Time to roast! 🍖</div>
          <div className="absolute -bottom-2 right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white"></div>
        </div>
      </div>

      <div className="absolute bottom-20 left-20 animate-bounce" style={{ animationDelay: '2s' }}>
        <div className="bg-white rounded-2xl p-3 shadow-lg relative">
          <div className="text-sm font-bold text-gray-800">Let's get spicy! 🌶️</div>
          <div className="absolute -bottom-2 left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white"></div>
        </div>
      </div>
    </div>
  );
}