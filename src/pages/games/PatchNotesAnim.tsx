import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, PenTool, Sparkles } from "lucide-react";

export default function PatchNotesAnim() {
  const navigate = useNavigate();
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    // Animation sequence
    const timer1 = setTimeout(() => setAnimationStep(1), 500);
    const timer2 = setTimeout(() => setAnimationStep(2), 1500);
    const timer3 = setTimeout(() => setAnimationStep(3), 2500);
    const timer4 = setTimeout(() => navigate("/games/patchnotes/chat"), 4000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-700 flex items-center justify-center relative overflow-hidden">
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
            {['📝', '📖', '✏️', '📚', '🎮', '🎯', '⚡', '💡', '🎨', '🎭'][Math.floor(Math.random() * 10)]}
          </div>
        ))}
      </div>

      {/* Floating notebooks and writing tools */}
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
            {i % 4 === 0 ? <BookOpen size={24} className="text-indigo-400" /> :
             i % 4 === 1 ? <PenTool size={24} className="text-purple-400" /> :
             i % 4 === 2 ? <Sparkles size={24} className="text-blue-400" /> :
             <span className="text-3xl">📝</span>}
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="text-center z-10">
        {/* Step 1: Notebook appears */}
        <div className={`transition-all duration-1000 ${animationStep >= 1 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
          <div className="relative mb-8">
            <div className="text-9xl animate-pulse">📝</div>
            <div className="absolute -top-4 -right-4">
              <Sparkles size={40} className="text-indigo-400 animate-spin" />
            </div>
          </div>
        </div>

        {/* Step 2: Title appears */}
        <div className={`transition-all duration-1000 ${animationStep >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 drop-shadow-2xl animate-bounce">
            PATCH NOTES
          </h1>
          <div className="flex justify-center items-center gap-4 mb-8">
            <BookOpen size={40} className="text-indigo-400 animate-ping" />
            <span className="text-2xl md:text-3xl font-bold text-purple-200">GAME UPDATES</span>
            <PenTool size={40} className="text-blue-400 animate-ping" />
          </div>
        </div>

        {/* Step 3: Subtitle and loading */}
        <div className={`transition-all duration-1000 ${animationStep >= 3 ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
          <p className="text-xl md:text-2xl text-indigo-200 mb-8 font-semibold">
            📝 Write funny patch notes for our favorite games! 📝
          </p>

          {/* Loading animation */}
          <div className="flex justify-center items-center gap-2">
            <div className="w-3 h-3 bg-indigo-300 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-3 h-3 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <span className="text-white font-bold ml-4">Loading update notes...</span>
          </div>
        </div>
      </div>

      {/* Comic-style speech bubbles */}
      <div className="absolute top-16 left-8 animate-bounce" style={{ animationDelay: '1s' }}>
        <div className="bg-white rounded-2xl p-3 shadow-lg relative">
          <div className="text-sm font-bold text-gray-800">Version 2.0! 🎉</div>
          <div className="absolute -bottom-2 left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white"></div>
        </div>
      </div>

      <div className="absolute top-28 right-8 animate-bounce" style={{ animationDelay: '1.5s' }}>
        <div className="bg-white rounded-2xl p-3 shadow-lg relative">
          <div className="text-sm font-bold text-gray-800">Breaking changes! ⚠️</div>
          <div className="absolute -bottom-2 right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white"></div>
        </div>
      </div>

      <div className="absolute bottom-16 left-16 animate-bounce" style={{ animationDelay: '2s' }}>
        <div className="bg-white rounded-2xl p-3 shadow-lg relative">
          <div className="text-sm font-bold text-gray-800">New features added! ✨</div>
          <div className="absolute -bottom-2 left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white"></div>
        </div>
      </div>
    </div>
  );
}