import React from "react";
import { Layers, Globe, Database, Activity, ArrowRight } from "lucide-react";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

const Dashboard = () => {
  // ==========================================
  // DATASET STATISTIK PER KATEGORI (5 kategori)
  // ==========================================
  const kategoriStats = [
    { name: "Jalan", value: 32, color: "green" },
    { name: "Gedung", value: 21, color: "blue" },
    { name: "Jembatan", value: 14, color: "orange" },
    { name: "Irigasi", value: 18, color: "purple" },
    { name: "Drainase", value: 10, color: "rose" },
  ];

  // ============================
  // BAR CHART 5 KATEGORI
  // ============================
  const barData = {
    labels: kategoriStats.map((k) => k.name),
    datasets: [
      {
        label: "Jumlah Data Aset",
        data: kategoriStats.map((k) => k.value),
        backgroundColor: [
          "#16a34a", // hijau
          "#3b82f6", // biru
          "#f97316", // orange
          "#8b5cf6", // ungu
          "#fb7185", // rose
        ],
        borderRadius: 8,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 10 } },
    },
  };

  return (
    <DashboardLayout>
      <div className="space-y-10">
        {/* HEADER */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-gray-800">
              Selamat Datang Admin 👋
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Kelola dan pantau semua data Aset Anda melalui dashboard modern
              ini.
            </p>
          </div>
        </div>

        {/* CARD STATISTIK */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
          {kategoriStats.map((item, i) => (
            <div
              key={i}
              className="bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition flex items-center gap-4"
            >
              <div
                className={`p-3 rounded-xl bg-${item.color}-100 text-${item.color}-700`}
              >
                <Database className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{item.name}</p>
                <h3 className="text-xl font-bold">{item.value}</h3>
              </div>
            </div>
          ))}
        </section>

        {/* CHARTS */}
        <section className="grid lg:grid-cols-3 gap-6">
          {/* Bar Chart */}
          <div className="col-span-2 bg-white border rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold text-gray-800 mb-4">
              Statistik Data Aset per Kategori
            </h2>
            <Bar data={barData} options={barOptions} height={120} />
          </div>

          {/* Activity */}
          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-green-600" />
              Aktivitas Terbaru
            </h2>

            <div className="space-y-5 text-sm">
              {[
                {
                  title: "Data Aset Jalan Nasional berhasil diperbarui",
                  time: "2 jam lalu",
                  color: "green",
                },
                {
                  title: "Data Gedung Pemerintah ditambahkan",
                  time: "Kemarin",
                  color: "blue",
                },
                {
                  title: "Data Aset Irigasi Sekunder direview",
                  time: "2 hari lalu",
                  color: "orange",
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-3">
                  <div
                    className={`w-2 h-2 bg-${item.color}-600 rounded-full mt-2`}
                  ></div>
                  <div>
                    <p className="text-gray-700 leading-snug">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TABLE */}
        <section className="bg-white border rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-800">Update Terbaru</h2>
            <button className="text-sm text-green-700 hover:underline flex items-center">
              Lihat Semua <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-t border-gray-100">
              <thead className="text-xs uppercase text-gray-600 bg-gray-50">
                <tr>
                  <th className="px-4 py-3">Nama</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Tipe</th>
                  <th className="px-4 py-3">Tanggal Edit</th>
                  <th className="px-4 py-3">Oleh</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {[
                  [
                    "Jalan Provinsi Barat",
                    "Jalan",
                    "Line",
                    "11 Okt 2025",
                    "Syafiul",
                  ],
                  [
                    "Gedung Sekolah Baru",
                    "Gedung",
                    "Polygon",
                    "09 Okt 2025",
                    "Ikhsan",
                  ],
                  [
                    "Jembatan Sungai Kecil",
                    "Jembatan",
                    "Line",
                    "07 Okt 2025",
                    "Admin",
                  ],
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    {row.map((cell, c) => (
                      <td key={c} className="px-4 py-3">
                        {c === 0 ? <b>{cell}</b> : cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
