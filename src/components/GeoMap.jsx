import React, { useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import { AnimatePresence, motion } from "framer-motion";
import "leaflet/dist/leaflet.css";

const GeoMap = ({
  center = [-3.83, 102.3],
  zoom = 11,
  activeLayerData = [],
}) => {
  const [selectedFeature, setSelectedFeature] = useState(null);

  const onEachFeature = (feature, layer) => {
    layer.on({
      click: (e) => {
        // Mencegah Leaflet menangani klik default jika perlu
        L.DomEvent.stopPropagation(e);
        setSelectedFeature(feature.properties);
      },
      mouseover: (e) => {
        const el = e.target;
        el.setStyle({ fillOpacity: 0.5, weight: 4, color: "#ffffff" });
        el.bringToFront();
      },
      mouseout: (e) => {
        const el = e.target;
        el.setStyle({
          fillOpacity: 0.3,
          weight: 2,
          color: el.options.originalColor,
        });
      },
    });
  };

  return (
    <div className="relative w-full h-[600px] overflow-hidden rounded-2xl shadow-2xl border border-slate-200">
      {/* PETA UTAMA */}
      <MapContainer
        center={center}
        zoom={zoom}
        zoomControl={false} // Kita matikan agar UI lebih bersih
        className="z-0 w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">CartoDB</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" // Menggunakan gaya peta minimalis (CartoDB Light)
        />

        {activeLayerData.map((layer) => (
          <GeoJSON
            key={layer.id}
            data={layer.data}
            style={{
              color: layer.color || "#10b981",
              originalColor: layer.color || "#10b981", // Simpan warna asli untuk mouseout
              weight: 2,
              fillOpacity: 0.3,
            }}
            onEachFeature={onEachFeature}
          />
        ))}
      </MapContainer>

      {/* OVERLAY: HEADER MINIMALIS */}
      <div className="absolute top-6 left-6 z-[1000] pointer-events-none">
        <div className="bg-white/80 backdrop-blur-md px-5 py-3 rounded-xl shadow-lg border border-white/40 pointer-events-auto">
          <h1 className="text-slate-800 font-bold text-sm tracking-tight uppercase">
            Sistem Informasi Geografis{" "}
            <span className="text-emerald-600 block text-xs font-medium">
              Monitoring Aset Wilayah
            </span>
          </h1>
        </div>
      </div>

      {/* SIDEBAR DETAIL (MODERN DRAWER) */}
      <AnimatePresence>
        {selectedFeature && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute top-0 right-0 z-[2000] w-80 md:w-96 h-full bg-white/90 backdrop-blur-xl shadow-[-20px_0_50px_rgba(0,0,0,0.1)] border-l border-white/20 flex flex-col"
          >
            {/* Header Sidebar */}
            <div className="p-6 bg-emerald-600 text-white shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold leading-tight">
                    Detail Informasi
                  </h2>
                  <p className="text-emerald-100 text-xs mt-1 uppercase tracking-widest font-medium">
                    Data Atribut Terpilih
                  </p>
                </div>
                <button
                  onClick={() => setSelectedFeature(null)}
                  className="bg-white/20 hover:bg-white/40 p-2 rounded-full transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content Sidebar */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-4">
                {Object.entries(selectedFeature).map(([key, value]) => {
                  if (value === null || typeof value === "object") return null;
                  return (
                    <div
                      key={key}
                      className="group border-b border-slate-100 pb-3 last:border-0"
                    >
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-emerald-500 transition-colors">
                        {key.replace(/_/g, " ")}
                      </label>
                      <p className="text-slate-700 font-semibold text-sm mt-1 break-words leading-relaxed">
                        {value}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer Sidebar */}
            {/* <div className="p-6 border-t border-slate-100 bg-slate-50/50">
              <button className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg">
                Cetak Laporan Detail
              </button>
            </div> */}
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOMBOL TUTUP SIDEBAR OTOMATIS JIKA KLIK PETA KOSONG */}
      {selectedFeature && (
        <div
          className="absolute inset-0 z-[1500]"
          onClick={() => setSelectedFeature(null)}
        />
      )}
    </div>
  );
};

export default GeoMap;
