import React, { useState, useEffect } from "react";
import { Database, Activity, ChevronLeft, ChevronRight } from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../services/dashboardService";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

const heroSlides = [
  {
    title: "Database Aset",
    subtitle:
      "Monitoring, pengelolaan, dan pelaporan aset daerah secara terpadu.",
    image:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80",
  },
  {
    title: "Transparansi & Akurasi Data",
    subtitle: "Data aset disajikan real‑time dengan visualisasi modern.",
    image:
      "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1600&q=80",
  },
  {
    title: "Mendukung Pengambilan Keputusan",
    subtitle: "Dashboard interaktif untuk analisis kondisi dan sebaran aset.",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80",
  },
];

const Dashboard = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { data: statistics, isLoading: isLoadingStastistics } = useQuery({
    queryKey: ["stastistics-total"],
    queryFn: dashboardService.getStatistic,
  });

  console.log(statistics);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const kategoriStats = [
    { color: "#22c55e" },
    { color: "#3b82f6" },
    {
      color: "#f97316",
    },
    {
      color: "#8b5cf6",
    },
    { color: "#ec4899" },
    {
      color: "#a78bfa",
    },
  ];

  const barData = {
    labels: statistics?.map((k) => k.category),
    datasets: [
      {
        label: "Jumlah Data Aset",
        data: statistics?.map((k) => k.total_assets),
        backgroundColor: kategoriStats.map((k) => k.color),
        borderRadius: 10,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } },
  };

  return (
    <DashboardLayout>
      <div className="space-y-12">
        {/* HERO SLIDER */}
        <div className="relative h-[300px] sm:h-[380px] lg:h-[430px] rounded-3xl overflow-hidden shadow-xl">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
              style={{
                backgroundImage: `url(${slide.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20"></div>
              <div className="absolute bottom-10 left-10 text-white max-w-xl">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold drop-shadow-xl">
                  {slide.title}
                </h1>
                <p className="mt-3 text-base sm:text-lg text-gray-200">
                  {slide.subtitle}
                </p>
              </div>
            </div>
          ))}

          {/* SLIDER NAVIGATION */}
          <button
            onClick={() =>
              setCurrentSlide((prev) =>
                prev === 0 ? heroSlides.length - 1 : prev - 1
              )
            }
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white p-2 rounded-full shadow-md"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={() =>
              setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
            }
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white p-2 rounded-full shadow-md"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* HEADER */}
        <header className="text-center">
          <h1 className="text-4xl font-bold text-green-800 drop-shadow-sm">
            Selamat Datang Admin 👋
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            Kelola dan pantau seluruh data aset melalui dashboard modern ini.
          </p>
        </header>

        {/* CARD STATISTIK */}
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {statistics?.map((item, i) => (
            <div
              key={i}
              className="bg-white border border-green-100 rounded-2xl p-5 shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-4 hover:-translate-y-1"
            >
              <div
                className="p-3 rounded-xl"
                style={{ backgroundColor: item.color + "20" }}
              >
                <Database className="w-6 h-6" style={{ color: item.color }} />
              </div>
              <div>
                <p className="text-xs text-gray-500 leading-tight">
                  {item.category}
                </p>
                <h3 className="text-2xl font-bold text-green-800">
                  {item.total_assets}
                </h3>
              </div>
            </div>
          ))}
        </section>

        {/* CHARTS */}
        <section className="grid lg:grid-cols-3 gap-6">
          {/* Bar Chart */}
          <div className="col-span-2 bg-white border border-green-100 rounded-2xl p-6 shadow-md">
            <h2 className="font-semibold text-lg text-green-800 mb-4">
              Statistik Data Aset per Kategori
            </h2>
            <Bar data={barData} options={barOptions} height={140} />
          </div>

          {/* Aktivitas */}
          <div className="bg-white border border-green-100 rounded-2xl p-6 shadow-md">
            <h2 className="font-semibold text-lg text-green-800 flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-green-600" />
              Aktivitas Terbaru
            </h2>

            <div className="space-y-5 text-sm">
              {[
                {
                  title: "Admin Data Aset Telah Login",
                  time: "2 jam lalu",
                  color: "#22c55e",
                },
                {
                  title: "Update Data Gedung Pemerintahan",
                  time: "3 hari lalu",
                  color: "#3b82f6",
                },
                {
                  title: "Data Aset Irigasi Diperbarui",
                  time: "5 hari lalu",
                  color: "#3b82f6",
                },
                {
                  title: "Data Jembatan Diperbarui",
                  time: "1 minggu lalu",
                  color: "#22c55e",
                },
                {
                  title: "Data Jalan Diperbarui",
                  time: "2 minggu lalu",
                  color: "#22c55e",
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-3">
                  <div
                    className="w-2 h-2 rounded-full mt-2"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <div>
                    <p className="text-gray-700 font-medium">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
