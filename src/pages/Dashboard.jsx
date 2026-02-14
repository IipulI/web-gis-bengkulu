import React, { useState, useEffect } from "react";
import {
  Database,
  Activity,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Clock,
  Calendar,
} from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../services/dashboardService";
// import { dashboardService } from "../services/dashboardService"; // Pastikan service tersedia

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const heroSlides = [
  {
    title: "Sistem Informasi Aset",
    subtitle:
      "Monitoring dan pengelolaan aset daerah dalam satu genggaman terintegrasi.",
    image:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80",
    tag: "Integrasi Terpadu",
  },
  {
    title: "Visualisasi Data Real-time",
    subtitle:
      "Analisis sebaran aset melalui dashboard interaktif yang akurat dan transparan.",
    image:
      "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1600&q=80",
    tag: "Akurasi Tinggi",
  },
];

const Dashboard = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fallback data jika query belum jalan
  const { data: statistics } = useQuery({
    queryKey: ["statistics-total"],
    queryFn: dashboardService.getStatistic,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const barData = {
    labels: statistics?.map((k) => k.category),
    datasets: [
      {
        label: "Jumlah Unit",
        data: statistics?.map((k) => k.total_assets),
        backgroundColor: statistics?.map((k) => k.color + "CC"), // 80% opacity
        hoverBackgroundColor: statistics?.map((k) => k.color),
        borderRadius: 12,
        borderSkipped: false,
        barThickness: 40,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1e293b",
        padding: 12,
        cornerRadius: 10,
        titleFont: { size: 14, weight: "bold" },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "#f1f5f9", drawBorder: false },
        ticks: { color: "#94a3b8", font: { size: 11 } },
      },
      x: {
        grid: { display: false },
        ticks: { color: "#64748b", font: { weight: "600" } },
      },
    },
  };

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto space-y-10 pb-10 animate-in fade-in duration-700">
        {/* HERO SLIDER SECTION */}
        <div className="relative group h-[400px] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-emerald-900/10 border border-white">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${
                index === currentSlide
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-105"
              }`}
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms]"
                style={{
                  backgroundImage: `url(${slide.image})`,
                  transform: index === currentSlide ? "scale(1.1)" : "scale(1)",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />

              <div className="absolute bottom-12 left-12 right-12 text-white">
                <span className="px-4 py-1.5 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 rounded-full text-emerald-400 text-xs font-black uppercase tracking-widest mb-4 inline-block">
                  {slide.tag}
                </span>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 max-w-2xl leading-[0.9]">
                  {slide.title}
                </h1>
                <p className="text-slate-200 text-lg max-w-xl font-medium opacity-80 italic">
                  "{slide.subtitle}"
                </p>
              </div>
            </div>
          ))}

          {/* Navigation Dots */}
          <div className="absolute bottom-6 right-12 flex gap-2">
            {heroSlides.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === i ? "w-8 bg-emerald-500" : "w-2 bg-white/30"}`}
              />
            ))}
          </div>
        </div>

        {/* WELCOME HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              Dashboard Overview{" "}
              <TrendingUp className="text-emerald-500 w-8 h-8" />
            </h2>
            <p className="text-slate-500 font-medium mt-1">
              Selamat datang kembali, Monitor kondisi aset Anda hari ini.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100">
            <Calendar className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-bold text-slate-600">
              {new Date().toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* STATISTICS CARDS */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statistics?.map((item, i) => (
            <div
              key={i}
              className="group relative bg-white border border-slate-100 rounded-[2rem] p-7 shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:bg-emerald-50 transition-colors duration-500" />

              <div className="relative z-10 flex flex-col gap-6">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500"
                  style={{ backgroundColor: item.color + "15" }}
                >
                  <Database className="w-7 h-7" style={{ color: item.color }} />
                </div>
                <div>
                  <h3 className="text-4xl font-black text-slate-800 tracking-tighter">
                    {item.total_assets}
                    <span className="text-sm font-bold text-slate-400 ml-2 uppercase tracking-widest italic">
                      Unit
                    </span>
                  </h3>
                  <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest group-hover:text-emerald-600 transition-colors">
                    {item.category}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* DATA VISUALIZATION SECTION */}
        <section className="grid lg:grid-cols-4 gap-8">
          {/* Main Chart Card */}
          <div className="lg:col-span-4 bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="font-black text-xl text-slate-800 tracking-tight">
                  Perbandingan Volume Aset
                </h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                  Data Statistik per Kategori
                </p>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg">
                <Activity className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
            <div className="h-[350px]">
              <Bar data={barData} options={barOptions} />
            </div>
          </div>

          {/* Activity Feed Card */}
          {/* <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -mr-32 -mt-32" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-lg tracking-tight">
                  Log Aktivitas
                </h3>
                <Clock className="w-5 h-5 text-emerald-400" />
              </div>

              <div className="space-y-6">
                {[
                  {
                    title: "Pemutakhiran Data Jalan",
                    user: "Admin",
                    time: "12m ago",
                    color: "bg-emerald-500",
                  },
                  {
                    title: "Login Sesi Baru",
                    user: "Operator 1",
                    time: "1h ago",
                    color: "bg-blue-500",
                  },
                  {
                    title: "Export Laporan PDF",
                    user: "Admin",
                    time: "3h ago",
                    color: "bg-amber-500",
                  },
                  {
                    title: "Entry Aset Gedung",
                    user: "Operator 2",
                    time: "Yesterday",
                    color: "bg-purple-500",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 group cursor-pointer">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-3 h-3 rounded-full ${item.color} shadow-[0_0_10px_rgba(0,0,0,0.5)] group-hover:scale-150 transition-transform`}
                      />
                      <div className="w-[1px] h-full bg-slate-700 mt-2" />
                    </div>
                    <div className="pb-2">
                      <p className="text-sm font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-bold uppercase tracking-tighter">
                          {item.user}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {item.time}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95">
                Lihat Semua Aktivitas
              </button>
            </div>
          </div> */}
        </section>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
