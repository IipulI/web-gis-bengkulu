import { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  useMapEvents,
  ZoomControl,
} from "react-leaflet";
import { useQuery } from "@tanstack/react-query";
import { layerService } from "../../services/layerService";
import environment from "../../config/environment";
import { useNavigate } from "react-router-dom";

const MapPage = () => {
  const [activeLayers, setActiveLayers] = useState([]);
  const [geoCache, setGeoCache] = useState({}); // <--- CACHE AGAR TIDAK REFETCH
  const [coords, setCoords] = useState({ lat: 0, lng: 0 });
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [mapType, setMapType] = useState("osm");

  const highlightedLayerRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (selectedPoint) setSlideIndex(0);
  }, [selectedPoint]);

  const center = [-3.8106, 102.2955];

  // FETCH LIST LAYER
  const { data: layers } = useQuery({
    queryKey: ["layers"],
    queryFn: layerService.getAll,
  });

  const layerList = useMemo(() => {
    if (!Array.isArray(layers)) return [];

    return layers.map((item) => {
      const original = item?.name || "";

      return {
        id: item?.id ?? null,
        key: original.replace(".json", "") || "",
        file: original || "",
        name: (original.replace(".json", "").replaceAll("_", " ") || "").trim(),
        color: item?.color || "#ff0000",
        geometryType: item.geometryType,
      };
    });
  }, [layers]);

  // FETCH GEOJSON PER ID — TAPI PAKAI CACHE
  const { data: geoData } = useQuery({
    queryKey: ["active-layers", activeLayers],
    enabled: activeLayers.length > 0,
    queryFn: async () => {
      const results = [];

      for (const layer of activeLayers) {
        // CEK CACHE DULU
        if (geoCache[layer.id]) {
          results.push(geoCache[layer.id]);
          continue;
        }

        // FETCH JIKA BELUM ADA DI CACHE
        const geojson = await layerService.getSpecificLayer(layer.id);
        const item = {
          id: layer.id,
          name: layer.name,
          color: layer.color,
          data: geojson.data || geojson,
        };

        // SIMPAN KE CACHE
        setGeoCache((prev) => ({
          ...prev,
          [layer.id]: item,
        }));

        results.push(item);
      }

      return results;
    },
  });

  const defaultLineStyle = {
    color: "#3388ff",
    weight: 4,
    opacity: 0.7,
  };

  const highlightLineStyle = {
    color: "#ff6f00",
    weight: 7,
    opacity: 1,
  };

  // TRACK COORD
  const LocationTracker = () => {
    useMapEvents({
      mousemove: (e) => setCoords({ lat: e.latlng.lat, lng: e.latlng.lng }),
    });
    return null;
  };

  const onEachFeature = (feature, layer) => {
    layer.on("click", () => {
      const geomType = feature.geometry.type;
      // Reset highlight sebelumnya
      if (highlightedLayerRef.current) {
        highlightedLayerRef.current.setStyle(defaultLineStyle);
      }

      // Highlight layer ini
      layer.setStyle(highlightLineStyle);
      layer.bringToFront(); // biar paling atas
      highlightedLayerRef.current = layer;

      // Tentukan koordinat point-nya
      let coords = null;
      if (geomType === "Point") {
        coords = layer.getLatLng();
      } else {
        // Ambil pusat geometrinya
        const bounds = layer.getBounds();
        const center = bounds.getCenter();
        coords = { lat: center.lat, lng: center.lng };
      }

      // Standarisasi properti deskriptif
      const p = feature.properties || {};

      console.log("on each feature", p);

      let detail = {};

      if (p.type == "Bangunan Gedung") {
        detail = {
          id: feature.id || "-",
          name: p.namaBangunan || p.name || "-",
          description:
            p.DESKRIPSI || p.DESCRIPTION || p.REMARK || "Bangunan Gedung",
          year: p.tahunPengadaan || p.TAHUN || "2024",
          regNumber: p.nomorRegister || p.NO_REG || "-",
          assetCode: p.KODE_ASET || p.ASET || "-",
          condition: p.KONDISI || p.CONDITION || "Aktif",
          maintenanceBy:
            p.MAINTENANCE || p.DIPELIHARA_OLEH || "Dinas PUPR Kota Bengkulu",

          category:
            geomType === "Polygon"
              ? "Point"
              : geomType === "MultiLineString"
              ? "Line"
              : "Polygon",

          meta: {
            jenisBangunan: p.jenisBangunan || "-",
            luasBangunan: p.luasBangunan || "-",
            lokasi: p.lokasi || "-",
            geometryType: geomType,
            ...p,
          },

          attachments: feature.attachments || [],
          coords,
        };
        setSelectedPoint(detail);
      } else if (p.type === "Jalan") {
        if (highlightedLayerRef.current) {
          highlightedLayerRef.current.setStyle(defaultLineStyle);
        }

        // Highlight jalan utama
        layer.setStyle(highlightLineStyle);
        highlightedLayerRef.current = layer;

        // Ambil titik awal & akhir

        const detail = {
          id: feature.id || "-",
          name: p.nama || p.name || "Nama Jalan",
          description: p.fungsi || "Data jalan Kota Bengkulu",
          year: p.tahunPengadaan || p.TAHUN || "-",
          regNumber: p.noRegister || p.NO_REG || "-",
          assetCode: p.nomorRuas || "-",
          condition: p.KONDISI || p.CONDITION || "-",
          maintenanceBy: p.sumberData || "Dinas PUPR Kota Bengkulu",
          category: "Line",
          meta: {
            geometryType: geomType,
            ...p,
          },
          coords: layer.getBounds().getCenter(),
        };
        setSelectedPoint(detail);
      } else if (p.type === "Jembatan") {
        detail = {
          id: feature.id || "-",
          name: p.name || `Jembatan di ${p.lokasi || "-"}`,
          description: p.fungsiJalanDihubungkan || "Jembatan penghubung jalan",
          year: p.tahunPengadaan || "-",
          regNumber: p.nomorRegister || "-",
          assetCode: `JBT-${feature.id || "000"}`, // bisa diubah jika ada kode aset resmi
          condition: p.KONDISI || p.CONDITION || "-",
          maintenanceBy: p.sumberData || "Dinas PUPR Kota Bengkulu",

          category: "Point", // biasanya jembatan = line

          meta: {
            lokasi: p.lokasi || "-",
            fungsiJalanDihubungkan: p.fungsiJalanDihubungkan || "-",
            tahunPerbaikanTerakhir: p.tahunPerbaikanTerakhir || "-",
            geometryType: geomType,
            ...p,
          },

          attachments: feature.attachments || [],
          coords,
        };
        setSelectedPoint(detail);
      } else if (
        geomType === "Polygon" ||
        geomType === "MultiPolygon" ||
        p.type === "Zona"
      ) {
        detail = {
          id: feature.id || "-",

          name: p.NAMOBJ || "Zona",

          description:
            p.REMARK && p.REMARK !== "Tidak Ada" ? p.REMARK : "Zona RDTR",

          year: "-", // data zona umumnya tidak punya tahun pengadaan

          regNumber: p.KODZON || "-",

          assetCode: p.KODSZN || "-",

          condition: "Aktif",

          maintenanceBy: "Pemerintah Daerah",

          category: "Polygon",

          meta: {
            kodeZona: p.KODZON || "-",
            subZona: p.KODSZN || "-",
            blok: p.KODBLK || "-",

            namaZona: p.NAMZON || "-",
            namaSubZona: p.NAMSZN || "-",

            luasHa: p.LUASHA || 0,

            kecamatan: p.WADMKC || "-",
            kelurahan: p.WADMKD || "-",
            kota: p.WADMKK || "-",
            provinsi: p.WADMPR || "-",

            peruntukan: p.JNSRPR || "-",
            kawasanStrategis: p.KKOP_1 || "-",
            kawasanRawanBencana: p.KRB_03 || "-",
            kawasanLindung: p.LP2B_2 || "-",

            geometryType: geomType,
            ...p,
          },

          attachments: feature.attachments || [],

          coords,
        };

        setSelectedPoint(detail);
      }

      console.log(selectedPoint);
    });
  };

  const filteredLayers = useMemo(() => {
    return layerList.filter((l) =>
      l.key.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, layerList]);

  // TOGGLE LAYER — menggunakan object, bukan id
  const toggleLayer = (layerObj) =>
    setActiveLayers((prev) => {
      const exists = prev.some((l) => l.id === layerObj.id);
      return exists
        ? prev.filter((l) => l.id !== layerObj.id)
        : [...prev, layerObj];
    });

  const clearLayers = () => setActiveLayers([]);

  const baseMaps = {
    osm: {
      label: "OSM",
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    },
    satellite: {
      label: "Satellite",
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    },
    googleStreet: {
      label: "G-Map",
      url: "http://mt0.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
      subdomains: ["mt0", "mt1", "mt2", "mt3"],
    },
    googleSat: {
      label: "G-Sat",
      url: "http://mt0.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
      subdomains: ["mt0", "mt1", "mt2", "mt3"],
    },
    dark: {
      label: "Dark",
      url: "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png",
    },
  };

  console.log(selectedPoint);

  return (
    <div className="relative w-full h-screen bg-gray-100 overflow-hidden">
      <MapContainer
        zoomControl={false}
        center={center as [number, number]}
        zoom={12.5}
        className="w-full h-full z-0"
      >
        <ZoomControl position="topright" />
        <TileLayer
          url={baseMaps[mapType].url}
          subdomains={baseMaps[mapType].subdomains ?? ["a", "b", "c"]}
          attribution={baseMaps[mapType].label}
        />

        <LocationTracker />

        {geoData?.map((layer) => (
          <GeoJSON
            key={layer.id}
            data={layer.data}
            style={{
              color: layer.color,
              weight: 3,
            }}
            onEachFeature={(f, l) => onEachFeature(f, l)}
          />
        ))}
      </MapContainer>

      <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-white px-6 py-2 rounded-full shadow z-[5000]">
        Database Aset Kota Bengkulu
      </div>

      <button
        onClick={() => setCatalogOpen(!catalogOpen)}
        className="absolute top-3 left-4 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow z-[5000]"
      >
        📚 Katalog Layer
      </button>
      {/* BASEMAP SWITCHER */}
      <div className="absolute top-3 right-4 bg-white rounded-xl shadow p-2 flex space-x-2 z-[6000]">
        {Object.keys(baseMaps).map((key) => (
          <button
            key={key}
            onClick={() => setMapType(key)}
            className={`
        px-3 py-1 rounded-lg text-sm font-medium transition
        ${
          mapType === key
            ? "bg-emerald-600 text-white shadow"
            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
        }
      `}
          >
            {baseMaps[key].label}
          </button>
        ))}
      </div>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white px-4 py-1.5 rounded-full shadow text-xs z-[5000]">
        Latitude: {coords.lat} | Longitude: {coords.lng}
      </div>

      <div
        className={`absolute top-0 left-0 w-[350px] h-full bg-white shadow-2xl transition-all z-[6000] ${
          catalogOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="bg-emerald-700 text-white px-5 py-4 flex justify-between">
          <h2>📚 Katalog Layer</h2>
          <button onClick={() => setCatalogOpen(false)}>✕</button>
        </div>

        <div className="p-4 border-b">
          <input
            className="w-full border px-3 py-2 rounded"
            placeholder="Cari layer..."
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="p-4 overflow-y-auto h-[calc(100%-150px)] space-y-3">
          {filteredLayers.map((layer) => {
            const active = activeLayers.some((l) => l.id === layer.id);

            return (
              <div
                key={layer.id}
                onClick={() => toggleLayer(layer)}
                className={`p-3 rounded-xl border cursor-pointer ${
                  active
                    ? "bg-emerald-50 border-emerald-500"
                    : "border-gray-200"
                }`}
              >
                <div className="flex justify-between">
                  <h4 className={active ? "text-emerald-700" : "text-gray-800"}>
                    {layer.key}
                  </h4>
                  {active && <span>✔️</span>}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Tipe: {layer.geometryType}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t">
          <button
            onClick={clearLayers}
            className="w-full bg-red-500 text-white py-2 rounded"
          >
            🗑️ Hapus Semua Layer
          </button>
        </div>
      </div>
      {/* ===========================
    MODAL DETAIL POINT
=========================== */}
      {/* =====================================================
   DETAIL SIDEBAR (RIGHT DRAWER)
===================================================== */}
      {selectedPoint && (
        <div className="fixed inset-0 z-[9500] flex">
          {/* BACKDROP */}
          <div
            className="flex-1 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedPoint(null)}
          />

          {/* SIDEBAR */}
          <div className="w-[380px] sm:w-[430px] h-full bg-white shadow-2xl animate-slideLeft overflow-y-auto">
            {/* HEADER */}
            <div className="px-5 py-4 bg-emerald-700 text-white flex justify-between items-center shadow">
              <h2 className="text-lg font-semibold truncate">Detail Feature</h2>
              <button
                className="text-xl font-bold"
                onClick={() => setSelectedPoint(null)}
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-6">
              {/* =============================
             1. TIPE FEATURE
        ============================== */}
              {/* <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                <h3 className="font-semibold text-emerald-700 mb-1">
                  🧭 Tipe Geometri
                </h3>
                <p className="text-gray-700 text-sm">
                  {selectedPoint.meta?.geometryType || "Point"}
                </p>
              </div> */}

              {/* =============================
             2. INFORMASI UTAMA
        ============================== */}
              <div>
                <h3 className="font-semibold text-2xl text-gray-700 mb-2">
                  📍 Informasi Utama
                </h3>
                <div className="bg-gray-50 border rounded-xl p-4 space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Nama:</span>{" "}
                    {selectedPoint.name}
                  </p>
                  <p>
                    <span className="font-medium">Deskripsi:</span>{" "}
                    {selectedPoint.description}
                  </p>

                  <p>
                    <span className="font-medium">Tahun Dibuat:</span>{" "}
                    {selectedPoint.year}
                  </p>
                  <p>
                    <span className="font-medium">Nomor Registrasi:</span>{" "}
                    {selectedPoint.regNumber}
                  </p>
                  <p>
                    <span className="font-medium">Kode Aset:</span>{" "}
                    {selectedPoint.assetCode}
                  </p>
                  <p>
                    <span className="font-medium">Kondisi:</span>{" "}
                    {selectedPoint.condition}
                  </p>
                  <p>
                    <span className="font-medium">Sumber Data:</span>{" "}
                    {selectedPoint.maintenanceBy}
                  </p>

                  {/* <p>
                    <span className="font-medium">Kategori Geometri:</span>{" "}
                    {selectedPoint.category}
                  </p> */}
                </div>
              </div>

              {/* =============================
             3. DETAIL PROPERTI (AUTO RENDER)
        ============================== */}
              {/* <div>
                <h3 className="font-semibold text-gray-700 mb-2">
                  🗂 Semua Properti
                </h3>

                <div className="bg-white border rounded-xl p-4 space-y-3 text-sm">
                  {Object.entries(selectedPoint.meta || {}).map(([k, v]) => (
                    <div key={k} className="flex justify-between border-b pb-1">
                      <span className="font-medium text-gray-600">{k}</span>
                      <span className="text-gray-800">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div> */}

              {/* =============================
   4. INFORMASI BERBEDA BERDASARKAN TIPE
============================== */}
              {selectedPoint.meta?.type && (
                <div>
                  <h3 className="font-semibold text-2xl text-gray-700 mb-2">
                    📐 Detail Berdasarkan Tipe
                  </h3>

                  {/* === JALAN === */}
                  {selectedPoint.meta.type === "Jalan" && (
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-sm space-y-2">
                      <p>
                        <span className="font-medium">Panjang Jalan:</span>{" "}
                        {selectedPoint.meta.panjangJalan || "-"} m
                      </p>
                      <p>
                        <span className="font-medium">Fungsi Jalan:</span>{" "}
                        {selectedPoint.meta.fungsi || "-"}
                      </p>
                      <p>
                        <span className="font-medium">Paving / Aspal:</span>{" "}
                        {selectedPoint.meta.bahan || "-"}
                      </p>
                    </div>
                  )}

                  {/* === BANGUNAN GEDUNG === */}
                  {selectedPoint.meta.type === "Bangunan Gedung" && (
                    <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl text-sm space-y-2">
                      <p>
                        <span className="font-medium">Jenis Bangunan:</span>{" "}
                        {selectedPoint.meta.jenisBangunan || "-"}
                      </p>
                      <p>
                        <span className="font-medium">Luas Bangunan:</span>{" "}
                        {selectedPoint.meta.luasBangunan || "-"} m2
                      </p>
                      <p>
                        <span className="font-medium">Lokasi:</span>{" "}
                        {selectedPoint.meta.lokasi || "-"}
                      </p>
                    </div>
                  )}

                  {/* === JEMBATAN === */}
                  {selectedPoint.meta.type === "Jembatan" && (
                    <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl text-sm space-y-2">
                      <p>
                        <span className="font-medium">Lokasi:</span>{" "}
                        {selectedPoint.meta.lokasi || "-"}
                      </p>
                      <p>
                        <span className="font-medium">
                          Fungsi Jalan yang Dihubungkan:
                        </span>{" "}
                        {selectedPoint.meta.fungsiJalanDihubungkan || "-"}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* =============================
             5. KOORDINAT
        ============================== */}
              <div>
                <h3 className="font-semibold text-2xl text-gray-700 mb-2">
                  📍 Koordinat
                </h3>
                <div className="bg-gray-50 border rounded-xl p-4 text-sm space-y-2">
                  <p>
                    <span className="font-medium">Latitude:</span>{" "}
                    {selectedPoint.coords.lat}
                  </p>
                  <p>
                    <span className="font-medium">Longitude:</span>{" "}
                    {selectedPoint.coords.lng}
                  </p>
                </div>
              </div>

              {/* =============================
             6. SLIDER GAMBAR
        ============================== */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">
                  🖼 Lampiran Foto
                </h3>

                {selectedPoint.attachments?.length > 0 ? (
                  <>
                    <div className="relative">
                      <img
                        src={
                          environment.IMAGE_URL +
                          selectedPoint.attachments[slideIndex].file_url
                        }
                        className="w-full h-56 object-cover rounded-xl shadow"
                      />

                      {/* Prev */}
                      <button
                        onClick={() =>
                          setSlideIndex((prev) =>
                            prev === 0
                              ? selectedPoint.attachments.length - 1
                              : prev - 1
                          )
                        }
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow"
                      >
                        ◀
                      </button>

                      {/* Next */}
                      <button
                        onClick={() =>
                          setSlideIndex((prev) =>
                            prev === selectedPoint.attachments.length - 1
                              ? 0
                              : prev + 1
                          )
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow"
                      >
                        ▶
                      </button>
                    </div>

                    {/* Dots */}
                    <div className="flex justify-center mt-3 space-x-1">
                      {selectedPoint.attachments.map((_, i) => (
                        <div
                          key={i}
                          className={`h-2.5 w-2.5 rounded-full cursor-pointer ${
                            slideIndex === i
                              ? "bg-emerald-600 scale-110"
                              : "bg-gray-300"
                          }`}
                          onClick={() => setSlideIndex(i)}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500 italic text-sm">
                    Tidak ada gambar.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => navigate("/")}
        className="absolute bottom-3 left-4 bg-white px-4 py-2 rounded-full shadow text-sm font-medium z-[5000] hover:bg-gray-100 transition"
      >
        ◀ Kembali
      </button>
    </div>
  );
};

export default MapPage;
