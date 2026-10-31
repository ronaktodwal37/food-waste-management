import React from 'react';
import { Leaf, Heart, Shield, Database, MapPin, Server } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand and Mission */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center space-x-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                <Leaf className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg">ZeroWaste</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Real-time food redistribution platform bridging commercial food donors, certified NGOs, volunteers, and local communities to systematically eliminate food waste.
            </p>
          </div>

          {/* User Roles */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-200">User Roles</h4>
            <ul className="text-xs space-y-1.5 text-stone-400">
              <li>• Commercial Food Donors</li>
              <li>• Verified NGOs & Shelters</li>
              <li>• Community Volunteers</li>
              <li>• Community Residents</li>
              <li>• Platform Administrators</li>
            </ul>
          </div>

          {/* Technology Stack */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-200">Tech Architecture</h4>
            <ul className="text-xs space-y-1.5 text-stone-400">
              <li className="flex items-center space-x-1.5">
                <Server className="w-3.5 h-3.5 text-emerald-400" />
                <span>Express.js & Node.js REST API</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Database className="w-3.5 h-3.5 text-amber-400" />
                <span>Firebase Admin & Firestore</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-400" />
                <span>OpenStreetMap & Leaflet</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span>Server-side RBAC & Token Auth</span>
              </li>
            </ul>
          </div>

          {/* Phase 1 Status */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Current Roadmap Status</h4>
            <div className="p-3 bg-stone-800/80 rounded-lg border border-stone-700 space-y-2 text-xs">
              <div className="flex items-center justify-between text-white font-medium">
                <span>Phase 1 of 12</span>
                <span className="text-emerald-400">Complete & Ready</span>
              </div>
              <p className="text-[11px] text-stone-400">
                Foundations, Express backend, React client, Tailwind, Firebase placeholders, & Health API verified.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} Zero-Waste Food Sharing & Redistribution Platform. Open source sustainability initiative.</p>
          <div className="flex items-center space-x-1 text-stone-400">
            <span>Built with commitment for</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline mx-0.5" />
            <span>zero hunger & zero waste</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
