import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plane,
  Mail,
  Lock,
  User,
  ArrowRight,
  Phone,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!isLogin && phoneNumber.length !== 10) {
      setError("Phone number must be exactly 10 digits.");
      return;
    }

    setLoading(true);

    const url = isLogin
      ? "http://localhost:8080/api/users/login"
      : "http://localhost:8080/api/users/register";

    const payload = isLogin
      ? { email, password }
      : {
          name,
          email,
          password,
          phone_number: phoneNumber,
        };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await response.text();

      if (response.ok) {
        setSuccess(text);
        if (isLogin) {
          setTimeout(() => navigate("/dashboard"), 1200);
        } else {
          setTimeout(() => {
            setIsLogin(true);
            setSuccess("");
            setName("");
            setPhoneNumber("");
          }, 2000);
        }
      } else {
        setError(text);
      }
    } catch (err) {
      setError("Network error: Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative bg-transparent">
      {/* AMBER GLASS CARD:
          - bg-amber-950/40 is the deep brown base.
          - backdrop-blur-3xl creates the heavy blur.
          - border-amber-500/10 adds a subtle warm outline.
          - shadow-[0_20px_60px_rgba(180,83,9,0.3)] adds a golden-brown shadow.
      */}
      <div className="w-full max-w-[440px] bg-amber-950/40 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_20px_60px_rgba(180,83,9,0.3)] border border-amber-500/10 relative z-10 p-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl mb-6 shadow-xl shadow-indigo-500/40">
            <Plane className="text-white w-7 h-7 -rotate-45" />
          </div>
          {/* text-amber-50 for high contrast, warm visibility */}
          <h1 className="text-4xl font-black text-amber-50 tracking-tight">
            Voyexa
          </h1>
          <p className="text-amber-200 mt-2 text-sm font-semibold">
            {isLogin
              ? "Your next journey starts here."
              : "Join the future of travel planning."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div className="relative">
                <User className="absolute left-4 top-4 w-5 h-5 text-amber-300" />
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full pl-12 pr-4 py-4 bg-amber-950/30 border border-amber-500/10 rounded-2xl outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all text-amber-50 placeholder:text-amber-300 font-medium"
                  required={!isLogin}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="relative">
                <Phone className="absolute left-4 top-4 w-5 h-5 text-amber-300" />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  maxLength={10}
                  className="w-full pl-12 pr-4 py-4 bg-amber-950/30 border border-amber-500/10 rounded-2xl outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all text-amber-50 placeholder:text-amber-300 font-medium"
                  required={!isLogin}
                  value={phoneNumber}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setPhoneNumber(val);
                  }}
                />
              </div>
            </>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-4 w-5 h-5 text-amber-300" />
            <input
              type="email"
              placeholder="Email Address"
              className="w-full pl-12 pr-4 py-4 bg-amber-950/30 border border-amber-500/10 rounded-2xl outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all text-amber-50 placeholder:text-amber-300 font-medium"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-4 w-5 h-5 text-amber-300" />
            <input
              type="password"
              placeholder="Password"
              className="w-full pl-12 pr-4 py-4 bg-amber-950/30 border border-amber-500/10 rounded-2xl outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all text-amber-50 placeholder:text-amber-300 font-medium"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-100 bg-red-950/40 p-3 rounded-xl text-xs font-bold border border-red-500/50">
              <AlertCircle size={16} className="text-red-400" /> {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 text-emerald-100 bg-emerald-950/40 p-3 rounded-xl text-xs font-bold border border-emerald-500/50">
              <ShieldCheck size={16} className="text-emerald-400" /> {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all mt-4 shadow-lg shadow-indigo-900/20 active:scale-[0.98] ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-amber-500/10 pt-6">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setSuccess("");
            }}
            disabled={loading}
            className="text-sm font-bold text-amber-300 hover:text-white transition-colors disabled:opacity-50"
          >
            {isLogin ? "Need an account? Sign up" : "Already a member? Log in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
