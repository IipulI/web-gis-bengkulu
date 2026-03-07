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
  Zap,
} from "lucide-react";
import HomeLayout from "./layouts/HomeLayout";
import { dashboardService } from "./services/dashboardService";

const heroSlides = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1581320545570-1c9f38a0f6a2?q=80&w=1600",
    title: "Infrastruktur Kota yang Terintegrasi",
    desc: "Data spasial modern untuk mendukung pembangunan Kota Bengkulu yang lebih cerdas.",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1600",
    title: "Pemetaan Digital Infrastruktur",
    desc: "Akses cepat data jalan, drainase, dan aset publik dalam satu genggaman.",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600",
    title: "Transparansi Data Pembangunan",
    desc: "Monitoring aset daerah secara visual, akurat, dan dapat dipertanggungjawabkan.",
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
      <section className="relative h-screen min-h-[750px] overflow-hidden bg-blue-950">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0"
          >
            {/* Overlay Gradient yang lebih dramatis */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-950 via-blue-900/40 to-transparent z-10" />
            <div className="absolute inset-0 bg-black/30 z-10" />
            <img
              src={heroSlides[currentSlide].image}
              className="w-full h-full object-cover"
              alt="Bengkulu Infrastructure"
            />
          </motion.div>
        </AnimatePresence>

        <div className="relative z-20 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="max-w-4xl"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400/10 border border-amber-400/30 backdrop-blur-md mb-8">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                  Official Government Portal
                </span>
              </div>

              <h1 className="text-6xl md:text-8xl font-black text-white leading-[1.05] mb-8">
                {heroSlides[currentSlide].title.split(" ").map((word, i) => (
                  <span key={i} className={i === 2 ? "text-amber-400" : ""}>
                    {word}{" "}
                  </span>
                ))}
              </h1>

              <p className="text-xl text-blue-100/80 leading-relaxed mb-10 max-w-2xl border-l-4 border-amber-400 pl-6">
                {heroSlides[currentSlide].desc}
              </p>

              <div className="flex flex-wrap gap-5">
                <button
                  onClick={() => navigate("/map")}
                  className="group bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-2xl font-black flex items-center gap-3 transition-all shadow-2xl shadow-blue-900/40 active:scale-95"
                >
                  Eksplorasi Peta Interaktif
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator Custom */}
        <div className="absolute bottom-12 left-6 z-20 hidden md:flex items-center gap-4 text-white/50">
          <span className="text-xs font-bold rotate-90 origin-left translate-x-4">
            SCROLL
          </span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-amber-400 to-transparent" />
        </div>
      </section>

      {/* ================= SEKILAS & VIDEO ================= */}
      <section className="py-32 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-1 w-12 bg-blue-600 rounded-full" />
              <h2 className="text-sm font-black text-blue-600 uppercase tracking-widest">
                Core Information
              </h2>
            </div>

            <h3 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-8">
              Pusat Kendali Data{" "}
              <span className="text-blue-700">Infrastruktur</span> Wilayah.
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
              {[
                {
                  title: "Kebijakan Terarah",
                  icon: <Globe />,
                  color: "bg-blue-50 text-blue-600",
                },
                {
                  title: "Pemetaan GIS",
                  icon: <MapPin />,
                  color: "bg-amber-50 text-amber-600",
                },

                {
                  title: "Efisiensi Publik",
                  icon: <BarChart3 />,
                  color: "bg-amber-50 text-amber-600",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-5 rounded-2xl bg-white shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
                >
                  <div className={`p-3 rounded-xl ${item.color}`}>
                    {React.cloneElement(item.icon, { size: 20 })}
                  </div>
                  <span className="font-bold text-slate-700">{item.title}</span>
                </div>
              ))}
            </div>

            {/* <div className="p-6 rounded-3xl bg-blue-900 text-white flex items-center gap-6">
              <img
                src="https://via.placeholder.com/150"
                alt="Walikota"
                className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400"
              />
              <div>
                <p className="text-lg font-black italic">
                  "Data adalah fondasi utama pembangunan yang presisi."
                </p>
                <p className="text-xs font-bold text-amber-400 uppercase mt-1 tracking-widest">
                  Dedy Wahyudi — Walikota Bengkulu
                </p>
              </div>
            </div> */}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Dekorasi Bingkai */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-amber-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />

            <div className="relative aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl bg-blue-900 group">
              <iframe
                className="w-full h-full opacity-90 group-hover:opacity-100 transition-opacity"
                src="https://www.youtube.com/embed/FTMJfvlfwxM"
                allowFullScreen
              />
              <div className="absolute inset-0 bg-blue-900/20 flex items-center justify-center pointer-events-none group-hover:bg-transparent transition-all">
                <div className="w-20 h-20 rounded-full bg-amber-400 flex items-center justify-center shadow-xl shadow-amber-900/40">
                  <Play className="w-8 h-8 text-blue-900 fill-blue-900 ml-1" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= STATISTIK (NAVY & GOLD THEME) ================= */}
      <section className="py-32 bg-blue-950 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-24">
            <div className="inline-block p-3 rounded-2xl bg-amber-400/10 mb-6">
              <Zap className="text-amber-400" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-6 italic">
              Statistik <span className="text-amber-400">Real-Time</span>
            </h2>
            <p className="text-blue-200/60 text-lg">
              Data distribusi infrastruktur Kota Bengkulu yang diperbarui secara
              berkala melalui survei lapangan terpadu.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {stats?.map((stat, i) => {
              const mainCount = Number(stat.total_assets).toLocaleString(
                "id-ID",
              );

              return (
                <motion.div
                  key={i}
                  whileHover={{ y: -15 }}
                  className="group bg-gradient-to-b from-white/10 to-transparent border border-white/10 p-1 rounded-[3rem] transition-all"
                >
                  <div className="bg-blue-900/40 p-10 rounded-[2.8rem] h-full flex flex-col backdrop-blur-md border border-white/5">
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <h4 className="text-xs font-black text-amber-400 uppercase tracking-[0.3em] mb-2">
                          {stat.category}
                        </h4>
                        <div className="flex items-baseline gap-2">
                          <p className="text-6xl font-black text-white">
                            {mainCount}
                          </p>
                          <span className="text-xs font-bold text-blue-300/50 uppercase">
                            Item
                          </span>
                        </div>
                      </div>
                      <div className="p-4 rounded-2xl bg-white/5 group-hover:bg-amber-400 transition-colors">
                        <BarChart3 className="w-6 h-6 text-amber-400 group-hover:text-blue-950" />
                      </div>
                    </div>

                    <div className="space-y-3 mt-auto">
                      {stat.sub_categories?.slice(0, 3).map((sub, idx) => {
                        const isLength = [
                          "kilometer",
                          "meter",
                          "km",
                          "m",
                        ].includes(sub.unit?.toLowerCase());
                        const subValue = Number(sub.unit_counts).toLocaleString(
                          "id-ID",
                          {
                            maximumFractionDigits: isLength ? 2 : 0,
                          },
                        );

                        return (
                          <div
                            key={idx}
                            className="flex justify-between items-center p-4 rounded-2xl bg-blue-950/50 border border-white/5 group/item hover:border-amber-400/30 transition-all"
                          >
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-blue-100 group-hover/item:text-amber-400 transition-colors">
                                {sub.name}
                              </span>
                              <span className="text-[10px] text-blue-400 uppercase font-black">
                                {sub.total_assets} Records
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-black text-white">
                                {subValue}
                              </span>
                              <span className="ml-1 text-[10px] text-amber-400 font-bold uppercase">
                                {sub.unit}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA (KUNING BIRU) ================= */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto rounded-[4rem] bg-blue-700 p-12 md:p-24 relative overflow-hidden shadow-3xl shadow-blue-900/40">
          {/* Background Decoration */}
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-400 rounded-full opacity-20" />
          <div className="absolute top-0 right-0 p-10 opacity-10">
            <Globe className="w-64 h-64 text-white" />
          </div>

          <div className="relative z-10 max-w-3xl">
            <h2 className="text-5xl md:text-6xl font-black text-white mb-8 leading-tight">
              Mulai Eksplorasi <br />{" "}
              <span className="text-amber-400">Data Spasial</span> Anda.
            </h2>
            <p className="text-blue-50 text-xl mb-12 opacity-80 leading-relaxed">
              Dapatkan akses penuh terhadap pemetaan infrastruktur Kota Bengkulu
              secara transparan dan akuntabel.
            </p>
            <div className="flex flex-wrap gap-6">
              <button
                onClick={() => navigate("/map")}
                className="bg-amber-400 hover:bg-amber-300 text-blue-950 px-12 py-6 rounded-[2rem] font-black uppercase tracking-widest text-sm transition-all active:scale-95 shadow-xl shadow-amber-900/20"
              >
                Buka Peta Interaktif
              </button>
              <button className="bg-transparent border-2 border-white/30 hover:bg-white/10 text-white px-12 py-6 rounded-[2rem] font-black uppercase tracking-widest text-sm transition-all">
                Kontak Kami
              </button>
            </div>
          </div>
        </div>
      </section>
    </HomeLayout>
  );
}
