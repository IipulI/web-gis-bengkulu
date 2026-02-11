import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin } from "lucide-react";
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

  const { data: layer } = useQuery({
    queryKey: ["layers"],
    queryFn: layerService.getAll,
  });

  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: dashboardService.getStatistic,
  });

  const [currentSlide, setCurrentSlide] = useState(0);

  // ================= AUTO SLIDER =================
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const produkHukumData = [
    {
      id: 1,
      type: "Perwali",
      tahun: 2024,
      title: "Perwali Kota Bengkulu Nomor 4 Tahun 2024",
      desc: "Rencana Kerja Pemerintah Daerah Kota Bengkulu Tahun 2025.",
      fileUrl:
        "https://peraturan.bpk.go.id/Details/317020/perwali-kota-bengkulu-no-4-tahun-2024.pdf",
    },
    {
      id: 2,
      type: "Perda",
      tahun: 2021,
      title: "Perda Kota Bengkulu Nomor 4 Tahun 2021",
      desc: "RTRW Kota Bengkulu Tahun 2021–2041.",
      fileUrl:
        "https://peraturan.bpk.go.id/Home/Details/188182/perda-kota-bengkulu-no-4-tahun-2021.pdf",
    },
    {
      id: 3,
      type: "Perwali",
      tahun: 2022,
      title: "Perwali Kota Bengkulu Nomor 29 Tahun 2022",
      desc: "Perubahan susunan organisasi perangkat daerah.",
      fileUrl:
        "https://peraturan.bpk.go.id/Home/Details/214551/perwali-kota-bengkulu-no-29-tahun-2022",
    },
    {
      id: 4,
      type: "Perda",
      tahun: 2020,
      title: "Perda Kota Bengkulu Nomor 2 Tahun 2020",
      desc: "Penyelenggaraan ketertiban umum masyarakat.",
      fileUrl:
        "https://peraturan.bpk.go.id/Home/Details/154594/perda-kota-bengkulu-no-2-tahun-2020",
    },
  ];

  return (
    <HomeLayout>
      {/* ================= HERO + SLIDER ================= */}
      <section className="relative h-[90vh] overflow-hidden text-white">
        <AnimatePresence mode="wait">
          <motion.div
            key={heroSlides[currentSlide].id}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <img
              src={heroSlides[currentSlide].image}
              className="w-full h-full object-cover"
              alt="slide"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/70" />
          </motion.div>
        </AnimatePresence>

        <div className="relative z-10 flex items-center justify-center h-full text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <h2 className="text-4xl md:text-6xl font-extrabold leading-tight">
              Basis Data Infrastruktur Kota Bengkulu
            </h2>

            <p className="mt-6 text-lg text-blue-100">
              {heroSlides[currentSlide].desc}
            </p>

            {/* <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(`/map`)}
              className="mt-10 bg-blue-600 hover:bg-blue-700 px-10 py-4 rounded-2xl font-semibold shadow-xl"
            >
              Lihat Peta Interaktif
            </motion.button> */}
          </motion.div>
        </div>
      </section>

      {/* ================= VISI MISI ================= */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-14 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-3xl font-bold text-slate-900 mb-5">
              Sekilas Database Aset
            </h3>

            <p className="text-slate-600 leading-relaxed mb-8">
              Sistem Basis Data Infrastruktur Kota Bengkulu menyediakan
              transparansi, efisiensi, dan kemudahan akses terhadap data
              pembangunan infrastruktur kota.
            </p>

            <ul className="space-y-4 text-slate-700">
              <li>✔ Kebijakan pembangunan lebih terarah</li>
              <li>✔ Pemetaan GIS seluruh wilayah kota</li>
              <li>✔ Transparansi aset daerah</li>
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
              src="https://www.youtube.com/embed/FTMJfvlfwxM"
              allowFullScreen
            />
          </motion.div>
        </div>
      </section>

      {/* ================= STATISTIK ================= */}
      <section className="bg-gradient-to-b from-blue-50 via-sky-50 to-white py-24">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-3xl font-bold text-slate-900 text-center mb-14">
            Statistik Data Aset
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
            {stats?.map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="relative overflow-hidden bg-white rounded-3xl shadow-xl border flex flex-col"
              >
                {/* GRADIENT ACCENT */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-400" />

                {/* HEADER */}
                <div className="p-8 pb-6">
                  <p className="text-5xl font-extrabold text-blue-600">
                    {stat.total_assets}
                  </p>
                  <p className="mt-2 text-slate-800 font-semibold leading-snug">
                    {stat.category}
                  </p>
                </div>

                {/* DIVIDER */}
                <div className="px-8">
                  <div className="h-px bg-slate-100" />
                </div>

                {/* SUB CATEGORY */}
                {stat.sub_categories?.length > 0 && (
                  <div className="p-6 pt-4 mt-auto">
                    <p className="text-xs uppercase tracking-wide text-slate-400 mb-4">
                      Sub Kategori
                    </p>

                    <div className="space-y-3">
                      {stat.sub_categories.map((sub, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3 text-sm hover:from-blue-50 hover:to-sky-50 transition"
                        >
                          <div className="flex flex-col">
                            <span className="text-slate-800 font-medium">
                              {sub.name}
                            </span>
                            <span className="text-xs text-slate-400">
                              {sub.layers_count} layer
                            </span>
                          </div>

                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                            {sub.total_assets}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PETA INTERAKTIF ================= */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold text-slate-900 mb-14">
            Peta Interaktif
          </h3>

          <motion.div
            whileHover={{ scale: 1.03 }}
            onClick={() => navigate(`/map`)}
            className="cursor-pointer max-w-xl mx-auto bg-gradient-to-br from-blue-100 to-white p-14 rounded-3xl shadow-xl border"
          >
            <MapPin className="w-24 h-24 text-blue-700 mx-auto mb-6" />
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
                className="bg-white rounded-3xl p-7 shadow-lg border text-left flex flex-col"
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
