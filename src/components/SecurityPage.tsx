import React, { useState } from "react";
import {
  ShieldCheck,
  Smartphone,
  Globe,
  MonitorSmartphone,
  LogOut,
} from "lucide-react";

const SecurityPage = () => {
  const [twoFA, setTwoFA] = useState(false);

  const loginHistory = [
    {
      device: "Chrome • Windows 10",
      ip: "36.72.121.45",
      location: "Bengkulu, Indonesia",
      time: "Baru saja",
      active: true,
    },
    {
      device: "Chrome • Android",
      ip: "36.72.88.22",
      location: "Kota Bengkulu",
      time: "2 hari lalu",
      active: false,
    },
    {
      device: "Safari • iPhone",
      ip: "36.72.90.13",
      location: "Kepahiang",
      time: "1 minggu lalu",
      active: false,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* HEADER */}
      <h2 className="text-2xl font-bold text-green-800 mb-8">Keamanan Akun</h2>

      <div className="space-y-10">
        {/* =======================================
            1. TWO FACTOR AUTHENTICATION
        ======================================== */}
        <div className="bg-white p-8 border border-green-100 shadow-md rounded-2xl">
          <h3 className="text-lg font-semibold text-green-700 flex items-center gap-2 mb-6">
            <ShieldCheck size={18} /> Autentikasi Dua Faktor (2FA)
          </h3>

          <div className="flex items-center justify-between">
            <p className="text-gray-700 text-sm leading-relaxed">
              Tambahkan lapisan keamanan. Saat login, sistem meminta kode OTP
              dari aplikasi Authenticator.
            </p>

            <button
              onClick={() => setTwoFA(!twoFA)}
              className={`px-5 py-2 rounded-lg shadow transition text-white ${
                twoFA
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {twoFA ? "Nonaktifkan" : "Aktifkan"}
            </button>
          </div>

          {twoFA && (
            <p className="mt-4 bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-sm">
              ✔ 2FA aktif — Anda akan memerlukan kode OTP saat login.
            </p>
          )}
        </div>

        {/* =======================================
            2. LOGIN ACTIVITY / RIWAYAT MASUK
        ======================================== */}
        <div className="bg-white p-8 border border-green-100 shadow-md rounded-2xl">
          <h3 className="text-lg font-semibold text-green-700 flex items-center gap-2 mb-6">
            <MonitorSmartphone size={18} /> Aktivitas Login
          </h3>

          <div className="space-y-4">
            {loginHistory.map((log, i) => (
              <div
                key={i}
                className="flex items-start justify-between p-4 border rounded-xl bg-gray-50 hover:bg-gray-100 transition"
              >
                <div>
                  <p className="font-semibold text-gray-800">{log.device}</p>
                  <p className="text-gray-500 text-sm">
                    {log.location} • IP {log.ip}
                  </p>
                  <p className="text-xs text-gray-400">{log.time}</p>
                </div>

                {log.active ? (
                  <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700 font-medium">
                    Aktif Sekarang
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        {/* =======================================
            3. SESSION MANAGEMENT
        ======================================== */}
        <div className="bg-white p-8 border border-green-100 shadow-md rounded-2xl">
          <h3 className="text-lg font-semibold text-green-700 flex items-center gap-2 mb-6">
            <LogOut size={18} /> Manajemen Sesi
          </h3>

          <p className="text-gray-700 text-sm mb-4">
            Anda dapat keluar dari semua perangkat kecuali perangkat ini.
          </p>

          <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg shadow transition">
            Logout dari Semua Perangkat
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecurityPage;
