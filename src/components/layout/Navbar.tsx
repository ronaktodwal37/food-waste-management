import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '../../context/AuthContext.tsx';
import {
  Leaf,
  Menu,
  X,
  LogOut,
  User,
  Sparkles,
  ChevronDown,
  ShieldCheck,
  UtensilsCrossed,
  Building2,
  Bike,
  Users,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout, switchDemoRole } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const handleRoleSwitch = async (role: UserRole) => {
    setRoleSwitcherOpen(false);
    await switchDemoRole(role);
    if (role === 'FOOD_DONOR') navigate('/donor/dashboard');
    else if (role === 'NGO') navigate('/ngo/dashboard');
    else if (role === 'VOLUNTEER') navigate('/volunteer/dashboard');
    else if (role === 'COMMUNITY_USER') navigate('/community/dashboard');
    else if (role === 'ADMIN') navigate('/admin/dashboard');
    else navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-lg text-stone-900 tracking-tight">ZeroWaste</span>
                {currentUser && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">
                    {currentUser.role}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-500 leading-none">Redistribution Network</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                isActive('/') ? 'text-emerald-700 bg-emerald-50' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Home
            </Link>

            {/* Role-Specific Portal Links */}
            {currentUser?.role === 'FOOD_DONOR' && (
              <Link
                to="/donor/dashboard"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isActive('/donor/dashboard') ? 'text-amber-700 bg-amber-50' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Donor Dashboard
              </Link>
            )}

            {currentUser?.role === 'NGO' && (
              <Link
                to="/ngo/dashboard"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isActive('/ngo/dashboard') ? 'text-blue-700 bg-blue-50' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                NGO Discovery
              </Link>
            )}

            {currentUser?.role === 'VOLUNTEER' && (
              <Link
                to="/volunteer/dashboard"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isActive('/volunteer/dashboard') ? 'text-teal-700 bg-teal-50' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Volunteer Missions
              </Link>
            )}

            {currentUser?.role === 'COMMUNITY_USER' && (
              <Link
                to="/community/dashboard"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isActive('/community/dashboard') ? 'text-purple-700 bg-purple-50' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Community Circle
              </Link>
            )}

            {currentUser?.role === 'ADMIN' && (
              <Link
                to="/admin/dashboard"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isActive('/admin/dashboard') ? 'text-stone-900 bg-stone-200' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Admin Governance
              </Link>
            )}

            <Link
              to="/how-it-works"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                isActive('/how-it-works') ? 'text-emerald-700 bg-emerald-50' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              How It Works
            </Link>

            <Link
              to="/impact"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                isActive('/impact') ? 'text-emerald-700 bg-emerald-50' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Impact
            </Link>
          </nav>

          {/* Right Action Section */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Instant Demo Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 flex items-center space-x-1.5 transition-colors"
                title="Switch test persona"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Demo Switcher</span>
                <ChevronDown className="w-3 h-3 text-emerald-600" />
              </button>

              {roleSwitcherOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-stone-200 py-1.5 z-50 text-xs">
                  <div className="px-3 py-1 text-[10px] font-bold text-stone-400 uppercase">Switch Active Role:</div>
                  <button
                    onClick={() => handleRoleSwitch('FOOD_DONOR')}
                    className="w-full px-3 py-1.5 text-left hover:bg-stone-50 flex items-center space-x-2 text-stone-700 font-medium"
                  >
                    <UtensilsCrossed className="w-3.5 h-3.5 text-amber-500" />
                    <span>Food Donor</span>
                  </button>
                  <button
                    onClick={() => handleRoleSwitch('NGO')}
                    className="w-full px-3 py-1.5 text-left hover:bg-stone-50 flex items-center space-x-2 text-stone-700 font-medium"
                  >
                    <Building2 className="w-3.5 h-3.5 text-blue-500" />
                    <span>Verified NGO</span>
                  </button>
                  <button
                    onClick={() => handleRoleSwitch('VOLUNTEER')}
                    className="w-full px-3 py-1.5 text-left hover:bg-stone-50 flex items-center space-x-2 text-stone-700 font-medium"
                  >
                    <Bike className="w-3.5 h-3.5 text-teal-500" />
                    <span>Volunteer Courier</span>
                  </button>
                  <button
                    onClick={() => handleRoleSwitch('COMMUNITY_USER')}
                    className="w-full px-3 py-1.5 text-left hover:bg-stone-50 flex items-center space-x-2 text-stone-700 font-medium"
                  >
                    <Users className="w-3.5 h-3.5 text-purple-500" />
                    <span>Community Resident</span>
                  </button>
                  <button
                    onClick={() => handleRoleSwitch('ADMIN')}
                    className="w-full px-3 py-1.5 text-left hover:bg-stone-50 flex items-center space-x-2 text-stone-900 font-bold border-t border-stone-100"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-stone-800" />
                    <span>Administrator</span>
                  </button>
                </div>
              )}
            </div>

            {/* User Profile or Login */}
            {currentUser ? (
              <div className="flex items-center space-x-2">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-stone-600" />
                  <span className="max-w-[100px] truncate">{currentUser.displayName}</span>
                </Link>

                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-stone-700 hover:text-stone-900"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-5 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-stone-700"
          >
            Home
          </Link>
          {currentUser?.role === 'FOOD_DONOR' && (
            <Link
              to="/donor/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-amber-800 bg-amber-50 rounded"
            >
              Donor Dashboard
            </Link>
          )}
          {currentUser?.role === 'NGO' && (
            <Link
              to="/ngo/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-blue-800 bg-blue-50 rounded"
            >
              NGO Discovery
            </Link>
          )}
          {currentUser?.role === 'VOLUNTEER' && (
            <Link
              to="/volunteer/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-teal-800 bg-teal-50 rounded"
            >
              Volunteer Missions
            </Link>
          )}
          {currentUser?.role === 'COMMUNITY_USER' && (
            <Link
              to="/community/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-purple-800 bg-purple-50 rounded"
            >
              Community Circle
            </Link>
          )}
          {currentUser?.role === 'ADMIN' && (
            <Link
              to="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-stone-900 bg-stone-100 rounded"
            >
              Admin Governance
            </Link>
          )}
          <Link
            to="/how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-stone-700"
          >
            How It Works
          </Link>
          <Link
            to="/impact"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-stone-700"
          >
            Impact
          </Link>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
            {currentUser ? (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 text-xs font-semibold text-rose-700 bg-rose-50 rounded-lg text-center"
              >
                Sign Out ({currentUser.displayName})
              </button>
            ) : (
              <div className="w-full flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-xs font-semibold text-stone-700 bg-stone-100 rounded-lg text-center"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg text-center"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
