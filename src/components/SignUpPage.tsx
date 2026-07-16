import React, { useState } from 'react';
import { GraduationCap, ArrowLeft, ShieldCheck, User as UserIcon, Mail, Phone, Lock, School, Eye, EyeOff, Shield, CheckCircle2 } from 'lucide-react';
import { School as SchoolType, User, UserRole } from '../types';
import SchoolSelect from './SchoolSelect';

interface SignUpPageProps {
  schools: SchoolType[];
  onSignUp: (user: User) => void;
  onNavigateToLanding: () => void;
}

export default function SignUpPage({ schools, onSignUp, onNavigateToLanding }: SignUpPageProps) {
  const [role, setRole] = useState<UserRole>(() => {
    const saved = sessionStorage.getItem('preferred_signup_role');
    if (saved && (saved === 'STUDENT' || saved === 'LANDLORD' || saved === 'INSPECTOR')) {
      sessionStorage.removeItem('preferred_signup_role');
      return saved as UserRole;
    }
    return 'STUDENT';
  });

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [department, setDepartment] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Verification Screen States
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [tempUser, setTempUser] = useState<User | null>(null);

  // Password strength logic
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { label: 'None', score: 0, colorClass: 'bg-gray-200', textColor: 'text-gray-400' };
    
    let score = 0;
    const hasUpper = /[A-Z]/.test(pass);
    const hasLower = /[a-z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSpecial = /[^A-Za-z0-9]/.test(pass);

    if (pass.length >= 8) score += 1;
    if (hasUpper) score += 1;
    if (hasLower) score += 1;
    if (hasNumber) score += 1;
    if (hasSpecial) score += 1;

    if (pass.length < 8) {
      return { label: 'Weak (Must be 8+ characters)', score: 1, colorClass: 'bg-red-500', textColor: 'text-red-500' };
    }

    // Requirements: capital, small, number, special, 8+ chars
    if (hasUpper && hasLower && hasNumber && hasSpecial && pass.length >= 8) {
      return { label: 'Strong', score: 3, colorClass: 'bg-emerald-500', textColor: 'text-emerald-600' };
    } else if (score >= 3) {
      return { label: 'Moderate', score: 2, colorClass: 'bg-blue-500', textColor: 'text-blue-600' };
    } else {
      return { label: 'Weak', score: 1, colorClass: 'bg-red-500', textColor: 'text-red-500' };
    }
  };

  const strength = getPasswordStrength(password);

  const handlePreSubmitValidation = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !email.trim() || !phone.trim() || !password) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (role === 'STUDENT' && !selectedSchool) {
      setErrorMsg('Please select your tertiary institution.');
      return;
    }

    // 1. Phone number validation (Nigerian-like: exactly 11 digits starting with 0, or starting with +234/234 followed by 10 digits)
    const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '');
    const isNigerian = /^(0\d{10}|234\d{10})$/.test(cleanPhone);
    if (!isNigerian) {
      setErrorMsg('Please enter a valid Nigerian phone number. It must be exactly 11 digits starting with 0 (e.g., 08123456789), or use the +234 format.');
      return;
    }

    // 2. Password complexity validation: capital letter, small letter, number, special character, min 8 characters
    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setErrorMsg('Password must contain at least one uppercase capital letter (A-Z).');
      return;
    }
    if (!/[a-z]/.test(password)) {
      setErrorMsg('Password must contain at least one lowercase letter (a-z).');
      return;
    }
    if (!/[0-9]/.test(password)) {
      setErrorMsg('Password must contain at least one numerical digit (0-9).');
      return;
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      setErrorMsg('Password must contain at least one special character (e.g. @, #, $, %, !, &, *).');
      return;
    }

    // 3. Confirm Password matching validation
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-type and confirm.');
      return;
    }

    // Validation passes! Create the temporary user record and open the Verification screen
    const avatarUrl = role === 'STUDENT' 
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120'
      : role === 'LANDLORD'
      ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120'
      : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120';

    const newUser: User = {
      id: `user_${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: cleanPhone.startsWith('234') ? `0${cleanPhone.slice(3)}` : cleanPhone,
      role: role,
      profilePicture: avatarUrl,
      kycStatus: role === 'STUDENT' ? 'APPROVED' : 'PENDING',
      schoolId: role === 'STUDENT' || role === 'INSPECTOR' ? selectedSchool : undefined,
      department: role === 'STUDENT' ? (department.trim() || 'General Studies') : undefined,
    };

    setTempUser(newUser);
    setIsVerifying(true);
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError('');

    if (verificationCode !== '234196' && verificationCode.trim() !== '123456') {
      setVerificationError('Incorrect verification code. For test mode, please enter the code: 234196');
      return;
    }

    if (!tempUser) {
      setVerificationError('An unexpected error occurred. Please try signing up again.');
      return;
    }

    try {
      onSignUp(tempUser);
      setIsVerifying(false);
      setSuccessMsg('Account verified and created successfully! Redirecting to Sign In page...');
      setTimeout(() => {
        window.history.pushState({}, '', '/signin');
      }, 2000);
    } catch (err: any) {
      setVerificationError(err.message || 'Error occurred while saving your account.');
    }
  };

  return (
    <div className="min-h-screen bg-wood-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Wood Background Rings */}
      <div className="absolute right-0 top-0 opacity-10 font-display font-black text-9xl select-none translate-x-20 -translate-y-10 text-wood-900 pointer-events-none">DORM</div>
      <div className="absolute left-0 bottom-0 opacity-10 font-display font-black text-9xl select-none -translate-x-20 translate-y-10 text-wood-900 pointer-events-none">SECURE</div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <button 
          onClick={onNavigateToLanding}
          className="inline-flex items-center text-xs font-semibold text-wood-600 hover:text-wood-950 transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft size={16} className="mr-1.5" />
          Back to Homepage
        </button>

        <div className="flex items-center justify-center space-x-2">
          <div className="bg-wood-500 text-white p-2.5 rounded-xl flex items-center justify-center shadow-md">
            <GraduationCap size={28} />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight text-wood-950">Dormiversity</span>
        </div>
        
        <h2 className="mt-4 text-center text-3xl font-display font-extrabold text-wood-950">
          {isVerifying ? 'Verify Contact Details' : 'Create Your Account'}
        </h2>
        
        {!isVerifying && (
          <p className="mt-1 text-center text-sm text-wood-600">
            Already have an account?{' '}
            <button 
              onClick={() => window.history.pushState({}, '', '/signin')}
              className="font-bold text-wood-600 hover:text-wood-950 underline cursor-pointer"
            >
              Sign In Here
            </button>
          </p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg relative z-10 animate-fadeIn">
        <div className="bg-white py-8 px-6 sm:px-10 border border-wood-200 shadow-xl rounded-3xl">
          
          {successMsg ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100 animate-bounce">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-display font-bold text-wood-950 font-sans">Verification Complete</h3>
              <p className="text-sm text-wood-600 max-w-sm mx-auto">{successMsg}</p>
            </div>
          ) : isVerifying ? (
            /* VERIFICATION OTP INTERSTITIAL SCREEN */
            <form className="space-y-6" onSubmit={handleVerifyCode}>
              <div className="text-center space-y-2 mb-4">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-100">
                  <Shield size={24} />
                </div>
                <h4 className="font-bold text-base text-wood-900">OTP Security Check</h4>
                <p className="text-xs text-wood-500 leading-relaxed px-4">
                  A verification code has been dispatched to <strong>{email}</strong> and SMS <strong>{phone}</strong>. Please enter the passcode to activate your vetted profile.
                </p>
              </div>

              {verificationError && (
                <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-800 rounded-xl text-xs font-semibold">
                  {verificationError}
                </div>
              )}

              <div className="bg-amber-50/50 border border-amber-200/60 rounded-2xl p-4 text-center">
                <span className="text-xs text-amber-800 font-bold">🧪 Sandbox Demo Code:</span>
                <span className="block text-lg font-mono font-bold tracking-widest text-amber-950 mt-1">234196</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-wood-700 uppercase tracking-wider mb-2 text-center">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-widest font-mono text-xl py-3 bg-wood-50 border border-wood-250 rounded-xl text-wood-950 outline-hidden focus:border-wood-500 focus:ring-1 focus:ring-wood-500 transition-all"
                  placeholder="••••••"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsVerifying(false);
                    setVerificationError('');
                  }}
                  className="w-1/3 py-3 bg-wood-50 hover:bg-wood-100 text-wood-700 font-bold rounded-xl text-xs sm:text-sm border border-wood-200 transition-all cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-wood-900 hover:bg-wood-950 text-white font-bold rounded-xl text-xs sm:text-sm transition-all cursor-pointer shadow-md"
                >
                  Verify & Activate Account
                </button>
              </div>
            </form>
          ) : (
            /* STANDARD SIGN UP FORM WITH ROBUST METERS & EYE ICONS */
            <form className="space-y-5" onSubmit={handlePreSubmitValidation}>
              {errorMsg && (
                <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-800 rounded-2xl text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              {/* Persona Select */}
              <div>
                <label className="block text-xs font-bold text-wood-700 uppercase tracking-wider mb-2">
                  Select Your Account Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['STUDENT', 'LANDLORD', 'INSPECTOR'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        setRole(r);
                        setErrorMsg('');
                      }}
                      className={`py-3 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center ${
                        role === r
                          ? 'bg-wood-900 border-wood-950 text-white shadow-md'
                          : 'bg-wood-50 hover:bg-wood-100 border-wood-200 text-wood-700'
                      }`}
                    >
                      {r.charAt(0) + r.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-wood-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-wood-400">
                    <UserIcon size={16} />
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-wood-50/50 border border-wood-200 rounded-xl text-wood-950 text-sm focus:border-wood-500 focus:ring-1 focus:ring-wood-500 outline-hidden transition-all placeholder-wood-400"
                    placeholder="Ayomide Fashina"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-wood-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-wood-400">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-wood-50/50 border border-wood-200 rounded-xl text-wood-950 text-sm focus:border-wood-500 focus:ring-1 focus:ring-wood-500 outline-hidden transition-all placeholder-wood-400"
                    placeholder="ayomide@university.edu.ng"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-wood-700 uppercase tracking-wider mb-1.5">
                  Phone Number (NGR 🇳🇬)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-wood-400">
                    <Phone size={16} />
                  </span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-wood-50/50 border border-wood-200 rounded-xl text-wood-950 text-sm focus:border-wood-500 focus:ring-1 focus:ring-wood-500 outline-hidden transition-all placeholder-wood-400"
                    placeholder="E.g. 08123456789"
                  />
                </div>
                <p className="text-[10px] text-wood-500 mt-1">Format: 11 digits starting with 0, or international +234 format.</p>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-wood-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-wood-400">
                    <Lock size={16} />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-wood-50/50 border border-wood-200 rounded-xl text-wood-950 text-sm focus:border-wood-500 focus:ring-1 focus:ring-wood-500 outline-hidden transition-all placeholder-wood-400"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-wood-400 hover:text-wood-700 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {password && (
                  <div className="mt-2 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-wood-600">Password Strength:</span>
                      <span className={strength.textColor}>{strength.label}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <div className={`h-1.5 rounded-full transition-all ${strength.score >= 1 ? strength.colorClass : 'bg-gray-200'}`} />
                      <div className={`h-1.5 rounded-full transition-all ${strength.score >= 2 ? strength.colorClass : 'bg-gray-200'}`} />
                      <div className={`h-1.5 rounded-full transition-all ${strength.score >= 3 ? strength.colorClass : 'bg-gray-200'}`} />
                    </div>
                    <p className="text-[10px] text-wood-500 mt-1 font-medium leading-relaxed">
                      Must contain: at least 8 characters, 1 capital, 1 small, 1 number, and 1 special character.
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-wood-700 uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-wood-400">
                    <Lock size={16} />
                  </span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-wood-50/50 border border-wood-200 rounded-xl text-wood-950 text-sm focus:border-wood-500 focus:ring-1 focus:ring-wood-500 outline-hidden transition-all placeholder-wood-400"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-wood-400 hover:text-wood-700 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Conditional School/Department fields */}
              {(role === 'STUDENT' || role === 'INSPECTOR') && (
                <div className="space-y-4 pt-1 border-t border-wood-100">
                  <div>
                    <label className="block text-xs font-bold text-wood-700 uppercase tracking-wider mb-1.5">
                      Select Your Tertiary Institution
                    </label>
                    <SchoolSelect
                      schools={schools}
                      value={selectedSchool}
                      onChange={(schoolId) => setSelectedSchool(schoolId)}
                      placeholder="Type to search and select your institution..."
                    />
                  </div>

                  {role === 'STUDENT' && (
                    <div>
                      <label className="block text-xs font-bold text-wood-700 uppercase tracking-wider mb-1.5">
                        Department / Course of Study
                      </label>
                      <input
                        type="text"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full px-4 py-3 bg-wood-50/50 border border-wood-200 rounded-xl text-wood-950 text-sm focus:border-wood-500 focus:ring-1 focus:ring-wood-500 outline-hidden transition-all placeholder-wood-400"
                        placeholder="Computer Science (Optional)"
                      />
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 wood-pattern-btn text-white font-bold rounded-xl text-sm shadow-md mt-6 cursor-pointer flex items-center justify-center space-x-1.5 hover:opacity-95 transition-opacity"
              >
                <span>Register Vetted Profile</span>
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-wood-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-wood-500 font-bold tracking-wider">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await fetch(`/api/auth/google/url?role=${role}&schoolId=${selectedSchool}`);
                    const data = await res.json();
                    if (data.url) {
                      const width = 600;
                      const height = 700;
                      const left = window.screen.width / 2 - width / 2;
                      const top = window.screen.height / 2 - height / 2;
                      const authWindow = window.open(
                        data.url,
                        'google_oauth_popup',
                        `width=${width},height=${height},top=${top},left=${left}`
                      );
                      if (!authWindow) {
                        alert('Please allow popups to sign up with Google.');
                      }
                    }
                  } catch (err) {
                    console.error('Google Auth open error:', err);
                  }
                }}
                className="w-full py-3 bg-white border border-wood-200 hover:border-wood-300 text-wood-700 font-bold rounded-xl text-sm shadow-xs hover:shadow-sm transition-all flex items-center justify-center space-x-2.5 cursor-pointer"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
                <span>Sign Up with Google</span>
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
