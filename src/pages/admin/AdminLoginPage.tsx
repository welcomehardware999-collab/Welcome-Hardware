import React, { useState } from 'react';
import { ArrowRight, AlertTriangle, Store, Loader2, Eye, EyeOff, ShieldCheck, UserCheck } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

interface AdminLoginPageProps {
  navigate: (path: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ navigate }) => {
  const { loginWithCredentials } = useAdmin();
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedId = adminId.trim();
    const trimmedPw = password.trim();

    if (!trimmedId) {
      setError('Please enter your authorized Admin ID.');
      return;
    }

    if (!trimmedPw) {
      setError('Please enter the Admin password.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const result = await loginWithCredentials(trimmedId, trimmedPw);
      if (result.success) {
        navigate('/admin');
      } else {
        setError(result.error || 'Invalid Admin ID or Password. Access denied.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-amber-500 selection:text-slate-950">
      
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="inline-block bg-white p-2.5 rounded-2xl shadow-2xl border border-slate-800">
          <img
            src="/welcome-hardware-logo.svg"
            alt="Welcome Hardware"
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-xl mx-auto"
          />
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
            Welcome Hardware Admin Portal
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Store Management Terminal • Near Theosophical Women's College, Hampi Road, HOSAPETE
          </p>
        </div>
      </div>

      {/* Sign-In Card */}
      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900 border border-slate-800/90 py-8 px-6 sm:px-9 shadow-2xl rounded-2xl space-y-6">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Authorized Sign-In
              </span>
            </div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-800/80 px-2 py-0.5 rounded">
              Two-ID Access
            </span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-rose-950/70 border border-rose-800/70 rounded-xl p-3.5 text-xs text-rose-200 flex items-start gap-2.5 animate-shake">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5 flex-1">
                <p className="font-semibold">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Admin ID Input */}
            <div>
              <label htmlFor="admin-id-input" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Admin ID
              </label>
              <div className="relative">
                <input
                  id="admin-id-input"
                  type="text"
                  value={adminId}
                  disabled={submitting}
                  onChange={(e) => {
                    setAdminId(e.target.value);
                    setError(null);
                  }}
                  className="w-full text-sm font-medium bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                  placeholder="Enter authorized Admin ID"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck="false"
                  autoFocus
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                  <UserCheck className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="admin-pw-input" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="admin-pw-input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  disabled={submitting}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  className="w-full text-sm font-medium bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-3.5 pr-10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                  placeholder="Enter admin password"
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-400 transition p-1"
                  title={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting || !adminId.trim() || !password.trim()}
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-black uppercase tracking-wider text-xs shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? (
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
            </div>
          </form>

          {/* Return to Customer Storefront Link */}
          <div className="border-t border-slate-800 pt-4 flex items-center justify-between text-xs text-slate-400">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1.5 text-slate-300 hover:text-amber-400 transition"
            >
              <Store className="w-3.5 h-3.5 text-amber-500" />
              <span>Return to Storefront</span>
            </button>
            <span className="text-[11px] text-slate-500">
              Hosapete Store Counter
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};
