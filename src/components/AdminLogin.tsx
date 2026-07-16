import React, { useState } from 'react';
import { Lock, Shield, AlertTriangle, ArrowLeft } from 'lucide-react';

interface AdminLoginProps {
  onSuccess: (token: string) => void;
}

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid credentials');
      } else {
        onSuccess(data.token);
      }
    } catch (err) {
      setError('Failed to connect to administrative server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-wood-950 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden selection:bg-amber-500 selection:text-wood-950">
      {/* Decorative Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      
      <div className="w-full max-w-md bg-wood-900 border border-wood-800 rounded-3xl p-8 shadow-2xl relative z-10 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/20">
            <Shield size={28} />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-white tracking-tight">Administrative Portal</h1>
            <p className="text-xs text-wood-400 mt-1">Gated access for authorized Dormiversity personnel only</p>
          </div>
        </div>

        {/* Lock Warning */}
        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-start space-x-3 text-xs">
          <AlertTriangle className="text-amber-500 mt-0.5 flex-shrink-0" size={16} />
          <div className="text-amber-200 leading-relaxed">
            <strong>Brute-force lockout active:</strong> Repeated incorrect password submissions will result in temporary lockouts. All login attempts are audited.
          </div>
        </div>

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-wood-300 uppercase tracking-wider">System Password</label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-wood-500"><Lock size={16} /></span>
              <input
                type="password"
                required
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••••"
                className="w-full bg-wood-950/50 border border-wood-800 text-white rounded-xl py-3.5 pl-11 pr-4 text-sm font-semibold outline-hidden placeholder-wood-700 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/15 border border-red-500/30 text-red-200 p-3.5 rounded-xl text-xs text-center font-medium leading-relaxed">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !password}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 disabled:bg-wood-800 disabled:text-wood-600 text-wood-950 font-bold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-wood-950 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span>Verify Access Key</span>
            )}
          </button>
        </form>

        {/* Back Link */}
        <div className="text-center pt-2">
          <button
            onClick={() => {
              window.history.pushState({}, '', '/');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-wood-500 hover:text-wood-300 transition-colors cursor-pointer"
          >
            <ArrowLeft size={12} />
            <span>Return to Homepage</span>
          </button>
        </div>

      </div>

      {/* Demo helper reminder badge */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-wood-900 border border-wood-800 px-4 py-2.5 rounded-xl text-[10px] text-wood-400 font-medium z-10 text-center shadow-lg">
        💡 <strong>Demo Helper:</strong> Use password defined in <code className="bg-wood-950 px-1 py-0.5 rounded text-amber-400 text-[9px]">.env</code> or default <code className="bg-wood-950 px-1 py-0.5 rounded text-amber-400 text-[9px]">dormiversity_admin_2026</code> to log in.
      </div>
    </div>
  );
}
