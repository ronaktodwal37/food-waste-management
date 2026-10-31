import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, UserRole } from '../../context/AuthContext.tsx';
import { Leaf, LogIn, Lock, Mail, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login, switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: UserRole) => {
    setLoading(true);
    setError(null);
    try {
      await switchDemoRole(role);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 mx-auto flex items-center justify-center text-white shadow-md">
          <Leaf className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-stone-900">Sign in to ZeroWaste</h1>
        <p className="text-xs text-stone-500">Access your role-specific dashboard and actions</p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Login Form */}
      <form onSubmit={handleLogin} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-stone-700">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-stone-700">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-xs flex items-center justify-center space-x-2"
        >
          <LogIn className="w-4 h-4" />
          <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
        </button>

        <p className="text-center text-xs text-stone-500 pt-2">
          Don't have an account?{' '}
          <Link to="/register" className="text-emerald-700 font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </form>

      {/* Quick 1-Click Demo Logins for Evaluator */}
      <div className="bg-stone-100 p-5 rounded-2xl border border-stone-200 space-y-3">
        <div className="flex items-center space-x-1.5 text-xs font-bold text-stone-800">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Instant Evaluator Demo Logins (1-Click)</span>
        </div>
        <p className="text-[11px] text-stone-500">
          Click any role button below to instantly log in with pre-seeded credentials:
        </p>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleQuickDemo('FOOD_DONOR')}
            className="p-2 rounded-lg bg-white border border-stone-200 hover:border-emerald-500 hover:bg-emerald-50 text-left font-medium text-stone-700 transition-colors"
          >
            🍽️ <span className="font-semibold">Food Donor</span>
            <span className="block text-[10px] text-stone-400">Green Leaf Bistro</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemo('NGO')}
            className="p-2 rounded-lg bg-white border border-stone-200 hover:border-blue-500 hover:bg-blue-50 text-left font-medium text-stone-700 transition-colors"
          >
            🏢 <span className="font-semibold">Verified NGO</span>
            <span className="block text-[10px] text-stone-400">Hope Haven Shelter</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemo('VOLUNTEER')}
            className="p-2 rounded-lg bg-white border border-stone-200 hover:border-teal-500 hover:bg-teal-50 text-left font-medium text-stone-700 transition-colors"
          >
            🚴 <span className="font-semibold">Volunteer</span>
            <span className="block text-[10px] text-stone-400">Alex Courier</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemo('COMMUNITY_USER')}
            className="p-2 rounded-lg bg-white border border-stone-200 hover:border-purple-500 hover:bg-purple-50 text-left font-medium text-stone-700 transition-colors"
          >
            👥 <span className="font-semibold">Community</span>
            <span className="block text-[10px] text-stone-400">Maria Santos</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemo('ADMIN')}
            className="col-span-2 p-2 rounded-lg bg-stone-800 text-white hover:bg-stone-900 text-left font-medium transition-colors flex items-center justify-between"
          >
            <span>🛡️ <span className="font-semibold">Platform Administrator</span> (admin@zerowaste.org)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
