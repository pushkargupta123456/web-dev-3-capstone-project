import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Phone,
  GraduationCap,
  Briefcase,
  Shield,
  Building2,
  Calendar,
  CheckCircle2,
  Loader2,
  MapPin,
  X,
  CreditCard,
} from 'lucide-react';
import { authService } from '../../services/api';
import KRMULogo from '../../components/ui/KRMULogo';

const DEPARTMENTS = [
  'School of Engineering & Technology (SOET)',
  'School of Management & Commerce (SOMC)',
  'School of Medical & Allied Sciences (SMAS)',
  'School of Legal Studies (SOLS)',
  'School of Basic & Applied Sciences (SBAS)',
  'School of Humanities & Social Sciences (SHSS)',
  'School of Agricultural Sciences',
  'School of Journalism & Mass Communication',
];

const SignupPage: React.FC = () => {
  const [role, setRole] = useState<'STUDENT' | 'FACULTY'>('STUDENT');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [idNumber, setIdNumber] = useState(''); // Registration No or Employee ID
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [semester, setSemester] = useState('1');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAdminNotice, setShowAdminNotice] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!agreedToTerms) {
      setError('Please agree to the Terms & Conditions and Privacy Policy to register.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const payload: any = {
        name,
        email,
        password,
        confirmPassword,
        phone,
        department,
        role,
      };

      if (role === 'STUDENT') {
        payload.registrationNumber = idNumber;
        payload.semester = Number(semester);
      } else {
        payload.employeeId = idNumber;
      }

      const response = await authService.register(payload);
      setSuccessMessage(
        response.data?.message ||
          'Account created successfully! You can now sign in with your credentials.'
      );

      // Store access token if returned
      if (response.data?.data?.accessToken) {
        localStorage.setItem('accessToken', response.data.data.accessToken);
      }

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || 'Registration failed. Please check your details and try again.'
      );
    } finally {
      setIsLoading(false);
    }
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

      {/* Main Split-Screen Layout */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Side: Deep Navy Brand Panel with Wave Curves and Benefits */}
        <div className="lg:col-span-5 flex flex-col justify-between relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 min-h-[520px] lg:min-h-[700px] bg-gradient-to-br from-[#082B5C] via-[#061F45] to-[#04122B] text-white p-8 sm:p-10">
          {/* Subtle curved background overlay */}
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

          {/* Top Branding */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <img
                src="/assets/krmu-crest.png"
                alt="KRMU Emblem"
                className="w-12 h-12 object-contain filter drop-shadow"
              />
              <div>
                <h3 className="text-sm font-black tracking-tight text-white">
                  K.R. MANGALAM UNIVERSITY
                </h3>
                <p className="text-[10px] font-bold text-red-400 tracking-widest uppercase">
                  THE COMPLETE WORLD
                </p>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mt-4">
              Join KRMU Family
            </h1>
            <p className="text-blue-100/90 text-sm mt-2 leading-relaxed">
              Create your account to access all campus services, track academic progress, and stay
              connected.
            </p>

            {/* Benefits Checkmarks */}
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-500/20 border border-blue-400/40 flex items-center justify-center flex-shrink-0 text-blue-300">
                  <CheckCircle2 className="w-4 h-4 text-[#1261D5] bg-white rounded-full" />
                </div>
                <span className="text-sm font-medium text-slate-100">
                  View Courses & Timetable
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-500/20 border border-blue-400/40 flex items-center justify-center flex-shrink-0 text-blue-300">
                  <CheckCircle2 className="w-4 h-4 text-[#1261D5] bg-white rounded-full" />
                </div>
                <span className="text-sm font-medium text-slate-100">
                  Track Attendance in Real-Time
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-500/20 border border-blue-400/40 flex items-center justify-center flex-shrink-0 text-blue-300">
                  <CheckCircle2 className="w-4 h-4 text-[#1261D5] bg-white rounded-full" />
                </div>
                <span className="text-sm font-medium text-slate-100">
                  Get Latest Announcements & Alerts
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-500/20 border border-blue-400/40 flex items-center justify-center flex-shrink-0 text-blue-300">
                  <CheckCircle2 className="w-4 h-4 text-[#1261D5] bg-white rounded-full" />
                </div>
                <span className="text-sm font-medium text-slate-100">
                  Access Academic Reports & Transcripts
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Campus Building Photograph */}
          <div className="relative z-10 mt-8 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
            <img
              src="/assets/krmu-campus-signup.jpg"
              alt="KRMU Campus Entrance"
              className="w-full h-36 object-cover object-center filter brightness-[0.95]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#061F45]/80 via-transparent to-transparent flex items-end p-3">
              <span className="text-[11px] font-semibold text-white/90 drop-shadow">
                K.R. Mangalam University Campus | Sohna Road, Gurugram
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: White Registration Card */}
        <div className="lg:col-span-7 w-full flex justify-center">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 p-8 sm:p-10 relative">
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#082B5C] tracking-tight">
                Create Account
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Fill in your details to get started with your university credentials.
              </p>
            </div>

            {/* Role Switcher Pills */}
            <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => {
                  setRole('STUDENT');
                  setIdNumber('');
                  setError('');
                }}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  role === 'STUDENT'
                    ? 'bg-[#1261D5] text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Student</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRole('FACULTY');
                  setIdNumber('');
                  setError('');
                }}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  role === 'FACULTY'
                    ? 'bg-[#1261D5] text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Faculty</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAdminNotice(true)}
                className="py-2.5 px-3 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            </div>

            {/* Error Message Banner */}
            {error && (
              <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5">
                  !
                </div>
                <p className="text-xs font-medium text-rose-800 leading-relaxed">{error}</p>
              </div>
            )}

            {/* Success Message Banner */}
            {successMessage && (
              <div className="mb-5 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-900">Registration Successful!</h4>
                  <p className="text-xs text-emerald-700 mt-0.5">{successMessage}</p>
                  <p className="text-[11px] text-emerald-600 font-medium mt-1">
                    Redirecting to login...
                  </p>
                </div>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-[#102B52] mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Aarav Sharma"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1261D5] focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-[#102B52] mb-1.5">
                    Institutional Email <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={
                        role === 'STUDENT'
                          ? 'rollnumber@krmu.edu.in'
                          : 'faculty.name@krmu.edu.in'
                      }
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1261D5] focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* ID Field (Reg No or Employee ID) */}
                <div>
                  <label className="block text-xs font-semibold text-[#102B52] mb-1.5">
                    {role === 'STUDENT' ? 'Registration Number' : 'Employee ID'}{' '}
                    <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      placeholder={role === 'STUDENT' ? 'e.g. 24KRMU102' : 'e.g. KRMUFAC088'}
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1261D5] focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-semibold text-[#102B52] mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1261D5] focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Department Dropdown */}
                <div className={role === 'STUDENT' ? '' : 'sm:col-span-2'}>
                  <label className="block text-xs font-semibold text-[#102B52] mb-1.5">
                    Department / School <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      required
                      className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1261D5] focus:border-transparent transition-all appearance-none cursor-pointer"
                    >
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Semester (for Students only) */}
                {role === 'STUDENT' && (
                  <div>
                    <label className="block text-xs font-semibold text-[#102B52] mb-1.5">
                      Current Semester <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <select
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        required
                        className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1261D5] focus:border-transparent transition-all appearance-none cursor-pointer"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                          <option key={s} value={s}>
                            Semester {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-[#102B52] mb-1.5">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      minLength={6}
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1261D5] focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold text-[#102B52] mb-1.5">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      minLength={6}
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1261D5] focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Terms and Conditions Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    required
                    className="w-4 h-4 mt-0.5 rounded border-slate-300 text-[#1261D5] focus:ring-[#1261D5]"
                  />
                  <span>
                    I agree to the{' '}
                    <span className="font-semibold text-[#1261D5] hover:underline">
                      Terms & Conditions
                    </span>{' '}
                    and{' '}
                    <span className="font-semibold text-[#1261D5] hover:underline">
                      Privacy Policy
                    </span>
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-[#082B5C] hover:bg-[#061F45] text-white font-semibold rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 disabled:opacity-60 cursor-pointer mt-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Campus Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Back to Login Link */}
            <div className="mt-6 text-center text-xs text-slate-500">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-[#1261D5] hover:text-[#082B5C] hover:underline transition-colors"
              >
                Login
              </Link>
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

      {/* Admin Notice Dialog */}
      {showAdminNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setShowAdminNotice(false)}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#082B5C]">Administrator Account Provisioning</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Per K.R. Mangalam University security policy, <strong>System Administrator</strong>{' '}
              roles are strictly protected and cannot be self-registered through the public portal.
            </p>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              If you are an authorized university IT administrator, please log in with your issued
              institutional master credentials or contact the IT Infrastructure Office.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setShowAdminNotice(false)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
              <Link
                to="/login"
                className="flex-1 py-2.5 bg-[#082B5C] hover:bg-[#061F45] text-white rounded-xl text-xs font-semibold text-center"
              >
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignupPage;
