import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Icons = {
  ArrowLeft: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
  CreditCard: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
  History: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Receipt: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  ShieldExclamation: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0-8v6m-5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
};

export default function BursarPortal() {
  const token = localStorage.getItem("token");
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [payAmount, setPayAmount] = useState("");

  useEffect(() => {
    const fetchFees = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/fees/my-fees", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setInvoices(res.data.fees || []);
      } catch (err) {
        console.error("Financial Sync Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFees();
  }, [token]);

  const handlePayment = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `http://localhost:8000/api/fees/pay/${selectedInvoice._id}`,
        { amount: payAmount, method: "Credit Card" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Payment successful. Your academic standing has been updated.");
      window.location.reload(); // Refresh to show new balance
    } catch (err) {
      alert(err.response?.data?.message || "Transaction failed.");
    }
  };

  const totalBalance = invoices.reduce((acc, inv) => acc + (inv.totalAmount - inv.amountPaid), 0);
  const hasHold = invoices.some(inv => inv.academicHold);

  if (loading) return <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center"><div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-200 pb-20 font-sans">
      <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/student/dashboard" className="text-sm font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-2"><Icons.ArrowLeft /> Portal Home</Link>
          <span className="text-sm font-medium text-slate-400">Student Financial Center</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-10">
        {/* FINANCIAL STANDING HERO */}
        <div className="bg-gradient-to-br from-slate-900 to-[#12182b] border border-white/5 rounded-3xl p-8 mb-10 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <h1 className="text-4xl font-black text-white mb-2">Account Summary</h1>
            <p className="text-slate-400">Manage your tuition, installments, and academic standing.</p>
          </div>
          <div className="text-center md:text-right">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Outstanding Balance</p>
            <p className={`text-5xl font-black ${totalBalance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              ₹{totalBalance.toLocaleString()}
            </p>
            {hasHold && (
              <div className="mt-4 inline-flex items-center gap-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 px-4 py-2 rounded-2xl text-xs font-bold animate-pulse">
                <Icons.ShieldExclamation /> ACADEMIC HOLD ACTIVE
              </div>
            )}
          </div>
        </div>

        {/* INVOICE LIST */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><Icons.Receipt /> Pending Invoices</h2>
            {invoices.filter(i => i.status !== 'paid').map(inv => (
              <div key={inv._id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-indigo-500/30 transition shadow-lg">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-500/10 px-2 py-1 rounded">{inv.feeType}</span>
                    <h3 className="text-xl font-bold text-white mt-2">Semester {inv.semester} Fees</h3>
                    <p className="text-sm text-slate-500 mt-1">Due Date: {new Date(inv.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-white">₹{(inv.totalAmount - inv.amountPaid).toLocaleString()}</p>
                    <p className="text-xs text-slate-500">Balance of ₹{inv.totalAmount.toLocaleString()}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedInvoice(inv)}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition flex items-center justify-center gap-2"
                >
                  <Icons.CreditCard /> Process Installment
                </button>
              </div>
            ))}
          </div>

          {/* PAYMENT HISTORY LEDGER */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl h-fit">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Icons.History /> Transaction Ledger</h2>
            <div className="space-y-4">
              {invoices.flatMap(inv => inv.paymentHistory).sort((a,b) => new Date(b.date) - new Date(a.date)).map((pay, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-slate-950 border border-slate-800 rounded-2xl">
                  <div>
                    <p className="text-sm font-bold text-slate-300">₹{pay.amount.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-500 uppercase">{pay.method}</p>
                  </div>
                  <p className="text-xs text-slate-500">{new Date(pay.date).toLocaleDateString()}</p>
                </div>
              ))}
              {invoices.length === 0 && <p className="text-center text-slate-500 text-sm py-10">No transactions recorded yet.</p>}
            </div>
          </div>
        </div>
      </div>

      {/* PAYMENT MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
            <button onClick={() => setSelectedInvoice(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white">✕</button>
            <h2 className="text-2xl font-black text-white mb-6">Make a Payment</h2>
            <form onSubmit={handlePayment} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Payment Amount (INR)</label>
                <input 
                  type="number" 
                  required 
                  max={selectedInvoice.totalAmount - selectedInvoice.amountPaid}
                  placeholder={`Max ₹${selectedInvoice.totalAmount - selectedInvoice.amountPaid}`}
                  className="w-full bg-slate-950 border border-slate-800 text-white p-4 rounded-xl focus:border-indigo-500 outline-none transition"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                />
              </div>
              <button type="submit" className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-lg">Confirm Transaction</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}