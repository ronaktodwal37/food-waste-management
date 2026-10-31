import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, UserRole } from '../../context/AuthContext.tsx';
import { Leaf, UserPlus, Mail, Lock, User, Phone, AlertCircle, ShieldAlert } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState<UserRole>('FOOD_DONOR');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register({ email, password, displayName, role, phoneNumber });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 mx-auto flex items-center justify-center text-white shadow-md">
          <Leaf className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-stone-900">Create Your Account</h1>
        <p className="text-xs text-stone-500">Join the zero-waste food sharing network</p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleRegister} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        {/* Role Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-stone-700">Select Stakeholder Role</label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { id: 'FOOD_DONOR', label: 'Commercial Donor', desc: 'Restaurant, Caterer' },
              { id: 'NGO', label: 'NGO / Shelter', desc: 'Charity Food Bank' },
              { id: 'VOLUNTEER', label: 'Civic Volunteer', desc: 'Food Courier' },
              { id: 'COMMUNITY_USER', label: 'Community', desc: 'Neighborhood sharing' },
            ].map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id as UserRole)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  role === r.id
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-semibold ring-1 ring-emerald-600'
                    : 'border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-300'
                }`}
              >
                <div className="font-semibold text-xs">{r.label}</div>
                <div className="text-[10px] text-stone-500">{r.desc}</div>
              </button>
            ))}
          </div>

          {role === 'NGO' && (
            <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-[11px] flex items-start space-x-2 mt-2">
              <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                NGO accounts are submitted in <strong>Pending</strong> state and must upload registration documents for administrator review before receiving donations.
              </span>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-stone-700">Full Name / Organization Name</label>
          <div className="relative">
            <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Green Leaf Bistro or Jane Doe"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-stone-700">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-stone-700">Phone Number (Optional)</label>
          <div className="relative">
            <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1 (555) 000-0000"
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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-xs flex items-center justify-center space-x-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
        </button>

        <p className="text-center text-xs text-stone-500 pt-1">
          Already registered?{' '}
          <Link to="/login" className="text-emerald-700 font-semibold hover:underline">
            Sign in here
          </Link>
        </p>
      </form>
    </div>
  );
};
