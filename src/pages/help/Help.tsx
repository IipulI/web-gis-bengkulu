import React, { useState } from "react";
import {
  LifeBuoy,
  MessageSquare,
  BookOpen,
  ChevronRight,
  Phone,
  Mail,
  Search,
  Globe,
  ShieldQuestion,
  ArrowRightCircle,
} from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";

const Help = () => {
  const [activeSection, setActiveSection] = useState(null);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-12">
        {/* ================= HERO SECTION ================= */}
        <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 md:p-16 shadow-2xl shadow-emerald-900/20">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]" />

          <div className="relative z-10 flex flex-col items-center text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest">
              <ShieldQuestion size={14} />
              Support System
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-[1.1]">
              Ada yang bisa{" "}
              <span className="text-emerald-500 italic">kami bantu?</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
              Pusat informasi komprehensif untuk operasional Web GIS Database
              Aset Kota Bengkulu. Temukan jawaban dari setiap tantangan teknis
              Anda.
            </p>
          </div>
        </div>

        {/* ================= QUICK ACTIONS GRID ================= */}
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              id: "manual",
              title: "Panduan Pengguna",
              desc: "Pelajari instruksi langkah demi langkah pengoperasian modul aset.",
              icon: LifeBuoy,
              color: "emerald",
              cta: "Buka Dokumentasi",
            },
            {
              id: "about",
              title: "Eksplorasi Sistem",
              desc: "Pahami arsitektur data dan kapabilitas analisis spasial platform.",
              icon: Globe,
              color: "blue",
              cta: "Pelajari Fitur",
            },
            {
              id: "video",
              title: "Tutorial Visual",
              desc: "Demonstrasi video interaktif untuk alur kerja yang lebih intuitif.",
              icon: BookOpen,
              color: "amber",
              cta: "Putar Video",
            },
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className="group relative bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 cursor-pointer overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                <item.icon size={120} />
              </div>

              <div
                className={`w-14 h-14 rounded-2xl bg-${item.color}-50 text-${item.color}-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}
              >
                <item.icon size={28} />
              </div>

              <h2 className="text-xl font-black text-slate-800 mb-3">
                {item.title}
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                {item.desc}
              </p>

              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm uppercase tracking-wider group-hover:gap-4 transition-all">
                {item.cta}
                <ArrowRightCircle size={18} className="text-emerald-500" />
              </div>
            </div>
          ))}
        </div>

        {/* ================= CONTACT & SUPPORT ================= */}
        <div className="bg-emerald-600 rounded-[2.5rem] p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-10 shadow-xl shadow-emerald-200">
          <div className="space-y-4 text-center md:text-left">
            <h2 className="text-3xl font-black leading-tight">
              Masih butuh bantuan spesifik?
            </h2>
            <p className="text-emerald-100 opacity-90 max-w-md font-medium">
              Tim teknis DPUPR Kota Bengkulu siap membantu Anda mengatasi
              masalah sistem dan data.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 w-full md:w-auto">
            <a
              href="tel:07363877"
              className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:bg-white/20 transition-all group"
            >
              <div className="p-3 bg-white rounded-xl text-emerald-600 group-hover:rotate-12 transition-transform">
                <Phone size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-200 uppercase tracking-widest">
                  Hotline
                </p>
                <p className="text-lg font-black">0736 3877</p>
              </div>
            </a>

            <a
              href="mailto:dpupr.bengkulukota@gmail.com"
              className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:bg-white/20 transition-all group"
            >
              <div className="p-3 bg-white rounded-xl text-emerald-600 group-hover:-rotate-12 transition-transform">
                <Mail size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-200 uppercase tracking-widest">
                  Email Resmi
                </p>
                <p className="text-sm font-black truncate w-40 md:w-auto">
                  dpupr.bengkulukota@gmail.com
                </p>
              </div>
            </a>
          </div>
        </div>

        {/* ================= MODALS (PERFECTIONIZED) ================= */}

        {/* MANUAL MODAL */}
        {activeSection === "manual" && (
          <ModalTemplate
            title="Dokumentasi Teknis"
            onClose={() => setActiveSection(null)}
          >
            <div className="bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
              <iframe
                src="/manual-webgis.pdf"
                className="w-full h-[70vh]"
                title="Manual WebGIS"
              />
            </div>
          </ModalTemplate>
        )}

        {/* ABOUT MODAL */}
        {activeSection === "about" && (
          <ModalTemplate
            title="Tentang Platform"
            onClose={() => setActiveSection(null)}
          >
            <div className="space-y-8 p-2">
              <div className="prose prose-slate max-w-none font-medium text-slate-600 leading-relaxed">
                <p>
                  Web GIS Database Aset Kota Bengkulu dirancang sebagai pusat
                  kendali infrastruktur digital yang mengintegrasikan data
                  atribut dengan koordinat spasial secara presisi.
                </p>
              </div>

              <div className="grid gap-4">
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <Search size={20} className="text-emerald-500" />
                  Knowledge Base (FAQ)
                </h3>

                {[
                  {
                    q: "Cara menambahkan Layer baru?",
                    a: "Melalui dashboard Admin, navigasi ke menu 'Layers Management' dan gunakan fungsi 'Import GeoJSON' atau manual draw.",
                  },
                  {
                    q: "Sinkronisasi Data Lapangan?",
                    a: "Data yang diinput melalui modul Mobile Collector akan tersinkronisasi secara real-time ke database pusat.",
                  },
                  {
                    q: "Keamanan Data?",
                    a: "Setiap data dilindungi dengan enkripsi SSL dan hak akses berbasis Role-Based Access Control (RBAC).",
                  },
                ].map((faq, i) => (
                  <details
                    key={i}
                    className="group bg-slate-50 border border-slate-200 rounded-2xl p-4 hover:border-emerald-300 transition-colors"
                  >
                    <summary className="list-none cursor-pointer flex items-center justify-between font-bold text-slate-700">
                      {faq.q}
                      <ChevronRight
                        size={18}
                        className="group-open:rotate-90 transition-transform"
                      />
                    </summary>
                    <p className="mt-4 text-slate-500 text-sm font-medium leading-relaxed border-t border-slate-200 pt-4">
                      {faq.a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </ModalTemplate>
        )}

        {/* VIDEO MODAL */}
        {activeSection === "video" && (
          <ModalTemplate
            title="Video Panduan Fitur"
            onClose={() => setActiveSection(null)}
          >
            <div className="aspect-video rounded-3xl overflow-hidden bg-black shadow-2xl border-4 border-white">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title="Video Dokumentasi WebGIS"
                allowFullScreen
              />
            </div>
          </ModalTemplate>
        )}
      </div>
    </DashboardLayout>
  );
};

// HELPER COMPONENT FOR CONSISTENT MODAL STYLE
const ModalTemplate = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
    <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl border border-white animate-in zoom-in-95 duration-300">
      <div className="sticky top-0 bg-white/80 backdrop-blur-md px-8 py-6 border-b border-slate-100 flex items-center justify-between z-20">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">
          {title}
        </h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-rose-500"
        >
          <ArrowRightCircle className="rotate-180" size={32} />
        </button>
      </div>
      <div className="p-8">{children}</div>
    </div>
  </div>
);

export default Help;
