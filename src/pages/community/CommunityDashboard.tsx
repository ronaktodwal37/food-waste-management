import React, { useState, useEffect } from 'react';
import { communityApi } from '../../services/api.ts';
import {
  Users,
  Heart,
  Plus,
  ShieldAlert,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
  Share2,
} from 'lucide-react';

export const CommunityDashboard: React.FC = () => {
  const [listings, setListings] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTargetId, setReportTargetId] = useState('');

  // Share form state
  const [shareTitle, setShareTitle] = useState('');
  const [shareCategory, setShareCategory] = useState('PRODUCE');
  const [shareQuantity, setShareQuantity] = useState(4);
  const [shareAddress, setShareAddress] = useState('Market St & 8th, Neighborhood');

  // Request form state
  const [reqTitle, setReqTitle] = useState('');
  const [reqCategory, setReqCategory] = useState('COOKED_MEALS');
  const [reqServings, setReqServings] = useState(3);
  const [reqUrgency, setReqUrgency] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [reqAddress, setReqAddress] = useState('Downtown Community Hub');
  const [reqNotes, setReqNotes] = useState('');

  // Report state
  const [reportReason, setReportReason] = useState('Suspected temperature abuse or spoil');
  const [reportDetails, setReportDetails] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [listRes, reqRes] = await Promise.all([
        communityApi.getListings(),
        communityApi.getRequests(),
      ]);
      setListings(listRes.data.listings || []);
      setRequests(reqRes.data.requests || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleShareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await communityApi.createListing({
        title: shareTitle,
        category: shareCategory,
        quantity: Number(shareQuantity),
        address: shareAddress,
        location: { latitude: 37.7785, longitude: -122.415 },
        description: 'Neighborhood grassroots surplus food sharing',
      });
      setShareModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await communityApi.createRequest({
        title: reqTitle,
        category: reqCategory,
        servingsNeeded: Number(reqServings),
        urgency: reqUrgency,
        address: reqAddress,
        location: { latitude: 37.7785, longitude: -122.415 },
        notes: reqNotes,
      });
      setRequestModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await communityApi.submitReport({
        targetId: reportTargetId,
        targetType: 'LISTING',
        reason: reportReason,
        details: reportDetails,
      });
      alert('Report submitted to platform administrators for investigation.');
      setReportModalOpen(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200 gap-4">
        <div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-purple-100 text-purple-800">
            Community Food Circle
          </span>
          <h1 className="text-2xl font-extrabold text-stone-900 mt-1">Peer-to-Peer Neighborhood Sharing</h1>
          <p className="text-xs text-stone-500">
            Grassroots food exchange for local residents. Share surplus garden crops, groceries, or request meal assistance.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setRequestModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-colors shadow-xs"
          >
            Request Food Support
          </button>
          <button
            onClick={() => setShareModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-xs flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Share Food</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Shared Food & Community Requests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Available Neighborhood Food */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-stone-900 flex items-center space-x-2">
              <Share2 className="w-4 h-4 text-emerald-600" />
              <span>Available in Neighborhood</span>
            </h2>
            <span className="text-xs font-semibold text-emerald-700">{listings.length} offers</span>
          </div>

          <div className="space-y-3">
            {listings.length === 0 ? (
              <div className="p-6 bg-white rounded-2xl border border-stone-200 text-center text-xs text-stone-500">
                No active neighborhood listings yet. Be the first neighbor to share surplus food!
              </div>
            ) : (
              listings.map((item) => (
                <div key={item.listingId} className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                        {item.category}
                      </span>
                      <h4 className="font-bold text-stone-900 text-sm mt-1">{item.title}</h4>
                    </div>
                    <span className="text-xs font-black text-emerald-800 font-mono bg-emerald-50 px-2 py-1 rounded">
                      {item.remainingQuantity || item.quantity} {item.unit}
                    </span>
                  </div>

                  <p className="text-xs text-stone-500 flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    <span>{item.address}</span>
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                    <span className="text-[11px] text-stone-400">Offered by {item.ownerName}</span>
                    <button
                      onClick={() => {
                        setReportTargetId(item.listingId);
                        setReportModalOpen(true);
                      }}
                      className="text-[11px] text-stone-400 hover:text-rose-600 flex items-center space-x-1"
                    >
                      <ShieldAlert className="w-3 h-3" />
                      <span>Report Unsafe</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Community Assistance Requests */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-stone-900 flex items-center space-x-2">
              <Heart className="w-4 h-4 text-purple-600" />
              <span>Assistance Requests</span>
            </h2>
            <span className="text-xs font-semibold text-purple-700">{requests.length} open</span>
          </div>

          <div className="space-y-3">
            {requests.length === 0 ? (
              <div className="p-6 bg-white rounded-2xl border border-stone-200 text-center text-xs text-stone-500">
                No active community assistance requests.
              </div>
            ) : (
              requests.map((req) => (
                <div key={req.requestId} className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                          {req.servingsNeeded} Servings Needed
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          req.urgency === 'HIGH' ? 'bg-rose-100 text-rose-800' : 'bg-stone-100 text-stone-700'
                        }`}>
                          {req.urgency} Urgency
                        </span>
                      </div>
                      <h4 className="font-bold text-stone-900 text-sm mt-1">{req.title}</h4>
                    </div>
                  </div>

                  {req.notes && (
                    <p className="text-xs text-stone-600 bg-stone-50 p-2 rounded-lg italic">
                      "{req.notes}"
                    </p>
                  )}

                  <p className="text-xs text-stone-500 flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    <span>{req.address}</span>
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal: Share Food */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="font-bold text-base text-stone-900">Share Food with Neighbors</h3>
              <button onClick={() => setShareModalOpen(false)} className="text-stone-400 hover:text-stone-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleShareSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Food Title</label>
                <input
                  type="text"
                  required
                  value={shareTitle}
                  onChange={(e) => setShareTitle(e.target.value)}
                  placeholder="e.g. Fresh Garden Tomatoes & Apples"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Category</label>
                  <select
                    value={shareCategory}
                    onChange={(e) => setShareCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white"
                  >
                    <option value="PRODUCE">Produce</option>
                    <option value="BAKERY">Bakery</option>
                    <option value="PACKAGED">Packaged Food</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Quantity (Portions)</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={shareQuantity}
                    onChange={(e) => setShareQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Pickup Street Area</label>
                <input
                  type="text"
                  required
                  value={shareAddress}
                  onChange={(e) => setShareAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShareModalOpen(false)}
                  className="px-4 py-2 font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl">
                  Publish Share
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Request Food */}
      {requestModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="font-bold text-base text-stone-900">Submit Food Assistance Request</h3>
              <button onClick={() => setRequestModalOpen(false)} className="text-stone-400 hover:text-stone-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRequestSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Request Description</label>
                <input
                  type="text"
                  required
                  value={reqTitle}
                  onChange={(e) => setReqTitle(e.target.value)}
                  placeholder="e.g. Family meal assistance needed for 3 people"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Servings Needed</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    required
                    value={reqServings}
                    onChange={(e) => setReqServings(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Urgency</label>
                  <select
                    value={reqUrgency}
                    onChange={(e: any) => setReqUrgency(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High (Within 3h)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">General Pickup Hub or Area</label>
                <input
                  type="text"
                  required
                  value={reqAddress}
                  onChange={(e) => setReqAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Dietary Preferences or Notes</label>
                <textarea
                  value={reqNotes}
                  onChange={(e) => setReqNotes(e.target.value)}
                  placeholder="Any allergies or dietary needs"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200"
                  rows={2}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRequestModalOpen(false)}
                  className="px-4 py-2 font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Report Unsafe Food */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="font-bold text-base text-rose-900 flex items-center space-x-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Report Unsafe or Misleading Food</span>
              </h3>
              <button onClick={() => setReportModalOpen(false)} className="text-stone-400 hover:text-stone-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Primary Reason</label>
                <input
                  type="text"
                  required
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Observed Details</label>
                <textarea
                  required
                  minLength={10}
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Describe hygiene issues, foul smell, or temperature breach observed"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="px-4 py-2 font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl">
                  Submit Safety Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
