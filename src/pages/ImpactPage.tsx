import React from 'react';
import { Leaf, Award, Heart, TrendingUp, Users, ShieldCheck, Scale, Globe } from 'lucide-react';

export const ImpactPage: React.FC = () => {
  const metricCards = [
    { label: 'Meals Targeted for Redistribution', value: '500,000+', icon: Leaf, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'CO2e Emissions Targeted to Prevent', value: '1,250 Tons', icon: Globe, color: 'text-teal-600 bg-teal-50' },
    { label: 'Registered Verified NGOs', value: 'Multi-Region', icon: Heart, color: 'text-rose-600 bg-rose-50' },
    { label: 'Active Volunteer Delivery Force', value: 'Grassroots', icon: Users, color: 'text-blue-600 bg-blue-50' },
  ];

  const unGoals = [
    { number: 'Goal 2', title: 'Zero Hunger', desc: 'End hunger, achieve food security and improved nutrition.' },
    { number: 'Goal 12', title: 'Responsible Consumption', desc: 'Halve per capita global food waste at retail and consumer levels by 2030.' },
    { number: 'Goal 13', title: 'Climate Action', desc: 'Significantly reduce greenhouse gas emissions caused by landfill food rot.' },
  ];

  return (
    <div className="space-y-12 py-6">
      <div className="max-w-3xl space-y-3">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800">
          Environmental &amp; Social Impact
        </span>
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">Verified Impact Metrics</h1>
        <p className="text-base text-stone-600 leading-relaxed">
          The platform records verified redistribution transactions directly into the <code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded font-mono">impactRecords</code> ledger. No fabricated numbers — every meal is verified through delivery completion.
        </p>
      </div>

      {/* Target Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="p-6 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-3">
              <div className={`w-10 h-10 rounded-xl ${m.color} flex items-center justify-center`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-stone-900">{m.value}</p>
                <p className="text-xs text-stone-500 mt-1">{m.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sustainable Development Goals Alignment */}
      <div className="bg-stone-900 text-white rounded-3xl p-8 md:p-10 space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Global Objectives</span>
          <h2 className="text-2xl font-bold mt-1">Alignment with UN Sustainable Development Goals (SDGs)</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {unGoals.map((g) => (
            <div key={g.number} className="p-5 rounded-2xl bg-stone-800/80 border border-stone-700 space-y-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                {g.number}
              </span>
              <h3 className="font-bold text-stone-100 text-base">{g.title}</h3>
              <p className="text-xs text-stone-400 leading-relaxed">{g.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
