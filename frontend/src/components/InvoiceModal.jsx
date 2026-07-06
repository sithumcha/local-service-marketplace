import React, { useEffect, useState } from 'react';
import api from '../services/api';

const InvoiceModal = ({ booking, onClose }) => {
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (booking?._id && (booking.isPaid || booking.status === 'completed' || booking.status === 'cancelled')) {
      setLoading(true);
      api.get('/payments/history')
        .then((res) => {
          if (res.data && res.data.payments) {
            const match = res.data.payments.find(
              (p) => {
                const bId = p.bookingId?._id || p.bookingId;
                return bId?.toString() === booking._id.toString();
              }
            );
            setPayment(match);
          }
        })
        .catch((err) => console.error('Failed to load payment detail:', err))
        .finally(() => setLoading(false));
    }
  }, [booking]);

  if (!booking) return null;

  // Calculate default values based on 10% standard commission rate from backend schema
  const defaultBasePrice = (booking.price * 0.90).toFixed(2);
  const defaultCommission = (booking.price * 0.10).toFixed(2);
  const defaultTotal = booking.price.toFixed(2);

  // Render actual payment details if loaded, else use fallback calculations
  const transactionId = payment?.transactionId || booking._id.toString().toUpperCase().slice(-12);
  const paymentMethod = payment?.paymentMethod || 'Credit/Debit Card';
  const basePrice = payment ? payment.providerPayoutAmount.toFixed(2) : defaultBasePrice;
  const platformFee = payment ? payment.commissionAmount.toFixed(2) : defaultCommission;
  const totalPrice = payment ? payment.amount.toFixed(2) : defaultTotal;

  const getStatusBadge = () => {
    if (booking.status === 'cancelled') {
      return (
        <span className="px-3 py-1 text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full">
          Refunded to Card ↩
        </span>
      );
    }
    if (booking.status === 'completed') {
      return (
        <span className="px-3 py-1 text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
          Released to Provider 💸
        </span>
      );
    }
    if (booking.isPaid) {
      return (
        <span className="px-3 py-1 text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full animate-pulse">
          🔒 Held in Escrow
        </span>
      );
    }
    return (
      <span className="px-3 py-1 text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700 rounded-full">
        Pending Payment
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white p-2 rounded-xl transition hover:bg-slate-800 cursor-pointer"
        >
          ✕
        </button>

        {/* Invoice Header */}
        <div className="flex justify-between items-start border-b border-slate-850 pb-4">
          <div>
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block mb-1">
              Escrow Receipt
            </span>
            <h3 className="text-xl font-black text-white">QuickServe.lk</h3>
          </div>
          <div className="text-right">
            <span className="text-slate-500 text-[10px] block font-bold">TRANSACTION REF</span>
            <span className="text-slate-300 font-mono text-xs font-bold">
              {transactionId}
            </span>
          </div>
        </div>

        {/* Status Area */}
        <div className="flex justify-between items-center bg-slate-950/60 p-4 border border-slate-850 rounded-2xl">
          <span className="text-xs font-bold text-slate-400">Payment Status</span>
          {getStatusBadge()}
        </div>

        {/* Loading Indicator */}
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"></div>
            <span className="text-xs text-slate-550 ml-2">Loading transactions logs...</span>
          </div>
        ) : (
          /* Invoice Details Grid */
          <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs border-b border-slate-850 pb-6">
            <div>
              <span className="text-slate-500 block">CUSTOMER</span>
              <span className="text-white font-bold">{booking.customerId?.name || 'Client'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">PROVIDER</span>
              <span className="text-white font-bold">{booking.providerId?.name || 'Expert'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">SERVICE JOB</span>
              <span className="text-white font-bold">{booking.serviceId?.name || 'General Help'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">PAYMENT METHOD</span>
              <span className="text-white font-bold capitalize">{paymentMethod}</span>
            </div>
          </div>
        )}

        {/* Price Breakdown */}
        <div className="space-y-3">
          <h4 className="text-xs font-black text-white uppercase tracking-wider">Fee Breakdown</h4>
          <div className="space-y-2 bg-slate-950/40 p-4 border border-slate-850 rounded-2xl">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Base Provider Payout (90%)</span>
              <span className="font-semibold text-slate-200">LKR {basePrice}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Escrow Commission Fee (10%)</span>
              <span className="font-semibold text-slate-200">LKR {platformFee}</span>
            </div>
            <div className="border-t border-slate-850 my-2 pt-2 flex justify-between text-sm font-bold">
              <span className="text-white">Total Charge (Escrow Deposit)</span>
              <span className="text-amber-400">LKR {totalPrice}</span>
            </div>
          </div>
        </div>


        {/* Note / Escrow stamp */}
        <div className="text-center space-y-1 py-1">
          <span className="text-[9px] text-slate-500 block leading-normal">
            🛡️ Escrow Guarantee: Funds are securely held by QuickServe.lk and only released to the provider upon completion of the service job.
          </span>
        </div>

        {/* Footer Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-slate-950 hover:bg-slate-850 border border-slate-850 hover:border-slate-800 rounded-xl text-xs font-bold text-slate-300 transition cursor-pointer"
        >
          Close Receipt
        </button>

      </div>
    </div>
  );
};

export default InvoiceModal;
