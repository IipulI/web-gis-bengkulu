/* eslint-disable @typescript-eslint/no-explicit-any */
// MapLayer.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Layers,
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
} from "lucide-react";

import DashboardLayout from "../layouts/DashboardLayout";
import GeoMap from "../components/GeoMap";
import { layerService } from "../services/layerService";
import { LayerSchema } from "../schemas/LayerSchema";
import { toast } from "sonner";

/**
 * MapLayer (REDESIGN)
 * - Tampilan modern / elegan
 * - Mobile friendly
 * - Warna primer: green-600
 * - Logic unchanged; hanya layout + style diperbarui
 */
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

  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({});
  const [editLayerId, setEditLayerId] = useState<string | null>(null);

  const [geoCache, setGeoCache] = useState<Record<string, GeoCacheEntry>>({});
  const [activeLayerData, setActiveLayerData] = useState<GeoCacheEntry[]>([]);
  const [queryFilter, setQueryFilter] = useState<string>("");

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

  // ===========================
  // FORM
  // ===========================
  const form = useForm<any>({
    resolver: zodResolver(LayerSchema),
    defaultValues: {
      name: "",
      description: "",
      geometryType: "POLYGON",
      color: "#16a34a",
      iconUrl: "",
    },
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
      description: layer.description,
      geometryType: layer.geometryType,
      color: layer.color ?? "#16a34a",
      iconUrl: layer.iconUrl ?? "",
    });
    setIsOpenModal(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Yakin ingin menghapus layer ini?")) return;
    deleteLayerMutation.mutate(id);
  };

  // ===========================
  // SUBMIT
  // ===========================
  const onSubmit = (values: any) => {
    const payload = {
      ...values,
      metadata: {
        crs: {
          type: "name",
          properties: {
            name: "urn:ogc:def:crs,crs:EPSG::4326,crs:EPSG::3855",
          },
        },
        z_coordinate_resolution: 0.0001,
        xy_coordinate_resolution: 0.0000000000025,
      },
    };

    if (editLayerId)
      updateLayerMutation.mutate({ id: editLayerId, data: payload });
    else createLayerMutation.mutate(payload);
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
        (l.description ?? "").toLowerCase().includes(q)
    );
  }, [layerList, queryFilter]);

  // =======================================================
  // UI
  // =======================================================
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-50 text-green-600">
                <Layers className="w-6 h-6" />
              </div>
              Manajemen Layer
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Kelola layer peta, pratinjau dan metadata secara terpusat.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="hidden md:flex items-center bg-white border rounded-lg px-3 py-2 shadow-sm">
              <Search className="w-4 h-4 text-gray-400 mr-2" />
              <input
                placeholder="Cari layer, deskripsi..."
                value={queryFilter}
                onChange={(e) => setQueryFilter(e.target.value)}
                className="outline-none w-72 text-sm"
              />
            </div>

            <button
              onClick={() => {
                setEditLayerId(null);
                form.reset();
                setIsOpenModal(true);
              }}
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md transform hover:scale-[1.02] transition"
            >
              <Plus className="w-4 h-4" />
              Layer Baru
            </button>
          </div>
        </div>

        {/* MAIN LAYOUT: left map, right list (responsive) */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          {/* LEFT: MAP PREVIEW (2/3) */}
          <div className="lg:col-span-2 bg-white border rounded-2xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg text-green-600">
                  <MapIcon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-gray-800">Peta Pratinjau</h3>
                <span className="text-xs text-gray-400">
                  (Klik eye untuk tampilkan)
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    // show all active layers toggled on
                    const next = {};
                    (layerList || []).forEach((l) => (next[l.id] = true));
                    setActiveLayers(next);

                    // fetch all into activeLayerData (use cache)
                    (async () => {
                      const results = [];
                      for (const layer of layerList || []) {
                        let geo = geoCache[layer.id];
                        if (!geo) {
                          const res = await layerService.getSpecificLayer(
                            layer.id
                          );
                          geo = {
                            id: layer.id,
                            color: layer.color,
                            name: layer.name,
                            data: res.data || res,
                          };
                          setGeoCache((p) => ({ ...p, [layer.id]: geo }));
                        }
                        results.push(geo);
                      }
                      setActiveLayerData(results);
                    })();
                  }}
                  title="Tampilkan semua layer"
                  className="text-sm px-3 py-1 rounded-md border hover:bg-gray-50"
                >
                  Tampilkan Semua
                </button>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden border">
              <div className="w-full h-[420px]">
                <GeoMap
                  center={[-3.83, 102.3]}
                  zoom={11}
                  activeLayerData={activeLayerData}
                />
              </div>
            </div>
          </div>

          {/* RIGHT: Layer List */}
          <div className="bg-white border rounded-2xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Daftar Layer</h3>
              <span className="text-xs text-gray-400">
                {layerList?.length || 0} items
              </span>
            </div>

            <div className="space-y-3 max-h-[420px] overflow-auto pr-2">
              {isLoading ? (
                <div className="text-sm text-gray-500">Memuat layer...</div>
              ) : (
                (filteredList || []).map((layer) => (
                  <div
                    key={layer.id}
                    className="flex items-center justify-between gap-4 p-3 rounded-lg hover:shadow-sm transition border"
                  >
                    {/* LEFT SIDE */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* ICON */}
                      <div
                        className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-white font-semibold"
                        style={{ background: layer.color || "#16a34a" }}
                      >
                        {layer.name?.slice(0, 2).toUpperCase()}
                      </div>

                      {/* TEXT */}
                      <div className="min-w-0 max-w-[200px] md:max-w-[260px]">
                        <div className="font-medium text-gray-800 truncate">
                          {layer.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {layer.description || "—"}
                        </div>
                      </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => toggleLayer(layer)}
                        className="p-2 rounded-md hover:bg-gray-100"
                        title={
                          activeLayers[layer.id]
                            ? "Sembunyikan layer"
                            : "Tampilkan layer"
                        }
                      >
                        {activeLayers[layer.id] ? (
                          <EyeOff className="text-gray-700" />
                        ) : (
                          <Eye className="text-green-600" />
                        )}
                      </button>

                      <button
                        onClick={() => handleEdit(layer)}
                        className="p-2 rounded-md hover:bg-gray-100"
                        title="Edit layer"
                      >
                        <Pencil className="text-green-600" />
                      </button>

                      {/* <button
                        onClick={() => navigate(`/map-layer/${layer.id}`)}
                        className="p-2 rounded-md hover:bg-gray-100"
                        title="Buka halaman layer"
                      >
                        <ExternalLink className="text-green-700" />
                      </button> */}

                      <button
                        onClick={() => handleDelete(layer.id)}
                        className="p-2 rounded-md hover:bg-red-50"
                        title="Hapus layer"
                      >
                        <Trash2 className="text-red-600" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-xs text-gray-500">Pengelolaan layer</div>
              <button
                onClick={() => refetchLayer()}
                className="text-sm px-3 py-1 rounded-md border hover:bg-gray-50"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* LATEST / TABLE (Full width) */}
        <div className="bg-white border rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">
              Ringkasan Layer & Statistik
            </h3>
            <div className="text-xs text-gray-400">Terakhir diperbarui</div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Nama Dataset</th>
                  <th className="px-4 py-3 text-left">Tipe</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Tanggal</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {(layerList || []).slice(0, 6).map((l) => (
                  <tr key={l.id}>
                    <td className="px-4 py-3 font-medium">{l.name}</td>
                    <td className="px-4 py-3">{l.geometryType}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs">
                        <Check className="w-3 h-3" />
                        Active
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">—</td>
                    <td className="px-4 py-3 text-right">
                      {/* <button
                        onClick={() => navigate(`/map-layer/${l.id}`)}
                        className="text-sm text-green-600 hover:underline"
                      >
                        Detail
                      </button> */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ===================== MODAL (Create / Edit) ===================== */}
      {isOpenModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => {
              setIsOpenModal(false);
              setEditLayerId(null);
              form.reset();
            }}
          />

          <div className="relative w-full max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-md text-green-600">
                    <Info className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">
                      {editLayerId ? "Edit Layer" : "Tambah Layer Baru"}
                    </h4>
                    <div className="text-xs text-gray-500">
                      Isi informasi dasar layer dan metadata.
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsOpenModal(false);
                      setEditLayerId(null);
                      form.reset();
                    }}
                    className="p-2 rounded-md hover:bg-gray-100"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="p-6 space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Nama Layer
                    </label>
                    <input
                      {...form.register("name")}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-200"
                      placeholder="Contoh: Batas Desa"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Tipe Geometri
                    </label>
                    <select
                      {...form.register("geometryType")}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-200"
                    >
                      <option value="POINT">POINT</option>
                      <option value="LINE">LINE</option>
                      <option value="POLYGON">POLYGON</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Deskripsi
                  </label>
                  <textarea
                    {...form.register("description")}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-200"
                    rows={3}
                    placeholder="Deskripsi singkat tentang layer"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Warna
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        {...form.register("color")}
                        className="w-14 h-10 rounded-md border"
                        title="Pilih warna"
                      />
                      <div className="text-sm text-gray-500">
                        Warna layer di peta
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-600 mb-1">
                      Icon URL (opsional)
                    </label>
                    <input
                      {...form.register("iconUrl")}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-200"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpenModal(false);
                      setEditLayerId(null);
                      form.reset();
                    }}
                    className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white shadow"
                  >
                    {editLayerId ? "Simpan Perubahan" : "Buat Layer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default MapLayer;
