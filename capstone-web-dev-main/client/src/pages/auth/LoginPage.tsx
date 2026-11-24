import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  GraduationCap,
  Trophy,
  Globe2,
  MapPin,
  Loader2,
  ShieldCheck,
  Users,
  BookOpen,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/api';
import KRMULogo from '../../components/ui/KRMULogo';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Forgot Password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');

  // Social SSO notification modal
  const [ssoMessage, setSsoMessage] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const user = await login(email, password, rememberMe);
      if (user.role === 'ADMIN') navigate('/admin');
      else if (user.role === 'FACULTY') navigate('/faculty');
      else navigate('/student');
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Invalid institutional credentials. Please verify your email and password.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMessage('');
    try {
      const res = await authService.forgotPassword(forgotEmail);
      setForgotMessage(
        res.data?.message ||
          'If an account with that email exists, password reset instructions have been dispatched.'
      );
    } catch (err: any) {
      setForgotMessage(err?.response?.data?.message || 'Password reset request failed.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSocialSSO = (provider: 'Google' | 'Microsoft') => {
    setSsoMessage(
      `${provider} Single Sign-On (SSO) is enabled for @krmangalam.edu.in accounts. For this demonstration, please use the institutional login form or one-click demo access.`
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F8FD] flex flex-col justify-between font-sans relative selection:bg-[#1261D5] selection:text-white">
      {/* Top University Header Bar */}
      <header className="w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 lg:px-12 py-3.5 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <KRMULogo variant="dark" size="md" />
        </div>
        <div className="hidden sm:flex items-center gap-2 text-sm font-semibold text-[#082B5C] italic tracking-wide">
          <span>Dream</span>
          <span className="text-[#1261D5]">•</span>
          <span>Learn</span>
          <span className="text-[#1261D5]">•</span>
          <span>Achieve</span>
        </div>
      </header>

      {/* Main Split-Screen Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Side: Authentic KRMU Campus Image + Hero Highlights */}
        <div className="lg:col-span-7 flex flex-col justify-between relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 min-h-[480px] lg:min-h-[620px] bg-slate-900 group">
          {/* Authentic Campus Photograph Background */}
          <img
            src="/assets/krmu-campus-main.jpg"
            alt="K.R. Mangalam University Campus"
            className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.92] group-hover:scale-105 transition-transform duration-700 ease-out"
          />

          {/* Elegant Navy Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#061F45]/90 via-[#082B5C]/50 to-transparent pointer-events-none" />

          {/* Top Brand Tagline on Left Banner */}
          <div className="relative z-10 p-6 sm:p-8">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-semibold tracking-wide uppercase shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Official Campus Portal
            </span>
          </div>

          {/* Center-Bottom Text Content */}
          <div className="relative z-10 p-6 sm:p-8 mt-auto">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight drop-shadow-md">
              Welcome Back!
            </h1>
            <p className="text-blue-100 text-sm sm:text-base mt-2 max-w-xl font-normal leading-relaxed drop-shadow">
              Sign in to your university account and continue your academic journey at K.R. Mangalam
              University.
            </p>

            {/* Three Feature Highlight Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/20">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 text-blue-200">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold leading-tight">Academic Excellence</h4>
                  <p className="text-[10px] text-blue-200/80">World-class curriculum</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 text-amber-300">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold leading-tight">Holistic Growth</h4>
                  <p className="text-[10px] text-blue-200/80">Leadership & sports</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 text-cyan-300">
                  <Globe2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold leading-tight">Global Network</h4>
                  <p className="text-[10px] text-blue-200/80">500+ corporate tie-ups</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Centered White Authentication Card */}
        <div className="lg:col-span-5 w-full flex justify-center">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/80 p-8 relative overflow-hidden">
            {/* Top University Emblem inside Card */}
            <div className="flex flex-col items-center text-center mb-6">
              <img
                src="/assets/krmu-crest.png"
                alt="KRMU Emblem"
                className="w-14 h-14 object-contain mb-2 drop-shadow-sm"
              />
              <h2 className="text-sm font-black text-[#082B5C] tracking-tight">
                K.R. MANGALAM UNIVERSITY
              </h2>
              <span className="text-[10px] font-bold text-[#D32F2F] tracking-widest uppercase">
                THE COMPLETE WORLD
              </span>

              <div className="mt-4">
                <h3 className="text-2xl font-extrabold text-[#082B5C] tracking-tight">Login</h3>
                <p className="text-xs text-slate-500 mt-1">Access your campus account</p>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5">
                  !
                </div>
                <p className="text-xs font-medium text-rose-800 leading-relaxed">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#102B52] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@krmangalam.edu.in"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1261D5] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#102B52] mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1261D5] focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me and Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-[#1261D5] focus:ring-[#1261D5]"
                  />
                  <span>Remember Me</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setShowForgotModal(true);
                  }}
                  className="font-semibold text-[#1261D5] hover:text-[#082B5C] hover:underline transition-colors cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-[#082B5C] hover:bg-[#061F45] text-white font-semibold rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 disabled:opacity-60 cursor-pointer mt-3"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* OR Divider */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <span className="relative px-3 bg-white text-xs font-semibold text-slate-400 uppercase tracking-wider">
                OR
              </span>
            </div>

            {/* Social / SSO Buttons */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => handleSocialSSO('Google')}
                className="w-full py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-2.5 transition-colors cursor-pointer shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleSocialSSO('Microsoft')}
                className="w-full py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-2.5 transition-colors cursor-pointer shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 23 23">
                  <path fill="#f35325" d="M1 1h10v10H1z" />
                  <path fill="#81bc06" d="M12 1h10v10H12z" />
                  <path fill="#05a6f0" d="M1 12h10v10H1z" />
                  <path fill="#ffba08" d="M12 12h10v10H12z" />
                </svg>
                <span>Continue with Microsoft</span>
              </button>
            </div>

            {/* Sign Up Link */}
            <div className="mt-6 text-center text-xs text-slate-500">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-bold text-[#1261D5] hover:text-[#082B5C] hover:underline transition-colors"
              >
                Sign Up
              </Link>
            </div>

            {/* Quick One-Click Demo Access Bar */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Quick Demo Access
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Live System
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin@university.edu', 'Admin@123456')}
                  className="p-2 border border-slate-200 rounded-xl text-left hover:border-[#082B5C] hover:bg-blue-50/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#082B5C]" />
                    <span className="text-xs font-bold text-slate-900 group-hover:text-[#082B5C]">
                      Admin
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">System ERP</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('james.wilson@university.edu', 'Faculty@123')}
                  className="p-2 border border-slate-200 rounded-xl text-left hover:border-emerald-600 hover:bg-emerald-50/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Users className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                      Faculty
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">Dr. Wilson</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('student01@university.edu', 'Student@123')}
                  className="p-2 border border-slate-200 rounded-xl text-left hover:border-indigo-600 hover:bg-indigo-50/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-700">
                      Student
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">Student 01</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* University Official Bottom Footer */}
      <footer className="w-full bg-[#061F45] text-slate-300 border-t border-slate-800 px-6 lg:px-12 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs z-20">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#1261D5]" />
          <span>K.R. Mangalam University | Gurugram, Haryana</span>
        </div>

        <div className="flex items-center gap-4 text-slate-400">
          <span>Connect with us:</span>
          <div className="flex items-center gap-2 text-white">
            <span className="w-6 h-6 rounded-full bg-white/10 hover:bg-[#1261D5] flex items-center justify-center transition-colors cursor-pointer text-[11px] font-bold">
              f
            </span>
            <span className="w-6 h-6 rounded-full bg-white/10 hover:bg-[#1261D5] flex items-center justify-center transition-colors cursor-pointer text-[11px] font-bold">
              in
            </span>
            <span className="w-6 h-6 rounded-full bg-white/10 hover:bg-[#1261D5] flex items-center justify-center transition-colors cursor-pointer text-[11px] font-bold">
              yt
            </span>
            <span className="w-6 h-6 rounded-full bg-white/10 hover:bg-[#1261D5] flex items-center justify-center transition-colors cursor-pointer text-[11px] font-bold">
              ig
            </span>
          </div>
        </div>

        <div>
          <span>© 2026 K.R. Mangalam University. All Rights Reserved.</span>
        </div>
      </footer>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => {
                setShowForgotModal(false);
                setForgotMessage('');
              }}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1261D5] flex items-center justify-center mb-3">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#082B5C]">Reset Your Password</h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter your institutional email address. We will verify your account and provide reset
                instructions.
              </p>
            </div>

            {forgotMessage && (
              <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs font-medium text-emerald-800 leading-relaxed">
                  {forgotMessage}
                </p>
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Institutional Email
                </label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@krmangalam.edu.in"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1261D5]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="flex-1 py-2.5 bg-[#082B5C] hover:bg-[#061F45] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
                >
                  {forgotLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SSO Notice Modal */}
      {ssoMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setSsoMessage('')}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1261D5] flex items-center justify-center mb-3">
              <Globe2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#082B5C]">Campus Single Sign-On</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">{ssoMessage}</p>
            <button
              type="button"
              onClick={() => setSsoMessage('')}
              className="w-full mt-5 py-2.5 bg-[#082B5C] hover:bg-[#061F45] text-white rounded-xl text-xs font-semibold"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
