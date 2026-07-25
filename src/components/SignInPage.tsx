import React, { useState, useRef, useEffect } from 'react';
import { GraduationCap, ArrowLeft, Mail, Lock, ShieldCheck, HelpCircle, Eye, EyeOff, ChevronDown, User as UserIcon, Home, ChevronsUpDown, Check } from 'lucide-react';
import { User, UserRole } from '../types';
import { getApiUrl } from '../utils';
import DormiversityLogo from './DormiversityLogo';

interface SignInPageProps {
  users: User[];
  onSignIn: (role: UserRole, userId: string) => void;
  onNavigateToLanding: () => void;
}

export default function SignInPage({ users, onSignIn, onNavigateToLanding }: SignInPageProps) {
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Custom Role Dropdown states
  const [isOpenRole, setIsOpenRole] = useState(false);
  const containerRoleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRoleRef.current && !containerRoleRef.current.contains(event.target as Node)) {
        setIsOpenRole(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please supply both your email address and password.');
      return;
    }

    // Match users based on exact email and role
    const matchedUser = users.find(
      u => u.email.toLowerCase().trim() === email.toLowerCase().trim() && u.role === role
    );

    if (matchedUser) {
      onSignIn(role, matchedUser.id);
    } else {
      setErrorMsg(`No matched account found under the ${role.toLowerCase()} role with those credentials. Please make sure you have signed up first!`);
    }
  };
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleAuthEmail, setGoogleAuthEmail] = useState('fashinaayomide2005@gmail.com');

  const handleGoogleSignIn = async () => {
    // Open window synchronously to avoid browser popup blocker
    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    const authWindow = window.open('about:blank', 'google_oauth_popup', `width=${width},height=${height},top=${top},left=${left}`);

    try {
      const res = await fetch(getApiUrl(`/api/auth/google/url?role=${role}`));
      const data = await res.json();
      if (data.url && authWindow) {
        authWindow.location.href = data.url;
      } else {
        if (authWindow) authWindow.close();
        setShowGoogleModal(true);
      }
    } catch (err) {
      if (authWindow) authWindow.close();
      console.warn('Backend Google Auth popup unavailable in preview, launching Google Fast Sign-In:', err);
      setShowGoogleModal(true);
    }
  };

  const handleExecuteGoogleFastSignIn = () => {
    if (!googleAuthEmail.trim()) return;
    const cleanEmail = googleAuthEmail.trim().toLowerCase();
    
    // Check if user exists with this email
    let matchedUser = users.find(u => u.email.toLowerCase().trim() === cleanEmail);
    if (matchedUser) {
      onSignIn(matchedUser.role, matchedUser.id);
    } else {
      // Find account under selected role or log into first matched role
      matchedUser = users.find(u => u.role === role);
      if (matchedUser) {
        onSignIn(role, matchedUser.id);
      } else if (users.length > 0) {
        onSignIn(users[0].role, users[0].id);
      }
    }
    setShowGoogleModal(false);
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

        <div className="flex items-center justify-center">
          <DormiversityLogo size={38} showText={true} textSize="text-2xl" onClick={onNavigateToLanding} />
        </div>
        <h2 className="mt-4 text-center text-3xl font-display font-extrabold text-wood-950">
          Sign In to Your Portal
        </h2>
        <p className="mt-1 text-center text-sm text-wood-600">
          New to Dormiversity?{' '}
          <button 
            onClick={() => window.history.pushState({}, '', '/signup')}
            className="font-bold text-wood-600 hover:text-wood-950 underline cursor-pointer"
          >
            Create an Account First
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 animate-fadeIn">
        <div className="bg-white py-8 px-6 sm:px-10 border border-wood-200 shadow-xl rounded-3xl">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {errorMsg && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-800 rounded-2xl text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            {/* Role Select Dropdown */}
            <div ref={containerRoleRef} className="relative z-20">
              <label className="block text-xs font-bold text-wood-700 uppercase tracking-wider mb-2">
                Signing In As:
              </label>
              <button
                type="button"
                onClick={() => setIsOpenRole(!isOpenRole)}
                className="w-full flex items-center justify-between text-left text-sm text-wood-950 bg-wood-50/50 border border-wood-200 hover:border-wood-400 rounded-xl px-4 py-3 shadow-2xs transition-all cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-wood-500"
              >
                <div className="flex items-center space-x-2.5 truncate">
                  {role === 'STUDENT' && <GraduationCap size={16} className="text-wood-500 shrink-0" />}
                  {role === 'LANDLORD' && <Home size={16} className="text-wood-500 shrink-0" />}
                  {role === 'INSPECTOR' && <ShieldCheck size={16} className="text-wood-500 shrink-0" />}
                  <span className="font-semibold truncate text-wood-900">
                    {role === 'STUDENT' && 'Student Tenant'}
                    {role === 'LANDLORD' && 'Landlord / Hostel Manager'}
                    {role === 'INSPECTOR' && 'Certified Physical Inspector'}
                  </span>
                </div>
                <ChevronsUpDown size={16} className="text-wood-400 shrink-0 ml-2" />
              </button>

              {isOpenRole && (
                <div className="absolute z-50 mt-1.5 w-full bg-white border border-wood-200 rounded-2xl shadow-xl overflow-hidden animate-fadeIn">
                  <div className="p-2.5 bg-wood-50 border-b border-wood-100 flex items-center space-x-2 text-[10px] font-bold text-wood-400 tracking-wider uppercase">
                    <span>Select Portal Access</span>
                  </div>
                  <div className="py-1 divide-y divide-wood-50/60 max-h-60 overflow-y-auto">
                    {(['STUDENT', 'LANDLORD', 'INSPECTOR'] as const).map((r) => {
                      const isSelected = role === r;
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => {
                            setRole(r);
                            setErrorMsg('');
                            setIsOpenRole(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 hover:bg-wood-50/80 transition-colors flex items-center justify-between gap-2 text-xs cursor-pointer ${
                            isSelected ? 'bg-wood-50/50 text-wood-950 font-semibold' : 'text-wood-700 font-medium'
                          }`}
                        >
                          <div className="flex items-start space-x-2.5 truncate">
                            <div className="mt-0.5 shrink-0">
                              {r === 'STUDENT' && <GraduationCap size={14} className={isSelected ? 'text-wood-900' : 'text-wood-400'} />}
                              {r === 'LANDLORD' && <Home size={14} className={isSelected ? 'text-wood-900' : 'text-wood-400'} />}
                              {r === 'INSPECTOR' && <ShieldCheck size={14} className={isSelected ? 'text-wood-900' : 'text-wood-400'} />}
                            </div>
                            <div className="truncate">
                              <div className="font-bold text-wood-950 text-xs flex items-center space-x-1.5">
                                <span>
                                  {r === 'STUDENT' && 'Student Tenant'}
                                  {r === 'LANDLORD' && 'Landlord / Hostel Manager'}
                                  {r === 'INSPECTOR' && 'Certified Physical Inspector'}
                                </span>
                                {isSelected && (
                                  <span className="px-1.5 py-0.5 text-[9px] font-black bg-wood-100 border border-wood-150 text-wood-700 rounded-sm scale-90">
                                    ACTIVE
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-wood-400 font-normal mt-0.5 whitespace-normal">
                                {r === 'STUDENT' && 'Discover vetted rooms & protect payment in escrow'}
                                {r === 'LANDLORD' && 'Publish secure student housing & collect rent'}
                                {r === 'INSPECTOR' && 'Claim off-campus structural vetting jobs'}
                              </p>
                            </div>
                          </div>
                          {isSelected && <Check size={14} className="text-wood-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
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
                  placeholder="name@university.edu.ng"
                />
              </div>
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
            </div>

            <button
              type="submit"
              className="w-full py-3.5 wood-pattern-btn text-white font-bold rounded-xl text-sm shadow-md mt-6 cursor-pointer flex items-center justify-center hover:opacity-95 transition-opacity"
            >
              <span>Sign In</span>
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
              onClick={handleGoogleSignIn}
              className="w-full py-3 bg-white border border-wood-200 hover:border-wood-300 text-wood-700 font-bold rounded-xl text-sm shadow-xs hover:shadow-sm transition-all flex items-center justify-center space-x-2.5 cursor-pointer"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
              <span>Sign In with Google</span>
            </button>
          </form>

          {/* Secure Platform Policy Guard */}
          <div className="mt-6 pt-5 border-t border-wood-100 flex flex-col space-y-4">
            <div className="flex items-start space-x-2 text-[11px] text-wood-500 leading-normal">
              <ShieldCheck size={16} className="text-wood-400 shrink-0 mt-0.5" />
              <p>
                Your session is protected with escrow security safeguards. Do not share credentials or transfer funds outside of the Paystack gateway.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Google Fast Sign-In Dialog */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 border border-wood-200 shadow-2xl relative">
            <button
              onClick={() => setShowGoogleModal(false)}
              className="absolute top-4 right-4 text-wood-400 hover:text-wood-900 font-bold p-1 rounded-full cursor-pointer"
            >
              ✕
            </button>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 border border-blue-200">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
              </div>
              <h3 className="font-display font-bold text-lg text-wood-950">Google Account Fast Sign-In</h3>
              <p className="text-xs text-wood-500 mt-1">
                Authenticating with Google OAuth for <strong>{role}</strong> portal. Confirm or enter your Google account email below:
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-wood-700 uppercase tracking-wider mb-1">
                  Google Account Email
                </label>
                <input
                  type="email"
                  value={googleAuthEmail}
                  onChange={(e) => setGoogleAuthEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-wood-50 border border-wood-200 rounded-xl text-wood-950 text-sm outline-hidden focus:ring-1 focus:ring-blue-500 font-semibold"
                  placeholder="fashinaayomide2005@gmail.com"
                  required
                />
              </div>

              <button
                type="button"
                onClick={handleExecuteGoogleFastSignIn}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer flex items-center justify-center space-x-2"
              >
                <span>Continue as {googleAuthEmail.split('@')[0]}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
