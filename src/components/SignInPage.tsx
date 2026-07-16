import React, { useState } from 'react';
import { GraduationCap, ArrowLeft, Mail, Lock, ShieldCheck, HelpCircle, Eye, EyeOff } from 'lucide-react';
import { User, UserRole } from '../types';

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

            {/* Role Select tab */}
            <div>
              <label className="block text-xs font-bold text-wood-700 uppercase tracking-wider mb-2">
                Signing In As:
              </label>
              <div className="grid grid-cols-4 gap-1 p-1 bg-wood-50 rounded-xl border border-wood-200">
                {(['STUDENT', 'LANDLORD', 'INSPECTOR', 'ADMIN'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setRole(r);
                      setErrorMsg('');
                    }}
                    className={`py-2 text-[10px] font-bold rounded-lg transition-all cursor-pointer text-center ${
                      role === r
                        ? 'bg-wood-900 text-white shadow-xs'
                        : 'text-wood-600 hover:text-wood-950'
                    }`}
                  >
                    {r === 'ADMIN' ? 'Admin' : r.charAt(0) + r.slice(1).toLowerCase()}
                  </button>
                ))}
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
              className="w-full py-3.5 wood-pattern-btn text-white font-bold rounded-xl text-sm shadow-md mt-6 cursor-pointer flex items-center justify-center"
            >
              <span>Verify & Sign In</span>
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
                  const res = await fetch(`/api/auth/google/url?role=${role}`);
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
                      alert('Please allow popups to sign in with Google.');
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
              <span>Sign In with Google</span>
            </button>
          </form>

          {/* Secure Platform Policy Guard */}
          <div className="mt-6 pt-5 border-t border-wood-100 flex items-start space-x-2 text-[11px] text-wood-500 leading-normal">
            <ShieldCheck size={16} className="text-wood-400 shrink-0 mt-0.5" />
            <p>
              Your session is protected with escrow security safeguards. Do not share credentials or transfer funds outside of the Paystack gateway.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
