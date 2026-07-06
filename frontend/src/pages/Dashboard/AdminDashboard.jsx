import React, { useEffect, useState } from 'react';
import useAuthStore from '../../store/useAuthStore';
import api from '../../services/api';

const AdminDashboard = () => {
  const { user, logout } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, approvals, disputes, users, providers

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/stats');
      if (res.data && res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to fetch admin stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleApproveProvider = async (profileId) => {
    setActionLoading(true);
    try {
      await api.post(`/admin/providers/${profileId}/approve`);
      alert('Provider profile approved successfully.');
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve provider');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokeProvider = async (profileId) => {
    if (!window.confirm('Are you sure you want to revoke verification for this provider? They will be hidden from search.')) return;
    setActionLoading(true);
    try {
      await api.post(`/admin/providers/${profileId}/revoke`);
      alert('Provider verification status revoked.');
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to revoke verification');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This will also remove any linked provider profile.')) return;
    setActionLoading(true);
    try {
      await api.delete(`/admin/users/${userId}`);
      alert('User and associated data deleted successfully.');
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProviderProfile = async (profileId) => {
    if (!window.confirm('Are you sure you want to delete this provider profile? The user account will remain.')) return;
    setActionLoading(true);
    try {
      await api.delete(`/admin/providers/${profileId}`);
      alert('Provider profile deleted successfully.');
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete provider profile');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolveDispute = async (bookingId, action) => {
    setActionLoading(true);
    try {
      await api.post(`/admin/bookings/${bookingId}/resolve-dispute`, { action });
      alert(`Dispute resolved successfully: Escrow funds ${action === 'release' ? 'released to provider' : 'refunded to customer'}.`);
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to resolve dispute');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 relative">
      <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto z-10 relative space-y-8">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-900 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-black text-white">Admin Control Center</h1>
            <p className="text-slate-455 text-xs mt-0.5">Welcome, Administrator {user?.name}</p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-slate-900 border border-slate-855 hover:bg-slate-800 text-slate-300 rounded-xl font-bold transition text-xs cursor-pointer"
          >
            Logout
          </button>
        </header>

        {errorMsg && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-455 text-xs rounded-xl">
            {errorMsg}
          </div>
        )}

        {/* Quick Metrics Grid */}
        <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-855 p-5 rounded-2xl">
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Users</h3>
            <p className="text-3xl font-black text-white mt-1">{stats?.totalUsers || 0}</p>
          </div>
          <div className="bg-slate-900 border border-slate-855 p-5 rounded-2xl">
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Pending Approvals</h3>
            <p className="text-3xl font-black text-amber-500 mt-1">{stats?.pendingApprovals || 0}</p>
          </div>
          <div className="bg-slate-900 border border-slate-855 p-5 rounded-2xl">
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Active Disputes</h3>
            <p className="text-3xl font-black text-rose-555 mt-1">{stats?.activeDisputes || 0}</p>
          </div>
          <div className="bg-slate-900 border border-slate-855 p-5 rounded-2xl">
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Revenue</h3>
            <p className="text-3xl font-black text-emerald-400 mt-1">LKR {stats?.totalRevenue || 0}</p>
          </div>
        </main>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-900 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 font-bold text-xs uppercase tracking-wider transition border-b-2 cursor-pointer whitespace-nowrap ${activeTab === 'overview' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('approvals')}
            className={`px-4 py-2.5 font-bold text-xs uppercase tracking-wider transition border-b-2 cursor-pointer whitespace-nowrap ${activeTab === 'approvals' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            Verification Queue ({stats?.pendingApprovals || 0})
          </button>
          <button
            onClick={() => setActiveTab('disputes')}
            className={`px-4 py-2.5 font-bold text-xs uppercase tracking-wider transition border-b-2 cursor-pointer whitespace-nowrap ${activeTab === 'disputes' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            Disputes ({stats?.activeDisputes || 0})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2.5 font-bold text-xs uppercase tracking-wider transition border-b-2 cursor-pointer whitespace-nowrap ${activeTab === 'users' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            Manage Users
          </button>
          <button
            onClick={() => setActiveTab('providers')}
            className={`px-4 py-2.5 font-bold text-xs uppercase tracking-wider transition border-b-2 cursor-pointer whitespace-nowrap ${activeTab === 'providers' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            Manage Providers
          </button>
        </div>

        {/* Tab Contents */}
        <div className="grid grid-cols-1 gap-8">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="bg-slate-900 border border-slate-855 p-6 rounded-3xl space-y-6">
              <div>
                <h2 className="text-lg font-black text-white">System Status Summary</h2>
                <p className="text-slate-500 text-xs mt-0.5">Overview of escrow checkpoints and provider operations</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-950">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Provider Radar Coverage</span>
                  <p className="text-white font-bold text-sm">Active & Online</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Escrow Account balance</span>
                  <p className="text-white font-bold text-sm">Stripe API Hold Connected</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">System Status</span>
                  <p className="text-emerald-450 font-bold text-sm">✓ All services running normally</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DEDICATED APPROVALS PAGE */}
          {activeTab === 'approvals' && (
            <div className="bg-slate-900 border border-slate-855 p-6 rounded-3xl space-y-4">
              <div>
                <h2 className="text-lg font-black text-white">Verification Approvals Queue</h2>
                <p className="text-slate-500 text-xs mt-0.5">Validate provider documents, certificates, experience details, and hourly rates to activate accounts.</p>
              </div>

              <div className="overflow-x-auto">
                {stats?.pendingProviders && stats.pendingProviders.length > 0 ? (
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-950 text-slate-500 uppercase tracking-wider">
                        <th className="py-3 px-2 font-bold">Provider Info</th>
                        <th className="py-3 px-2 font-bold">Hourly Rate</th>
                        <th className="py-3 px-2 font-bold">Working District</th>
                        <th className="py-3 px-2 font-bold">Bio Description</th>
                        <th className="py-3 px-2 font-bold text-right">Verification Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.pendingProviders.map((prov) => (
                        <tr key={prov._id} className="border-b border-slate-950/60 hover:bg-slate-955/10">
                          <td className="py-3 px-2">
                            <span className="font-bold text-white block">{prov.userId?.name}</span>
                            <span className="text-[10px] text-slate-550 font-mono">{prov.userId?.email}</span>
                          </td>
                          <td className="py-3 px-2 font-bold text-white">
                            LKR {prov.hourlyRate}/hr
                          </td>
                          <td className="py-3 px-2 text-slate-400">
                            📍 {prov.city ? `${prov.city}, ` : ''}{prov.district}
                          </td>
                          <td className="py-3 px-2 text-slate-400 max-w-xs truncate" title={prov.bio}>
                            {prov.bio || 'No bio description provided.'}
                          </td>
                          <td className="py-3 px-2 text-right">
                            <button
                              disabled={actionLoading}
                              onClick={() => handleApproveProvider(prov._id)}
                              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-955 font-black rounded-xl transition cursor-pointer"
                            >
                              Approve & Go Live
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-16 text-slate-500 text-xs space-y-2">
                    <span className="text-3xl block">📋</span>
                    <p className="font-bold text-white">No registrations pending approvals</p>
                    <p className="text-slate-600 text-[10px]">All submitted provider profiles are verified and active on the search map.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: DISPUTES */}
          {activeTab === 'disputes' && (
            <div className="bg-slate-900 border border-slate-855 p-6 rounded-3xl space-y-4">
              <div>
                <h2 className="text-lg font-black text-white">Escrow Payment Disputes</h2>
                <p className="text-slate-500 text-xs mt-0.5">Determine payout allocations for jobs flagged by customer or provider</p>
              </div>
              <div className="overflow-x-auto">
                {stats?.disputes && stats.disputes.length > 0 ? (
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-950 text-slate-500 uppercase tracking-wider">
                        <th className="py-3 px-2 font-bold">Booking Details</th>
                        <th className="py-3 px-2 font-bold">Customer</th>
                        <th className="py-3 px-2 font-bold">Provider</th>
                        <th className="py-3 px-2 font-bold">Escrow Hold</th>
                        <th className="py-3 px-2 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.disputes.map((disp) => (
                        <tr key={disp._id} className="border-b border-slate-950/60 hover:bg-slate-955/10">
                          <td className="py-3 px-2">
                            <span className="font-bold text-white">{disp.serviceId?.name || 'General Help'}</span><br />
                            <span className="text-[10px] text-slate-500 font-mono">ID: {disp._id}</span>
                          </td>
                          <td className="py-3 px-2 text-slate-400">
                            <span className="font-bold text-white">{disp.customerId?.name}</span><br />
                            {disp.customerId?.phone}
                          </td>
                          <td className="py-3 px-2 text-slate-400">
                            <span className="font-bold text-white">{disp.providerId?.name}</span><br />
                            {disp.providerId?.phone}
                          </td>
                          <td className="py-3 px-2 font-bold text-rose-500">LKR {disp.price}</td>
                          <td className="py-3 px-2 text-right space-x-2">
                            <button
                              disabled={actionLoading}
                              onClick={() => handleResolveDispute(disp._id, 'release')}
                              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-450 disabled:opacity-50 text-slate-955 font-black rounded-xl transition cursor-pointer"
                            >
                              Release Payout
                            </button>
                            <button
                              disabled={actionLoading}
                              onClick={() => handleResolveDispute(disp._id, 'refund')}
                              className="px-3 py-1.5 bg-rose-500 hover:bg-rose-450 disabled:opacity-50 text-slate-955 font-black rounded-xl transition cursor-pointer"
                            >
                              Refund Client
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-16 text-slate-500 text-xs space-y-2">
                    <span className="text-3xl block">⚖️</span>
                    <p className="font-bold text-white">No active dispute resolutions</p>
                    <p className="text-slate-600 text-[10px]">There are currently no flagged escrow holdings.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: MANAGE USERS */}
          {activeTab === 'users' && (
            <div className="bg-slate-900 border border-slate-855 p-6 rounded-3xl space-y-4">
              <div>
                <h2 className="text-lg font-black text-white">All Registered User Accounts</h2>
                <p className="text-slate-500 text-xs mt-0.5">Manage credentials, review roles, or delete system profiles</p>
              </div>
              <div className="overflow-x-auto">
                {stats?.allUsers && stats.allUsers.length > 0 ? (
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-950 text-slate-500 uppercase tracking-wider">
                        <th className="py-3 px-2 font-bold">User Name</th>
                        <th className="py-3 px-2 font-bold">Email</th>
                        <th className="py-3 px-2 font-bold">Phone Number</th>
                        <th className="py-3 px-2 font-bold">System Role</th>
                        <th className="py-3 px-2 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.allUsers.map((u) => (
                        <tr key={u._id} className="border-b border-slate-950/60 hover:bg-slate-955/10">
                          <td className="py-3 px-2 font-bold text-white flex items-center gap-2">
                            <span className="h-6 w-6 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center font-bold text-[10px] text-amber-500">
                              {u.name?.charAt(0)}
                            </span>
                            {u.name}
                          </td>
                          <td className="py-3 px-2 text-slate-400 font-mono">{u.email}</td>
                          <td className="py-3 px-2 text-slate-400 font-mono">{u.phone || 'N/A'}</td>
                          <td className="py-3 px-2">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${u.role === 'admin' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : u.role === 'provider' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right">
                            {u.role !== 'admin' ? (
                              <button
                                disabled={actionLoading}
                                onClick={() => handleDeleteUser(u._id)}
                                className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500 border border-rose-500/20 hover:border-rose-500 text-rose-455 hover:text-slate-955 font-bold rounded-xl transition cursor-pointer"
                              >
                                Delete User
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-600 font-bold px-2">System Administrator</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-8 text-slate-500 text-xs">
                    No users registered in system database.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: MANAGE PROVIDERS */}
          {activeTab === 'providers' && (
            <div className="bg-slate-900 border border-slate-855 p-6 rounded-3xl space-y-4">
              <div>
                <h2 className="text-lg font-black text-white">All Provider Profiles</h2>
                <p className="text-slate-500 text-xs mt-0.5">Control live profiles, edit listing badges, or delete directory cards</p>
              </div>
              <div className="overflow-x-auto">
                {stats?.allProviders && stats.allProviders.length > 0 ? (
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-950 text-slate-500 uppercase tracking-wider">
                        <th className="py-3 px-2 font-bold">Provider</th>
                        <th className="py-3 px-2 font-bold">Rate</th>
                        <th className="py-3 px-2 font-bold">Coverage area</th>
                        <th className="py-3 px-2 font-bold">Radar Status</th>
                        <th className="py-3 px-2 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.allProviders.map((prov) => (
                        <tr key={prov._id} className="border-b border-slate-950/60 hover:bg-slate-955/10">
                          <td className="py-3 px-2">
                            <span className="font-bold text-white block">{prov.userId?.name || 'Ghost User'}</span>
                            <span className="text-[10px] text-slate-500">{prov.serviceCategories?.[0]?.name || 'General Help'}</span>
                          </td>
                          <td className="py-3 px-2 font-bold text-white">LKR {prov.hourlyRate}/hr</td>
                          <td className="py-3 px-2 text-slate-400">
                            {prov.city ? `${prov.city}, ` : ''}{prov.district || 'Colombo'}
                          </td>
                          <td className="py-3 px-2">
                            {prov.isApproved ? (
                              <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
                                ✓ Live Radar
                              </span>
                            ) : (
                              <span className="bg-amber-500/10 text-amber-500 text-[9px] font-bold px-2 py-0.5 rounded-full border border-amber-500/20 animate-pulse">
                                Pending approval
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-2 text-right space-x-2">
                            {prov.isApproved ? (
                              <button
                                disabled={actionLoading}
                                onClick={() => handleRevokeProvider(prov._id)}
                                className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500 border border-amber-500/20 hover:border-amber-500 text-amber-500 hover:text-slate-955 font-bold rounded-xl transition cursor-pointer text-[10px]"
                              >
                                Revoke Approval
                              </button>
                            ) : (
                              <button
                                disabled={actionLoading}
                                onClick={() => handleApproveProvider(prov._id)}
                                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-955 font-bold rounded-xl transition cursor-pointer text-[10px]"
                              >
                                Approve Live
                              </button>
                            )}
                            <button
                              disabled={actionLoading}
                              onClick={() => handleDeleteProviderProfile(prov._id)}
                              className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500 border border-rose-500/20 hover:border-rose-500 text-rose-455 hover:text-slate-955 font-bold rounded-xl transition cursor-pointer text-[10px]"
                            >
                              Delete Profile
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-8 text-slate-500 text-xs">
                    No provider profiles registered in directory catalog.
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
