import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const Unauthorized: React.FC = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
    <div className="text-center max-w-md">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-6 text-rose-600">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Access Denied</h1>
      <p className="text-sm text-gray-500 mb-6">You do not have authorization to access this institutional management module.</p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 bg-[#1e2a5e] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#141b3d] transition-colors shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Authorized Dashboard
      </Link>
    </div>
  </div>
);

export default Unauthorized;
