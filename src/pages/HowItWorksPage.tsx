import React from 'react';
import {
  UtensilsCrossed,
  Cpu,
  Split,
  Bike,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Sparkles,
} from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Donor Publishes Surplus Food',
      icon: UtensilsCrossed,
      color: 'bg-amber-100 text-amber-700',
      description:
        'A restaurant or caterer logs in, enters details (servings, prep timestamp, allergens, storage temperature, pickup deadline), selects precise pickup coordinates on an interactive OpenStreetMap, and declares food safety.',
      tags: ['Commercial Donors', 'Leaflet Coordinates', 'Food Safety Checklist'],
    },
    {
      step: '02',
      title: 'Intelligent Matching Engine Scored',
      icon: Cpu,
      color: 'bg-blue-100 text-blue-700',
      description:
        'The backend computes geohashes and runs the explainable matching algorithm evaluating Distance (30%), Capacity (30%), Urgency (25%), and Dietary Compatibility (15%), ranking verified nearby NGOs.',
      tags: ['Geofire-Common', 'Explainable Score 0-100', 'No AI Hallucinations'],
    },
    {
      step: '03',
      title: 'Transactional Multi-NGO Allocation',
      icon: Split,
      color: 'bg-teal-100 text-teal-700',
      description:
        'Multiple verified NGOs can claim portions of the listing (e.g. 100 meals split into 40, 35, and 25). Executed inside an atomic Firestore transaction to guarantee zero double-reservations or over-allocations.',
      tags: ['ACID Atomicity', 'Partial Portions', 'Concurrency Protection'],
    },
    {
      step: '04',
      title: 'Volunteer Pickup & Dual OTP Verification',
      icon: Bike,
      color: 'bg-emerald-100 text-emerald-700',
      description:
        'A certified community volunteer accepts the delivery task, follows OpenStreetMap routes, verifies donor pickup via server-hashed OTP, transports food within safety windows, and hands off to the NGO with a second delivery OTP.',
      tags: ['Turn-by-turn routing', 'Server-hashed OTP', 'Dual Handshake'],
    },
    {
      step: '05',
      title: 'Credits Awarded & Verified Impact Recorded',
      icon: ShieldCheck,
      color: 'bg-purple-100 text-purple-700',
      description:
        'Upon verified delivery confirmation, an idempotent credit transaction awards non-cash volunteer credits, updates leaderboards, and logs verified meals saved and CO2 diverted in the platform impact ledger.',
      tags: ['Idempotency Ledger', 'Non-cash Recognition', 'Audited Metrics'],
    },
  ];

  return (
    <div className="space-y-12 py-6">
      <div className="max-w-3xl space-y-3">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800">
          Redistribution Pipeline
        </span>
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">How the Platform Works</h1>
        <p className="text-base text-stone-600 leading-relaxed">
          From kitchen surplus to community dining tables: every step is cryptographically verified, transactionally protected, and mapped in real time.
        </p>
      </div>

      <div className="space-y-6">
        {steps.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={item.step}
              className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center gap-6"
            >
              <div className="flex items-center space-x-4 md:w-64 shrink-0">
                <span className="text-3xl font-extrabold font-mono text-stone-300">{item.step}</span>
                <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>

              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-bold text-stone-900">{item.title}</h3>
                <p className="text-xs text-stone-600 leading-relaxed">{item.description}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-medium px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Safety Notice Card */}
      <div className="p-6 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2 text-xs text-amber-900">
        <h4 className="font-bold text-sm text-amber-950 flex items-center space-x-1.5">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>Food Safety &amp; Legal Responsibility Notice</span>
        </h4>
        <p className="leading-relaxed text-amber-800">
          This platform connects donors, NGOs, and volunteers to facilitate food redistribution. The platform algorithm and matching scores do not replace human inspection, professional food hygiene standards, or applicable municipal food safety regulations. Donors must certify storage standards and allergens before publishing listings.
        </p>
      </div>
    </div>
  );
};
