import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MyceliumLogo from "@/components/MyceliumLogo";
import { Lock, User } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsVisible(false);
      setTimeout(() => {
        navigate("/connections");
      }, 500);
    }
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-[hsl(260,30%,8%)] via-[hsl(265,35%,12%)] to-[hsl(270,40%,10%)] flex items-center justify-center px-4 transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      style={{ paddingTop: 0 }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-4 mt-2">
          <div className="w-24 h-24">
            <MyceliumLogo />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-1 bg-gradient-to-r from-[hsl(280,95%,52%)] via-[hsl(180,85%,48%)] to-[hsl(90,80%,48%)] bg-clip-text text-transparent">
          Log In
        </h1>
        <p className="text-center text-[hsl(var(--muted-foreground))] mb-4 text-sm">
          Welcome back to the mycelium network
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Username Field */}
          <div>
            <label className="block text-xs font-medium text-[hsl(var(--foreground))] mb-1">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[hsl(var(--input))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] placeholder-[hsl(var(--muted-foreground))] focus:outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/20 text-sm transition-all"
                placeholder="Enter your username"
              />
            </div>
            {errors.username && (
              <p className="text-red-400 text-xs mt-1">{errors.username}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-medium text-[hsl(var(--foreground))] mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[hsl(var(--input))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] placeholder-[hsl(var(--muted-foreground))] focus:outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/20 text-sm transition-all"
                placeholder="••••••••"
              />
            </div>
            {errors.password && (
              <p className="text-red-400 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2 px-3 mt-4 bg-gradient-to-r from-[hsl(280,95%,52%)] to-[hsl(180,85%,48%)] hover:from-[hsl(280,95%,47%)] hover:to-[hsl(180,85%,43%)] text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl text-base"
          >
            Log In
          </button>

          {/* Sign Up Link */}
          <p className="text-center text-xs text-[hsl(var(--muted-foreground))] mt-3">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/auth")}
              className="text-[hsl(var(--primary))] hover:text-[hsl(260,80%,70%)] font-semibold transition-colors"
            >
              Create one
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
