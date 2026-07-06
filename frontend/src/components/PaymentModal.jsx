import React, { useState } from 'react';

const PaymentModal = ({ booking, onConfirm, onClose }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');

  if (!booking) return null;

  // Format card number with spaces every 4 digits
  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    const formatted = value.match(/.{1,4}/g)?.join(' ') || '';
    setCardNumber(formatted.slice(0, 19));
  };

  // Format expiry date as MM/YY
  const handleExpiryChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) {
      setExpiry(`${value.slice(0, 2)}/${value.slice(2, 4)}`);
    } else {
      setExpiry(value);
    }
  };

  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setCvv(value.slice(0, 3));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cardNumber.length < 19 || expiry.length < 5 || cvv.length < 3 || !name.trim()) {
      alert('Please fill in valid card details.');
      return;
    }

    setProcessing(true);
    setProcessingStep('Contacting secure gateway bank...');

    setTimeout(() => {
      setProcessingStep('Locking LKR ' + booking.price + ' in Escrow custody...');
      setTimeout(async () => {
        try {
          await onConfirm(booking._id);
          onClose();
        } catch (err) {
          alert(err.message || 'Payment hold authorization failed');
        } finally {
          setProcessing(false);
        }
      }, 1500);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
        
        {/* Close Button */}
        {!processing && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-500 hover:text-white p-2 rounded-xl transition hover:bg-slate-800 cursor-pointer"
          >
            ✕
          </button>
        )}

        {/* Modal Header */}
        <div className="text-center pb-2">
          <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block mb-1">
            🔒 Secure Checkout
          </span>
          <h3 className="text-xl font-black text-white">Escrow Authorization Hold</h3>
          <p className="text-slate-500 text-xs mt-1">
            Funds are locked in escrow and only released upon work confirmation.
          </p>
        </div>

        {processing ? (
          /* Processing Loader */
          <div className="py-12 flex flex-col items-center justify-center space-y-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
            <p className="text-sm font-bold text-white text-center">{processingStep}</p>
            <p className="text-[10px] text-slate-500 text-center max-w-xs">
              Please do not refresh the page or click back. Your connection is secured using 256-bit encryption.
            </p>
          </div>
        ) : (
          /* Payment Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Amount details */}
            <div className="flex justify-between items-center bg-slate-950 p-4 rounded-2xl border border-slate-850">
              <span className="text-xs font-bold text-slate-400">Total Escrow Hold Amount</span>
              <span className="text-amber-400 text-xl font-black">LKR {booking.price}</span>
            </div>

            {/* Cardholder Name */}
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">
                Cardholder Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="E.g. Sithum Chanuka"
                className="w-full rounded-xl bg-slate-950 border border-slate-850 px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            {/* Card Number */}
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">
                Card Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="0000 0000 0000 0000"
                  className="w-full rounded-xl bg-slate-950 border border-slate-850 px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-amber-500 transition"
                />
                <span className="absolute right-3.5 top-3.5 text-xs">💳</span>
              </div>
            </div>

            {/* Expiry and CVV */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">
                  Expiry Date
                </label>
                <input
                  type="text"
                  required
                  value={expiry}
                  onChange={handleExpiryChange}
                  placeholder="MM/YY"
                  maxLength="5"
                  className="w-full rounded-xl bg-slate-950 border border-slate-850 px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-amber-500 transition text-center"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">
                  CVV Code
                </label>
                <input
                  type="password"
                  required
                  value={cvv}
                  onChange={handleCvvChange}
                  placeholder="•••"
                  maxLength="3"
                  className="w-full rounded-xl bg-slate-950 border border-slate-850 px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-amber-500 transition text-center"
                />
              </div>
            </div>

            {/* Submit Authorization */}
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-center transition cursor-pointer shadow-lg shadow-amber-500/10 hover:scale-[1.01]"
            >
              🔒 Authorize Held Payment
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
