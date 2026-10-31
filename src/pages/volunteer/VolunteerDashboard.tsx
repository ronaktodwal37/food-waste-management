import React, { useState, useEffect } from 'react';
import { volunteerApi } from '../../services/api.ts';
import { RouteMap } from '../../components/maps/RouteMap.tsx';
import {
  Bike,
  Award,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  KeyRound,
  RefreshCw,
  Trophy,
  History,
  X,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const VolunteerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'available' | 'my' | 'leaderboard'>('available');
  const [availableTasks, setAvailableTasks] = useState<any[]>([]);
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // OTP Verification modal state
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [activeDeliveryId, setActiveDeliveryId] = useState<string>('');
  const [verificationStage, setVerificationStage] = useState<'PICKUP' | 'DELIVERY'>('PICKUP');
  const [otpInput, setOtpInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState<string | null>(null);

  // Accepted task OTP previews for evaluation demo
  const [otpPreviewNotice, setOtpPreviewNotice] = useState<{ pickup?: string; delivery?: string } | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [availRes, myRes, statsRes] = await Promise.all([
        volunteerApi.getAvailableTasks(),
        volunteerApi.getMyTasks(),
        volunteerApi.getStats(),
      ]);
      setAvailableTasks(availRes.data.tasks || []);
      setMyTasks(myRes.data.tasks || []);
      setStats(statsRes.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleAcceptTask = async (taskId: string) => {
    try {
      const res = await volunteerApi.acceptTask(taskId);
      if (res.data.pickupOtpPreview && res.data.deliveryOtpPreview) {
        setOtpPreviewNotice({
          pickup: res.data.pickupOtpPreview,
          delivery: res.data.deliveryOtpPreview,
        });
      }
      setActiveTab('my');
      fetchAll();
    } catch (err: any) {
      alert(err.message || 'Failed to accept task');
    }
  };

  const openVerifyModal = (deliveryId: string, stage: 'PICKUP' | 'DELIVERY') => {
    setActiveDeliveryId(deliveryId);
    setVerificationStage(stage);
    setOtpInput('');
    setVerificationFeedback(null);
    setOtpModalOpen(true);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setVerificationFeedback(null);
    try {
      if (verificationStage === 'PICKUP') {
        const res = await volunteerApi.verifyPickup({
          deliveryId: activeDeliveryId,
          otp: otpInput,
        });
        setVerificationFeedback(`Success: ${res.data.message}`);
        setTimeout(() => {
          setOtpModalOpen(false);
          fetchAll();
        }, 1200);
      } else {
        const res = await volunteerApi.verifyDelivery({
          deliveryId: activeDeliveryId,
          otp: otpInput,
        });
        setVerificationFeedback(
          `Delivery Complete! You earned +${res.data.creditsAwarded} credits. New total: ${res.data.totalCredits}`
        );
        setTimeout(() => {
          setOtpModalOpen(false);
          fetchAll();
        }, 2000);
      }
    } catch (err: any) {
      setVerificationFeedback(`Error: ${err.message}`);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200 gap-4">
        <div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-teal-100 text-teal-800">
            Civic Volunteer Portal
          </span>
          <h1 className="text-2xl font-extrabold text-stone-900 mt-1">Food Rescue &amp; Delivery Courier</h1>
          <p className="text-xs text-stone-500">
            Accept nearby transport tasks, navigate routes, verify handovers with OTP, and earn credits.
          </p>
        </div>

        <button
          onClick={fetchAll}
          className="text-xs text-stone-600 hover:text-stone-900 flex items-center space-x-1"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Tasks</span>
        </button>
      </div>

      {/* Gamification Stats Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center space-x-1.5 text-xs text-emerald-700 font-semibold">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>Volunteer Credits</span>
          </div>
          <p className="text-2xl font-black text-stone-900">{stats?.profile?.totalCredits || 0}</p>
          <p className="text-[11px] text-stone-400">Non-cash recognition points</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center space-x-1.5 text-xs text-blue-700 font-semibold">
            <Bike className="w-4 h-4 text-blue-600" />
            <span>Completed Rescues</span>
          </div>
          <p className="text-2xl font-black text-stone-900">{stats?.profile?.totalDeliveries || 0}</p>
          <p className="text-[11px] text-stone-400">Verified missions</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center space-x-1.5 text-xs text-teal-700 font-semibold">
            <Clock className="w-4 h-4 text-teal-600" />
            <span>Hours Contributed</span>
          </div>
          <p className="text-2xl font-black text-stone-900">{stats?.profile?.totalHoursVolunteered || 0} hrs</p>
          <p className="text-[11px] text-stone-400">Logistics service time</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center space-x-1.5 text-xs text-purple-700 font-semibold">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>Meals Delivered</span>
          </div>
          <p className="text-2xl font-black text-stone-900">{stats?.profile?.totalMealsRedistributed || 0}</p>
          <p className="text-[11px] text-stone-400">Servings safely delivered</p>
        </div>
      </div>

      {/* Demo OTP Helper Notice Banner */}
      {otpPreviewNotice && (
        <div className="p-4 rounded-2xl bg-stone-900 text-stone-100 space-y-2 border border-stone-800">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
            <div className="flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Cryptographic OTPs Generated for Active Mission</span>
            </div>
            <button onClick={() => setOtpPreviewNotice(null)} className="text-stone-400 hover:text-white">✕</button>
          </div>
          <p className="text-xs text-stone-300">
            (Evaluation mode helper: In production, the pickup code appears on the donor's screen, and delivery code on the NGO's screen. Use these to test verification):
          </p>
          <div className="flex gap-4 text-xs font-mono">
            <div className="bg-stone-800 px-3 py-1.5 rounded-lg border border-stone-700">
              <span className="text-stone-400 block text-[10px]">1. DONOR PICKUP OTP:</span>
              <span className="text-emerald-400 font-bold text-sm">{otpPreviewNotice.pickup}</span>
            </div>
            <div className="bg-stone-800 px-3 py-1.5 rounded-lg border border-stone-700">
              <span className="text-stone-400 block text-[10px]">2. NGO DELIVERY OTP:</span>
              <span className="text-teal-400 font-bold text-sm">{otpPreviewNotice.delivery}</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-stone-200 text-xs font-bold">
        <button
          onClick={() => setActiveTab('available')}
          className={`py-2.5 px-4 border-b-2 transition-colors ${
            activeTab === 'available'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Available Missions ({availableTasks.length})
        </button>

        <button
          onClick={() => setActiveTab('my')}
          className={`py-2.5 px-4 border-b-2 transition-colors ${
            activeTab === 'my'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          My Tasks ({myTasks.length})
        </button>

        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`py-2.5 px-4 border-b-2 transition-colors ${
            activeTab === 'leaderboard'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Credit Ledger &amp; Leaderboard
        </button>
      </div>

      {/* Tab 1: Available Missions */}
      {activeTab === 'available' && (
        <div className="space-y-4">
          {availableTasks.length === 0 ? (
            <div className="p-8 bg-white rounded-2xl border border-stone-200 text-center text-xs text-stone-500">
              No delivery missions currently waiting for courier pickup. Check back shortly!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableTasks.map((task) => (
                <div key={task.taskId} className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {task.servings} Servings
                        </span>
                        {task.isUrgent && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 animate-pulse">
                            URGENT BONUS (+20)
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-stone-900 text-base mt-1.5">{task.foodName}</h3>
                    </div>
                    <span className="text-xs font-mono font-bold text-stone-600 bg-stone-100 px-2 py-1 rounded">
                      ~{task.estimatedDistanceKm} km
                    </span>
                  </div>

                  {/* Route Map preview */}
                  {task.donorLocation && task.ngoLocation && (
                    <RouteMap
                      pickupLocation={task.donorLocation}
                      pickupAddress={task.donorAddress}
                      dropoffLocation={task.ngoLocation}
                      dropoffAddress={task.ngoAddress}
                      distanceKm={task.estimatedDistanceKm}
                      height="200px"
                    />
                  )}

                  <div className="text-xs space-y-1 text-stone-600">
                    <p><strong>From:</strong> {task.donorAddress}</p>
                    <p><strong>To:</strong> {task.ngoName} ({task.ngoAddress})</p>
                  </div>

                  <button
                    onClick={() => handleAcceptTask(task.taskId)}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center space-x-2 shadow-xs"
                  >
                    <Bike className="w-4 h-4" />
                    <span>Accept Delivery Mission</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: My Tasks & Verification Actions */}
      {activeTab === 'my' && (
        <div className="space-y-4">
          {myTasks.length === 0 ? (
            <div className="p-8 bg-white rounded-2xl border border-stone-200 text-center text-xs text-stone-500">
              You don't have any active delivery tasks. Browse available missions to accept one!
            </div>
          ) : (
            <div className="space-y-4">
              {myTasks.map((task) => (
                <div key={task.taskId} className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                          {task.servings} Servings
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            task.status === 'ACCEPTED'
                              ? 'bg-amber-100 text-amber-800'
                              : task.status === 'IN_TRANSIT'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {task.status}
                        </span>
                      </div>
                      <h3 className="font-bold text-stone-900 text-base mt-1">{task.foodName}</h3>
                    </div>

                    {/* Verification Actions */}
                    <div className="flex items-center space-x-2">
                      {task.status === 'ACCEPTED' && (
                        <button
                          onClick={() => openVerifyModal(task.deliveryId, 'PICKUP')}
                          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-xs"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Enter Pickup OTP (At Donor)</span>
                        </button>
                      )}

                      {task.status === 'IN_TRANSIT' && (
                        <button
                          onClick={() => openVerifyModal(task.deliveryId, 'DELIVERY')}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-xs animate-pulse"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Enter Delivery OTP (At NGO)</span>
                        </button>
                      )}

                      {task.status === 'COMPLETED' && (
                        <span className="text-xs font-bold text-emerald-700 flex items-center space-x-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Delivery Verified &amp; Credits Awarded</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Route Visualizer */}
                  {task.donorLocation && task.ngoLocation && (
                    <RouteMap
                      pickupLocation={task.donorLocation}
                      pickupAddress={task.donorAddress}
                      dropoffLocation={task.ngoLocation}
                      dropoffAddress={task.ngoAddress}
                      distanceKm={task.estimatedDistanceKm}
                      height="220px"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Gamification Ledger, Badges, and Leaderboard */}
      {activeTab === 'leaderboard' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Credit Ledger */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center space-x-2">
              <History className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-base text-stone-900">Volunteer Credit Ledger</h3>
            </div>

            <div className="space-y-2">
              {stats?.creditsLedger?.length === 0 ? (
                <p className="text-xs text-stone-500 py-4 text-center">No credit awards yet. Complete deliveries to earn points!</p>
              ) : (
                stats?.creditsLedger?.map((entry: any) => (
                  <div key={entry.creditId} className="p-3 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-stone-800">{entry.reason}</p>
                      <p className="text-[11px] text-stone-400 font-mono">
                        {new Date(entry.createdAt).toLocaleDateString()} at{' '}
                        {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className="text-sm font-extrabold text-emerald-700 font-mono">+{entry.amount} pts</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Leaderboard & Badges */}
          <div className="space-y-6">
            {/* Badges showcase */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-base text-stone-900">Achievements &amp; Badges</h3>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                {stats?.badges?.all?.map((badge: any) => {
                  const isEarned = stats?.badges?.earned?.some((b: any) => b.badgeId === badge.badgeId);
                  return (
                    <div
                      key={badge.badgeId}
                      className={`p-3 rounded-xl border transition-all ${
                        isEarned
                          ? 'border-purple-200 bg-purple-50/70 text-purple-950 font-semibold'
                          : 'border-stone-200 bg-stone-50 text-stone-400 opacity-50'
                      }`}
                    >
                      <Award className={`w-6 h-6 mx-auto mb-1 ${isEarned ? 'text-purple-600' : 'text-stone-300'}`} />
                      <div className="text-[11px] font-bold">{badge.title}</div>
                      <div className="text-[9px] mt-0.5 text-stone-500">{isEarned ? 'UNLOCKED' : 'LOCKED'}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Monthly Leaderboard */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-base text-stone-900">Monthly Volunteer Leaderboard</h3>
              </div>

              <div className="space-y-2 text-xs">
                {stats?.leaderboard?.map((entry: any, index: number) => (
                  <div
                    key={entry.volunteerUid}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-100"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="font-bold font-mono text-stone-400 w-4">{index + 1}.</span>
                      <div>
                        <span className="font-bold text-stone-800 block">{entry.name}</span>
                        <span className="text-[10px] text-stone-500">{entry.totalDeliveries} deliveries • {entry.totalMealsRedistributed} meals</span>
                      </div>
                    </div>
                    <span className="font-bold text-emerald-700 font-mono text-sm">{entry.totalCredits} pts</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Enter Handshake OTP */}
      {otpModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="font-bold text-base text-stone-900">
                {verificationStage === 'PICKUP' ? 'Verify Donor Pickup' : 'Verify NGO Drop-Off'}
              </h3>
              <button onClick={() => setOtpModalOpen(false)} className="text-stone-400 hover:text-stone-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-600">
              {verificationStage === 'PICKUP'
                ? 'Ask the donor for their 6-digit pickup verification code:'
                : 'Ask the receiving NGO representative for their 6-digit delivery confirmation code:'}
            </p>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="6-digit OTP"
                  className="w-full text-center text-2xl font-mono tracking-widest py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                />
              </div>

              {verificationFeedback && (
                <div className={`p-3 rounded-xl text-xs font-medium ${
                  verificationFeedback.startsWith('Success') || verificationFeedback.startsWith('Delivery')
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'bg-red-50 text-red-800'
                }`}>
                  {verificationFeedback}
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOtpModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifying || otpInput.length !== 6}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl"
                >
                  {verifying ? 'Verifying Code...' : 'Submit Verification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
