import React from "react";
import { Camera, User, Mail, Shield } from "lucide-react";

const ProfilePage = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* HEADER */}
      <h2 className="text-2xl font-bold text-green-800 mb-8">
        Profil Pengguna
      </h2>

      <div className="bg-white shadow-md border border-green-100 rounded-2xl p-8 grid md:grid-cols-3 gap-10">
        {/* FOTO PROFIL */}
        <div className="flex flex-col items-center">
          <div className="relative w-40 h-40">
            <img
              src="https://ui-avatars.com/api/?name=Admin+Bengkulu&background=16a34a&color=fff&size=200"
              alt="Foto Profil"
              className="w-40 h-40 rounded-full object-cover shadow"
            />

            <label className="absolute bottom-2 right-2 bg-green-600 hover:bg-green-700 text-white p-2 rounded-full cursor-pointer shadow-lg transition">
              <Camera size={18} />
              <input type="file" className="hidden" />
            </label>
          </div>

          <p className="text-gray-600 text-sm mt-3">
            Klik ikon kamera untuk mengganti foto.
          </p>
        </div>

        {/* FORM PROFIL */}
        <div className="md:col-span-2 space-y-6">
          {/* NAMA */}
          <div>
            <label className="text-sm font-semibold text-green-700 flex items-center gap-2 mb-1">
              <User size={16} /> Nama Lengkap
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="Masukkan nama lengkap"
              defaultValue="Admin Kota Bengkulu"
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-sm font-semibold text-green-700 flex items-center gap-2 mb-1">
              <Mail size={16} /> Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="Masukkan email"
              defaultValue="admin@bengkulu.go.id"
            />
          </div>

          {/* ROLE */}
          <div>
            <label className="text-sm font-semibold text-green-700 flex items-center gap-2 mb-1">
              <Shield size={16} /> Hak Akses
            </label>
            <input
              type="text"
              disabled
              className="w-full px-4 py-2 border bg-gray-100 rounded-lg text-gray-600"
              value="Administrator"
            />
          </div>

          {/* BUTTON AKSI */}
          <div className="flex gap-4 pt-3">
            <button className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow transition">
              Simpan Perubahan
            </button>
            <button className="border border-gray-300 px-5 py-2 rounded-lg hover:bg-gray-50 transition">
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
