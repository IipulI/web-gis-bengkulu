import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Layers,
  Database,
} from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { layerService } from "../../services/layerService";
import { toast } from "sonner";

const LayerSchemaDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // ================= FETCH DATA =================
  const { data, isLoading, isError } = useQuery({
    queryKey: ["layer-schema-detail", id],
    queryFn: () => layerService.getOneLayerSchema(id),
    enabled: !!id,
  });

  // ================= ERROR =================
  if (isError) {
    toast.error("Gagal memuat detail layer schema");
    navigate(-1);
  }

  // ================= LOADING =================
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-gray-500">
          Memuat detail layer schema...
        </div>
      </DashboardLayout>
    );
  }

  const schema = data?.data ?? data;

  return (
    <DashboardLayout>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-green-800">
            Detail Layer Schema
          </h1>
          <p className="text-sm text-gray-500">
            Informasi lengkap schema layer
          </p>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 border px-4 py-2 rounded-lg hover:bg-green-50"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
      </div>

      {/* ================= INFORMASI UMUM ================= */}
      <div className="bg-white border border-green-200 rounded-xl p-6 mb-8">
        <h2 className="flex items-center gap-2 font-semibold text-green-800 mb-4">
          <Layers className="w-5 h-5" />
          Informasi Umum
        </h2>

        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div>
            <p className="text-gray-500">Nama Layer</p>
            <p className="font-medium">{schema.name}</p>
          </div>

          <div>
            <p className="text-gray-500">Sub Kategori</p>
            <p className="font-medium">{schema.subCategory}</p>
          </div>

          <div>
            <p className="text-gray-500">Geometry Type</p>
            <span className="inline-block mt-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
              {schema.geometryType}
            </span>
          </div>

          <div>
            <p className="text-gray-500">Status Layer</p>
            <div className="flex items-center gap-2 mt-1">
              {schema.isActive ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-green-700 font-medium">Aktif</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span className="text-red-600 font-medium">Tidak Aktif</span>
                </>
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            <p className="text-gray-500">Deskripsi</p>
            <p className="font-medium">{schema.description || "-"}</p>
          </div>
        </div>
      </div>

      {/* ================= DEFINISI ATRIBUT ================= */}
      <div className="bg-white border border-green-200 rounded-xl p-6">
        <h2 className="flex items-center gap-2 font-semibold text-green-800 mb-6">
          <Database className="w-5 h-5" />
          Definisi Atribut ({schema.definition?.length || 0})
        </h2>

        {schema.definition?.length === 0 ? (
          <p className="text-sm text-gray-500">Tidak ada definisi atribut</p>
        ) : (
          <div className="space-y-4">
            {schema.definition.map((def, index) => (
              <div key={index} className="border rounded-lg p-4 bg-green-50/40">
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Key</p>
                    <p className="font-medium">{def.key}</p>
                  </div>

                  <div>
                    <p className="text-gray-500">Label</p>
                    <p className="font-medium">{def.label}</p>
                  </div>

                  <div>
                    <p className="text-gray-500">Tipe Data</p>
                    <p className="font-medium uppercase">{def.type}</p>
                  </div>

                  <div>
                    <p className="text-gray-500">Input Type</p>
                    <p className="font-medium uppercase">{def.input_type}</p>
                  </div>

                  <div>
                    <p className="text-gray-500">Required</p>
                    <p className="font-medium">
                      {def.required ? "Ya" : "Tidak"}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">Visible Public</p>
                    <p className="font-medium">
                      {def.is_visible_public ? "Ya" : "Tidak"}
                    </p>
                  </div>

                  <div className="md:col-span-3">
                    <p className="text-gray-500">Import Alias</p>
                    <p className="font-medium">
                      {def.import_alias?.join(", ") || "-"}
                    </p>
                  </div>

                  <div className="md:col-span-3">
                    <p className="text-gray-500">Filter Values</p>
                    <p className="font-medium">
                      {def.filter_values?.join(", ") || "-"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default LayerSchemaDetailPage;
