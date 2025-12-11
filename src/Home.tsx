import { useState } from "react";
import { MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import HomeLayout from "./layouts/HomeLayout";
import { useQuery } from "@tanstack/react-query";
import { layerService } from "./services/layerService";

export default function Home() {
  const { data: layer } = useQuery({
    queryKey: ["layers"],
    queryFn: layerService.getAll,
  });

  const navigate = useNavigate();

  console.log("layer", layer);

  const [openProduk, setOpenProduk] = useState(null);
  const [openGaleri, setOpenGaleri] = useState(null);

  // Data dummy produk hukum
  const produkHukumData = [
    {
      id: 1,
      title: "Peraturan Wali Kota No 1 Tahun 2024",
      desc: "Peraturan mengenai penataan ruang wilayah dan pengelolaan aset daerah Kota Bengkulu.",
      fileUrl: "#",
      thumbnail:
        "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
    {
      id: 2,
      title: "Perda No 2 Tahun 2024",
      desc: "Regulasi dasar perencanaan pengembangan kawasan strategis.",
      fileUrl: "#",
      thumbnail:
        "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
    {
      id: 3,
      title: "Peraturan Zonasi Tahun 2024",
      desc: "Dokumen lengkap terkait aturan zonasi di seluruh wilayah Kota Bengkulu.",
      fileUrl: "#",
      thumbnail:
        "https://images.pexels.com/photos/3184463/pexels-photo-3184463.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
    {
      id: 4,
      title: "Peraturan Pemanfaatan Ruang Tahun 2024",
      desc: "Peraturan yang mengatur pemanfaatan ruang publik dan kawasan strategis.",
      fileUrl: "#",
      thumbnail:
        "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
  ];

  // Dummy galeri

  return (
    <div className="font-sans text-gray-800">
      <HomeLayout>
        {/* ===============================
        HERO SECTION
    =============================== */}
        <section className="relative bg-gradient-to-br from-blue-700 to-blue-900 text-white py-24 text-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[url('')] bg-cover bg-center"></div>

          <div className="relative max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-extrabold leading-tight">
              Basis Data Infrastruktur Kota Bengkulu
            </h2>
            <p className="text-blue-200 text-lg md:text-xl mt-4">
              Akses Peta Cepat Terhadap Peta dan Data Infrastruktur Kota
              Bengkulu
            </p>

            <button
              onClick={() => navigate(`/map`)}
              className="mt-8 bg-white text-blue-800 hover:bg-gray-100 px-8 py-3 rounded-xl font-semibold shadow-lg transition transform hover:scale-[1.03]"
            >
              ▶ Lihat Peta Interaktif
            </button>
          </div>
        </section>

        {/* ===============================
        SECTION VISI MISI
    =============================== */}
        <section className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-3xl font-bold text-blue-900 mb-4">
              Sekilas Tentang Database Aset
            </h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              Sistem Basis Data Infrastruktur Kota Bengkulu ini dirancang untuk
              memberikan transparansi, efisiensi, serta kemudahan akses terhadap
              seluruh data yang berhubungan dengan pembangunan Infrastruktur Di
              Kota Bengkulu.
            </p>

            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-blue-600 font-bold text-xl mr-2">✔</span>
                Menyediakan Kebijakan Pembangunan Infrastruktur
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 font-bold text-xl mr-2">✔</span>
                Mendukung pemetaan digital berbasis GIS seluruh wilayah kota.
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 font-bold text-xl mr-2">✔</span>
                Menampilkan aset daerah secara detail dan transparan.
              </li>
            </ul>

            <div className="mt-6">
              <p className="font-semibold text-blue-800">Dedy Wahyudi</p>
              <p className="text-sm text-gray-500">Walikota Bengkulu</p>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden shadow-xl">
            <iframe
              width="560"
              height="315"
              src="https://www.youtube.com/embed/FTMJfvlfwxM?si=geLj5XX5XUPE-J_R"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
        </section>

        {/* ===============================
        STATISTIK DATA ASET
    =============================== */}
        <section className="bg-blue-50 py-16">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-blue-900 mb-10">
              Statistik Data Aset Kota Bengkulu
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow text-center">
                <p className="text-4xl font-bold text-blue-700">124</p>
                <p className="text-gray-600 text-sm mt-2">Bangunan Gedung</p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow text-center">
                <p className="text-4xl font-bold text-blue-700">812</p>
                <p className="text-gray-600 text-sm mt-2">
                  Jaringan Jalan Dan Jembatan
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow text-center">
                <p className="text-4xl font-bold text-blue-700">57</p>
                <p className="text-gray-600 text-sm mt-2">
                  Drainase Perkotaan dan Pengendalian Banjir
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow text-center">
                <p className="text-4xl font-bold text-blue-700">32</p>
                <p className="text-gray-600 text-sm mt-2">
                  Bangunan Sumber Daya Air dan Irigasi
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow text-center">
                <p className="text-4xl font-bold text-blue-700">20</p>
                <p className="text-gray-600 text-sm mt-2">Jaringan Air Minum</p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow text-center">
                <p className="text-4xl font-bold text-blue-700">18</p>
                <p className="text-gray-600 text-sm mt-2">
                  Pengelolaan Air Limba dan Limbah B3 dan Sanitasi (aspal dan
                  septiptank)
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===============================
        LAYANAN SECTION
    =============================== */}
        <section id="layanan" className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h3 className="text-3xl font-bold text-blue-900 mb-12">
              PETA INTERAKTIF
            </h3>

            <div className="grid md:grid-cols-1 gap-8">
              <div
                onClick={() => navigate(`/map`)}
                className="bg-blue-50 p-8 rounded-2xl shadow hover:shadow-xl transition"
              >
                <MapPin className="w-28 h-28 text-blue-700 mx-auto mb-5" />
                <p className="text-lg text-gray-700 font-semibold">
                  Eksplorasi peta aset daerah
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===============================
        PRODUK HUKUM
    =============================== */}
        <section id="produk" className="bg-blue-50 py-16">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h3 className="text-3xl font-bold text-blue-900 mb-12">
              Produk Hukum Terkait Infrastruktur
            </h3>

            <div className="grid md:grid-cols-4 gap-6">
              {produkHukumData.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setOpenProduk(item)}
                  className="cursor-pointer bg-white p-6 rounded-xl shadow hover:shadow-xl transition border hover:border-blue-300"
                >
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-32 object-cover rounded-lg mb-4"
                  />
                  <h4 className="font-semibold mb-2">{item.title}</h4>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {item.desc}
                  </p>
                  <span className="text-blue-600 text-sm font-semibold">
                    Klik untuk detail →
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===============================
        GALERI FOTO
    =============================== */}
        <section id="galeri" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h3 className="text-3xl font-bold text-blue-900 mb-12">
              Galeri Infrastruktur Kota Bengkulu
            </h3>

            <div className="grid md:grid-cols-4 gap-4">
              {/* {galeriData.map((item) => (
                <img
                  key={item.id}
                  onClick={() => setOpenGaleri(item)}
                  src={item.image}
                  alt={item.title}
                  className="cursor-pointer rounded-xl shadow hover:opacity-90 transition hover:shadow-xl"
                />
              ))} */}
            </div>
          </div>
        </section>

        {/* ========================================
   MODAL PRODUK HUKUM
======================================== */}
        {openProduk && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl relative p-6 animate-fadeIn">
              <button
                className="absolute top-3 right-3 text-gray-700 hover:text-black"
                onClick={() => setOpenProduk(null)}
              >
                ✖
              </button>

              <img
                src={openProduk.thumbnail}
                alt=""
                className="w-full h-56 object-cover rounded-xl mb-4"
              />

              <h3 className="text-xl font-bold text-blue-900">
                {openProduk.title}
              </h3>
              <p className="text-gray-700 mt-2 leading-relaxed">
                {openProduk.desc}
              </p>

              <a
                href={openProduk.fileUrl}
                className="block mt-5 text-center bg-blue-700 hover:bg-blue-800 text-white py-2 rounded-xl font-semibold"
              >
                📄 Buka Dokumen
              </a>
            </div>
          </div>
        )}

        {/* ========================================
   MODAL GALERI FOTO
======================================== */}
        {openGaleri && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl relative p-6 animate-fadeIn">
              <button
                className="absolute top-3 right-3 text-gray-700 hover:text-black"
                onClick={() => setOpenGaleri(null)}
              >
                ✖
              </button>

              <img
                src={openGaleri.image}
                alt=""
                className="w-full h-72 object-cover rounded-xl mb-4"
              />

              <h3 className="text-2xl font-bold text-blue-900">
                {openGaleri.title}
              </h3>
              <p className="text-gray-700 mt-2">{openGaleri.desc}</p>
            </div>
          </div>
        )}
      </HomeLayout>
    </div>
  );
}
