import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import useBookingStore from '../../store/useBookingStore';
import ProviderProfileForm from '../../components/provider/ProviderProfileForm';
import NotificationBell from '../../components/NotificationBell';
import ThemeToggle from '../../components/ThemeToggle';
import InvoiceModal from '../../components/InvoiceModal';
import api from '../../services/api';


const ProviderDashboard = () => {
  const { user, logout } = useAuthStore();
  const { bookings, fetchUserBookings, updateStatus, deleteBooking, loading: loadingBookings } = useBookingStore();
  
  const [profile, setProfile] = useState(null);
  const [hasProfile, setHasProfile] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [reEdit, setReEdit] = useState(false);
  const [selectedInvoiceBooking, setSelectedInvoiceBooking] = useState(null);

  const fetchProfile = async () => {
    setLoadingProfile(true);
    try {
      const res = await api.get('/providers/profile/me');
      if (res.data && res.data.success) {
        setProfile(res.data.profile);
        setHasProfile(true);
      }
    } catch (err) {
      if (err.response?.status === 444) {
        setHasProfile(false);
      } else {
        console.error('Failed to load profile', err);
      }
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    if (user?._id) {
      fetchUserBookings(user._id);
    }
  }, [user]);

  const handleProfileCreated = (newProfile) => {
    setProfile(newProfile);
    setHasProfile(true);
    setReEdit(false);
  };

  const handleAccept = async (id) => {
    try {
      await updateStatus(id, 'accepted');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDecline = async (id) => {
    if (window.confirm('Are you sure you want to decline this booking request?')) {
      try {
        await updateStatus(id, 'cancelled');
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this booking record from your dashboard history? This will permanently clean up the chat and booking records.')) {
      try {
        await deleteBooking(id);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleStartJob = async (id) => {
    try {
      await updateStatus(id, 'in-progress');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleMarkCompleted = async (id) => {
    try {
      await updateStatus(id, 'completed');
      fetchUserBookings(user._id);
    } catch (err) {
      alert(err.message);
    }
  };


  if (loadingProfile) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  // If no profile exists yet, display setup form
  if (!hasProfile || reEdit) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col justify-center">
        <div className="max-w-xl mx-auto w-full">
          <header className="flex justify-between items-center mb-8 border-b border-slate-900 pb-4">
            <span className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">QuickServe.lk</span>
            <div className="flex gap-4 items-center">
              {reEdit && (
                <button onClick={() => setReEdit(false)} className="text-xs text-slate-400 hover:text-white">Cancel Edit</button>
              )}
              <button onClick={logout} className="text-xs font-semibold text-slate-400 hover:text-white">Logout</button>
            </div>
          </header>
          <ProviderProfileForm initialData={profile} onSuccess={handleProfileCreated} />
        </div>
      </div>
    );
  }

  // Calculate earnings minus 10% commission
  const completedJobs = bookings.filter((b) => b.status === 'completed');
  const grossEarnings = completedJobs.reduce((sum, b) => sum + b.price, 0);
  const netPayout = grossEarnings * 0.9;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 relative">
      <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto z-10 relative">
        {!profile?.isApproved && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/25 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-pulse">
            <div>
              <h4 className="font-bold text-amber-400 text-sm">Profile Pending Verification</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Your profile is currently hidden from customer proximity radar search results until approved.</p>
            </div>
            <button
              onClick={async () => {
                try {
                  await api.post('/providers/profile/sandbox-approve');
                  alert('Profile approved successfully in developer sandbox mode!');
                  fetchProfile();
                } catch (err) {
                  alert(err.response?.data?.message || 'Approval bypass failed');
                }
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer transition-all whitespace-nowrap self-stretch sm:self-auto text-center"
            >
              Verify Profile (Sandbox Bypass)
            </button>
          </div>
        )}

        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-900 pb-6 mb-8 gap-4">
            <p className="text-slate-400">Welcome back, {user?.name}! Your provider station is live.</p>
            {profile?.serviceCategories && profile.serviceCategories.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.serviceCategories.map((cat) => (
                  <span key={cat._id || cat} className="bg-amber-500/10 text-amber-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-500/20">
                    {cat.name || 'General Help'} {cat.icon || '🛠'}
                  </span>
                ))}
              </div>
            )}

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <NotificationBell />
            <button
              onClick={() => setReEdit(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 transition cursor-pointer"
            >
              Edit Business
            </button>
            <Link
              to="/profile"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 transition"
            >
              Settings
            </Link>
            <button
              onClick={logout}
              className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Logout
            </button>
          </div>

        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 space-y-6">
            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Completed Jobs</p>
                <p className="text-3xl font-black text-white mt-1">{completedJobs.length}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Hourly Rate</p>
                <p className="text-3xl font-black text-white mt-1">LKR {profile?.hourlyRate}/hr</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Net Payout (LKR)</p>
                <p className="text-3xl font-black text-emerald-400 mt-1">LKR {netPayout.toFixed(0)}</p>
              </div>
            </div>

            {/* Weekly Payouts Analytics Chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Earnings Analytics</h3>
                <p className="text-slate-500 text-xs mt-0.5">Weekly escrow payouts analysis (gross vs. 10% commission deduction)</p>
              </div>

              {/* Flex bar chart mockup using dynamic layout columns */}
              <div className="h-32 flex items-end justify-between gap-4 pt-4 border-b border-slate-800 px-2">
                {[
                  { label: 'Week 1', gross: completedJobs.length > 0 ? grossEarnings * 0.2 : 4000 },
                  { label: 'Week 2', gross: completedJobs.length > 0 ? grossEarnings * 0.35 : 7500 },
                  { label: 'Week 3', gross: completedJobs.length > 0 ? grossEarnings * 0.15 : 3000 },
                  { label: 'Week 4', gross: completedJobs.length > 0 ? grossEarnings * 0.3 : 6000 }
                ].map((item, idx) => {
                  const commission = item.gross * 0.1;
                  const net = item.gross - commission;
                  const maxVal = completedJobs.length > 0 ? grossEarnings : 10000;
                  const barHeight = Math.min((net / (maxVal || 1)) * 100, 100);
                  
                  return (
                    <div key={idx} className="flex-grow flex flex-col items-center gap-2 group relative">
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 text-white text-[9px] font-bold py-1 px-2 rounded border border-slate-850 text-center z-10 min-w-[90px] pointer-events-none">
                        <span className="block text-slate-400">Gross: LKR {item.gross.toFixed(0)}</span>
                        <span className="block text-emerald-450">Net: LKR {net.toFixed(0)}</span>
                      </div>

                      {/* Bar columns */}
                      <div className="w-full bg-slate-950/80 rounded-t-lg h-20 flex items-end overflow-hidden border border-slate-850">
                        <div
                          className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 transition-all duration-500 rounded-t-md cursor-pointer hover:from-emerald-500 hover:to-emerald-300"
                          style={{ height: `${barHeight || 5}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-semibold">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Client Bookings List */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

              <h2 className="text-xl font-bold text-white mb-4">Client Bookings List</h2>

              {loadingBookings ? (
                <div className="flex justify-center py-10">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"></div>
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-xl">
                  No service booking requests received yet. Stay active to receive bookings!
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div
                      key={booking._id}
                      className="p-5 bg-slate-950/60 border border-slate-850 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-base">
                            {booking.customerId?.name}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                              booking.status === 'completed'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : booking.status === 'cancelled'
                                ? 'bg-rose-500/10 text-rose-455 border border-rose-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {booking.status}
                          </span>
                        </div>
                        <p className="text-slate-450 text-xs">
                          🛠 {booking.serviceId?.name} • 📆 {new Date(booking.scheduledDate).toLocaleString()}
                        </p>
                        <p className="text-slate-500 text-xs">📍 {booking.address}</p>
                      </div>

                      <div className="flex flex-row md:flex-col items-start md:items-end justify-between w-full md:w-auto border-t md:border-t-0 border-slate-900 pt-4 md:pt-0 gap-3">
                        <div className="text-right">
                          <span className="text-slate-500 text-[10px] block">Gross Job Payout</span>
                          <span className="font-black text-white">LKR {booking.price}</span>
                        </div>

                        <div className="flex gap-2">
                          {['pending', 'accepted', 'in-progress', 'completed'].includes(booking.status) && (
                            <Link
                              to={`/chat?bookingId=${booking._id}`}
                              className="px-3.5 py-2 bg-slate-900 border border-slate-850 hover:bg-slate-850 rounded-xl text-xs font-bold text-slate-300 transition"
                            >
                              Chat
                            </Link>
                          )}

                          {(booking.isPaid || booking.status === 'completed' || booking.status === 'cancelled') && (
                            <button
                              onClick={() => setSelectedInvoiceBooking(booking)}
                              className="px-3.5 py-2 bg-slate-900 border border-slate-855 hover:bg-slate-850 rounded-xl text-xs font-bold text-slate-300 transition cursor-pointer"
                            >
                              Receipt 🧾
                            </button>
                          )}

                          {(booking.status === 'completed' || booking.status === 'cancelled') && (
                            <button
                              onClick={() => handleDelete(booking._id)}
                              className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/30 rounded-xl text-xs font-bold text-rose-400 transition cursor-pointer"
                            >
                              Delete 🗑️
                            </button>
                          )}

                          {booking.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleDecline(booking._id)}
                                className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl text-xs font-bold text-rose-400 transition"
                              >
                                Decline
                              </button>
                              <button
                                onClick={() => handleAccept(booking._id)}
                                className="px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl text-xs font-bold text-emerald-400 transition"
                              >
                                Accept
                              </button>
                            </>
                          )}

                          {booking.status === 'accepted' && (
                            <span className={`px-3 py-2 text-xs font-bold rounded-xl ${
                              booking.isPaid ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-900 text-slate-500 border border-slate-850'
                            }`}>
                              {booking.isPaid ? 'Ready to Start (Paid)' : 'Waiting Client Payment'}
                            </span>
                          )}

                          {booking.status === 'accepted' && booking.isPaid && (
                            <button
                              onClick={() => handleStartJob(booking._id)}
                              className="px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-xl text-xs font-bold text-amber-400 transition animate-pulse"
                            >
                              Start Job
                            </button>
                          )}

                          {booking.status === 'in-progress' && (
                            <>
                              {booking.providerMarkedComplete ? (
                                <span className="px-3 py-2 bg-slate-900 border border-slate-850 rounded-xl text-xs font-bold text-slate-500">
                                  Waiting Client Release
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleMarkCompleted(booking._id)} // sets complete flag
                                  className="px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl text-xs font-bold text-emerald-400 transition"
                                >
                                  Mark Completed
                                </button>
                              )}
                            </>
                          )}
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Availability Schedule</h2>
              <div className="space-y-2">
                {profile?.availability?.map((item) => (
                  <div key={item.day} className="flex justify-between items-center text-sm py-2 border-b border-slate-800 last:border-b-0">
                    <span className="font-semibold text-slate-300">{item.day}</span>
                    <span className="text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg text-xs font-mono">
                      {item.startTime} - {item.endTime}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Bio Description</h2>
              <p className="text-slate-350 text-sm leading-relaxed whitespace-pre-wrap">{profile?.bio}</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Service Coverage Coordinates</h2>
              <p className="text-slate-350 text-xs font-semibold font-mono space-y-1.5">
                <span>Lng: {profile?.userId?.location?.coordinates?.[0] || '79.8612 (Default Colombo)'}</span>
                <br/>
                <span>Lat: {profile?.userId?.location?.coordinates?.[1] || '6.9271 (Default Colombo)'}</span>
              </p>
            </div>
          </aside>

        </main>
      </div>

      {/* Invoice Receipt Modal */}
      {selectedInvoiceBooking && (
        <InvoiceModal
          booking={selectedInvoiceBooking}
          onClose={() => setSelectedInvoiceBooking(null)}
        />
      )}
    </div>
  );
};

export default ProviderDashboard;
