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
  const [openCategory, setOpenCategory] = useState({});
  const [openSubCategory, setOpenSubCategory] = useState({});

  const highlightedLayerRef = useRef(null);
  const mapRef = useRef(null);

  const toggleCategory = (cat) =>
    setOpenCategory((p) => ({ ...p, [cat]: !p[cat] }));

  const toggleSubCategory = (key) =>
    setOpenSubCategory((p) => ({ ...p, [key]: !p[key] }));

  const navigate = useNavigate();

  console.log(selectedPoint);

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

  const mapPropertiesBySchema = (properties = {}, schema = []) => {
    return schema
      .filter((field) => field.is_visible_public)
      .map((field) => ({
        key: field.key,
        label: field.label,
        value:
          properties[field.key] !== null && properties[field.key] !== undefined
            ? properties[field.key]
            : "-",
        type: field.type,
      }));
  };

  const onEachFeature = (feature, layer) => {
    layer.on("click", () => {
      const geomType = feature.geometry.type;

      // ===============================
      // RESET HIGHLIGHT SEBELUMNYA
      // ===============================
      if (highlightedLayerRef.current) {
        if (highlightedLayerRef.current.setStyle) {
          highlightedLayerRef.current.setStyle(defaultLineStyle);
        }
      }

      // ===============================
      // HIGHLIGHT CURRENT LAYER
      // ===============================
      if (layer.setStyle) {
        // Line / Polygon
        layer.setStyle(highlightLineStyle);
        layer.bringToFront();
        highlightedLayerRef.current = layer;
      } else {
        // Point (Marker)
        highlightedLayerRef.current = layer;
      }

      // ===============================
      // KOORDINAT
      // ===============================
      let coords;

      if (geomType === "Point") {
        coords = layer.getLatLng();

        mapRef.current?.flyTo(coords, 17, {
          animate: true,
          duration: 0.8,
        });
      } else {
        const bounds = layer.getBounds();
        coords = bounds.getCenter();

        mapRef.current?.fitBounds(bounds, {
          padding: [80, 80],
          animate: true,
          duration: 0.8,
        });
      }

      // ===============================
      // DATA
      // ===============================
      const properties = feature.properties || {};
      const schema = feature.schema || [];
      const attachments = feature.attachments || [];

      const mappedProperties = mapPropertiesBySchema(properties, schema);

      const detail = {
        id: feature.id,
        title:
          properties.nama ||
          properties.name ||
          feature.name ||
          "Detail Feature",

        geometryType: geomType,
        coords,
        attachments,

        meta: mappedProperties,
        rawProperties: properties,
      };

      setSelectedPoint(detail);
    });
  };

  //   const filteredLayers = useMemo(() => {
  //     return layerList.filter((l) =>
  //       l.key.toLowerCase().includes(searchTerm.toLowerCase()),
  //     );
  //   }, [searchTerm, layerList]);

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

  const groupedLayers = useMemo(() => {
    const map = {};

    layers.forEach((layer) => {
      const category = layer.category || "Lainnya";
      const subCategory = layer.subCategory || "Umum";

      if (!map[category]) map[category] = {};
      if (!map[category][subCategory]) map[category][subCategory] = [];

      map[category][subCategory].push(layer);
    });

    return map;
  }, [layerList]);

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
            data={{
              ...layer.data,
              features: layer.data.features.map((f) => ({
                ...f,
                schema: layer.data.schema, // ⬅️ INJECT SCHEMA
              })),
            }}
            style={{
              color: layer.color,
              weight: 3,
            }}
            onEachFeature={onEachFeature}
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

        {/* <div className="p-4 border-b">
          <input
            className="w-full border px-3 py-2 rounded"
            placeholder="Cari layer..."
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div> */}

        <div className="p-4 overflow-y-auto h-[calc(100%-150px)] space-y-4">
          {Object.entries(groupedLayers).map(([category, subcats]) => (
            <div key={category} className="border rounded-xl">
              {/* ================= CATEGORY ================= */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex justify-between items-center px-4 py-3 font-semibold text-emerald-700 hover:bg-emerald-50"
              >
                <span>📁 {category}</span>
                <span>{openCategory[category] ? "−" : "+"}</span>
              </button>

              {openCategory[category] && (
                <div className="pl-3 pb-3 space-y-2">
                  {Object.entries(subcats).map(([sub, layers]) => {
                    const subKey = `${category}-${sub}`;

                    return (
                      <div key={subKey}>
                        {/* ============== SUBCATEGORY ============== */}
                        <button
                          onClick={() => toggleSubCategory(subKey)}
                          className="w-full flex justify-between items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded"
                        >
                          <span>📂 {sub}</span>
                          <span>{openSubCategory[subKey] ? "−" : "+"}</span>
                        </button>

                        {/* ================= LAYERS ================= */}
                        {openSubCategory[subKey] && (
                          <div className="pl-4 mt-1 space-y-1">
                            {layers.map((layer) => {
                              const active = activeLayers.some(
                                (l) => l.id === layer.id,
                              );

                              return (
                                <div
                                  key={layer.id}
                                  onClick={() => toggleLayer(layer)}
                                  className={`cursor-pointer px-3 py-2 rounded-lg border text-sm flex justify-between items-center ${
                                    active
                                      ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                                      : "border-gray-200 hover:bg-gray-50"
                                  }`}
                                >
                                  <span>{layer.name}</span>
                                  {active && <span>✔</span>}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-4 border-t">
          <button
            onClick={clearLayers}
            className="w-full bg-red-500 text-white py-2 rounded"
          >
            🗑️ NonAktifkan Semua Layer
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
            <div className="px-5 py-4 bg-emerald-700 text-white flex items-center justify-between">
              <div className="flex flex-col">
                <h2 className="text-lg font-semibold leading-tight truncate">
                  {selectedPoint.title}
                </h2>
                <span className="text-xs opacity-80">
                  Detail Informasi Aset
                </span>
              </div>

              <button
                className="text-xl font-bold hover:opacity-80"
                onClick={() => setSelectedPoint(null)}
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-6">
              {/* =============================
            INFORMASI DETAIL (DINAMIS)
        ============================== */}
              <div className="p-5 space-y-6">
                <h3 className="font-semibold text-xl text-gray-700 mb-3">
                  🗂 Informasi Detail
                </h3>

                <div className="bg-white border rounded-xl overflow-hidden">
                  {selectedPoint.meta.length > 0 ? (
                    selectedPoint.meta.map((item) => (
                      <div
                        key={item.key}
                        className="grid grid-cols-2 gap-3 px-4 py-3 border-b last:border-b-0"
                      >
                        <span className="text-gray-500 text-sm">
                          {item.label}
                        </span>
                        <span className="text-gray-800 text-sm font-medium text-right break-words">
                          {item.value !== null && item.value !== ""
                            ? String(item.value)
                            : "-"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-gray-500 italic text-sm">
                      Tidak ada data properti.
                    </div>
                  )}
                </div>
              </div>

              {/* =============================
            KOORDINAT
        ============================== */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                  Koordinat
                </h3>

                <div className="bg-gray-50 border rounded-xl px-4 py-3 text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Latitude</span>
                    <span className="font-medium text-gray-800">
                      {selectedPoint.coords.lat}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Longitude</span>
                    <span className="font-medium text-gray-800">
                      {selectedPoint.coords.lng}
                    </span>
                  </div>
                </div>
              </div>

              {/* =============================
            LAMPIRAN GAMBAR
        ============================== */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                  Lampiran Foto
                </h3>

                {selectedPoint.attachments?.length > 0 ? (
                  <>
                    <div className="relative rounded-xl overflow-hidden border">
                      <img
                        src={
                          environment.IMAGE_URL +
                          selectedPoint.attachments[slideIndex].file_url
                        }
                        className="w-full h-56 object-cover"
                      />

                      <button
                        onClick={() =>
                          setSlideIndex((i) =>
                            i === 0
                              ? selectedPoint.attachments.length - 1
                              : i - 1,
                          )
                        }
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow"
                      >
                        ◀
                      </button>

                      <button
                        onClick={() =>
                          setSlideIndex((i) =>
                            i === selectedPoint.attachments.length - 1
                              ? 0
                              : i + 1,
                          )
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow"
                      >
                        ▶
                      </button>
                    </div>

                    <div className="flex justify-center mt-3 gap-1">
                      {selectedPoint.attachments.map((_, i) => (
                        <span
                          key={i}
                          onClick={() => setSlideIndex(i)}
                          className={`h-2.5 w-2.5 rounded-full cursor-pointer transition ${
                            slideIndex === i ? "bg-emerald-600" : "bg-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-gray-500 italic text-sm">
                    Tidak ada gambar.
                  </div>
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
