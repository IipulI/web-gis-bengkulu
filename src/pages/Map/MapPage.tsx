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
import { unslugify } from "../../utils/unslugify.ts";

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
  };

  const groupedLayers = useMemo(() => {
    const map = {};

    layers?.forEach((layer) => {
      const category = layer.category || "Lainnya";
      const subCategory = layer.subCategory || "Umum";

      if (!map[category]) map[category] = {};
      if (!map[category][subCategory]) map[category][subCategory] = [];

      map[category][subCategory].push(layer);
    });

    return map;
  }, [layerList]);

  console.log(groupedLayers);

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden font-sans">
      {/* MAP CONTAINER */}
      <MapContainer
        zoomControl={false}
        center={center as [number, number]}
        zoom={12.5}
        className="w-full h-full z-0"
        ref={mapRef}
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
                schema: layer.data.schema,
              })),
            }}
            style={{
              color: layer.color,
              weight: 3,
              fillOpacity: 0.2,
            }}
            onEachFeature={onEachFeature}
          />
        ))}
      </MapContainer>

      {/* TOP NAVIGATION BAR - GLASSMORPHISM */}
      <div className="absolute top-5 left-0 right-0 z-[5000] flex justify-center px-4 pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          {/* Tombol Katalog */}
          <button
            onClick={() => setCatalogOpen(!catalogOpen)}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-2.5 rounded-2xl shadow-[0_8px_30px_rgba(245,158,11,0.4)] transition-all active:scale-95 font-bold text-sm"
          >
            <span className="text-lg">layers</span>
            Katalog Layer
          </button>

          {/* Title Badge */}
          <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 px-6 py-2.5 rounded-2xl shadow-xl hidden md:block">
            <h1 className="text-white font-bold text-sm tracking-tight uppercase">
              Database Infrastruktur{" "}
              <span className="text-amber-500">Kota Bengkulu</span>
            </h1>
          </div>

          {/* Basemap Switcher */}
          <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 p-1 rounded-2xl shadow-xl flex gap-1">
            {Object.keys(baseMaps).map((key) => (
              <button
                key={key}
                onClick={() => setMapType(key)}
                className={`px-4 py-1.5 rounded-xl text-[11px] font-bold uppercase transition-all ${
                  mapType === key
                    ? "bg-amber-500 text-slate-950 shadow-md"
                    : "text-slate-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {baseMaps[key].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* LEFT SIDEBAR - CATALOG */}
      <div
        className={`absolute top-0 left-0 w-[360px] h-full bg-slate-900/95 backdrop-blur-xl shadow-[25px_0_50px_-15px_rgba(0,0,0,0.5)] transition-all duration-500 ease-in-out z-[6000] border-r border-white/5 flex flex-col ${
          catalogOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="pt-24 px-8 pb-6 flex justify-between items-end border-b border-white/5">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tighter">
              LIBRARY
            </h2>
            <p className="text-xs text-amber-500 font-bold uppercase tracking-widest">
              Daftar Layer Infrastruktur
            </p>
          </div>
          <button
            onClick={() => setCatalogOpen(false)}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 custom-scrollbar">
          {Object.entries(groupedLayers).map(([category, subcats]) => (
            <div
              key={category}
              className="bg-white/5 border border-white/5 rounded-3xl overflow-hidden shadow-sm"
            >
              <button
                onClick={() => toggleCategory(category)}
                className="w-full text-left flex justify-between items-center px-5 py-4 font-bold text-white hover:bg-amber-500/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
                  <span className="text-sm tracking-tight">{ unslugify(category) }</span>
                </div>
                <span className="text-slate-500">
                  {openCategory[category] ? "−" : "+"}
                </span>
              </button>

              {openCategory[category] && (
                <div className="px-3 pb-4 space-y-3 animate-fadeIn">
                  {Object.entries(subcats).map(([sub, layers]) => {
                    const subKey = `${category}-${sub}`;
                    return (
                      <div key={subKey} className="space-y-1">
                        <button
                          onClick={() => toggleSubCategory(subKey)}
                          className="w-full flex justify-between items-center px-3 py-2 text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]"
                        >
                          {sub}
                          <span>{openSubCategory[subKey] ? "↓" : "→"}</span>
                        </button>

                        {openSubCategory[subKey] && (
                          <div className="grid grid-cols-1 gap-1 pl-1">
                            {layers.map((layer) => {
                              const active = activeLayers.some(
                                (l) => l.id === layer.id,
                              );
                              return (
                                <div
                                  key={layer.id}
                                  onClick={() => toggleLayer(layer)}
                                  className={`group cursor-pointer px-4 py-3 rounded-2xl border transition-all flex justify-between items-center ${
                                    active
                                      ? "bg-amber-500 border-amber-400 text-slate-950 shadow-lg shadow-amber-900/20"
                                      : "bg-white/5 border-white/5 hover:border-amber-500/50 text-slate-300 hover:text-white"
                                  }`}
                                >
                                  <span className="text-xs font-bold leading-tight">
                                    {layer.name}
                                  </span>
                                  {active && (
                                    <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded-lg font-black">
                                      ON
                                    </span>
                                  )}
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

        <div className="p-6 bg-slate-950/50">
          <button
            onClick={clearLayers}
            className="w-full bg-white/5 hover:bg-red-600 hover:text-white text-slate-400 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95"
          >
            Reset Semua Layer
          </button>
        </div>
      </div>

      {/* DETAIL SIDEBAR (RIGHT) */}
      {selectedPoint && (
        <div className="fixed inset-0 z-[9500] flex justify-end">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedPoint(null)}
          />

          <div className="relative w-full max-w-[420px] h-full bg-slate-900 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] flex flex-col animate-slideInRight border-l border-white/10">
            {/* Detail Image Header */}
            <div className="relative h-64 bg-slate-800">
              {selectedPoint.attachments?.length > 0 ? (
                <img
                  src={
                    environment.IMAGE_URL +
                    selectedPoint.attachments[slideIndex].file_url
                  }
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-800">
                  <span className="text-4xl">📷</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
              <button
                onClick={() => setSelectedPoint(null)}
                className="absolute top-6 right-6 w-10 h-10 bg-black/20 backdrop-blur-md hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all border border-white/10"
              >
                ✕
              </button>
              <div className="absolute bottom-6 left-8 right-8 text-white">
                <h2 className="text-2xl font-black leading-tight tracking-tight uppercase truncate">
                  {selectedPoint.title}
                </h2>
                <p className="text-xs font-bold text-amber-500 uppercase tracking-widest">
                  Informasi Infrastruktur
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              {/* Detail Grid */}
              <section>
                <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">
                  Informasi Atribut
                </h3>
                <div className="space-y-1">
                  {selectedPoint.meta.map((item) => (
                    <div
                      key={item.key}
                      className="flex justify-between py-3 border-b border-white/5 group hover:bg-white/5 transition-colors px-2 rounded-lg"
                    >
                      <span className="text-sm font-medium text-slate-400">
                        {item.label}
                      </span>
                      <span className="text-sm font-black text-white">
                        {String(item.value || "-")}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Location Badge */}
              <section className="bg-slate-950 rounded-3xl p-6 text-white shadow-2xl border border-white/5">
                <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-3">
                  Koordinat Lokasi
                </h3>
                <div className="grid grid-cols-2 gap-4 font-mono text-sm uppercase">
                  <div>
                    <p className="text-slate-500 text-[9px] mb-1 font-bold">
                      Latitude
                    </p>
                    <p className="font-bold text-white">
                      {selectedPoint.coords.lat.toFixed(6)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[9px] mb-1 font-bold">
                      Longitude
                    </p>
                    <p className="font-bold text-white">
                      {selectedPoint.coords.lng.toFixed(6)}
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM FLOATING CONTROLS */}
      <div className="absolute bottom-6 left-6 z-[5000] flex gap-3">
        <button
          onClick={() => navigate("/")}
          className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-2xl shadow-xl font-bold text-xs uppercase tracking-widest transition-all border border-white/10 active:scale-95 flex items-center gap-2"
        >
          <span className="text-amber-500">←</span> Kembali
        </button>
      </div>

      <div className="absolute bottom-6 right-6 z-[5000] bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 shadow-lg hidden sm:block">
        <p className="text-[10px] font-black text-amber-500 font-mono uppercase tracking-widest">
          {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
        </p>
      </div>
    </div>
  );
};

export default MapPage;
