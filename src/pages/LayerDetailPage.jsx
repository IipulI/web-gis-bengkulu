/* eslint-disable */

import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  FileDown,
  Pencil,
  Plus,
  Search,
  Trash,
  Upload,
  X,
} from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import { layerService } from "../services/layerService";
import { featureService } from "../services/featureService";
import { ImagePlus } from "lucide-react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Polygon,
  useMapEvents,
} from "react-leaflet";
import { attachmentService } from "../services/attachmentService";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Eye } from "lucide-react";
import environment from "../config/environment";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/img/leaflet/marker-icon-2x.png",
  iconUrl: "/img/leaflet/marker-icon.png",
  shadowUrl: "/img/leaflet/marker-shadow.png",
});

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

const LayerDetailPage = () => {
  const { id } = useParams();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewFeatureId, setViewFeatureId] = useState(null);

  const [uploadFeatureId, setUploadFeatureId] = useState(null);

  const [imageFile, setImageFile] = useState(null);

  const [editForm, setEditForm] = useState(null);

  const [page, setPage] = useState(1);
  const size = 10;

  const { data: attachmentData, isLoading: attachmentLoading } = useQuery({
    queryKey: ["attachments", id, viewFeatureId],
    queryFn: attachmentService.getAttachment(id, viewFeatureId),
    enabled: !!viewFeatureId && viewModalOpen,
  });

  const uploadAttachmentMutation = useMutation({
    mutationFn: ({ layerId, featureId, file }) => {
      const formData = new FormData();
      formData.append("file", file);

      return attachmentService.addAttachment(layerId, featureId, formData);
    },

    onSuccess: () => {
      setUploadModalOpen(false);
      setImageFile(null);
      refetch();
    },
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["layer-dashboard", id, page],
    queryFn: () =>
      layerService.getSpecificLayerDashboard(id, {
        page,
        size,
      }),
    enabled: !!id,
  });

  const [search, setSearch] = useState("");
  const [selectedFeatureId, setSelectedFeatureId] = useState();

  const schema = data?.schema;
  const layer = data?.data;
  const features = layer?.spatialItem || [];
  const pagination = layer?.pagination;

  const getValueByPath = (obj, path) => {
    if (!obj || !path) return "";

    return path.split(".").reduce((acc, key) => {
      if (acc && acc[key] !== undefined) {
        return acc[key];
      }
      return "";
    }, obj);
  };

  const setValueByPath = (obj, path, value) => {
    const keys = path.split(".");
    let current = obj;

    keys.forEach((key, index) => {
      if (index === keys.length - 1) {
        current[key] = value;
      } else {
        if (!current[key]) current[key] = {};
        current = current[key];
      }
    });

    return obj;
  };

  //   Tabel Otomatis buat nyesuain field dari key label
  const columns = useMemo(() => {
    if (!schema?.definition) return [];

    return schema.definition.map((field) => ({
      key: field.key,
      label: field.label,
      field: `properties.${field.key}`,
      editable: true,
      type: field.type === "number" ? "number" : "text",

      render: (feature) => feature.properties?.[field.key] ?? "-",
    }));
  }, [schema]);

  const filteredFeatures = useMemo(() => {
    if (!search) return features;

    return features.filter((f) =>
      JSON.stringify(f.properties).toLowerCase().includes(search.toLowerCase()),
    );
  }, [features, search]);

  const selectedFeature = useMemo(
    () => features.find((f) => f.id === selectedFeatureId),
    [features, selectedFeatureId],
  );

  useEffect(() => {
    if (!selectedFeature) return;

    setEditForm(structuredClone(selectedFeature));
  }, [selectedFeature]);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => layerService.updateSpatialItem(id, data),

    onSuccess: () => {
      setEditModalOpen(false);
      refetch();
    },
  });

  const handleExport = async (format) => {
    const res = await layerService.exportData(id, format);

    const blob = new Blob([res.data]);
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = getExportFilename(layer?.name, format);
    a.click();

    window.URL.revokeObjectURL(url);
  };

  console.log(attachmentData);
  console.log(viewFeatureId);

  return (
    <DashboardLayout>
      {/* HEADER SECTION */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Layer:{" "}
            <span className="text-green-600">
              {layer?.name || "Loading..."}
            </span>
          </h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Manajemen fitur dan geometri data spasial.
          </p>
        </div>

        <div className="relative group">
          <button className="inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg hover:shadow-green-200 active:scale-95">
            <FileDown className="w-4 h-4" />
            <span>Export Dataset</span>
          </button>

          {/* Dropdown Export - Smooth Transition */}
          <div className="absolute right-0 mt-3 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto z-50 p-2">
            {[
              { label: "Shapefile (SHP)", format: "shp" },
              { label: "GeoJSON", format: "geojson" },
              { label: "KML / KMZ", format: "kml" },
            ].map((item) => (
              <button
                key={item.format}
                onClick={() => handleExport(item.format)}
                className="w-full px-4 py-2.5 text-sm text-gray-600 hover:bg-green-50 hover:text-green-700 rounded-lg text-left transition-colors flex items-center justify-between group/item"
              >
                {item.label}
                <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                  <ChevronRight className="w-3 h-3" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN CARD LIST */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="font-bold text-gray-800 text-lg">
            Daftar Atribut Data
          </h2>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={`Cari data ${layer?.name || ""}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-full md:w-80 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:bg-white transition-all outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {features.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-gray-400">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <MoreHorizontal className="w-8 h-8 opacity-20" />
              </div>
              <p className="text-sm font-medium">
                Belum ada data yang tersedia
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 font-semibold uppercase tracking-wider text-[11px]">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={`p-4 text-${col.align || "left"} border-b border-gray-100`}
                    >
                      {col.label}
                    </th>
                  ))}
                  <th className="p-4 text-center border-b border-gray-100">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredFeatures.map((f) => (
                  <tr
                    key={f.id}
                    className="hover:bg-green-50/30 transition-colors group"
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`p-4 text-gray-600 text-${col.align || "left"}`}
                      >
                        {col.render ? col.render(f) : "-"}
                      </td>
                    ))}
                    <td className="p-4">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedFeatureId(f.id);
                            setEditModalOpen(true);
                          }}
                          className="p-2 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors"
                          title="Edit Data"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setUploadFeatureId(f.id);
                            setUploadModalOpen(true);
                          }}
                          className="p-2 hover:bg-green-50 text-green-600 rounded-lg transition-colors"
                          title="Tambah Gambar"
                        >
                          <ImagePlus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setViewFeatureId(f.id);
                            setViewModalOpen(true);
                          }}
                          className="p-2 hover:bg-purple-50 text-purple-600 rounded-lg transition-colors"
                          title="Lihat Galeri"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* PAGINATION */}
        {pagination && (
          <div className="p-5 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/30">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Showing{" "}
              <span className="text-gray-900">
                {(pagination.currentPage - 1) * pagination.perPage + 1}
              </span>
              -{" "}
              <span className="text-gray-900">
                {Math.min(
                  pagination.currentPage * pagination.perPage,
                  pagination.totalItems,
                )}
              </span>
              of <span className="text-gray-900">{pagination.totalItems}</span>{" "}
              entries
            </p>

            <div className="flex items-center gap-2">
              <button
                disabled={pagination.currentPage === 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-2 border rounded-xl hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="px-4 py-1.5 bg-white border rounded-xl text-sm font-bold shadow-sm">
                {pagination.currentPage}{" "}
                <span className="text-gray-300 font-normal mx-1">/</span>{" "}
                {pagination.totalPage}
              </div>

              <button
                disabled={pagination.currentPage === pagination.totalPage}
                onClick={() => setPage((p) => p + 1)}
                className="p-2 border rounded-xl hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL EDIT - Modern Style */}
      {editModalOpen && selectedFeature && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-md transition-opacity"
            onClick={() => setEditModalOpen(false)}
          />

          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-800">Edit Atribut</h2>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6"
              onSubmit={(e) => {
                e.preventDefault();
                updateMutation.mutate({
                  id: selectedFeature.id,
                  data: editForm,
                });
              }}
            >
              {columns
                .filter((c) => c.editable)
                .map((col) => (
                  <div key={col.key} className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                      {col.label}
                    </label>
                    <input
                      type={col.type || "text"}
                      value={getValueByPath(editForm, col.field) ?? ""}
                      onChange={(e) => {
                        const updated = structuredClone(editForm);
                        setValueByPath(updated, col.field, e.target.value);
                        setEditForm(updated);
                      }}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all outline-none"
                    />
                  </div>
                ))}

              <div className="col-span-full flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-semibold bg-green-600 text-white rounded-xl shadow-lg shadow-green-200 hover:bg-green-700 active:scale-95 transition-all"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IMAGE GALLERY MODAL - Ultra Modern */}
      {viewModalOpen && viewFeatureId && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6">
          <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-md transition-opacity"
            onClick={() => setViewModalOpen(false)}
          />

          <div className="bg-white w-full max-w-6xl rounded-[2rem] shadow-2xl relative overflow-hidden flex flex-col h-[90vh] md:h-[85vh] animate-in fade-in zoom-in duration-300">
            {/* HEADER - Sticky */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-white z-10">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                  Detail Informasi Fitur
                </h2>
                <p className="text-gray-500 text-sm flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-bold uppercase">
                    ID: {viewFeatureId}
                  </span>
                  • Review data atribut dan aset visual
                </p>
              </div>
              <button
                onClick={() => setViewModalOpen(false)}
                className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-red-50 hover:text-red-500 text-gray-400 rounded-xl transition-all shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* MAIN CONTENT AREA - Scrollable */}
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
              {/* LEFT COLUMN: ATRIBUTE DATA (Scrollable) */}
              <div className="w-full md:w-5/12 border-r border-gray-50 bg-gray-50/30 overflow-y-auto p-8 custom-scrollbar">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                  <h3 className="font-bold text-gray-800 uppercase text-xs tracking-widest">
                    Atribut Data
                  </h3>
                </div>

                <div className="space-y-4">
                  {selectedFeature ? (
                    columns.map((col) => (
                      <div
                        key={col.key}
                        className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 group hover:border-green-200 transition-colors"
                      >
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1 group-hover:text-green-500">
                          {col.label}
                        </label>
                        <div className="text-gray-700 font-medium">
                          {col.render
                            ? col.render(selectedFeature)
                            : getValueByPath(selectedFeature, col.field) || "-"}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="animate-pulse space-y-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="h-20 bg-gray-100 rounded-2xl"
                        ></div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: GALLERY (Scrollable) */}
              <div className="w-full md:w-7/12 overflow-y-auto p-8 bg-white custom-scrollbar">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
                    <h3 className="font-bold text-gray-800 uppercase text-xs tracking-widest">
                      Media & Lampiran
                    </h3>
                  </div>
                  <span className="text-xs font-bold bg-purple-50 text-purple-600 px-3 py-1 rounded-full">
                    {attachmentData?.length || 0} File
                  </span>
                </div>

                {attachmentLoading ? (
                  <div className="h-64 flex flex-col items-center justify-center space-y-4">
                    <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-400 text-sm font-medium">
                      Memuat aset...
                    </p>
                  </div>
                ) : attachmentData?.length === 0 ? (
                  <div className="h-64 border-2 border-dashed border-gray-100 rounded-[2rem] flex flex-col items-center justify-center text-gray-300">
                    <ImagePlus className="w-12 h-12 mb-3 opacity-20" />
                    <p className="text-sm font-medium">
                      Tidak ada lampiran gambar
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {attachmentData?.map((file) => (
                      <div
                        key={file.id}
                        className="group relative aspect-square rounded-[1.5rem] overflow-hidden bg-gray-100 ring-1 ring-black/5 shadow-sm hover:shadow-xl transition-all duration-500"
                      >
                        <img
                          src={`${environment.IMAGE_URL}${file.fileUrl}`}
                          alt="attachment"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-5">
                          <p className="text-white text-[10px] font-medium mb-3 truncate">
                            {file.name || "Attachment File"}
                          </p>
                          <button
                            onClick={() => window.open(file.url, "_blank")}
                            className="w-full py-2.5 bg-white/20 hover:bg-white backdrop-blur-md text-white hover:text-gray-900 rounded-xl font-bold text-xs transition-all"
                          >
                            Buka Gambar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* FOOTER - Optional Action Bar */}
            <div className="px-8 py-4 border-t border-gray-50 bg-gray-50/50 flex justify-end">
              <button
                onClick={() => {
                  setViewModalOpen(false);
                  setSelectedFeatureId(viewFeatureId);
                  setEditModalOpen(true);
                }}
                className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-black transition-all active:scale-95"
              >
                <Pencil className="w-4 h-4" />
                Edit Data Ini
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default LayerDetailPage;
