import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { User, ShieldCheck, Mail, Phone, Building2, Award } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return (
      <div className="py-12 text-center text-xs text-stone-500">
        Please sign in to view your profile.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-xs space-y-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-2xl shadow-md">
            {currentUser.displayName?.[0] || 'U'}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-stone-900">{currentUser.displayName}</h1>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                {currentUser.role}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">{currentUser.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-4 border-t border-stone-100">
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-150 space-y-1">
            <span className="text-stone-400 block font-medium">Account Status</span>
            <span className="font-bold text-emerald-700 text-sm">{currentUser.status || 'ACTIVE'}</span>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-150 space-y-1">
            <span className="text-stone-400 block font-medium">Compliance Verification</span>
            <span className="font-bold text-stone-900 text-sm">
              {currentUser.role === 'NGO'
                ? currentUser.isApproved
                  ? 'Verified by Admin ✓'
                  : 'Pending Admin Review'
                : 'Verified'}
            </span>
          </div>
        </div>

        {currentUser.organization && (
          <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
            <h3 className="font-bold text-sm text-stone-900 flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>Associated Organization</span>
            </h3>
            <div className="text-xs space-y-1 text-stone-600">
              <p><strong>Name:</strong> {currentUser.organization.name}</p>
              <p><strong>Registration Number:</strong> {currentUser.organization.registrationNumber}</p>
              <p><strong>Address:</strong> {currentUser.organization.address}</p>
              {currentUser.organization.receivingCapacityServings && (
                <p><strong>Receiving Capacity:</strong> {currentUser.organization.receivingCapacityServings} meals/day</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
