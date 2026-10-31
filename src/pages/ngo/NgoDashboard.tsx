import React, { useState, useEffect } from 'react';
import { ngoApi } from '../../services/api.ts';
import { DiscoveryMap } from '../../components/maps/DiscoveryMap.tsx';
import { LocationPickerMap } from '../../components/maps/LocationPickerMap.tsx';
import {
  Building2,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  Send,
  Split,
  RefreshCw,
  X,
  FileText,
} from 'lucide-react';

export const NgoDashboard: React.FC = () => {
  const [profileData, setProfileData] = useState<any | null>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Claim Modal
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<any | null>(null);
  const [claimQuantity, setClaimQuantity] = useState<number>(10);
  const [claiming, setClaiming] = useState(false);

  // Org registration / update modal
  const [orgModalOpen, setOrgModalOpen] = useState(false);
  const [orgName, setOrgName] = useState('Hope Haven Shelter & Food Bank');
  const [regNumber, setRegNumber] = useState('TAX-NGO-88219');
  const [address, setAddress] = useState('1050 Mission Street, Civic Center');
  const [location, setLocation] = useState({ latitude: 37.7812, longitude: -122.4111 });
  const [capacity, setCapacity] = useState<number>(200);
  const [radius, setRadius] = useState<number>(15);
  const [docUrl, setDocUrl] = useState('https://example.com/docs/501c3-certificate.pdf');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profRes, discRes, allocRes] = await Promise.all([
        ngoApi.getProfile(),
        ngoApi.discoverFood(),
        ngoApi.getMyAllocations(),
      ]);
      setProfileData(profRes.data);
      setListings(discRes.data.listings || []);
      setAllocations(allocRes.data.allocations || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRegisterOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ngoApi.registerOrg({
        name: orgName,
        registrationNumber: regNumber,
        address,
        location,
        receivingCapacityServings: Number(capacity),
        serviceRadiusKm: Number(radius),
        dietaryPreferences: ['GENERAL', 'VEGETARIAN'],
        verificationDocUrls: [docUrl],
      });
      setOrgModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Submission failed');
    }
  };

  const handleOpenClaim = (listing: any) => {
    setSelectedListing(listing);
    setClaimQuantity(listing.remainingServings || listing.totalServings || 10);
    setClaimModalOpen(true);
  };

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListing) return;
    setClaiming(true);
    try {
      await ngoApi.claimAllocation({
        listingId: selectedListing.listingId,
        requestedServings: Number(claimQuantity),
      });
      setClaimModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Claim failed');
    } finally {
      setClaiming(false);
    }
  };

  const isApproved = profileData?.isApproved;

  // Prepare map items
  const mapItems = listings.map((l) => ({
    id: l.listingId,
    type: 'LISTING' as const,
    title: l.foodName,
    servings: l.remainingServings,
    location: l.pickupLocation,
    address: l.pickupAddress,
    matchScore: l.matchScore,
    onSelect: () => handleOpenClaim(l),
  }));

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200 gap-4">
        <div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-blue-100 text-blue-800">
            Verified NGO &amp; Food Bank Portal
          </span>
          <h1 className="text-2xl font-extrabold text-stone-900 mt-1">Surplus Food Discovery &amp; Intake</h1>
          <p className="text-xs text-stone-500">
            Discover nearby commercial food donations scored by proximity, capacity, and urgency.
          </p>
        </div>

        <button
          onClick={() => setOrgModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-900 text-white font-semibold text-xs transition-colors flex items-center space-x-2 shrink-0"
        >
          <Building2 className="w-4 h-4" />
          <span>{profileData?.organization ? 'Edit Organization Profile' : 'Submit Organization Profile'}</span>
        </button>
      </div>

      {/* Verification Status Banner */}
      {!isApproved ? (
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
          <div className="flex items-center space-x-2 font-bold text-sm text-amber-950">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <span>Verification Status: Pending Administrator Approval</span>
          </div>
          <p className="text-xs leading-relaxed text-amber-800">
            Your NGO registration is undergoing compliance review by platform administrators. You can browse nearby donations and examine matching metrics, but claiming food allocations is locked until verification is approved.
          </p>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-xs font-bold text-emerald-950">Approved NGO Partner</p>
              <p className="text-[11px] text-emerald-700">Cleared for atomic multi-NGO food allocation claims</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
            VERIFIED
          </span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* OpenStreetMap Food Discovery */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-900">Live Nearby Donations Map</h2>
          <span className="text-xs text-stone-500">OpenStreetMap + Geofire</span>
        </div>
        <DiscoveryMap items={mapItems} height="360px" />
      </div>

      {/* Food Listings with Explainable Match Scores */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-900">Available Surplus Food Donations</h2>
            <p className="text-xs text-stone-500">Ranked by explainable matching score (0-100%)</p>
          </div>
          <button onClick={fetchData} className="text-xs text-stone-600 hover:text-stone-900 flex items-center space-x-1">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {listings.length === 0 ? (
          <div className="p-8 bg-white rounded-2xl border border-stone-200 text-center text-xs text-stone-500">
            No active surplus donations currently available in this radius.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {listings.map((l) => (
              <div key={l.listingId} className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                        {l.category}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {l.storageCondition}
                      </span>
                    </div>
                    <h3 className="font-bold text-stone-900 text-base mt-1.5">{l.foodName}</h3>
                  </div>

                  {/* Matching score pill */}
                  <div className="text-right shrink-0">
                    <span className="inline-block text-xs font-black px-2.5 py-1 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs">
                      {l.matchScore}% Match
                    </span>
                    <span className="block text-[10px] text-stone-500 mt-0.5 font-medium">{l.distanceKm} km away</span>
                  </div>
                </div>

                {/* Servings details */}
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-stone-500 text-[11px] block">Available Servings</span>
                    <span className="font-bold text-stone-900 text-sm">
                      {l.remainingServings} of {l.totalServings} {l.unit}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-stone-500 text-[11px] block">Pickup Deadline</span>
                    <span className="font-semibold text-rose-700">
                      {new Date(l.pickupDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Explainable Reasons */}
                {l.reasons && l.reasons.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Match Factors:</span>
                    <div className="flex flex-wrap gap-1 text-[11px]">
                      {l.reasons.map((r: string, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                          ✓ {r}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Claim Button */}
                <button
                  onClick={() => handleOpenClaim(l)}
                  disabled={!isApproved}
                  className="w-full py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-1.5"
                >
                  <Split className="w-3.5 h-3.5" />
                  <span>{isApproved ? 'Claim Portions (Multi-NGO Allocation)' : 'Verification Required to Claim'}</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Claim Modal with Atomic Portion Selection */}
      {claimModalOpen && selectedListing && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-bold text-base text-stone-900">Claim Food Allocation</h3>
              <button onClick={() => setClaimModalOpen(false)} className="text-stone-400 hover:text-stone-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl space-y-1 text-xs">
              <p className="font-bold text-stone-900">{selectedListing.foodName}</p>
              <p className="text-stone-500">Remaining available: {selectedListing.remainingServings} {selectedListing.unit}</p>
            </div>

            <form onSubmit={handleClaim} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  How many servings can your shelter absorb?
                </label>
                <input
                  type="number"
                  min={1}
                  max={selectedListing.remainingServings}
                  required
                  value={claimQuantity}
                  onChange={(e) => setClaimQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200"
                />
                <span className="text-[11px] text-stone-500 mt-1 block">
                  Other NGOs will be able to claim any remaining portions.
                </span>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl text-[11px] text-emerald-900 space-y-1">
                <p className="font-bold">Atomic ACID Guarantee:</p>
                <p>This claim executes in an isolated Firestore transaction. The quantity will be deducted atomically and a volunteer delivery task will be generated automatically.</p>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setClaimModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={claiming}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                >
                  {claiming ? 'Confirming Claim...' : 'Confirm Allocation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: NGO Org Details */}
      {orgModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-bold text-base text-stone-900">NGO Organization Profile &amp; Verification</h3>
              <button onClick={() => setOrgModalOpen(false)} className="text-stone-400 hover:text-stone-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterOrg} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Organization Name</label>
                <input
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Tax / Charity Registration #</label>
                  <input
                    type="text"
                    required
                    value={regNumber}
                    onChange={(e) => setRegNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Max Daily Servings Capacity</label>
                  <input
                    type="number"
                    required
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Service Radius (km)</label>
                <input
                  type="number"
                  required
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Verification Document URL (PDF/Image)</label>
                <input
                  type="url"
                  required
                  value={docUrl}
                  onChange={(e) => setDocUrl(e.target.value)}
                  placeholder="https://example.com/docs/charity-cert.pdf"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Drop-off Coordinates (Leaflet Map)</label>
                <LocationPickerMap
                  initialLocation={location}
                  onLocationChange={(loc) => setLocation(loc)}
                  height="200px"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOrgModalOpen(false)}
                  className="px-4 py-2 font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
                >
                  Save &amp; Submit for Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
