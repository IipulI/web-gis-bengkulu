import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white px-6">
      <div className="bg-white shadow-xl rounded-2xl p-10 max-w-lg text-center border border-green-100">
        {/* ICON / ILLUSTRATION */}
        <div className="mx-auto mb-6 w-32 h-32">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="90" fill="#E8FBEA" />
            <path
              d="M70 75 L130 75 L125 140 L75 140 Z"
              fill="white"
              stroke="#4CAF50"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="100" cy="95" r="8" fill="#4CAF50" />
            <rect x="90" y="110" width="20" height="25" rx="3" fill="#4CAF50" />
          </svg>
        </div>

        {/* TEXT */}
        <h1 className="text-4xl font-bold text-green-700 mb-2">
          Halaman Tidak Ditemukan
        </h1>
        <p className="text-gray-600 text-sm mb-8 leading-relaxed">
          Sepertinya Anda mencoba mengakses halaman yang tidak tersedia atau
          sudah dipindahkan. Silakan kembali ke halaman sebelumnya.
        </p>

        {/* BUTTON */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mx-auto bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg"
        >
          <ArrowLeft size={18} />
          Kembali
        </button>
      </div>
    </div>
  );
};

export default NotFound;
