import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Target, Sparkles } from "lucide-react";

export default function FightClubAnim() {
  const navigate = useNavigate();
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    // Animation sequence
    const timer1 = setTimeout(() => setAnimationStep(1), 500);
    const timer2 = setTimeout(() => setAnimationStep(2), 1500);
    const timer3 = setTimeout(() => setAnimationStep(3), 2500);
    const timer4 = setTimeout(() => navigate("/games/fightclub/chat"), 4000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-orange-800 to-yellow-700 flex items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
              fontSize: `${20 + Math.random() * 30}px`
            }}
          >
            {['🥊', '👊', '💥', '⚡', '🎯', '🏆', '🏅', '🎖️', '🏟️', '🥇'][Math.floor(Math.random() * 10)]}
          </div>
        ))}
      </div>

      {/* Floating boxing gloves and targets */}
      <div className="absolute inset-0">
        {[...Array(12)].map((_, i) => (
          <div
            key={`decor-${i}`}
            className="absolute animate-bounce"
            style={{
              left: `${15 + Math.random() * 70}%`,
              top: `${Math.random() * 60}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1.5 + Math.random() * 1}s`
            }}
          >
            {i % 4 === 0 ? <span className="text-3xl">🥊</span> :
             i % 4 === 1 ? <span className="text-3xl">👊</span> :
             i % 4 === 2 ? <Target size={24} className="text-yellow-400" /> :
             <Zap size={24} className="text-orange-400" />}
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="text-center z-10">
        {/* Step 1: Boxing gloves appear */}
        <div className={`transition-all duration-1000 ${animationStep >= 1 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
          <div className="relative mb-8">
            <div className="flex items-center justify-center gap-8">
              <span className="text-8xl animate-bounce">🥊</span>
              <span className="text-8xl animate-bounce" style={{ animationDelay: '0.2s' }}>👊</span>
            </div>
            <div className="absolute -top-4 -right-4">
              <Sparkles size={40} className="text-yellow-400 animate-spin" />
            </div>
          </div>
        </div>

        {/* Step 2: Title appears */}
        <div className={`transition-all duration-1000 ${animationStep >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 drop-shadow-2xl animate-bounce">
            FIGHT CLUB
          </h1>
          <div className="flex justify-center items-center gap-4 mb-8">
            <Target size={40} className="text-yellow-400 animate-ping" />
            <span className="text-2xl md:text-3xl font-bold text-orange-200">CHARACTER BATTLE</span>
            <Zap size={40} className="text-red-400 animate-ping" />
          </div>
        </div>

        {/* Step 3: Subtitle and loading */}
        <div className={`transition-all duration-1000 ${animationStep >= 3 ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
          <p className="text-xl md:text-2xl text-yellow-200 mb-8 font-semibold">
            🥊 Who would win in a fight? 🥊
          </p>

          {/* Loading animation */}
          <div className="flex justify-center items-center gap-2">
            <div className="w-3 h-3 bg-yellow-300 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-3 h-3 bg-orange-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-red-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <span className="text-white font-bold ml-4">Loading battle arena...</span>
          </div>
        </div>
      </div>

      {/* Comic-style speech bubbles */}
      <div className="absolute top-16 left-8 animate-bounce" style={{ animationDelay: '1s' }}>
        <div className="bg-white rounded-2xl p-3 shadow-lg relative">
          <div className="text-sm font-bold text-gray-800">My character would destroy yours! 💪</div>
          <div className="absolute -bottom-2 left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white"></div>
        </div>
      </div>

      <div className="absolute top-28 right-8 animate-bounce" style={{ animationDelay: '1.5s' }}>
        <div className="bg-white rounded-2xl p-3 shadow-lg relative">
          <div className="text-sm font-bold text-gray-800">Time to settle this! ⚔️</div>
          <div className="absolute -bottom-2 right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white"></div>
        </div>
      </div>

      <div className="absolute bottom-16 left-16 animate-bounce" style={{ animationDelay: '2s' }}>
        <div className="bg-white rounded-2xl p-3 shadow-lg relative">
          <div className="text-sm font-bold text-gray-800">Let the games begin! 🎮</div>
          <div className="absolute -bottom-2 left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white"></div>
        </div>
      </div>
    </div>
  );
}