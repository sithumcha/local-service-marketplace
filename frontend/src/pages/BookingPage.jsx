import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import useBookingStore from '../store/useBookingStore';
import PaymentModal from '../components/PaymentModal';

const BookingPage = () => {
  const [searchParams] = useSearchParams();
  const providerId = searchParams.get('providerId');

  const [provider, setProvider] = useState(null);
  const [loadingProvider, setLoadingProvider] = useState(true);

  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00');
  const [address, setAddress] = useState('');
  const [hours, setHours] = useState(2);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [masterCategories, setMasterCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { createBooking } = useBookingStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch master categories as fallback
    api.get('/services')
      .then((res) => {
        if (res.data && res.data.success) {
          setMasterCategories(res.data.services || []);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (providerId) {
      setLoadingProvider(true);
      api.get(`/providers/${providerId}`)
        .then((res) => {
          const profile = res.data.profile;
          setProvider(profile);
          // Set default category ID from provider categories
          if (profile?.serviceCategories && profile.serviceCategories.length > 0) {
            setSelectedServiceId(profile.serviceCategories[0]._id || profile.serviceCategories[0]);
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setLoadingProvider(false));
    }
  }, [providerId]);


  const executeBookingSubmission = async (isPaid = false) => {
    setSubmitting(true);
    setErrorMsg('');
    try {
      const scheduledDate = new Date(`${date}T${time}`);
      const totalPrice = provider.hourlyRate * hours;

      // Resolve category ID
      const resolvedServiceId = selectedServiceId || 
        (provider?.serviceCategories && provider.serviceCategories.length > 0
          ? (provider.serviceCategories[0]._id || provider.serviceCategories[0])
          : (masterCategories[0]?._id || '6a4a5b6e799387866526bb58'));

      await createBooking({
        providerId: provider.userId?._id || providerId,
        serviceId: resolvedServiceId,
        scheduledDate,
        address,
        price: totalPrice,
        paymentMethod,
        isPaid,
        coordinates: [79.8612, 6.9271], // Default Colombo coordinates
      });

      // Redirect to customer dashboard
      navigate('/dashboard/customer');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit booking order');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !address) {
      setErrorMsg('Please complete all form fields');
      return;
    }

    if (paymentMethod === 'card') {
      setShowPaymentModal(true);
    } else {
      await executeBookingSubmission(false);
    }
  };

  if (loadingProvider) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to={`/providers/${providerId}`} className="text-sm font-semibold hover:text-amber-400 transition">
            ← Cancel Booking
          </Link>
          <span className="text-xl font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            QuickServe.lk
          </span>
        </div>
      </header>

      {/* Main Form */}
      <main className="flex-grow max-w-2xl w-full mx-auto px-4 py-12">
        <form onSubmit={handleSubmit} className="space-y-6 bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl">
          <div>
            <h1 className="text-2xl font-black text-white">Schedule Service Booking</h1>
            <p className="text-slate-400 text-xs mt-1">
              Booking verification details for {provider?.userId?.name}.
            </p>
          </div>

          {errorMsg && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-455 text-sm rounded-xl">
              {errorMsg}
            </div>
          )}

          {/* Service Category Dropdown Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Select Service Category
            </label>
            <select
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              {provider?.serviceCategories && provider.serviceCategories.length > 0 ? (
                provider.serviceCategories.map((cat) => (
                  <option key={cat._id || cat} value={cat._id || cat}>
                    {cat.name || 'Offered Service'} {cat.icon || '🛠'}
                  </option>
                ))
              ) : (
                masterCategories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name} {cat.icon}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Service slot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Service Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Service Start Time
              </label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition text-sm"
              />
            </div>
          </div>

          {/* Payment Method Option Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Select Payment Option
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-4 rounded-2xl border text-sm font-bold text-center transition flex flex-col items-center gap-1.5 cursor-pointer ${
                  paymentMethod === 'card'
                    ? 'bg-amber-500/10 border-amber-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span>💳 Card Escrow</span>
                <span className="text-[9px] text-slate-500 font-normal">🔒 Secure Escrow Hold</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-4 rounded-2xl border text-sm font-bold text-center transition flex flex-col items-center gap-1.5 cursor-pointer ${
                  paymentMethod === 'cash'
                    ? 'bg-amber-500/10 border-amber-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span>💵 Cash Payout</span>
                <span className="text-[9px] text-slate-500 font-normal">Handover on completion</span>
              </button>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Full Service Address (Sri Lanka)
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="E.g. 123 Galle Road, Colombo 03"
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-white placeholder-slate-650 focus:outline-none focus:border-amber-500 transition text-sm"
            />
          </div>

          {/* Estimated duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center bg-slate-950 p-4 rounded-2xl border border-slate-850">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Estimated Duration
              </label>
              <select
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className="bg-transparent border-0 font-bold text-white text-lg focus:ring-0 focus:outline-none cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((h) => (
                  <option key={h} value={h} className="bg-slate-950 text-white">
                    {h} {h === 1 ? 'Hour' : 'Hours'}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:text-right">
              <span className="text-slate-500 text-xs block">Estimated Total Price</span>
              <span className="text-amber-400 text-2xl font-black">
                LKR {provider ? provider.hourlyRate * hours : 0}
              </span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black rounded-xl hover:scale-[1.01] hover:from-amber-400 hover:to-amber-500 transition duration-150 disabled:opacity-50"
          >
            {submitting ? 'Holding Escrow & Requesting...' : 'Authorize Held Payment & Book Now'}
          </button>
        </form>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500 mt-8">
        <p>© 2026 QuickServe.lk. Secure Escrow hold payment processing.</p>
      </footer>

      {/* Payment Gateway Modal */}
      {showPaymentModal && (
        <PaymentModal
          booking={{ price: provider ? provider.hourlyRate * hours : 0 }}
          onConfirm={async () => {
            setShowPaymentModal(false);
            await executeBookingSubmission(true);
          }}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
};

export default BookingPage;
