import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Globe,
  MapPin,
  Play,
  ShieldCheck,
} from "lucide-react";
import HomeLayout from "./layouts/HomeLayout";
import { layerService } from "./services/layerService";
import { dashboardService } from "./services/dashboardService";

// ================= SAMPLE HERO SLIDER IMAGES =================
// Ganti dengan asset lokal jika tersedia
const heroSlides = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1581320545570-1c9f38a0f6a2?q=80&w=1600",
    title: "Infrastruktur Kota yang Terintegrasi",
    desc: "Data spasial modern untuk mendukung pembangunan Kota Bengkulu.",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1600",
    title: "Pemetaan Digital Infrastruktur",
    desc: "Akses cepat data jalan, drainase, dan aset publik kota.",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600",
    title: "Transparansi Data Pembangunan",
    desc: "Monitoring aset daerah secara visual dan interaktif.",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: dashboardService.getStatistic,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <HomeLayout>
      {/* ================= HERO SECTION ================= */}
      <section className="relative h-screen min-h-[700px] overflow-hidden bg-slate-900">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-900 z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-transparent to-slate-900/60 z-10" />
            <img
              src={heroSlides[currentSlide].image}
              className="w-full h-full object-cover select-none"
              alt="Bengkulu Infrastructure"
            />
          </motion.div>
        </AnimatePresence>

        <div className="relative z-20 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="max-w-3xl"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-md mb-6">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-[0.2em]">
                  Official Government Portal
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] mb-6">
                {heroSlides[currentSlide].title.split(" ").map((word, i) => (
                  <span key={i} className={i === 2 ? "text-emerald-500" : ""}>
                    {word}{" "}
                  </span>
                ))}
              </h1>

              <p className="text-lg md:text-xl text-slate-300 leading-relaxed mb-10 max-w-2xl">
                {heroSlides[currentSlide].desc}
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate("/map")}
                  className="group bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all shadow-xl shadow-emerald-900/20 active:scale-95"
                >
                  Eksplorasi Peta Interaktif
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-2xl font-bold transition-all">
                  Pelajari Lebih Lanjut
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 text-white/30"
        >
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center p-1">
            <div className="w-1 h-2 bg-emerald-500 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* ================= SEKILAS & VIDEO ================= */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-50 skew-x-12 translate-x-20 -z-10" />

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-sm font-black text-emerald-600 uppercase tracking-[0.3em] mb-4">
              Core Information
            </h2>
            <h3 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-8">
              Pusat Kendali Data <br /> Infrastruktur Wilayah.
            </h3>
            <p className="text-slate-500 text-lg leading-relaxed mb-10">
              Sistem Basis Data Infrastruktur Kota Bengkulu dirancang untuk
              menjadi tulang punggung pengambilan keputusan berbasis data bagi
              pemerintah dan masyarakat.
            </p>

            <div className="grid grid-cols-2 gap-6 mb-10">
              {[
                {
                  title: "Kebijakan Terarah",
                  icon: <Globe className="w-5 h-5" />,
                },
                { title: "Pemetaan GIS", icon: <MapPin className="w-5 h-5" /> },
                {
                  title: "Transparansi Aset",
                  icon: <ShieldCheck className="w-5 h-5" />,
                },
                {
                  title: "Efisiensi Publik",
                  icon: <BarChart3 className="w-5 h-5" />,
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-emerald-200 transition-colors"
                >
                  <div className="p-2 rounded-lg bg-white shadow-sm text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    {item.icon}
                  </div>
                  <span className="font-bold text-slate-700">{item.title}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
                <img src="https://via.placeholder.com/150" alt="Walikota" />
              </div>
              <div>
                <p className="font-black text-slate-900 leading-none">
                  Dedy Wahyudi, S.E., M.M.
                </p>
                <p className="text-xs font-bold text-slate-400 uppercase mt-1">
                  Walikota Bengkulu
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative group"
          >
            <div className="absolute -inset-4 bg-emerald-500/10 rounded-[2.5rem] blur-2xl group-hover:bg-emerald-500/20 transition-all" />
            <div className="relative aspect-video rounded-[2rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] bg-slate-900">
              <iframe
                className="w-full h-full opacity-80"
                src="https://www.youtube.com/embed/FTMJfvlfwxM"
                allowFullScreen
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:scale-110 transition-transform">
                <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center shadow-2xl">
                  <Play className="w-8 h-8 text-white fill-white ml-1" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= STATISTIK PREMIUM ================= */}
      <section className="py-32 bg-slate-900 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Header Section */}
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h3 className="text-sm font-black text-emerald-500 uppercase tracking-[0.3em] mb-4">
              Data Statistics
            </h3>
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              Transparansi Angka Aset
            </h2>
            <p className="text-slate-400">
              Ringkasan distribusi aset infrastruktur yang tercatat dalam sistem
              informasi geografis secara aktual.
            </p>
          </div>

          {/* Grid Section */}
          <div className="grid md:grid-cols-3 gap-8">
            {stats?.map((stat, i) => {
              // 1. FORMAT ANGKA UTAMA (PARENT) -> Jumlah Record (cth: 178)
              const mainCount = Number(stat.total_assets).toLocaleString("id-ID");

              return (
                  <motion.div
                      key={i}
                      whileHover={{ y: -10 }}
                      className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-xl relative overflow-hidden group transition-all hover:bg-white/10 flex flex-col justify-between"
                  >

                  {/* Background Icon Decoration */}
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <BarChart3 className="w-24 h-24 text-emerald-500" />
                  </div>

                  {/* MAIN STATS (Upper Part) */}
                  <div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <p className="text-6xl font-black text-white tracking-tighter">
                        {mainCount}
                      </p>
                      <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Aset</span>
                    </div>
                    <h4 className="text-xl font-bold text-emerald-400 mb-8 uppercase tracking-wide">
                      {stat.category}
                    </h4>
                  </div>

                  {/* SUB CATEGORIES (Lower Part) */}
                  <div className="space-y-4">
                    {stat.sub_categories?.slice(0, 3).map((sub, idx) => {
                      // Cek apakah satuannya panjang (butuh desimal) atau unit (bulat)
                      const isLength = ['kilometer', 'meter', 'km', 'm'].includes(sub.unit?.toLowerCase());

                      // Gunakan 'unit_counts' agar yang muncul adalah KM atau Unit Value
                      const subValue = Number(sub.unit_counts).toLocaleString("id-ID", {
                        maximumFractionDigits: isLength ? 2 : 0,
                      });

                        return (
                            <div
                                key={idx}
                                className="flex justify-between items-center py-3 border-b border-white/5 group/item"
                            >
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-300 group-hover/item:text-white transition-colors">
                                  {sub.name}
                                </span>

                                {/* Tampilkan jumlah Layer & Record sebagai info tambahan kecil */}
                                <span className="text-[10px] uppercase text-slate-500 tracking-wider font-black">{sub.layers_count} Layer • {sub.total_assets} Aset</span>
                              </div>

                              {/* Badge Nilai Utama (KM/Unit) */}
                              <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-lg text-xs font-black whitespace-nowrap">{subValue} <span className="text-[10px] uppercase opacity-70 ml-0.5">{sub.unit}</span></span>
                            </div>
                        );
                      })}
                    </div>
                  </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= PRODUK HUKUM (GRID MODERN) ================= */}
      {/* <section className="py-32 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <h3 className="text-sm font-black text-emerald-600 uppercase tracking-[0.3em] mb-4">
                Legal Foundation
              </h3>
              <h2 className="text-4xl font-black text-slate-900">
                Produk Hukum Terbaru
              </h2>
            </div>
            <button className="text-sm font-black uppercase text-slate-900 flex items-center gap-2 hover:gap-4 transition-all group">
              Lihat Semua Dokumen{" "}
              <ArrowRight className="w-4 h-4 text-emerald-600" />
            </button>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {produkHukumData.map((item) => (
              <motion.a
                whileHover={{ scale: 1.02 }}
                key={item.id}
                href={item.fileUrl}
                target="_blank"
                className="bg-white group rounded-3xl p-8 shadow-sm border border-slate-200/60 hover:shadow-2xl hover:shadow-slate-200 transition-all flex flex-col h-full"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 group-hover:bg-emerald-600 transition-colors">
                  <FileText className="w-6 h-6 text-slate-400 group-hover:text-white" />
                </div>
                <div className="flex gap-2 mb-4">
                  <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded-md uppercase tracking-wider">
                    {item.type}
                  </span>
                  <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md uppercase tracking-wider">
                    {item.tahun}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 mb-4 line-clamp-2 leading-snug group-hover:text-emerald-600 transition-colors">
                  {item.title}
                </h4>
                <p className="text-sm text-slate-500 mb-8 line-clamp-3 italic">
                  "{item.desc}"
                </p>
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-900">
                    Download PDF
                  </span>
                  <ChevronRight className="w-4 h-4 text-emerald-500 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section> */}

      {/* ================= FINAL CTA ================= */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto rounded-[3rem] bg-emerald-600 p-12 md:p-20 relative overflow-hidden shadow-2xl shadow-emerald-900/20">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
            <MapPin className="w-[400px] h-[400px] -translate-y-20 translate-x-20 text-white" />
          </div>
          <div className="relative z-10 max-w-2xl text-white">
            <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
              Siap mengeksplorasi data kota Anda?
            </h2>
            <p className="text-emerald-100 text-lg mb-10 opacity-90">
              Buka peta interaktif sekarang untuk melihat visualisasi data aset
              infrastruktur Kota Bengkulu secara transparan.
            </p>
            <button
              onClick={() => navigate("/map")}
              className="bg-slate-900 hover:bg-black text-white px-10 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-sm transition-all active:scale-95 shadow-2xl"
            >
              Buka Peta Interaktif
            </button>
          </div>
        </div>
      </section>
    </HomeLayout>
  );
}
