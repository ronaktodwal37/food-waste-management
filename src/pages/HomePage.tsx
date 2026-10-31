import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HealthBadge } from '../components/common/HealthBadge.tsx';
import { useAuth, UserRole } from '../context/AuthContext.tsx';
import {
  UtensilsCrossed,
  Building2,
  Bike,
  Users,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Layers,
  Terminal,
  ExternalLink,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const handleLaunchRole = async (role: UserRole, path: string) => {
    await switchDemoRole(role);
    navigate(path);
  };

  const roles = [
    {
      title: 'Commercial Food Donor',
      badge: 'FOOD_DONOR' as UserRole,
      path: '/donor/dashboard',
      icon: UtensilsCrossed,
      color: 'from-amber-500 to-orange-500',
      description: 'Restaurants, caterers, hotels, and college messes publish surplus food with pickup deadlines, portions, and storage guidelines.',
      features: ['Listing creation with Leaflet maps', 'AI matching score preview', 'Multi-NGO allocation tracking', 'Real-time OTP pickup verification'],
    },
    {
      title: 'Verified NGO / Shelter',
      badge: 'NGO' as UserRole,
      path: '/ngo/dashboard',
      icon: Building2,
      color: 'from-blue-600 to-indigo-600',
      description: 'Charities and food banks discover nearby food matching their capacity and dietary needs, claiming full or partial portions.',
      features: ['Admin document verification', 'Dynamic receiving capacity', 'Automated geohash matching engine', 'Discrepancy reporting & delivery intake'],
    },
    {
      title: 'Community Volunteer',
      badge: 'VOLUNTEER' as UserRole,
      path: '/volunteer/dashboard',
      icon: Bike,
      color: 'from-emerald-500 to-teal-600',
      description: 'Civic couriers collect surplus food from donors and safely deliver it to recipient NGOs using turn-by-turn routing and OTP verification.',
      features: ['OpenStreetMap pickup/drop routes', 'Cryptographic OTP dual-verification', 'Non-cash credit recognition ledger', 'Achievements & monthly leaderboard'],
    },
    {
      title: 'Community Resident',
      badge: 'COMMUNITY_USER' as UserRole,
      path: '/community/dashboard',
      icon: Users,
      color: 'from-purple-500 to-pink-500',
      description: 'Local neighbors share homegrown produce, surplus groceries, or request meals in a grassroots peer-to-peer sharing circle.',
      features: ['Peer-to-peer neighborhood listings', 'One-click reservation', 'Unsafe food reporting mechanisms', 'Community pickup coordination'],
    },
    {
      title: 'Platform Administrator',
      badge: 'ADMIN' as UserRole,
      path: '/admin/dashboard',
      icon: ShieldCheck,
      color: 'from-stone-700 to-stone-900',
      description: 'Oversees safety compliance, reviews NGO legal documents, audits allocation transactions, and monitors platform impact analytics.',
      features: ['NGO verification & approval queue', 'Audit log inspection', 'Volunteer credit rule manager', 'System safety reports & suspensions'],
    },
  ];

  const fullStackHighlights = [
    { title: 'Server-Side RBAC & Token Auth', desc: 'Strict role verification via Firebase Admin SDK; no frontend role spoofing' },
    { title: 'Explainable Matching Algorithm', desc: '30% distance, 30% capacity, 25% urgency, 15% dietary compatibility' },
    { title: 'Atomic Multi-NGO Allocations', desc: 'Firestore transactions preventing over-allocation or double-claims' },
    { title: 'Cryptographic Dual OTP Handshake', desc: 'Secure donor pickup & NGO drop-off verification with SHA-256' },
    { title: 'Volunteer Credit Ledger', desc: 'Idempotent rewards, milestone badges, and monthly leaderboard' },
    { title: 'OpenStreetMap & Leaflet', desc: 'Interactive coordinate picking, discovery radius, and transit routing' },
  ];

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-emerald-900 via-emerald-850 to-stone-900 text-white p-8 md:p-14 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>End-to-End Operational Platform — Live and Fully Integrated</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Zero-Waste Food Sharing &amp; Redistribution Platform
          </h1>

          <p className="text-stone-300 text-base sm:text-lg leading-relaxed">
            Bridging restaurants, hotels, hostels, and caterers with certified NGOs, community volunteers, and local residents. Eliminating food waste through intelligent geohash matching, atomic multi-NGO allocations, and verified delivery.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/donor/dashboard"
              className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-semibold text-sm transition-all shadow-md flex items-center space-x-2"
            >
              <span>Explore Portals</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#health-section"
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-sm border border-white/20 transition-all flex items-center space-x-2"
            >
              <Terminal className="w-4 h-4" />
              <span>Inspect Live API Diagnostics</span>
            </a>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 top-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Backend Health Check Verification Section */}
      <section id="health-section" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-stone-900">Live Backend Health &amp; Integration Diagnostics</h2>
            <p className="text-sm text-stone-500">
              The Express backend is live, answering REST calls and executing transactions.
            </p>
          </div>
          <span className="text-xs font-mono bg-stone-100 text-stone-700 px-2.5 py-1 rounded-md border border-stone-200">
            HTTP 200 OK
          </span>
        </div>

        <HealthBadge />
      </section>

      {/* Five User Roles Grid */}
      <section className="space-y-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-stone-100 text-stone-700 text-xs font-semibold mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Role-Based Access Control</span>
          </div>
          <h2 className="text-2xl font-bold text-stone-900">Five Dedicated Stakeholder Portals</h2>
          <p className="text-sm text-stone-600 max-w-2xl mt-1">
            Every stakeholder has a dedicated workflow. Click <strong>"Launch Portal"</strong> to instantly enter that persona with pre-seeded demo credentials.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <div
                key={role.badge}
                className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${role.color} text-white flex items-center justify-center shadow-sm`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-semibold border border-stone-200">
                      {role.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-stone-900 text-lg">{role.title}</h3>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">{role.description}</p>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-stone-100">
                    <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Key Capabilities</p>
                    <ul className="text-xs space-y-1 text-stone-600">
                      {role.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center space-x-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[11px] text-stone-400">1-Click Launch:</span>
                  <button
                    onClick={() => handleLaunchRole(role.badge, role.path)}
                    className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center space-x-1 shadow-xs"
                  >
                    <span>Launch Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Platform Architecture & Guarantees */}
      <section className="bg-stone-50 rounded-3xl p-8 border border-stone-200 space-y-6">
        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Architecture &amp; Integrity</span>
          <h2 className="text-2xl font-bold text-stone-900 mt-1">End-to-End System Guarantees</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {fullStackHighlights.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-white border border-stone-200 space-y-1">
              <h4 className="font-bold text-stone-900 text-sm">{item.title}</h4>
              <p className="text-xs text-stone-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
