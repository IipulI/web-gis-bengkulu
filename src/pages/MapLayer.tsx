/* eslint-disable @typescript-eslint/no-explicit-any */
// MapLayer.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Map as MapIcon,
  Plus,
  Eye,
  EyeOff,
  Pencil,
  ExternalLink,
  Trash2,
  X,
  Check,
  Search,
  Info,
  RefreshCw,
  Hamburger,
  XCircle,
  Upload,
  Link,
  UploadCloud,
  Download,
  Edit3,
  ArrowRight,
  CheckCircle2,
  Layers,
  ArrowLeft,
  Filter,
} from "lucide-react";

import DashboardLayout from "../layouts/DashboardLayout";
import GeoMap from "../components/GeoMap";
import { layerService } from "../services/layerService";
import { toast } from "sonner";
import z from "zod";
import { categoryService } from "../services/categoryService";

const getExportFilename = (layerName, format) => {
  const safeName = layerName?.replace(/\s+/g, "_").toLowerCase() || "layer";
  switch (format) {
    case "shp":
      return `${safeName}.zip`;
    case "geojson":
      return `${safeName}.geojson`;
    case "kml":
      return `${safeName}.kml`;
    default:
      return `${safeName}`;
  }
};

interface Layer {
  id: string;
  name: string;
  description?: string;
  geometryType: "POINT" | "LINE" | "POLYGON";
  color?: string;
  iconUrl?: string;
}

interface GeoCacheEntry {
  id: string;
  color?: string;
  name: string;
  data: any;
}

interface UpdateLayerPayload {
  id: string;
  data: any;
}

// ======================
// KOMPONEN
// ======================

const MapLayer: React.FC = () => {
  const navigate = useNavigate();
  const [isUpdateImportOpen, setIsUpdateImportOpen] = useState(false);
  const [updateLayerId, setUpdateLayerId] = useState<string | null>(null);

  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({});
  const [editLayerId, setEditLayerId] = useState<string | null>(null);

  const [geoCache, setGeoCache] = useState<Record<string, GeoCacheEntry>>({});
  const [activeLayerData, setActiveLayerData] = useState<GeoCacheEntry[]>([]);
  const [queryFilter, setQueryFilter] = useState<string>("");

  const [showSidebar, setShowSidebar] = useState<boolean>(true);

  const isEditMode = Boolean(editLayerId);

  // ===========================
  // GET ALL LAYERS
  // ===========================
  const {
    data: layerList = [],
    isLoading,
    refetch: refetchLayer,
  } = useQuery<Layer[]>({
    queryKey: ["layers"],
    queryFn: () => layerService.getAll(),
  });

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryService.getCategory,
  });

  console.log("Ini Kategori", categories);

  // ===========================
  // FORM
  // ===========================

  const importSchema = z.object({
    color: z.string(),
    fileSHP: z.any(),
    category: z.string(),
  });

  const editSchema = z.object({
    name: z.string().min(1, "Nama wajib diisi"),
  });

  const form = useForm<any>({
    resolver: zodResolver(isEditMode ? editSchema : importSchema),
  });

  // ===========================
  // TOGGLE LAYER
  // ===========================
  const toggleLayer = async (layer: Layer) => {
    const isActive = activeLayers[layer.id];

    if (isActive) {
      setActiveLayers((prev) => ({ ...prev, [layer.id]: false }));
      setActiveLayerData((prev) => prev.filter((l) => l.id !== layer.id));
      return;
    }

    let geo = geoCache[layer.id];

    if (!geo) {
      const res = await layerService.getSpecificLayer(layer.id);
      geo = {
        id: layer.id,
        color: layer.color,
        name: layer.name,
        data: res.data || res,
      };
      setGeoCache((prev) => ({ ...prev, [layer.id]: geo }));
    }

    setActiveLayers((prev) => ({ ...prev, [layer.id]: true }));
    setActiveLayerData((prev) => [...prev, geo!]);
  };

  // ===========================
  // MUTATIONS
  // ===========================
  const createLayerMutation = useMutation({
    mutationFn: (data: any) => layerService.createLayer(data),
    onSuccess: () => {
      setIsOpenModal(false);
      form.reset();
      refetchLayer();
    },
  });

  const updateLayerMutation = useMutation({
    mutationFn: (payload: UpdateLayerPayload) =>
      layerService.updateLayer(payload.id, payload.data),
    onSuccess: () => {
      setIsOpenModal(false);
      setEditLayerId(null);
      toast.success("Berhasil Mengedit Layer");
      refetchLayer();
    },
  });

  const deleteLayerMutation = useMutation({
    mutationFn: (id: string) => layerService.deleteLayer(id),
    onSuccess: () => {
      toast.success("Berhasil Menghapus Layer");
      refetchLayer();
    },
  });

  // ===========================
  // EDIT HANDLER
  // ===========================
  const handleEdit = (layer: Layer) => {
    setEditLayerId(layer.id);
    form.reset({
      name: layer.name,
      color: layer.color ?? "#16a34a",
    });
    setIsOpenModal(true);
    console.log("layer", layer);
  };

  const updateLayerImportMutation = useMutation({
    mutationFn: ({ layerId, data }: { layerId: string; data: FormData }) =>
      layerService.updateExistingLayerImport(layerId, data),
    onSuccess: () => {
      toast.success("Layer berhasil diperbarui");
      setIsUpdateImportOpen(false);
      setUpdateLayerId(null);
      refetchLayer();
    },
    onError: () => {
      toast.error("Gagal memperbarui layer");
    },
  });

  const handleExportLayer = async (id: string, name: string, format: string) => {
    try {
      const res = await layerService.exportData(id, format);
      const fileBlob = res instanceof Blob ? res : new Blob([res]);

      const url = window.URL.createObjectURL(fileBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = getExportFilename(name, format);

      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Gagal mengekspor file.");
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("Yakin ingin menghapus layer ini?")) return;
    deleteLayerMutation.mutate(id);
  };

  // ===========================
  // SUBMIT
  // ===========================
  const onSubmit = (values: any) => {
    if (editLayerId) {
      updateLayerMutation.mutate({
        id: editLayerId,
        data: {
          name: values.name,
        },
      });
    } else {
      const formData = new FormData();

      formData.append("color", values.color);
      formData.append("category", values.category);
      formData.append("file", values.fileSHP); // ⬅️ PENTING
      formData.append(
        "metadata",
        JSON.stringify({
          crs: {
            type: "name",
            properties: {
              name: "urn:ogc:def:crs,crs:EPSG::4326,crs:EPSG::3855",
            },
          },
          z_coordinate_resolution: 0.0001,
          xy_coordinate_resolution: 0.0000000000025,
        }),
      );

      createLayerMutation.mutate(formData);
    }
  };

  // ===========================
  // FILTER
  // ===========================
  const filteredList = useMemo(() => {
    const q = queryFilter.trim().toLowerCase();
    if (!q) return layerList;
    return layerList.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        (l.description ?? "").toLowerCase().includes(q),
    );
  }, [layerList, queryFilter]);

  const toggleSidebar = () => {
    setShowSidebar((prev) => !prev);
  };

  const LayerManager = () => {
    return (
      <aside className="col-span-12 lg:col-span-3 h-[calc(100vh-2rem)] sticky top-4">
        <div className="flex flex-col h-full bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-[24px] shadow-2xl shadow-slate-200/50 overflow-hidden">
          {/* --- HEADER SECTION --- */}
          <div className="flex-none p-5 border-b border-slate-100 bg-white/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 leading-tight">
                    Layer Manager
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {layerList.length} Dataset Tersedia
                  </p>
                </div>
              </div>
              {/* Tombol Close/Back jika di Mobile */}
              <button
                onClick={() => navigate("/dashboard")}
                className="lg:hidden p-2 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Cari layer..."
                value={queryFilter}
                onChange={(e) => setQueryFilter(e.target.value)}
                className="block w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 rounded-xl text-sm transition-all outline-none placeholder:text-slate-400 font-medium"
              />
              {queryFilter && (
                <button
                  onClick={() => setQueryFilter("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* --- SCROLLABLE LIST SECTION --- */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 custom-scrollbar">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2" />
                <span className="text-xs font-medium">Memuat data...</span>
              </div>
            ) : filteredList.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                  <Filter className="w-6 h-6" />
                </div>
                <p className="text-sm text-slate-500 font-medium">
                  Tidak ada layer ditemukan.
                </p>
              </div>
            ) : (
              filteredList.map((layer) => {
                const isActive = activeLayers[layer.id];

                return (
                  <div
                    key={layer.id}
                    className={`group relative flex flex-col p-3 rounded-2xl transition-all duration-200 border ${
                      isActive
                        ? "bg-indigo-50/40 border-indigo-100 shadow-sm"
                        : "bg-white border-transparent hover:border-slate-200 hover:shadow-sm hover:bg-slate-50/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Visual Toggle Switch */}
                      <button
                        onClick={() => toggleLayer(layer)}
                        className={`relative flex-none w-10 h-6 rounded-full transition-colors duration-300 ${
                          isActive
                            ? "bg-indigo-500"
                            : "bg-slate-200 hover:bg-slate-300"
                        }`}
                      >
                        <span
                          className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-sm transition-transform duration-300 ${
                            isActive ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>

                      {/* Layer Info */}
                      <div className="flex-1 min-w-0 cursor-default">
                        <h4
                          className={`text-sm font-bold truncate ${isActive ? "text-indigo-900" : "text-slate-700"}`}
                        >
                          {layer.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor: layer.color || "#cbd5e1",
                            }}
                          />
                          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide truncate">
                            {layer.geometryType || "SHP"}
                          </p>
                        </div>
                      </div>

                      {/* Quick Detail Action */}
                      <button
                        onClick={() =>
                          navigate(`/dashboard/layer/${layer.id}/detail`, {
                            state: layer.name,
                          })
                        }
                        className="p-2 rounded-lg text-slate-300 hover:text-indigo-600 hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                        title="Lihat Detail"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Expanded Actions (Only visible on hover or active) */}
                    <div
                      className={`mt-3 pt-2 border-t border-slate-100/50 flex items-center justify-end gap-1 ${isActive ? "flex" : "hidden group-hover:flex"}`}
                    >
                      <span className="text-[10px] text-slate-400 mr-auto font-mono opacity-60">
                        ID: {layer.id.substring(0, 6)}...
                      </span>

                      <ActionBtn
                        icon={<Edit3 className="w-3.5 h-3.5" />}
                        onClick={() => handleEdit(layer)}
                        label="Edit Metadata"
                      />
                      <ActionBtn
                          icon={<Download className="w-3.5 h-3.5"/>}
                          onClick={() => handleExportLayer(layer.id, layer.name, 'shp')}
                          label="Download SHP"
                      />
                      <ActionBtn
                        icon={<UploadCloud className="w-3.5 h-3.5" />}
                        onClick={() => {
                          setUpdateLayerId(layer.id);
                          setIsUpdateImportOpen(true);
                        }}
                        label="Update File"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* --- FOOTER ACTION --- */}
          <div className="flex-none p-4 bg-white border-t border-slate-100">
            <button
              onClick={() => {
                const next = {};
                layerList.forEach((l) => (next[l.id] = true));
                // Call parent update function here
              }}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 transition-all active:scale-[0.98]"
            >
              <MapIcon className="w-4 h-4" />
              <span>Tampilkan Semua</span>
            </button>

            <div className="mt-3 flex justify-between items-center px-1">
              <button
                onClick={() => refetchLayer()}
                className="text-[11px] font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                Segarkan Data
              </button>
              <span className="text-[10px] text-slate-400">
                Auto-save enabled
              </span>
            </div>
          </div>
        </div>
      </aside>
    );
  };

  const ActionBtn = ({ icon, onClick, label }) => (
    <button
      onClick={onClick}
      className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
      title={label}
    >
      {icon}
    </button>
  );

  const handleUpdateImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateLayerId) return;

    const target = e.target as any;
    const file = target.fileUpdate.files[0];

    if (!file) {
      toast.error("Silakan pilih file SHP terlebih dahulu");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    // Memanggil mutasi yang sudah Anda buat
    updateLayerImportMutation.mutate({
      layerId: updateLayerId,
      data: formData,
    });
  };
  return (
    <DashboardLayout sidebarHidden={true}>
      <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
        <div className="max-w-[1600px] mx-auto grid grid-cols-12 gap-8">
          {/* LEFT SIDEBAR: LAYER MANAGER */}
          <aside className="col-span-12 lg:col-span-3">
            <div className="sticky top-8">
              <LayerManager />
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main className="col-span-12 lg:col-span-9 flex flex-col gap-8">
            {/* HEADER SECTION */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
              <div className="flex items-center gap-5">
                {/* TOMBOL KEMBALI */}
                <button
                  onClick={() => navigate("/dashboard")}
                  className="group flex items-center justify-center h-12 w-12 bg-slate-50 hover:bg-amber-500 rounded-xl border border-slate-200 hover:border-amber-600 transition-all duration-300 shadow-sm hover:shadow-amber-200 active:scale-90"
                  title="Kembali ke Dashboard"
                >
                  <ArrowLeft className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
                </button>

                <div className="flex items-center gap-5">
                  <div className="h-12 w-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 shadow-inner">
                    <MapIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                      Peta Pratinjau
                    </h1>
                    <p className="text-sm text-slate-500 font-medium mt-0.5">
                      Monitoring dan manajemen dataset spasial realtime.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/map")}
                  className="group flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 active:scale-95 text-slate-700"
                >
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-amber-600" />
                  Buka Peta Penuh
                </button>

                <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5 hidden md:flex items-center shadow-sm">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse mr-3" />
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    Aktif:
                  </span>
                  <span className="ml-2 text-sm text-emerald-700 font-bold">
                    {
                      Object.keys(activeLayers).filter((k) => activeLayers[k])
                        .length
                    }{" "}
                    Layer
                  </span>
                </div>
              </div>
            </header>

            {/* MAP SECTION */}
            <section className="group relative bg-white border border-slate-200 rounded-[2rem] shadow-xl shadow-slate-200/50 p-3 transition-all hover:shadow-2xl hover:shadow-slate-300/40">
              <div className="w-full h-[600px] rounded-[1.5rem] overflow-hidden border border-slate-100">
                <GeoMap
                  center={[-3.83, 102.3]}
                  zoom={11}
                  activeLayerData={activeLayerData}
                />
              </div>
              {/* Subtle Overlay Instruction */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-white/20 text-xs font-medium text-slate-600 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                Gunakan scroll untuk zoom dan drag untuk menggeser peta
              </div>
            </section>

            {/* SUMMARY TABLE SECTION */}
            <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                <div>
                  <h3 className="font-bold text-slate-800">Ringkasan Layer</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Menampilkan 8 dataset terbaru yang diunggah
                  </p>
                </div>
                <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-widest">
                  Lihat Semua
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[11px] text-slate-400 uppercase tracking-[0.1em] bg-slate-50/50">
                      <th className="px-6 py-4 text-left font-bold">
                        Nama Dataset
                      </th>
                      <th className="px-6 py-4 text-left font-bold">
                        Tipe Geometri
                      </th>
                      <th className="px-6 py-4 text-left font-bold">Status</th>
                      <th className="px-6 py-4 text-right font-bold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(layerList || []).slice(0, 8).map((l: Layer) => (
                      <tr
                        key={l.id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">
                            {l.name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase tracking-tighter">
                            ID: {l.id.substring(0, 8)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium border border-slate-200">
                            {l.geometryType}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Aktif
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button className="p-2 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 text-slate-400 hover:text-red-600 transition-all shadow-sm">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </main>

          {/* MODAL EDIT & IMPORT DATA */}
          {isOpenModal && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300"
                onClick={() => {
                  setIsOpenModal(false);
                  setEditLayerId(null);
                  form.reset();
                }}
              />

              {/* Modal Content */}
              <div className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden transform animate-in zoom-in-95 duration-300">
                <div className="p-8">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex gap-4 items-center">
                      <div
                        className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-inner ${isEditMode ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600"}`}
                      >
                        {isEditMode ? (
                          <Pencil className="w-6 h-6" />
                        ) : (
                          <UploadCloud className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                          {isEditMode
                            ? "Edit Detail Layer"
                            : "Impor Dataset Baru"}
                        </h3>
                        <p className="text-slate-500 text-sm font-medium">
                          {isEditMode
                            ? "Perbarui informasi nama dan identitas layer."
                            : "Tambahkan file SHP baru ke dalam sistem."}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setIsOpenModal(false);
                        setEditLayerId(null);
                      }}
                      className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  {/* FORM START */}
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    {/* Field: NAMA (Muncul di Edit & Import) */}
                    <div className="space-y-2">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.15em] ml-1">
                        Nama Layer
                      </label>
                      <input
                        {...form.register("name")}
                        placeholder="Contoh: Batas Wilayah Desa..."
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium"
                      />
                      {form.formState.errors.name && (
                        <p className="text-red-500 text-xs font-bold ml-1">
                          {form.formState.errors.name.message as string}
                        </p>
                      )}
                    </div>

                    {/* Field khusus IMPORT (Tidak muncul saat Edit) */}
                    {!isEditMode && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.15em] ml-1">
                              Kategori
                            </label>
                            <select
                              {...form.register("category")}
                              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium appearance-none"
                            >
                              <option value="">Pilih Kategori</option>
                              {categories?.map((cat: any) => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.15em] ml-1">
                              Warna Layer
                            </label>
                            <div className="flex gap-2 p-2 bg-slate-50 border border-slate-100 rounded-2xl">
                              <input
                                type="color"
                                {...form.register("color")}
                                className="h-10 w-full rounded-xl cursor-pointer bg-transparent border-none"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.15em] ml-1">
                            File SHP (Zip)
                          </label>
                          <input
                            type="file"
                            onChange={(e) =>
                              form.setValue("fileSHP", e.target.files?.[0])
                            }
                            accept=".zip"
                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-6 file:rounded-2xl file:border-0 file:text-sm file:font-black file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 border border-slate-100 rounded-2xl p-2"
                          />
                        </div>
                      </>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setIsOpenModal(false);
                          setEditLayerId(null);
                        }}
                        className="flex-1 px-6 py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm transition-all"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={
                          createLayerMutation.isPending ||
                          updateLayerMutation.isPending
                        }
                        className={`flex-[2] px-6 py-4 text-white rounded-2xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50
                ${isEditMode ? "bg-emerald-600 shadow-emerald-200 hover:bg-emerald-700" : "bg-indigo-600 shadow-indigo-200 hover:bg-indigo-700"}`}
                      >
                        {createLayerMutation.isPending ||
                        updateLayerMutation.isPending ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        {isEditMode ? "Simpan Perubahan" : "Mulai Import"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
          {/* MODAL UPDATE IMPORT (KHUSUS RE-UPLOAD FILE SHP) */}
          {isUpdateImportOpen && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
              {/* Backdrop dengan Blur */}
              <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={() => {
                  setIsUpdateImportOpen(false);
                  setUpdateLayerId(null);
                }}
              />

              {/* Modal Container */}
              <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden transform animate-in zoom-in-95 duration-300">
                <div className="p-8">
                  {/* Header Modal */}
                  <div className="flex justify-between items-center mb-6">
                    <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <button
                      onClick={() => setIsUpdateImportOpen(false)}
                      className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                      Perbarui File Geospasial
                    </h3>
                    <p className="text-slate-500 text-sm mt-1 font-medium">
                      Unggah file SHP baru untuk mengganti data pada layer ini.
                    </p>
                  </div>

                  {/* Form Body */}
                  <form
                    onSubmit={handleUpdateImportSubmit}
                    className="space-y-6"
                  >
                    <div className="relative group">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
                        Pilih File SHP (Zip)
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          name="fileUpdate"
                          accept=".zip,.shp"
                          className="block w-full text-sm text-slate-500
                  file:mr-4 file:py-3 file:px-6
                  file:rounded-2xl file:border-0
                  file:text-sm file:font-black
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  border border-slate-100 rounded-2xl p-2
                  transition-all group-hover:border-blue-200 cursor-pointer"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2 ml-1 italic">
                        *Pastikan file berisi komponen .shp, .shx, dan .dbf
                        dalam satu zip.
                      </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setIsUpdateImportOpen(false)}
                        className="flex-1 px-6 py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm transition-all"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={updateLayerImportMutation.isPending}
                        className="flex-[2] px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {updateLayerImportMutation.isPending ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        {updateLayerImportMutation.isPending
                          ? "Mengunggah..."
                          : "Simpan Perubahan"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MapLayer;
