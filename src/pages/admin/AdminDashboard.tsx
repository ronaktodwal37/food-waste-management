import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api.ts';
import {
  ShieldCheck,
  Users,
  Building2,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  Search,
  Sliders,
  Sparkles,
  Lock,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [tab, setTab] = useState<'overview' | 'ngos' | 'users' | 'audit' | 'reports' | 'credits'>('overview');
  const [stats, setStats] = useState<any | null>(null);
  const [pendingNgos, setPendingNgos] = useState<any[]>([]);
  const [userList, setUserList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [creditRules, setCreditRules] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Credit rule editing state
  const [shortCredits, setShortCredits] = useState<number>(30);
  const [medCredits, setMedCredits] = useState<number>(50);
  const [longCredits, setLongCredits] = useState<number>(80);
  const [urgentCredits, setUrgentCredits] = useState<number>(20);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsRes, ngosRes, usersRes, logsRes, repsRes, rulesRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getPendingNgos(),
        adminApi.getUsers(),
        adminApi.getAuditLogs(),
        adminApi.getReports(),
        adminApi.getCreditRules(),
      ]);

      setStats(statsRes.data);
      setPendingNgos(ngosRes.data.pendingNgos || []);
      setUserList(usersRes.data.users || []);
      setAuditLogs(logsRes.data.logs || []);
      setReports(repsRes.data.reports || []);
      if (rulesRes.data.rules) {
        setCreditRules(rulesRes.data.rules);
        setShortCredits(rulesRes.data.rules.baseShortDistanceCredits);
        setMedCredits(rulesRes.data.rules.baseMediumDistanceCredits);
        setLongCredits(rulesRes.data.rules.baseLongDistanceCredits);
        setUrgentCredits(rulesRes.data.rules.urgentBonusCredits);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleVerifyNgo = async (ngoUid: string, approved: boolean) => {
    try {
      await adminApi.verifyNgo(ngoUid, {
        approved,
        rejectionReason: approved ? undefined : 'Documentation does not meet municipal charity compliance standards',
      });
      alert(approved ? 'NGO verified and approved successfully!' : 'NGO application marked as rejected.');
      fetchAll();
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    if (!confirm(`Are you sure you want to set this user status to ${newStatus}?`)) return;
    try {
      await adminApi.setUserStatus(userId, { status: newStatus, reason: 'Administrator account status review' });
      fetchAll();
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    }
  };

  const handleResolveReport = async (reportId: string) => {
    try {
      await adminApi.resolveReport(reportId, { resolutionNotes: 'Reviewed by administrator and action logged.' });
      fetchAll();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveCreditRules = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.updateCreditRules({
        baseShortDistanceCredits: Number(shortCredits),
        baseMediumDistanceCredits: Number(medCredits),
        baseLongDistanceCredits: Number(longCredits),
        urgentBonusCredits: Number(urgentCredits),
      });
      alert('Volunteer credit rules updated successfully!');
      fetchAll();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200 gap-4">
        <div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-stone-800 text-stone-100">
            Platform Administration
          </span>
          <h1 className="text-2xl font-extrabold text-stone-900 mt-1">Admin Command &amp; Governance</h1>
          <p className="text-xs text-stone-500">
            Verify NGO compliance documents, manage users, inspect immutable audit trails, and oversee food safety.
          </p>
        </div>

        <button
          onClick={fetchAll}
          className="text-xs text-stone-600 hover:text-stone-900 flex items-center space-x-1"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 text-xs font-bold overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview Metrics' },
          { id: 'ngos', label: `Pending NGO Approvals (${pendingNgos.length})` },
          { id: 'users', label: `User Directory (${userList.length})` },
          { id: 'audit', label: `Security Audit Logs (${auditLogs.length})` },
          { id: 'reports', label: `Safety Reports (${reports.filter((r) => r.status === 'PENDING_REVIEW').length})` },
          { id: 'credits', label: 'Volunteer Credit Rules' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`py-2.5 px-4 border-b-2 whitespace-nowrap transition-colors ${
              tab === t.id
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Overview Metrics */}
      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-1">
              <span className="text-xs font-semibold text-stone-500">Total Registered Users</span>
              <p className="text-2xl font-black text-stone-900">{stats?.users?.total || 0}</p>
              <div className="text-[11px] text-stone-400">
                {stats?.users?.donors} donors • {stats?.users?.ngos} NGOs • {stats?.users?.volunteers} couriers
              </div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-1">
              <span className="text-xs font-semibold text-stone-500">NGO Verification Queue</span>
              <p className="text-2xl font-black text-amber-600">{pendingNgos.length}</p>
              <div className="text-[11px] text-stone-400">Awaiting document inspection</div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-1">
              <span className="text-xs font-semibold text-stone-500">Completed Deliveries</span>
              <p className="text-2xl font-black text-emerald-700">{stats?.deliveries?.completed || 0}</p>
              <div className="text-[11px] text-stone-400">Verified via dual OTP</div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-1">
              <span className="text-xs font-semibold text-stone-500">Verified Meals Saved</span>
              <p className="text-2xl font-black text-teal-700">{stats?.impact?.totalMealsRedistributed || 0}</p>
              <div className="text-[11px] text-stone-400">{stats?.impact?.totalCo2PreventedKg || 0} kg CO2 prevented</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: NGO Approvals Queue */}
      {tab === 'ngos' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-stone-900">Pending NGO Verification Applications</h2>
          {pendingNgos.length === 0 ? (
            <div className="p-8 bg-white rounded-2xl border border-stone-200 text-center text-xs text-stone-500">
              No pending NGO applications at this time. All NGOs have been reviewed.
            </div>
          ) : (
            <div className="space-y-4">
              {pendingNgos.map((ngo) => (
                <div key={ngo.uid} className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                          PENDING NGO
                        </span>
                        <span className="text-xs text-stone-400 font-mono">UID: {ngo.uid}</span>
                      </div>
                      <h3 className="font-bold text-stone-900 text-base mt-1">
                        {ngo.organization?.name || ngo.displayName}
                      </h3>
                      <p className="text-xs text-stone-500">{ngo.email}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleVerifyNgo(ngo.uid, true)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve NGO</span>
                      </button>
                      <button
                        onClick={() => handleVerifyNgo(ngo.uid, false)}
                        className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-rose-50 hover:text-rose-700 text-stone-600 font-bold text-xs flex items-center space-x-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="text-stone-400 block text-[10px]">Registration #</span>
                      <span className="font-bold text-stone-800">{ngo.organization?.registrationNumber || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px]">Daily Capacity</span>
                      <span className="font-bold text-stone-800">{ngo.organization?.receivingCapacityServings || 'N/A'} meals</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px]">Service Radius</span>
                      <span className="font-bold text-stone-800">{ngo.organization?.serviceRadiusKm || 10} km</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px]">Verification Document</span>
                      {ngo.organization?.verificationDocUrls?.[0] ? (
                        <a
                          href={ngo.organization.verificationDocUrls[0]}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-blue-600 hover:underline flex items-center space-x-1"
                        >
                          <FileText className="w-3 h-3" />
                          <span>View PDF/Doc</span>
                        </a>
                      ) : (
                        <span className="text-stone-400">None uploaded</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: User Directory */}
      {tab === 'users' && (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-stone-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-stone-900">Registered Platform Users</h2>
            <span className="text-xs text-stone-500">{userList.length} total users</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-100 text-stone-600 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">NGO Approved</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {userList.map((u) => (
                  <tr key={u.uid} className="hover:bg-stone-50/50">
                    <td className="p-3">
                      <div className="font-bold text-stone-900">{u.displayName}</div>
                      <div className="text-[11px] text-stone-500 font-mono">{u.email}</div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-stone-100 text-stone-700">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="p-3">
                      {u.role === 'NGO' ? (
                        u.isApproved ? (
                          <span className="text-emerald-700 font-bold">Yes</span>
                        ) : (
                          <span className="text-amber-600 font-bold">Pending</span>
                        )
                      ) : (
                        <span className="text-stone-300">—</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {u.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleToggleUserStatus(u.uid, u.status)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                            u.status === 'ACTIVE'
                              ? 'text-rose-700 hover:bg-rose-50'
                              : 'text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {u.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Audit Logs */}
      {tab === 'audit' && (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-stone-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-stone-900">Immutable Security &amp; Transaction Audit Log</h2>
            <span className="text-xs font-mono text-stone-400">Append-only</span>
          </div>

          <div className="divide-y divide-stone-100 max-h-[500px] overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log.logId} className="p-3.5 text-xs flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-stone-900 px-1.5 py-0.5 bg-stone-100 rounded text-[11px]">
                      {log.action}
                    </span>
                    <span className="text-stone-400 font-mono text-[11px]">By: {log.performedBy}</span>
                  </div>
                  {log.details && (
                    <pre className="text-[11px] text-stone-600 mt-1 font-mono">
                      {JSON.stringify(log.details)}
                    </pre>
                  )}
                </div>
                <span className="text-[10px] text-stone-400 font-mono shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Reports */}
      {tab === 'reports' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-stone-900">Food Safety &amp; Listing Reports</h2>
          {reports.length === 0 ? (
            <div className="p-8 bg-white rounded-2xl border border-stone-200 text-center text-xs text-stone-500">
              No reports filed.
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => (
                <div key={rep.reportId} className="p-4 bg-white rounded-2xl border border-stone-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-800 text-sm">{rep.reason}</span>
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      rep.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {rep.status}
                    </span>
                  </div>
                  <p className="text-stone-600">{rep.details}</p>
                  <p className="text-[11px] text-stone-400">Target ID: {rep.targetId} ({rep.targetType})</p>
                  {rep.status === 'PENDING_REVIEW' && (
                    <button
                      onClick={() => handleResolveReport(rep.reportId)}
                      className="px-3 py-1 bg-stone-800 text-white rounded-lg text-xs font-semibold hover:bg-stone-900"
                    >
                      Mark as Resolved
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Credit Rules */}
      {tab === 'credits' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 max-w-xl space-y-4 shadow-xs">
          <h2 className="text-base font-bold text-stone-900 flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-emerald-600" />
            <span>Configure Volunteer Recognition Rules</span>
          </h2>

          <form onSubmit={handleSaveCreditRules} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Short Distance Credits (&lt; 2 km)</label>
              <input
                type="number"
                required
                value={shortCredits}
                onChange={(e) => setShortCredits(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">Medium Distance Credits (2 - 5 km)</label>
              <input
                type="number"
                required
                value={medCredits}
                onChange={(e) => setMedCredits(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">Long Distance Credits (&gt; 5 km)</label>
              <input
                type="number"
                required
                value={longCredits}
                onChange={(e) => setLongCredits(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">Urgent Delivery Bonus Credits</label>
              <input
                type="number"
                required
                value={urgentCredits}
                onChange={(e) => setUrgentCredits(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 font-mono"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700"
            >
              Update Credit Formula
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
