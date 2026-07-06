import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import useProviderStore from '../store/useProviderStore';
import useAuthStore from '../store/useAuthStore';
import useBookingStore from '../store/useBookingStore';
import bookingService from '../services/booking.service';

const ProviderProfile = () => {
  const { id } = useParams();
  const { currentProvider, fetchProviderById, loading } = useProviderStore();
  const { user } = useAuthStore();
  const { bookings, fetchUserBookings } = useBookingStore();
  
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [matchedBooking, setMatchedBooking] = useState(null);

  useEffect(() => {
    fetchProviderById(id);
    
    // Load reviews
    setLoadingReviews(true);
    bookingService.getProviderReviews(id)
      .then((data) => {
        setReviews(data.reviews || []);
      })
      .catch((err) => console.error('Failed to load reviews:', err))
      .finally(() => setLoadingReviews(false));
  }, [id]);

  useEffect(() => {
    if (user?._id && user.role === 'customer') {
      fetchUserBookings(user._id);
    }
  }, [user]);

  useEffect(() => {
    if (bookings.length > 0 && currentProvider?.userId?._id) {
      const activeBooking = bookings.find(
        (b) => b.providerId?._id?.toString() === currentProvider.userId._id.toString() && b.status !== 'cancelled'
      );
      setMatchedBooking(activeBooking);
    }
  }, [bookings, currentProvider]);

  if (loading || !currentProvider) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  const { userId, serviceCategories, bio, experienceYears, hourlyRate, availability, ratingAvg, totalReviews, isApproved } = currentProvider;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/search" className="text-sm font-semibold hover:text-amber-400 transition flex items-center gap-1.5">
            ← Back to Search
          </Link>
          <span className="text-xl font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            QuickServe.lk
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-5xl w-full mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column - Details */}
        <section className="md:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex gap-6 items-center flex-wrap sm:flex-nowrap">
            <div className="h-20 w-20 rounded-2xl bg-slate-950 flex items-center justify-center text-3xl font-black text-amber-500 border border-slate-800">
              {userId?.profileImage ? (
                <img src={userId.profileImage} alt="" className="w-full h-full object-cover rounded-2xl" />
              ) : (
                userId?.name?.charAt(0) || 'P'
              )}
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-3xl font-black text-white leading-tight">{userId?.name}</h1>
                {userId?.isVerified && (
                  <span className="bg-sky-500/10 text-sky-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-sky-500/20">
                    ✔️ Verified ID
                  </span>
                )}
                {currentProvider?.isFeatured && (
                  <span className="bg-yellow-500/10 text-yellow-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-yellow-500/20 animate-pulse">
                    ⭐ Featured Pro
                  </span>
                )}
              </div>
              <p className="text-slate-400 font-semibold">{serviceCategories?.map((c) => c.name).join(', ') || 'Service Expert'}</p>
              <div className="flex items-center gap-1.5 text-sm text-slate-500">
                <span className="text-amber-400 font-bold">★ {ratingAvg ? ratingAvg.toFixed(1) : 'New'}</span>
                <span>({totalReviews} reviews)</span>
                <span>•</span>
                <span>{experienceYears} Years Experience</span>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
            <h2 className="text-lg font-bold text-white mb-3">About the Provider</h2>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{bio || 'No bio description provided.'}</p>
          </div>

          {/* Reviews Stream */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
            <h2 className="text-lg font-bold text-white mb-4">Customer Reviews</h2>

            {loadingReviews ? (
              <div className="h-20 flex items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"></div>
              </div>
            ) : reviews.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-6">No reviews submitted yet for this provider.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div key={rev._id} className="p-4 bg-slate-950/60 rounded-2xl border border-slate-950">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-sm text-slate-200">{rev.customerId?.name}</span>
                      <span className="text-amber-400 text-xs">{'★'.repeat(rev.rating)}</span>
                    </div>
                    <p className="text-slate-400 text-sm">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Right Column - Booking Panel */}
        <aside className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl text-center space-y-4">
            <div>
              <span className="text-slate-500 text-xs block uppercase tracking-wider font-bold">Hourly Rate</span>
              <span className="text-white text-3xl font-black">LKR {hourlyRate}</span>
              <span className="text-slate-400 text-sm font-semibold"> / hr</span>
            </div>

            <Link
              to={`/bookings/new?providerId=${userId?._id || id}`}
              className="block w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-center transition shadow-lg shadow-amber-500/10 hover:scale-[1.01]"
            >
              Book Service Now
            </Link>

            {matchedBooking ? (
              <Link
                to={`/chat?bookingId=${matchedBooking._id}`}
                className="block w-full py-3.5 bg-slate-950 border border-slate-850 hover:bg-slate-850 text-amber-400 font-bold rounded-xl text-center transition text-xs shadow-md"
              >
                Chat with Provider 💬
              </Link>
            ) : (
              <div className="p-3 bg-slate-950/50 rounded-2xl border border-slate-950 text-[10px] text-slate-500 leading-normal text-left">
                💬 **Chat Box Note**: Booking this provider will automatically open a secure real-time messaging room with {userId?.name || 'them'} to coordinate the job.
              </div>
            )}


            <p className="text-slate-500 text-xs leading-relaxed">
              Card payment authorization hold placed on booking request. Funds only released upon work completion.
            </p>
          </div>

          {/* Availability */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-455 mb-3">Weekly Schedule</h3>
            <div className="space-y-2.5">
              {availability?.map((item) => (
                <div key={item.day} className="flex justify-between items-center text-xs pb-2 border-b border-slate-800 last:border-b-0">
                  <span className="font-semibold text-slate-300">{item.day}</span>
                  <span className="text-slate-400 bg-slate-950 px-2 py-0.5 rounded font-mono">
                    {item.startTime} - {item.endTime}
                  </span>
                </div>
              ))}
              {(!availability || availability.length === 0) && (
                <p className="text-slate-500 text-xs">No availability registered</p>
              )}
            </div>
          </div>
        </aside>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500 mt-8">
        <p>© 2026 QuickServe.lk. Booking escrows protected.</p>
      </footer>
    </div>
  );
};

export default ProviderProfile;
