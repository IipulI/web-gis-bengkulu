import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Layers,
  Database,
  Info,
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
      {/* ================= HEADER AREA ================= */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-200">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              Detail <span className="text-emerald-600">Skema</span>
            </h1>
          </div>
          <p className="text-slate-500 font-medium text-sm ml-12">
            Konfigurasi struktur metadata untuk layer{" "}
            <span className="text-slate-800 font-bold">"{schema.name}"</span>
          </p>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-2xl border border-slate-100 shadow-sm transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ================= LEFT COLUMN: SUMMARY & STATUS ================= */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-50" />

            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Info className="w-4 h-4" /> Ringkasan Layer
            </h2>

            <div className="space-y-6 relative z-10">
              <div className="group">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-emerald-500 transition-colors">
                  Nama Layer
                </p>
                <p className="text-lg font-bold text-slate-800 leading-tight">
                  {schema.name}
                </p>
              </div>

              <div className="group">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-emerald-500 transition-colors">
                  Sub Kategori
                </p>
                <p className="text-sm font-bold text-slate-600 bg-slate-50 inline-block px-3 py-1 rounded-lg">
                  {schema.subCategory}
                </p>
              </div>

              <div className="group">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-emerald-500 transition-colors">
                  Tipe Geometri
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-black text-slate-700 uppercase">
                    {schema.geometryType}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                  Status Publikasi
                </p>
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-xs ${
                    schema.isActive
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                      : "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
                  }`}
                >
                  {schema.isActive ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  {schema.isActive ? "PUBLISHED / AKTIF" : "DRAFT / NON-AKTIF"}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-200">
            <h2 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-4">
              Deskripsi Internal
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed italic">
              "
              {schema.description ||
                "Tidak ada deskripsi tambahan untuk skema ini."}
              "
            </p>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: ATTRIBUTE DEFINITIONS ================= */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-xl">
                <Database className="w-5 h-5 text-slate-600" />
              </div>
              <h2 className="font-black text-slate-800 uppercase text-sm tracking-widest">
                Definisi Atribut{" "}
                <span className="text-emerald-600 ml-2">
                  ({schema.definition?.length || 0})
                </span>
              </h2>
            </div>
          </div>

          {schema.definition?.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-100 rounded-[2.5rem] p-20 text-center">
              <p className="text-slate-400 font-medium italic">
                Belum ada atribut yang didefinisikan.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {schema.definition.map((def, index) => (
                <div
                  key={index}
                  className="group bg-white border border-slate-100 rounded-[2rem] p-6 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-50 transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    {/* Attr Info */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 text-slate-400 font-mono text-[10px] font-bold">
                          {(index + 1).toString().padStart(2, "0")}
                        </span>
                        <div>
                          <h4 className="font-black text-slate-800 text-base leading-none uppercase tracking-tight">
                            {def.label}
                          </h4>
                          <code className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded mt-1 inline-block">
                            ID: {def.key}
                          </code>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase mb-1">
                            Data Type
                          </p>
                          <p className="text-xs font-bold text-slate-700">
                            {def.type}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase mb-1">
                            Input Control
                          </p>
                          <p className="text-xs font-bold text-slate-700">
                            {def.input_type}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase mb-1">
                            Wajib Diisi
                          </p>
                          <p
                            className={`text-xs font-bold ${def.required ? "text-rose-500" : "text-slate-400"}`}
                          >
                            {def.required ? "YA (Mandatory)" : "TIDAK"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase mb-1">
                            Publik
                          </p>
                          <p
                            className={`text-xs font-bold ${def.is_visible_public ? "text-emerald-600" : "text-slate-400"}`}
                          >
                            {def.is_visible_public ? "TERLIHAT" : "HIDDEN"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Extra Meta (Alias & Filters) */}
                    <div className="flex flex-col gap-2 min-w-[180px] border-t md:border-t-0 md:border-l border-slate-50 pt-4 md:pt-0 md:pl-6">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">
                          Import Aliases
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {def.import_alias?.length > 0 ? (
                            def.import_alias.map((a) => (
                              <span
                                key={a}
                                className="text-[9px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md"
                              >
                                {a}
                              </span>
                            ))
                          ) : (
                            <span className="text-[9px] italic text-slate-300">
                              None
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">
                          Filter Values
                        </p>
                        <p className="text-[10px] font-medium text-slate-500 line-clamp-2">
                          {def.filter_values?.join(", ") || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LayerSchemaDetailPage;
