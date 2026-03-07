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
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600 rounded-[1.2rem] shadow-xl shadow-indigo-100">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                Detail <span className="text-indigo-600">Skema</span>
              </h1>
              <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2 ml-0.5">
                Konfigurasi struktur metadata layer
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-600 font-black text-[10px] uppercase tracking-[0.2em] px-8 py-4 rounded-2xl border border-slate-200 shadow-sm transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ================= LEFT COLUMN: SUMMARY & STATUS ================= */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden">
            {/* Decorative Element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -mr-16 -mt-16 opacity-60" />

            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-500" /> Ringkasan Layer
            </h2>

            <div className="space-y-7 relative z-10">
              <div className="group">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 group-hover:text-indigo-500 transition-colors">
                  Nama Layer
                </p>
                <p className="text-xl font-black text-slate-900 leading-tight">
                  {schema.name}
                </p>
              </div>

              <div className="group">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 group-hover:text-indigo-500 transition-colors">
                  Sub Kategori
                </p>
                <p className="text-xs font-black text-indigo-700 bg-indigo-50/50 border border-indigo-100 inline-block px-4 py-1.5 rounded-xl uppercase tracking-wider">
                  {schema.subCategory}
                </p>
              </div>

              <div className="group">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 group-hover:text-indigo-500 transition-colors">
                  Tipe Geometri
                </p>
                <div className="flex items-center gap-2.5 mt-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]" />
                  <span className="text-sm font-black text-slate-800 uppercase tracking-widest">
                    {schema.geometryType}
                  </span>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                  Status Publikasi
                </p>
                <div
                  className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-black text-[10px] tracking-[0.1em] ${
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

          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-200 relative overflow-hidden group">
            <div className="absolute bottom-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Layers className="w-20 h-20" />
            </div>
            <h2 className="text-[10px] font-black text-amber-400 uppercase tracking-[0.3em] mb-4">
              Deskripsi Internal
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed font-medium italic relative z-10">
              "
              {schema.description ||
                "Tidak ada deskripsi tambahan untuk skema ini."}
              "
            </p>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: ATTRIBUTE DEFINITIONS ================= */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 rounded-xl">
                <Database className="w-5 h-5 text-indigo-600" />
              </div>
              <h2 className="font-black text-slate-900 uppercase text-xs tracking-[0.2em]">
                Definisi Atribut{" "}
                <span className="text-amber-500 ml-2">
                  ({schema.definition?.length || 0})
                </span>
              </h2>
            </div>
          </div>

          {schema.definition?.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] p-24 text-center">
              <div className="inline-flex p-5 bg-slate-50 rounded-full mb-4">
                <Database className="w-10 h-10 text-slate-200" />
              </div>
              <p className="text-slate-400 font-black uppercase text-xs tracking-widest">
                Belum ada atribut yang didefinisikan.
              </p>
            </div>
          ) : (
            <div className="grid gap-5">
              {schema.definition.map((def, index) => (
                <div
                  key={index}
                  className="group bg-white border border-slate-200/70 rounded-[2.2rem] p-7 hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-50/50 transition-all duration-300 relative overflow-hidden"
                >
                  {/* Sidebar Indicator */}
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-100 group-hover:bg-indigo-500 transition-colors" />

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    {/* Attr Info */}
                    <div className="flex-1 space-y-5">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center justify-center w-10 h-10 rounded-2xl bg-slate-50 text-slate-400 font-mono text-xs font-black group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                          {(index + 1).toString().padStart(2, "0")}
                        </span>
                        <div>
                          <h4 className="font-black text-slate-900 text-lg leading-none uppercase tracking-tight">
                            {def.label}
                          </h4>
                          <div className="flex items-center gap-2 mt-2">
                            <code className="text-[10px] text-amber-600 font-black bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100 uppercase">
                              KEY: {def.key}
                            </code>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-2">
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            Data Type
                          </p>
                          <p className="text-xs font-black text-slate-800 uppercase">
                            {def.type}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            Input Control
                          </p>
                          <p className="text-xs font-black text-indigo-600 uppercase">
                            {def.input_type}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            Mandatory
                          </p>
                          <p
                            className={`text-xs font-black ${def.required ? "text-rose-500" : "text-slate-400 uppercase"}`}
                          >
                            {def.required ? "WAJIB" : "OPSIONAL"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            Visibility
                          </p>
                          <p
                            className={`text-xs font-black uppercase ${def.is_visible_public ? "text-amber-600" : "text-slate-400"}`}
                          >
                            {def.is_visible_public ? "PUBLIK" : "INTERNAL"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Extra Meta (Alias & Filters) */}
                    <div className="flex flex-col gap-4 min-w-[200px] border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                          Import Aliases
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {def.import_alias?.length > 0 ? (
                            def.import_alias.map((a) => (
                              <span
                                key={a}
                                className="text-[9px] font-black bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg border border-indigo-100"
                              >
                                {a}
                              </span>
                            ))
                          ) : (
                            <span className="text-[9px] font-bold text-slate-300 uppercase italic">
                              Tanpa Alias
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">
                          Filter Values
                        </p>
                        <p className="text-[10px] font-bold text-slate-500 line-clamp-2 leading-relaxed">
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
