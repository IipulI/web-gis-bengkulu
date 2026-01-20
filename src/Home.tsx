// NOTE:
// - TEKS TIDAK DIUBAH SAMA SEKALI
// - HANYA PERUBAHAN DESAIN, WARNA, LAYOUT, DAN INTERAKSI
// - Fokus: elegan, mewah, modern, interaktif ringan

import { useState } from "react";
import { MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import HomeLayout from "./layouts/HomeLayout";
import { useQuery } from "@tanstack/react-query";
import { layerService } from "./services/layerService";
import { dashboardService } from "./services/dashboardService";
import { motion } from "framer-motion";

export default function Home() {
  const { data: layer } = useQuery({
    queryKey: ["layers"],
    queryFn: layerService.getAll,
  });

  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: dashboardService.getStatistic,
  });

  const produkHukumData = [
    {
      id: 1,
      type: "Perwali",
      tahun: 2024,
      title: "Perwali Kota Bengkulu Nomor 4 Tahun 2024",
      desc: "Rencana Kerja Pemerintah Daerah (RKPD) Kota Bengkulu Tahun 2025.",
      fileUrl:
        "https://peraturan.bpk.go.id/Details/317020/perwali-kota-bengkulu-no-4-tahun-2024.pdf",
    },
    {
      id: 2,
      type: "Perda",
      tahun: 2021,
      title: "Perda Kota Bengkulu Nomor 4 Tahun 2021",
      desc: "Rencana Tata Ruang Wilayah (RTRW) Kota Bengkulu Tahun 2021–2041.",
      fileUrl:
        "https://peraturan.bpk.go.id/Home/Details/188182/perda-kota-bengkulu-no-4-tahun-2021.pdf",
    },
    {
      id: 3,
      type: "Perwali",
      tahun: 2022,
      title: "Perwali Kota Bengkulu Nomor 29 Tahun 2022",
      desc: "Perubahan atas Perwali tentang Kedudukan, Susunan Organisasi, Tugas dan Fungsi Perangkat Daerah.",
      fileUrl:
        "https://peraturan.bpk.go.id/Home/Details/214551/perwali-kota-bengkulu-no-29-tahun-2022",
    },
    {
      id: 4,
      type: "Perda",
      tahun: 2020,
      title: "Perda Kota Bengkulu Nomor 2 Tahun 2020",
      desc: "Penyelenggaraan Ketertiban Umum dan Ketenteraman Masyarakat.",
      fileUrl:
        "https://peraturan.bpk.go.id/Home/Details/154594/perda-kota-bengkulu-no-2-tahun-2020",
    },
  ];

  const navigate = useNavigate();
  const [openProduk, setOpenProduk] = useState(null);
  const [openGaleri, setOpenGaleri] = useState(null);

  return (
    <HomeLayout>
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#0b1220]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),transparent_60%)]" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative max-w-5xl mx-auto px-6 py-32 text-center text-white"
        >
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Basis Data Infrastruktur Kota Bengkulu
          </h2>
          <p className="mt-6 text-lg md:text-xl text-blue-200">
            Akses Peta Cepat Terhadap Peta dan Data Infrastruktur Kota Bengkulu
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(`/map`)}
            className="mt-10 inline-flex items-center gap-3 bg-white/95 text-blue-900 px-10 py-4 rounded-2xl font-semibold shadow-xl backdrop-blur"
          >
            ▶ Lihat Peta Interaktif
          </motion.button>
        </motion.div>
      </section>

      {/* ================= VISI MISI ================= */}
      <section className="relative bg-white py-24">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-14 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-3xl font-bold text-slate-900 mb-5">
              Sekilas Tentang Database Aset
            </h3>
            <p className="text-slate-600 leading-relaxed mb-8">
              Sistem Basis Data Infrastruktur Kota Bengkulu ini dirancang untuk
              memberikan transparansi, efisiensi, serta kemudahan akses terhadap
              seluruh data yang berhubungan dengan pembangunan Infrastruktur Di
              Kota Bengkulu.
            </p>

            <ul className="space-y-4 text-slate-700">
              <li className="flex items-start gap-3">
                ✔ Menyediakan Kebijakan Pembangunan Infrastruktur
              </li>
              <li className="flex items-start gap-3">
                ✔ Mendukung pemetaan digital berbasis GIS seluruh wilayah kota.
              </li>
              <li className="flex items-start gap-3">
                ✔ Menampilkan aset daerah secara detail dan transparan.
              </li>
            </ul>

            <div className="mt-8">
              <p className="font-semibold text-slate-900">Dedy Wahyudi</p>
              <p className="text-sm text-slate-500">Walikota Bengkulu</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl overflow-hidden shadow-2xl"
          >
            <iframe
              className="w-full h-[340px]"
              src="https://www.youtube.com/embed/FTMJfvlfwxM?si=geLj5XX5XUPE-J_R"
              allowFullScreen
            />
          </motion.div>
        </div>
      </section>

      {/* ================= STATISTIK ================= */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-24">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold text-slate-900 mb-14">
            Statistik Data Aset Kota Bengkulu
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {stats?.map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -6 }}
                className="bg-white rounded-3xl shadow-lg p-8 border border-slate-100"
              >
                <p className="text-5xl font-extrabold text-blue-700">
                  {stat.total_assets}
                </p>
                <p className="mt-3 text-slate-600 text-sm tracking-wide">
                  {stat.category}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PETA INTERAKTIF ================= */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold text-slate-900 mb-14">
            PETA INTERAKTIF
          </h3>

          <motion.div
            whileHover={{ scale: 1.03 }}
            onClick={() => navigate(`/map`)}
            className="cursor-pointer max-w-xl mx-auto bg-gradient-to-br from-blue-50 to-white p-14 rounded-3xl shadow-xl border"
          >
            <MapPin className="w-28 h-28 text-blue-700 mx-auto mb-6" />
            <p className="text-lg font-semibold text-slate-700">
              Eksplorasi peta aset daerah
            </p>
          </motion.div>
        </div>
      </section>

      {/* ================= PRODUK HUKUM ================= */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold text-slate-900 mb-14">
            Produk Hukum Kota Bengkulu
          </h3>

          <div className="grid md:grid-cols-4 gap-8">
            {produkHukumData.map((item) => (
              <motion.a
                whileHover={{ y: -6 }}
                key={item.id}
                href={item.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-3xl p-7 shadow-lg border border-slate-100 text-left flex flex-col"
              >
                <p className="text-xs text-slate-500 mb-2">
                  {item.type} • {item.tahun}
                </p>
                <h4 className="font-semibold text-slate-900 mb-3">
                  {item.title}
                </h4>
                <p className="text-sm text-slate-600 mb-6 line-clamp-2">
                  {item.desc}
                </p>
                <span className="mt-auto text-blue-700 text-sm font-semibold">
                  📄 Buka Dokumen →
                </span>
              </motion.a>
            ))}
          </div>
        </div>
      </section>
    </HomeLayout>
  );
}
