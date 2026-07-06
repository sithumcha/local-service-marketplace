import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import useBookingStore from '../../store/useBookingStore';
import NotificationBell from '../../components/NotificationBell';
import InvoiceModal from '../../components/InvoiceModal';
import PaymentModal from '../../components/PaymentModal';


const CustomerDashboard = () => {
  const { user, logout } = useAuthStore();
  const { bookings, fetchUserBookings, updateStatus, payBooking, submitReview, deleteBooking, loading } = useBookingStore();

  const [reviewBookingId, setReviewBookingId] = useState(null);
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedInvoiceBooking, setSelectedInvoiceBooking] = useState(null);
  const [selectedPaymentBooking, setSelectedPaymentBooking] = useState(null);
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (user?._id) {
      fetchUserBookings(user._id);
    }
  }, [user]);

  const handlePay = async (id) => {
    try {
      await payBooking(id);
      alert('Payment authorization hold secured in escrow! Job is now in-progress.');
      fetchUserBookings(user._id);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this service booking? Held funds will be refunded.')) {
      try {
        await updateStatus(id, 'cancelled');
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleComplete = async (id) => {
    if (window.confirm('Mark this job as completed? This will release the escrow held funds to the service provider.')) {
      try {
        await updateStatus(id, 'completed');
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

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    setReviewError('');

    try {
      await submitReview({
        bookingId: reviewBookingId,
        rating,
        comment,
      });
      alert('Thank you! Review submitted successfully.');
      setReviewBookingId(null);
      setComment('');
      setRating(5);
      fetchUserBookings(user._id); // Reload to remove review button
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const completedCount = bookings.filter((b) => b.status === 'completed').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 relative">
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto z-10 relative">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-900 pb-6 mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-white">Customer Dashboard</h1>
            <p className="text-slate-400">Welcome back, {user?.name || 'Customer'}! Let's get things fixed.</p>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <Link
              to="/search"
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-sm transition"
            >
              Find Providers
            </Link>
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
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Bookings Scheduled</p>
                <p className="text-3xl font-black text-white mt-1">{bookings.length}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Completed Service Jobs</p>
                <p className="text-3xl font-black text-emerald-400 mt-1">{completedCount}</p>
              </div>
            </div>

            {/* Main Area */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Your Recent Booking Orders</h2>

              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"></div>
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-xl">
                  No bookings found. Propose a job by searching for service providers!
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
                            {booking.providerId?.name}
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
                        <p className="text-slate-400 text-xs">
                          🛠 {booking.serviceId?.name || 'General Help'} • 📆 {new Date(booking.scheduledDate).toLocaleString()}
                        </p>
                        <p className="text-slate-500 text-xs">📍 {booking.address}</p>
                      </div>

                      <div className="flex flex-row md:flex-col items-start md:items-end justify-between w-full md:w-auto border-t md:border-t-0 border-slate-900 pt-4 md:pt-0 gap-3">
                        <div className="text-right">
                          <span className="text-slate-500 text-[10px] block">Price</span>
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

                          {booking.status === 'completed' && (
                            <button
                              onClick={() => setReviewBookingId(booking._id)}
                              className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-xl text-xs font-bold text-amber-400 transition cursor-pointer"
                            >
                              Review ★
                            </button>
                          )}

                          {(booking.status === 'pending' || (booking.status === 'accepted' && !booking.isPaid)) && (
                            <button
                              onClick={() => handleCancel(booking._id)}
                              className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/30 rounded-xl text-xs font-bold text-rose-400 transition"
                            >
                              Cancel
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

                          {booking.status === 'accepted' && !booking.isPaid && booking.paymentMethod === 'card' && (
                             <button
                               onClick={() => setSelectedPaymentBooking(booking)}
                               className="px-3.5 py-2 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 rounded-xl text-xs font-bold text-amber-400 transition animate-pulse cursor-pointer"
                             >
                               Pay (Escrow hold)
                             </button>
                           )}

                          {booking.status === 'in-progress' && (
                            <div className="flex items-center gap-2">
                              {booking.providerMarkedComplete && (
                                <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-xl">
                                  Provider finished
                                </span>
                              )}
                              <button
                                onClick={() => handleComplete(booking._id)}
                                className="px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl text-xs font-bold text-emerald-400 transition"
                              >
                                Confirm complete (Release payout)
                              </button>
                            </div>
                          )}

                          {booking.status === 'completed' && (
                            <button
                              onClick={() => setReviewBookingId(booking._id)}
                              className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/30 rounded-xl text-xs font-bold text-amber-400 transition"
                            >
                              Review
                            </button>
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
              <h2 className="text-xl font-bold text-white mb-4">Customer Details</h2>
              
              <div className="space-y-4 text-sm text-slate-300">
                <div>
                  <span className="text-slate-500 block text-xs uppercase tracking-wider">Name</span>
                  <span className="font-semibold">{user?.name}</span>
                </div>
                
                <div>
                  <span className="text-slate-500 block text-xs uppercase tracking-wider">Email Address</span>
                  <span>{user?.email}</span>
                </div>

                <div>
                  <span className="text-slate-500 block text-xs uppercase tracking-wider">Phone Number</span>
                  <span>{user?.phone}</span>
                </div>

                <div>
                  <span className="text-slate-500 block text-xs uppercase tracking-wider">Account Status</span>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold mt-1 ${
                    user?.isVerified ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {user?.isVerified ? '✓ Verified' : 'Pending Verification'}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </main>
      </div>

      {/* Review Modal Popup */}
      {reviewBookingId && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
          <form
            onSubmit={handleReviewSubmit}
            className="w-full max-w-md bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-4 shadow-2xl relative"
          >
            <h3 className="text-xl font-bold text-white">Review Service Job</h3>
            
            {reviewError && (
              <p className="text-xs text-rose-455 p-3 rounded-lg bg-rose-500/5">{reviewError}</p>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Rating</label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isGold = star <= (hoveredRating || rating);
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-transform duration-100 hover:scale-125 focus:outline-none cursor-pointer"
                    >
                      <svg
                        className={`h-8 w-8 transition-colors duration-150 ${
                          isGold ? 'text-amber-400 fill-amber-400' : 'text-slate-700 fill-transparent hover:text-slate-500'
                        }`}
                        stroke="currentColor"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11.48 3.499c.158-.326.628-.326.786 0l2.36 4.782 5.277.767c.36.052.504.496.244.752l-3.818 3.722.9 5.257c.06.353-.31.62-.622.454l-4.72-2.483-4.72 2.483c-.313.166-.682-.101-.622-.454l.9-5.257-3.818-3.722c-.26-.256-.116-.7-.244-.752l5.277-.767 2.36-4.782z"
                        />
                      </svg>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Feedback Comment</label>
              <textarea
                required
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="E.g. Great plumbing repair work, very quick and tidy!"
                className="w-full rounded-xl bg-slate-950 border border-slate-850 px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setReviewBookingId(null)}
                className="flex-grow py-3 bg-slate-950 hover:bg-slate-850 border border-slate-850 rounded-xl text-sm font-semibold transition text-slate-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingReview}
                className="flex-grow py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl text-sm transition"
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Invoice Receipt Modal */}
      {selectedInvoiceBooking && (
        <InvoiceModal
          booking={selectedInvoiceBooking}
          onClose={() => setSelectedInvoiceBooking(null)}
        />
      )}

      {/* Payment Gateway Modal */}
      {selectedPaymentBooking && (
        <PaymentModal
          booking={selectedPaymentBooking}
          onConfirm={handlePay}
          onClose={() => setSelectedPaymentBooking(null)}
        />
      )}
    </div>
  );
};

export default CustomerDashboard;
