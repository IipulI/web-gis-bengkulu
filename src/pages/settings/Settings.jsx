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
  Camera,
  Mail,
  SettingsIcon,
  BellRing,
  ShieldCheck,
  UserCircle,
} from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearUserData } from "../../store/userSlice";
import ProfilePage from "../../components/ProfilePage";
import SecurityPage from "../../components/SecurityPage";

const Settings = () => {
  const [activePage, setActivePage] = useState(null);

  const goBack = () => setActivePage(null);

  // Wrapper untuk halaman detail dengan animasi slide-in
  const SectionWrapper = ({ title, subtitle, children }) => (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-in slide-in-from-right-8 duration-500 ease-out">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={goBack}
          className="p-3 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-emerald-600 hover:border-emerald-100 hover:shadow-lg hover:shadow-emerald-50 transition-all active:scale-90"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none">
            {title}
          </h1>
          <p className="text-slate-400 text-sm font-medium mt-1">{subtitle}</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white">
        {children}
      </div>
    </div>
  );

  const renderPage = () => {
    switch (activePage) {
      case "profile":
        return (
          <SectionWrapper
            title="Profil Pengguna"
            subtitle="Kelola informasi identitas dan data personal Anda."
          >
            <div className="flex flex-col items-center mb-8">
              <div className="w-24 h-24 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center text-emerald-600 mb-4 shadow-inner">
                <UserCircle size={48} />
              </div>
              <h3 className="font-bold text-slate-800">Admin Bengkulu</h3>
              <p className="text-sm text-slate-400">admin@bengkulu.go.id</p>
            </div>
            {/* Panggil <ProfilePage /> di sini */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 border-dashed text-center text-slate-400 text-sm italic">
              Formulir profil muncul di sini...
            </div>
          </SectionWrapper>
        );

      case "password":
        return (
          <SectionWrapper
            title="Keamanan Sandi"
            subtitle="Pastikan kata sandi Anda kuat dan diperbarui secara berkala."
          >
            <form className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">
                  Kata Sandi Lama
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none transition-all"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">
                    Kata Sandi Baru
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">
                    Konfirmasi
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none transition-all"
                  />
                </div>
              </div>
              <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200 active:scale-[0.98] mt-4 uppercase tracking-widest">
                Simpan Perubahan
              </button>
            </form>
          </SectionWrapper>
        );

      default:
        return (
          <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in zoom-in-95 duration-500">
            {/* Header Header */}
            <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl shadow-emerald-900/20">
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px]" />
              <div className="relative z-10 flex items-center gap-6">
                <div className="p-4 bg-emerald-500 rounded-[1.5rem] shadow-lg shadow-emerald-500/40">
                  <SettingsIcon className="w-8 h-8 text-white animate-[spin_4s_linear_infinite]" />
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-tight leading-none">
                    Pengaturan
                  </h1>
                  <p className="text-emerald-100/60 mt-2 text-sm font-medium">
                    Konfigurasi akun dan preferensi sistem Anda
                  </p>
                </div>
              </div>
            </div>

            {/* Menu List */}
            <div className="grid gap-6">
              <section className="space-y-3">
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-6">
                  Personal & Akun
                </h2>
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
                  <SettingsItem
                    icon={User}
                    title="Profil Pengguna"
                    desc="Ubah nama, email, dan biodata Anda"
                    color="emerald"
                    onClick={() => setActivePage("profile")}
                  />
                  <SettingsItem
                    icon={Lock}
                    title="Keamanan & Sandi"
                    desc="Kelola metode login dan keamanan"
                    color="blue"
                    onClick={() => setActivePage("password")}
                  />
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-6">
                  Sistem
                </h2>
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
                  <SettingsItem
                    icon={BellRing}
                    title="Notifikasi"
                    desc="Atur alert dan pengingat sistem"
                    color="amber"
                  />
                  <SettingsItem
                    icon={ShieldCheck}
                    title="Hak Akses"
                    desc="Lihat izin role Anda saat ini"
                    color="purple"
                  />
                </div>
              </section>

              <button
                className="group w-full bg-rose-50 hover:bg-rose-600 p-6 rounded-[2rem] border border-rose-100 transition-all duration-300 flex items-center justify-between shadow-sm hover:shadow-rose-200"
                onClick={() => setActivePage("logout")}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-xl text-rose-500 shadow-sm group-hover:scale-90 transition-transform">
                    <LogOut size={20} />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-slate-800 group-hover:text-white transition-colors">
                      Keluar Aplikasi
                    </p>
                    <p className="text-xs text-rose-400 group-hover:text-rose-100 transition-colors font-medium">
                      Akhiri sesi login Anda
                    </p>
                  </div>
                </div>
                <ChevronRight
                  className="text-rose-300 group-hover:text-white transition-all group-hover:translate-x-1"
                  size={20}
                />
              </button>
            </div>
          </div>
        );
    }
  };

  return <DashboardLayout>{renderPage()}</DashboardLayout>;
};

// Sub-komponen untuk baris menu agar kode tetap bersih
const SettingsItem = ({ icon: Icon, title, desc, color, onClick }) => (
  <button
    onClick={onClick}
    className="w-full p-5 flex items-center justify-between hover:bg-slate-50 transition-all group"
  >
    <div className="flex items-center gap-4">
      <div
        className={`p-3.5 rounded-2xl bg-${color}-50 text-${color}-600 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
      >
        <Icon size={22} />
      </div>
      <div className="text-left">
        <p className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors leading-none">
          {title}
        </p>
        <p className="text-xs text-slate-400 mt-1.5 font-medium">{desc}</p>
      </div>
    </div>
    <div className="p-2 rounded-xl bg-slate-50 text-slate-300 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-all">
      <ChevronRight size={18} />
    </div>
  </button>
);

export default Settings;
