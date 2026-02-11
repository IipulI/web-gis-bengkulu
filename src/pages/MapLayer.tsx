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
} from "lucide-react";

import DashboardLayout from "../layouts/DashboardLayout";
import GeoMap from "../components/GeoMap";
import { layerService } from "../services/layerService";
import { toast } from "sonner";
import z from "zod";
import { categoryService } from "../services/categoryService";

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
      <>
        <aside
          className="
  col-span-3
  bg-white/90
  border border-gray-200
  backdrop-blur-sm
  rounded-2xl
  shadow-md
  p-5
  flex flex-col
  h-[calc(100vh-2rem)]
"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Layer Manager
              </h2>
              <p className="text-xs text-gray-500">
                Kelola layer peta secara terpusat
              </p>
            </div>
            {/* <button
              onClick={() => {
                setEditLayerId(null);
                form.reset();
                setIsOpenModal(true);
              }}
              className="inline-flex items-center gap-2 bg-green-600 text-white px-3 py-1 rounded-md shadow-sm hover:bg-green-700"
            >
              <Upload className="w-4 h-4" />
            </button> */}
            <button
              onClick={() => {
                navigate("/dashboard");
              }}
              className="inline-flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-md shadow-sm hover:bg-green-700"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>

          {/* Search */}
          <div className="mb-4">
            <div className="flex items-center bg-gray-50/70 border border-gray-200 rounded-xl px-3 py-2 shadow-sm hover:shadow transition-all">
              <Search className="w-4 h-4 text-gray-400 mr-2" />
              <input
                placeholder="Cari layer, deskripsi..."
                value={queryFilter}
                onChange={(e) => setQueryFilter(e.target.value)}
                className="outline-none w-full text-sm bg-transparent"
              />
              <button
                onClick={() => setQueryFilter("")}
                className="ml-2 text-xs text-gray-500"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Layer List */}
          <div className="flex-1 overflow-auto space-y-3 pr-2">
            {isLoading ? (
              <div className="text-sm text-gray-500">Memuat layer...</div>
            ) : (
              (filteredList || []).map((layer: Layer) => (
                <div
                  key={layer.id}
                  className="flex items-center justify-between gap-4 p-4 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold flex-shrink-0"
                        style={{ background: layer.color || "#16a34a" }}
                      >
                        {layer.name?.slice(0, 2).toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <div className="font-medium text-gray-800 truncate">
                          {layer.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {layer.description || "—"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
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
                          <Eye className="text-gray-700 rounded-lg hover:bg-gray-100 transition-colors" />
                        ) : (
                          <EyeOff className="text-green-600" />
                        )}
                      </button>

                      <button
                        onClick={() => handleEdit(layer)}
                        className="p-2 rounded-md hover:bg-gray-100"
                        title="Edit layer"
                      >
                        <Pencil className="text-green-600" />
                      </button>

                      <button
                        onClick={() =>
                          navigate(`/dashboard/layer/${layer.id}/detail`, {
                            state: layer.name,
                          })
                        }
                        className="p-2 rounded-md hover:bg-gray-100"
                        title="Detail Layer"
                      >
                        <Link className="text-green-600" />
                      </button>
                      <button
                        onClick={() => {
                          setEditLayerId(null);
                          form.reset();
                          setIsOpenModal(true);
                        }}
                        className="inline-flex items-center gap-2 bg-green-600 text-white px-3 py-1 rounded-md shadow-sm hover:bg-green-700"
                      >
                        <Upload className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setUpdateLayerId(layer.id);
                          setIsUpdateImportOpen(true);
                        }}
                        className="p-2 rounded-md hover:bg-gray-100"
                        title="Update Layer via Import"
                      >
                        <UploadCloud className="w-5 h-5 text-blue-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {layerList?.length || 0} layer
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => refetchLayer()}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-md border hover:bg-gray-100 shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="text-xs">Refresh</span>
              </button>

              <button
                onClick={() => {
                  const next: Record<string, boolean> = {};
                  (layerList || []).forEach((l: Layer) => (next[l.id] = true));
                  setActiveLayers(next);

                  (async () => {
                    const results: GeoCacheEntry[] = [];
                    for (const layer of layerList || []) {
                      let geo = geoCache[layer.id];
                      if (!geo) {
                        const res = await layerService.getSpecificLayer(
                          layer.id,
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
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white shadow"
              >
                <MapIcon className="w-4 h-4" />
                <span className="text-xs">Tampilkan Semua</span>
              </button>
            </div>
          </div>
        </aside>
      </>
    );
  };
  return (
    <DashboardLayout sidebarHidden={true}>
      {/* {showSidebar && <Sidebar />} */}
      <div className="h-full p-6 grid grid-cols-12 gap-6">
        <LayerManager />
        {/* MAIN PANEL */}
        <main className="col-span-9 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-semibold text-gray-800 tracking-tight">
                Peta Pratinjau
              </h1>
              <div className="text-sm text-gray-500">
                (Klik Logo Mata untuk tampilkan)
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/map")}
                className="text-sm px-3 py-2 rounded-md border hover:bg-gray-50"
              >
                Buka Halaman Peta
              </button>

              <div className="bg-white border rounded-lg px-3 py-2 shadow-sm hidden md:flex items-center">
                <div className="text-xs text-gray-500">Aktif:</div>
                <div className="ml-2 text-sm text-green-700 font-medium">
                  {
                    Object.keys(activeLayers).filter((k) => activeLayers[k])
                      .length
                  }
                </div>
              </div>
            </div>
          </div>

          {/* MAP */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-4 flex-1 min-h-[560px]">
            <div className="w-full h-full rounded-xl overflow-hidden border">
              <GeoMap
                center={[-3.83, 102.3]}
                zoom={11}
                activeLayerData={activeLayerData}
              />
            </div>
          </div>

          {/* SUMMARY TABLE */}
          <div className="bg-white border rounded-2xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">
                Ringkasan Layer & Statistik
              </h3>
              <div className="text-xs text-gray-400">Terakhir diperbarui</div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-gray-600 uppercase bg-gray-50/80 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left">Nama Dataset</th>
                    <th className="px-4 py-3 text-left">Tipe</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Tanggal</th>
                    {/* <th className="px-4 py-3 text-right">Aksi</th> */}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {(layerList || []).slice(0, 8).map((l: Layer) => (
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
                        <div className="inline-flex items-center gap-2">
                          {/* <button
                            onClick={() => handleEdit(l)}
                            className="text-sm text-green-600 hover:underline"
                          >
                            Edit
                          </button> */}
                          {/* <button
                            onClick={() => handleDelete(l.id)}
                            className="text-sm text-red-600 hover:underline"
                          >
                            Hapus
                          </button> */}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {/* MODAL */}
        {isOpenModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => {
                setIsOpenModal(false);
                setEditLayerId(null);
                form.reset();
              }}
            />

            <div className="relative w-full max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
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

                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="p-6 space-y-4"
                >
                  {/* ===== MODE EDIT ===== */}
                  {isEditMode && (
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Nama Layer
                      </label>
                      <input
                        type="text"
                        {...form.register("name")}
                        className="w-full rounded-md border px-3 py-2"
                        placeholder="Nama layer"
                      />
                    </div>
                  )}

                  {/* ===== MODE IMPORT ===== */}
                  {!isEditMode && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          Warna Layer
                        </label>
                        <input
                          type="color"
                          {...form.register("color")}
                          className="w-16 h-10 rounded-md border"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          Kategori Layer
                        </label>
                        <select
                          {...form.register("category")}
                          className="w-full py-2 px-1 rounded-md border"
                        >
                          {categories?.map((category, key) => (
                            <>
                              <option value={category.value}>
                                {category.name}
                              </option>
                            </>
                          ))}
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm text-gray-600 mb-1">
                          File SHP
                        </label>
                        <input
                          type="file"
                          onChange={(e) => {
                            form.setValue("fileSHP", e.target.files?.[0]);
                            console.log(e.target.files?.[0]);
                          }}
                          className="w-full p-3 border rounded-lg"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Upload file .shp (beserta .shx, .dbf jika diperlukan)
                        </p>
                      </div>
                    </div>
                  )}

                  {/* ===== ACTION BUTTON ===== */}
                  <div className="flex justify-end gap-3 pt-4">
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
                      className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white"
                    >
                      {isEditMode ? "Simpan Perubahan" : "Import Layer"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      {isUpdateImportOpen && updateLayerId && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => {
              setIsUpdateImportOpen(false);
              setUpdateLayerId(null);
            }}
          />

          <div className="relative w-full max-w-lg mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl border overflow-hidden">
              {/* HEADER */}
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-md text-blue-600">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">
                      Update Layer (Import)
                    </h4>
                    <p className="text-xs text-gray-500">
                      Upload ulang file SHP untuk memperbarui data layer
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsUpdateImportOpen(false);
                    setUpdateLayerId(null);
                  }}
                  className="p-2 rounded-md hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* BODY */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();

                  const fileInput = e.currentTarget.elements.namedItem(
                    "file",
                  ) as HTMLInputElement;

                  if (!fileInput?.files?.[0]) {
                    toast.error("File SHP wajib diisi");
                    return;
                  }

                  const formData = new FormData();
                  formData.append("file", fileInput.files[0]);

                  formData.append(
                    "metadata",
                    JSON.stringify({
                      crs: {
                        type: "name",
                        properties: {
                          name: "urn:ogc:def:crs,crs:EPSG::4326,crs:EPSG::3855",
                        },
                      },
                    }),
                  );

                  updateLayerImportMutation.mutate({
                    layerId: updateLayerId,
                    data: formData,
                  });
                }}
                className="p-6 space-y-4"
              >
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    File SHP Baru
                  </label>
                  <input
                    name="file"
                    type="file"
                    className="w-full p-3 border rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload file .shp untuk menggantikan data lama
                  </p>
                </div>

                {/* ACTION */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsUpdateImportOpen(false);
                      setUpdateLayerId(null);
                    }}
                    className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                  >Updating</button>
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
