import React, { useState, useEffect } from 'react';
import { donorApi } from '../../services/api.ts';
import { LocationPickerMap } from '../../components/maps/LocationPickerMap.tsx';
import {
  UtensilsCrossed,
  Plus,
  Clock,
  MapPin,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Users,
  ShieldCheck,
  Trash2,
  Eye,
  RefreshCw,
  X,
} from 'lucide-react';

export const DonorDashboard: React.FC = () => {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [matchModalOpen, setMatchModalOpen] = useState<boolean>(false);
  const [allocModalOpen, setAllocModalOpen] = useState<boolean>(false);
  const [selectedListing, setSelectedListing] = useState<any | null>(null);
  const [matchingNgos, setMatchingNgos] = useState<any[]>([]);
  const [allocationDetails, setAllocationDetails] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [foodName, setFoodName] = useState('');
  const [category, setCategory] = useState('COOKED_MEALS');
  const [totalServings, setTotalServings] = useState<number>(50);
  const [unit, setUnit] = useState('meals');
  const [storageCondition, setStorageCondition] = useState('HOT_HEATED');
  const [allergens, setAllergens] = useState<string[]>([]);
  const [pickupAddress, setPickupAddress] = useState('742 Evergreen Terrace, Downtown');
  const [pickupLocation, setPickupLocation] = useState({ latitude: 37.7749, longitude: -122.4194 });
  const [safetySigned, setSafetySigned] = useState(false);

  // Expiry & Prep Timestamps (defaults: prepared 1 hour ago, pickup deadline in 5 hours)
  const [prepTime, setPrepTime] = useState(new Date(Date.now() - 3600000).toISOString().slice(0, 16));
  const [deadline, setDeadline] = useState(new Date(Date.now() + 5 * 3600000).toISOString().slice(0, 16));

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await donorApi.getMyListings();
      setListings(res.data.listings || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!safetySigned) {
      alert('You must sign the Food Safety Declaration to publish surplus food.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await donorApi.createListing({
        foodName,
        category,
        totalServings: Number(totalServings),
        unit,
        preparationTime: new Date(prepTime).toISOString(),
        pickupDeadline: new Date(deadline).toISOString(),
        storageCondition,
        allergens,
        safetyDeclarationSigned: true,
        pickupAddress,
        pickupLocation,
        imageUrls: ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'],
      });
      setCreateModalOpen(false);
      fetchListings();
    } catch (err: any) {
      setError(err.message || 'Failed to create listing');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenMatches = async (listing: any) => {
    setSelectedListing(listing);
    setMatchModalOpen(true);
    try {
      const res = await donorApi.getListingMatches(listing.listingId);
      setMatchingNgos(res.data.matches || []);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleOpenAllocations = async (listing: any) => {
    setSelectedListing(listing);
    setAllocModalOpen(true);
    try {
      const res = await donorApi.getListingAllocations(listing.listingId);
      setAllocationDetails(res.data);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleCancelListing = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this listing?')) return;
    try {
      await donorApi.deleteListing(id);
      fetchListings();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const toggleAllergen = (item: string) => {
    setAllergens((prev) => (prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]));
  };

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200 gap-4">
        <div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-amber-100 text-amber-800">
            Commercial Donor Portal
          </span>
          <h1 className="text-2xl font-extrabold text-stone-900 mt-1">Food Donation Management</h1>
          <p className="text-xs text-stone-500">
            Publish surplus portions, inspect real-time NGO match scores, and track multi-NGO allocations.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-xs flex items-center space-x-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Food Donation</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Listings Table / Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-900">Your Active &amp; Historical Donations</h2>
          <button
            onClick={fetchListings}
            className="text-xs text-stone-600 hover:text-stone-900 flex items-center space-x-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-stone-500">Loading donation listings...</div>
        ) : listings.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center space-y-3">
            <UtensilsCrossed className="w-10 h-10 text-stone-300 mx-auto" />
            <h3 className="text-base font-bold text-stone-800">No Food Listings Yet</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              You haven't published any food surplus yet. Publish a batch of meals to start matching with verified NGOs.
            </p>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold"
            >
              Post First Donation
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {listings.map((item) => {
              const remaining = item.remainingServings ?? item.totalServings;
              const allocated = item.totalServings - remaining;
              const percentAllocated = Math.round((allocated / item.totalServings) * 100);

              return (
                <div key={item.listingId} className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                          {item.category}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            item.status === 'AVAILABLE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'PARTIALLY_ALLOCATED'
                              ? 'bg-blue-100 text-blue-800'
                              : item.status === 'FULLY_ALLOCATED'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-stone-200 text-stone-700'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <h3 className="font-bold text-stone-900 text-base mt-1.5">{item.foodName}</h3>
                    </div>

                    {item.status === 'AVAILABLE' && (
                      <button
                        onClick={() => handleCancelListing(item.listingId)}
                        className="text-stone-400 hover:text-red-600 p-1 rounded"
                        title="Cancel listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Allocation Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-stone-700">
                      <span>Redistribution Progress:</span>
                      <span>
                        {allocated} / {item.totalServings} {item.unit} claimed ({percentAllocated}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-stone-100 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all"
                        style={{ width: `${percentAllocated}%` }}
                      />
                    </div>
                  </div>

                  {/* Details meta */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-stone-600 pt-2 border-t border-stone-100">
                    <div className="flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      <span>Deadline: {new Date(item.pickupDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      <span className="truncate">{item.pickupAddress}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 pt-2">
                    <button
                      onClick={() => handleOpenMatches(item)}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition-colors flex items-center justify-center space-x-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Matching NGOs</span>
                    </button>

                    <button
                      onClick={() => handleOpenAllocations(item)}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors flex items-center justify-center space-x-1"
                    >
                      <Users className="w-3.5 h-3.5 text-stone-600" />
                      <span>Allocations &amp; OTP</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Create Food Listing */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center space-x-2">
                <UtensilsCrossed className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-lg text-stone-900">Publish Surplus Food Donation</h3>
              </div>
              <button onClick={() => setCreateModalOpen(false)} className="text-stone-400 hover:text-stone-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateListing} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Food Item Name / Title</label>
                <input
                  type="text"
                  required
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  placeholder="e.g. 50 Servings of Mediterranean Rice Bowls & Grilled Veggies"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-white"
                  >
                    <option value="COOKED_MEALS">Cooked Meals</option>
                    <option value="BAKERY">Bakery &amp; Pastries</option>
                    <option value="PRODUCE">Fresh Produce</option>
                    <option value="DAIRY">Dairy</option>
                    <option value="PACKAGED">Packaged Food</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">Quantity (Servings)</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={totalServings}
                    onChange={(e) => setTotalServings(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">Unit</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="meals, boxes, kg"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">Preparation Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={prepTime}
                    onChange={(e) => setPrepTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">Pickup Deadline</label>
                  <input
                    type="datetime-local"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Storage Condition</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {['HOT_HEATED', 'REFRIGERATED', 'FROZEN', 'AMBIENT'].map((cond) => (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => setStorageCondition(cond)}
                      className={`p-2 rounded-lg border text-center transition-colors ${
                        storageCondition === cond
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                          : 'border-stone-200 bg-stone-50 text-stone-600'
                      }`}
                    >
                      {cond.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Allergens Selection */}
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Allergens Present</label>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {['GLUTEN', 'DAIRY', 'PEANUTS', 'SOY', 'EGGS', 'NUTS', 'SHELLFISH'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleAllergen(item)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors ${
                        allergens.includes(item)
                          ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold'
                          : 'bg-stone-50 border-stone-200 text-stone-600'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location Selection with Leaflet Map */}
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Pickup Address &amp; OpenStreetMap Coordinates</label>
                <input
                  type="text"
                  required
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  placeholder="Street address for courier pickup"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 mb-2"
                />
                <LocationPickerMap
                  initialLocation={pickupLocation}
                  onLocationChange={(loc) => setPickupLocation(loc)}
                  height="220px"
                />
              </div>

              {/* Food Safety Declaration */}
              <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200 space-y-2">
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="safety-declaration"
                    checked={safetySigned}
                    onChange={(e) => setSafetySigned(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="safety-declaration" className="text-xs text-amber-950 font-medium leading-relaxed">
                    <strong>Mandatory Food Safety Declaration:</strong> I hereby certify that this surplus food was prepared under commercial hygiene conditions, has remained within safe temperature controls, contains accurate allergen warnings, and is safe for human consumption within the designated pickup window.
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                >
                  {submitting ? 'Publishing...' : 'Publish Food Donation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Matching NGOs Preview */}
      {matchModalOpen && selectedListing && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Matching Engine
                </span>
                <h3 className="font-bold text-base text-stone-900 mt-1">Recommended NGOs for {selectedListing.foodName}</h3>
              </div>
              <button onClick={() => setMatchModalOpen(false)} className="text-stone-400 hover:text-stone-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {matchingNgos.length === 0 ? (
                <p className="text-xs text-stone-500 py-4 text-center">No verified NGOs nearby currently matching criteria.</p>
              ) : (
                matchingNgos.map((ngo) => (
                  <div key={ngo.ngoOrgId} className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-stone-900">{ngo.ngoName}</h4>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
                          {ngo.score}% Match
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-stone-500">{ngo.address} ({ngo.distanceKm} km away)</p>

                    {/* Breakdown pill tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1 text-[11px]">
                      {ngo.reasons.map((reason: string, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-white border border-stone-200 text-stone-700">
                          ✓ {reason}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Allocations & Dual OTP Handshake Tracker */}
      {allocModalOpen && selectedListing && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="font-bold text-base text-stone-900">Allocations &amp; Courier Handshake</h3>
                <p className="text-xs text-stone-500">Track claimed portions and physical OTP handovers</p>
              </div>
              <button onClick={() => setAllocModalOpen(false)} className="text-stone-400 hover:text-stone-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {allocationDetails?.allocations?.length === 0 ? (
                <div className="p-6 text-center text-stone-500">
                  No NGOs have claimed portions of this donation yet. It remains available in the discovery pool.
                </div>
              ) : (
                allocationDetails?.allocations?.map((alloc: any) => (
                  <div key={alloc.allocationId} className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-stone-900">{alloc.ngoName}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {alloc.allocatedServings} servings claimed
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-stone-200 space-y-1">
                      <span className="font-semibold text-stone-700 block">Courier Pickup Verification OTP:</span>
                      <p className="text-[11px] text-stone-500">
                        When the civic volunteer arrives at your kitchen, ask for their delivery ID and share your pickup confirmation.
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
