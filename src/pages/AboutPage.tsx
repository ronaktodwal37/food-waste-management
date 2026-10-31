import React from 'react';
import { Leaf, ShieldAlert, Heart, Scale, Building, Code2, Users2 } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-12 py-6 max-w-4xl mx-auto">
      <div className="space-y-3">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800">
          About the Initiative
        </span>
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">Zero-Waste Food Redistribution</h1>
        <p className="text-base text-stone-600 leading-relaxed">
          Over one-third of all food produced globally is discarded, while millions experience food insecurity. This platform is engineered to dismantle the logistical bottlenecks preventing high-quality surplus commercial food from reaching those in need.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Leaf className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-stone-900 text-lg">Our Mission</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            To provide zero-friction digital coordination between food businesses, vetted charity shelters, and civic volunteers. Every transaction is transparent, audited, and optimized for speed and safety.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-stone-900 text-lg">Verified NGO Partnership</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Only vetted NGOs with verified administrative credentials and cold-storage compliance are cleared to receive commercial donations, ensuring dignified and safe distribution.
          </p>
        </div>
      </div>

      {/* Food Safety & Liability Principles */}
      <div className="p-8 rounded-3xl bg-stone-100 border border-stone-200 space-y-4">
        <div className="flex items-center space-x-2 text-stone-900">
          <ShieldAlert className="w-5 h-5 text-amber-600" />
          <h3 className="font-bold text-base">Platform Food Safety Framework</h3>
        </div>
        <p className="text-xs text-stone-600 leading-relaxed">
          The platform enforces mandatory data collection for food items: preparation timestamps, safe consumption windows, allergen tags, and storage conditions (hot holding, refrigerated, room temperature).
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-white rounded-xl border border-stone-200">
            <span className="font-semibold text-stone-800 block">Strict Window</span>
            <span className="text-stone-500 text-[11px]">Unclaimed listings automatically expire before safe consumption limits.</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-stone-200">
            <span className="font-semibold text-stone-800 block">Dual Handshake</span>
            <span className="text-stone-500 text-[11px]">Server-generated OTPs verify pickup and delivery chain of custody.</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-stone-200">
            <span className="font-semibold text-stone-800 block">Report &amp; Discard</span>
            <span className="text-stone-500 text-[11px]">NGOs and volunteers can flag temperature breaks or unsafe conditions immediately.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
