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
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-2xl shadow-[0_8px_30px_rgb(5,150,105,0.4)] transition-all active:scale-95 font-semibold text-sm"
          >
            <span className="text-lg">layers</span>
            Katalog Layer
          </button>

          {/* Title Badge */}
          <div className="bg-white/80 backdrop-blur-md border border-white/40 px-6 py-2.5 rounded-2xl shadow-xl hidden md:block">
            <h1 className="text-slate-800 font-bold text-sm tracking-tight uppercase">
              Database Aset{" "}
              <span className="text-emerald-600">Kota Bengkulu</span>
            </h1>
          </div>

          {/* Basemap Switcher */}
          <div className="bg-white/80 backdrop-blur-md border border-white/40 p-1 rounded-2xl shadow-xl flex gap-1">
            {Object.keys(baseMaps).map((key) => (
              <button
                key={key}
                onClick={() => setMapType(key)}
                className={`px-4 py-1.5 rounded-xl text-[11px] font-bold uppercase transition-all ${
                  mapType === key
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-200"
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
        className={`absolute top-0 left-0 w-[360px] h-full bg-white/90 backdrop-blur-xl shadow-[25px_0_50px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 ease-in-out z-[6000] border-r border-white/40 flex flex-col ${
          catalogOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="pt-24 px-6 pb-6 flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter">
              LIBRARY
            </h2>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">
              Daftar Layer Aset
            </p>
          </div>
          <button
            onClick={() => setCatalogOpen(false)}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 space-y-4 custom-scrollbar">
          {Object.entries(groupedLayers).map(([category, subcats, name]) => (
            <div
              key={category}
              className="bg-white/50 border border-slate-100 rounded-3xl overflow-hidden shadow-sm"
            >
              <button
                onClick={() => toggleCategory(category)}
                className="w-full text-left flex justify-between items-center px-5 py-4 font-bold text-slate-800 hover:bg-emerald-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-sm tracking-tight">{category}</span>
                </div>
                <span className="text-slate-400">
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
                          className="w-full flex justify-between items-center px-3 py-2 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]"
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
                                      ? "bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-100"
                                      : "bg-white border-slate-100 hover:border-emerald-300 text-slate-700 hover:shadow-md"
                                  }`}
                                >
                                  <span className="text-xs font-bold leading-tight">
                                    {layer.name}
                                  </span>
                                  {active && (
                                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-lg">
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

        <div className="p-6">
          <button
            onClick={clearLayers}
            className="w-full bg-slate-900 hover:bg-red-600 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95"
          >
            Reset Semua Layer
          </button>
        </div>
      </div>

      {/* DETAIL SIDEBAR (RIGHT) */}
      {selectedPoint && (
        <div className="fixed inset-0 z-[9500] flex justify-end">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedPoint(null)}
          />

          <div className="relative w-full max-w-[420px] h-full bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.2)] flex flex-col animate-slideInRight">
            {/* Detail Image Header */}
            <div className="relative h-64 bg-slate-200">
              {selectedPoint.attachments?.length > 0 ? (
                <img
                  src={
                    environment.IMAGE_URL +
                    selectedPoint.attachments[slideIndex].file_url
                  }
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                  <span className="text-4xl">📷</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <button
                onClick={() => setSelectedPoint(null)}
                className="absolute top-6 right-6 w-10 h-10 bg-white/20 backdrop-blur-md hover:bg-white/40 text-white rounded-full flex items-center justify-center transition-all"
              >
                ✕
              </button>
              <div className="absolute bottom-6 left-8 right-8 text-white">
                <h2 className="text-2xl font-black leading-tight tracking-tight uppercase truncate">
                  {selectedPoint.title}
                </h2>
                <p className="text-xs font-medium text-white/80 uppercase tracking-widest">
                  Aset Informasi
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              {/* Detail Grid */}
              <section>
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                  Informasi Atribut
                </h3>
                <div className="space-y-1">
                  {selectedPoint.meta.map((item) => (
                    <div
                      key={item.key}
                      className="flex justify-between py-3 border-b border-slate-50 group hover:bg-slate-50 transition-colors px-2 rounded-lg"
                    >
                      <span className="text-sm font-medium text-slate-500">
                        {item.label}
                      </span>
                      <span className="text-sm font-black text-slate-800">
                        {String(item.value || "-")}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Location Badge */}
              <section className="bg-slate-950 rounded-3xl p-6 text-white shadow-2xl">
                <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-3">
                  Koordinat Lokasi
                </h3>
                <div className="grid grid-cols-2 gap-4 font-mono text-sm uppercase">
                  <div>
                    <p className="text-white/40 text-[9px] mb-1">Latitude</p>
                    <p className="font-bold">
                      {selectedPoint.coords.lat.toFixed(6)}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/40 text-[9px] mb-1">Longitude</p>
                    <p className="font-bold">
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
          className="bg-white hover:bg-slate-50 text-slate-800 px-5 py-3 rounded-2xl shadow-xl font-bold text-xs uppercase tracking-widest transition-all border border-slate-100 active:scale-95 flex items-center gap-2"
        >
          <span>←</span> Kembali
        </button>
      </div>

      <div className="absolute bottom-6 right-6 z-[5000] bg-white/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/50 shadow-lg hidden sm:block">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
          {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
        </p>
      </div>
    </div>
  );
};

export default MapPage;
