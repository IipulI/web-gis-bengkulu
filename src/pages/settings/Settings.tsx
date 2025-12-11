import React, { useState } from "react";
import {
  User,
  Shield,
  Bell,
  Monitor,
  Lock,
  LogOut,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearUserData } from "../../store/userSlice";

const Settings = () => {
  const [activePage, setActivePage] = useState(null);

  const goBack = () => setActivePage(null);

  const SectionWrapper = ({ title, children }) => (
    <div className="p-6 space-y-8">
      <div className="flex items-center space-x-3 mb-2">
        <button onClick={goBack} className="p-2 rounded-full hover:bg-gray-100">
          <ArrowLeft />
        </button>
        <h1 className="text-xl font-semibold text-gray-700">{title}</h1>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow border space-y-4 animate-fadeIn">
        {children}
      </div>
    </div>
  );

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(clearUserData());
    navigate("/login");
  };

  const renderPage = () => {
    switch (activePage) {
      case "profile":
        return (
          <SectionWrapper title="Profil Pengguna">
            <p className="text-gray-700 text-sm">
              Halaman ini dapat berisi form untuk mengubah nama, email, foto,
              atau informasi lainnya.
            </p>
          </SectionWrapper>
        );

      case "security":
        return (
          <SectionWrapper title="Keamanan Akun">
            <p className="text-gray-700 text-sm">
              Pengaturan keamanan seperti autentikasi dua faktor atau login
              activity.
            </p>
          </SectionWrapper>
        );

      case "password":
        return (
          <SectionWrapper title="Ubah Kata Sandi">
            <form className="space-y-4">
              <input
                type="password"
                placeholder="Kata sandi lama"
                className="p-3 border rounded w-full"
              />
              <input
                type="password"
                placeholder="Kata sandi baru"
                className="p-3 border rounded w-full"
              />
              <input
                type="password"
                placeholder="Konfirmasi kata sandi"
                className="p-3 border rounded w-full"
              />
              <button className="bg-green-600 text-white w-full py-3 rounded-lg shadow hover:bg-green-700 transition">
                Simpan Perubahan
              </button>
            </form>
          </SectionWrapper>
        );

      case "notification":
        return (
          <SectionWrapper title="Notifikasi">
            <p className="text-gray-700 text-sm">Kelola notifikasi aplikasi.</p>
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-gray-600">Notifikasi Push</span>
              <input type="checkbox" className="toggle-checkbox" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Email Alert</span>
              <input type="checkbox" className="toggle-checkbox" />
            </div>
          </SectionWrapper>
        );

      case "appearance":
        return (
          <SectionWrapper title="Tampilan">
            <p className="text-gray-700 text-sm">Mode Light / Dark Theme.</p>
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-gray-600">Dark Mode</span>
              <input type="checkbox" className="toggle-checkbox" />
            </div>
          </SectionWrapper>
        );

      case "logout":
        return (
          <SectionWrapper title="Keluar Akun">
            <p className="text-gray-700 text-sm mb-4">
              Anda yakin ingin keluar dari akun Anda?
            </p>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white w-full py-3 rounded-lg shadow hover:bg-red-700 transition"
            >
              Keluar
            </button>
          </SectionWrapper>
        );

      default:
        return (
          <div className="p-6 space-y-8 animate-fadeIn">
            <div className="bg-green-600 text-white p-6 rounded-2xl shadow-md">
              <h1 className="text-2xl font-bold">Pengaturan</h1>
              <p className="opacity-90 mt-1 text-sm">
                Kelola preferensi akun, keamanan, dan tampilan aplikasi.
              </p>
            </div>

            {/* ACCOUNT */}
            <section>
              <h2 className="text-gray-700 font-semibold mb-3">Akun</h2>
              <div className="bg-white rounded-xl border shadow divide-y">
                <button
                  onClick={() => setActivePage("profile")}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <div className="flex items-center space-x-3">
                    <User className="text-green-600" />
                    <div className="text-left">
                      <p className="font-medium text-gray-800">
                        Profil Pengguna
                      </p>
                      <p className="text-xs text-gray-500">
                        Informasi pribadi & akun
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-400" />
                </button>

                <button
                  onClick={() => setActivePage("security")}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <div className="flex items-center space-x-3">
                    <Shield className="text-green-600" />
                    <div className="text-left">
                      <p className="font-medium text-gray-800">Keamanan</p>
                      <p className="text-xs text-gray-500">
                        Password & kontrol akses
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-400" />
                </button>

                <button
                  onClick={() => setActivePage("password")}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <div className="flex items-center space-x-3">
                    <Lock className="text-green-600" />
                    <div className="text-left">
                      <p className="font-medium text-gray-800">
                        Ubah Kata Sandi
                      </p>
                      <p className="text-xs text-gray-500">
                        Ganti password akun Anda
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-400" />
                </button>
              </div>
            </section>

            {/* PREFERENCES */}
            <section>
              <h2 className="text-gray-700 font-semibold mb-3">Preferensi</h2>
              <div className="bg-white rounded-xl border shadow divide-y">
                <button
                  onClick={() => setActivePage("notification")}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <div className="flex items-center space-x-3">
                    <Bell className="text-green-600" />
                    <div className="text-left">
                      <p className="font-medium text-gray-800">Notifikasi</p>
                      <p className="text-xs text-gray-500">
                        Kelola preferensi alert
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-400" />
                </button>

                <button
                  onClick={() => setActivePage("appearance")}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <div className="flex items-center space-x-3">
                    <Monitor className="text-green-600" />
                    <div className="text-left">
                      <p className="font-medium text-gray-800">Tampilan</p>
                      <p className="text-xs text-gray-500">
                        Mode terang & gelap
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-400" />
                </button>
              </div>
            </section>

            {/* LOGOUT */}
            <section>
              <h2 className="text-gray-700 font-semibold mb-3">Aksi Lainnya</h2>
              <div className="bg-white rounded-xl border shadow">
                <button
                  onClick={() => setActivePage("logout")}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <div className="flex items-center space-x-3">
                    <LogOut className="text-red-500" />
                    <p className="font-medium text-red-600">Keluar dari Akun</p>
                  </div>
                  <ChevronRight size={18} className="text-gray-400" />
                </button>
              </div>
            </section>
          </div>
        );
    }
  };

  return <DashboardLayout>{renderPage()}</DashboardLayout>;
};

export default Settings;
