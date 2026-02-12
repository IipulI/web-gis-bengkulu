/* eslint-disable */

import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash, Upload, X } from "lucide-react";
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

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/img/leaflet/marker-icon-2x.png',
  iconUrl:       '/img/leaflet/marker-icon.png',
  shadowUrl:     '/img/leaflet/marker-shadow.png',
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

  const [uploadFeatureId, setUploadFeatureId] = useState(null);

  const [imageFile, setImageFile] = useState(null);

  const [editForm, setEditForm] = useState(null);

  const [page, setPage] = useState(1);
  const size = 10;

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
  return (
    <DashboardLayout>
      {/* HEADER */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Detail Layer: {layer?.name}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage fitur dan geometry dari layer ini.
          </p>
        </div>

        <div className="relative group">
          <button className="bg-green-600 hover:bg-green-700 transition text-white px-5 py-2.5 rounded-lg shadow flex items-center gap-2">
            <Upload className="w-4 h-4" /> Export Data
          </button>

          <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition pointer-events-none group-hover:pointer-events-auto z-50">
            <button
              onClick={() => handleExport("shp")}
              className="w-full px-4 py-2 text-sm hover:bg-gray-100 text-left"
            >
              Export SHP
            </button>
            <button
              onClick={() => handleExport("geojson")}
              className="w-full px-4 py-2 text-sm hover:bg-gray-100 text-left"
            >
              Export GeoJSON
            </button>
            <button
              onClick={() => handleExport("kml")}
              className="w-full px-4 py-2 text-sm hover:bg-gray-100 text-left"
            >
              Export KML
            </button>
          </div>
        </div>
      </div>
      {/* CARD LIST */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="font-semibold text-gray-700 mb-4">List Data</h2>

        {features.length === 0 ? (
          <p className="text-gray-500 text-sm">Belum ada data.</p>
        ) : (
          <div className="overflow-x-auto">
            <div className="flex justify-between items-center mb-3">
              <input
                type="text"
                placeholder={`Cari ${layer?.name || "data"}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />

              <span className="text-xs text-gray-500">
                {filteredFeatures.length} data
              </span>
            </div>

            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-100 text-xs text-gray-600 uppercase">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={`p-3 border text-${col.align || "left"}`}
                    >
                      {col.label}
                    </th>
                  ))}
                  <th className="p-3 border text-center">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {filteredFeatures.map((f) => (
                  <tr
                    key={f.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`p-3 border text-${col.align || "left"}`}
                      >
                        {col.render ? col.render(f) : "-"}
                      </td>
                    ))}

                    <td className="p-3 border text-center">
                      <div className="flex justify-center gap-3">
                        <Pencil
                          onClick={() => {
                            setSelectedFeatureId(f.id);
                            setEditModalOpen(true);
                          }}
                          className="w-4 h-4 cursor-pointer text-blue-600 hover:text-blue-800"
                        />

                        <ImagePlus
                          onClick={() => {
                            setUploadFeatureId(f.id);
                            setUploadModalOpen(true);
                          }}
                          className="w-4 h-4 cursor-pointer text-green-600 hover:text-green-800"
                          title="Upload Gambar"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {pagination && (
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-gray-500">
              Menampilkan{" "}
              {(pagination.currentPage - 1) * pagination.perPage + 1}–
              {Math.min(
                pagination.currentPage * pagination.perPage,
                pagination.totalItems,
              )}{" "}
              dari {pagination.totalItems} data
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={pagination.currentPage === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 border rounded-lg text-sm disabled:opacity-40"
              >
                Prev
              </button>

              <span className="text-sm font-medium">
                Page {pagination.currentPage} / {pagination.totalPage}
              </span>

              <button
                disabled={pagination.currentPage === pagination.totalPage}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 border rounded-lg text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
      {/* && !featureLoading */}
      ()
      {/* EDIT MODAL (placeholder) */}
      {editModalOpen && selectedFeature && (
        <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-xl shadow-lg p-6 relative">
            <button
              onClick={() => setEditModalOpen(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-black"
            >
              <X />
            </button>

            <h2 className="text-xl font-semibold mb-4">
              Edit Feature: {selectedFeature.name}
            </h2>

            {/* Tempat form edit */}

            <form
              onSubmit={(e) => {
                e.preventDefault();

                updateMutation.mutate({
                  id: selectedFeature.id,
                  data: editForm,
                });
              }}
              className="grid grid-cols-2 gap-4"
            >
              {columns
                .filter((c) => c.editable)
                .map((col) => {
                  const value = getValueByPath(editForm, col.field);

                  return (
                    <div key={col.key} className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-600">
                        {col.label}
                      </label>

                      <input
                        type={col.type || "text"}
                        value={value ?? ""}
                        onChange={(e) => {
                          const updated = structuredClone(editForm);
                          setValueByPath(updated, col.field, e.target.value);
                          setEditForm(updated);
                        }}
                        className="border px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  );
                })}

              <div className="col-span-2 flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 text-sm border rounded-lg"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {uploadModalOpen && uploadFeatureId && (
        <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6 relative">
            <button
              onClick={() => setUploadModalOpen(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-black"
            >
              <X />
            </button>

            <h2 className="text-lg font-semibold mb-4">Upload Gambar</h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();

                if (!imageFile) return;

                uploadAttachmentMutation.mutate({
                  layerId: id,
                  featureId: uploadFeatureId,
                  file: imageFile,
                });
              }}
              className="flex flex-col gap-4"
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="border px-3 py-2 rounded-lg text-sm"
                required
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 text-sm border rounded-lg"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={uploadAttachmentMutation.isLoading}
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg disabled:opacity-50"
                >
                  {uploadAttachmentMutation.isLoading
                    ? "Mengunggah..."
                    : "Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default LayerDetailPage;
