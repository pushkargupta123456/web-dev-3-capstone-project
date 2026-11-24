import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft } from 'lucide-react';

const NotFound: React.FC = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
    <div className="text-center max-w-md">
      <div className="w-16 h-16 rounded-2xl bg-[#1e2a5e]/10 flex items-center justify-center mx-auto mb-6 text-[#1e2a5e]">
        <GraduationCap className="w-8 h-8" />
      </div>
      <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-2">404</h1>
      <h2 className="text-xl font-bold text-gray-800 mb-2">Page Not Found</h2>
      <p className="text-sm text-gray-500 mb-6">The requested campus portal resource or page does not exist or has been moved.</p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 bg-[#1e2a5e] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#141b3d] transition-colors shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Portal
      </Link>
    </div>
  </div>
);

export default NotFound;
