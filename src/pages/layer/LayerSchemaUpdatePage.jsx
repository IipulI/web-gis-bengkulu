import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  PencilLine,
  Database,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "../../layouts/DashboardLayout";
import { layerService } from "../../services/layerService";

const emptyDefinition = {
  key: "",
  label: "",
  type: "string",
  input_type: "text",
  required: false,
  is_visible_public: true,
  export_alias: "",
  import_alias: [],
  filter_values: [],
  strict_options: false,
};

const LayerSchemaUpdatePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(null);

  // ================= GET DATA =================
  const { data, isLoading, isError } = useQuery({
    queryKey: ["layer-schema", id],
    queryFn: () => layerService.getOneLayerSchema(id),
    enabled: !!id,
  });

  // ================= SET FORM =================
  useEffect(() => {
    if (!data) return;
    const schema = data.data ?? data;

    setForm({
      name: schema.subCategory || "",
      geometryType: schema.geometryType || "",
      description: schema.description || "",
      is_active: schema.isActive ?? true,
      definition:
        schema.definition?.length > 0
          ? schema.definition
          : [{ ...emptyDefinition }],
    });
  }, [data]);

  // ================= ERROR =================
  useEffect(() => {
    if (isError) {
      toast.error("Gagal memuat data layer schema");
      navigate("/layer-schema");
    }
  }, [isError, navigate]);

  // ================= UPDATE =================
  const updateMutation = useMutation({
    mutationFn: (payload) => layerService.updateLayerSchema(id, payload),
    onSuccess: () => {
      toast.success("Layer schema berhasil diperbarui");
      queryClient.invalidateQueries(["layer-schema"]);
      navigate("/dashboard/layer-schema");
    },
    onError: () => toast.error("Gagal memperbarui layer schema"),
  });

  // ================= HANDLERS =================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleDefinitionChange = (index, field, value) => {
    const updated = [...form.definition];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, definition: updated });
  };

  const handleArrayInput = (index, field, value) => {
    const updated = [...form.definition];
    updated[index][field] = value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    setForm({ ...form, definition: updated });
  };

  const addDefinition = () => {
    setForm((prev) => ({
      ...prev,
      definition: [...prev.definition, { ...emptyDefinition }],
    }));
  };

  const removeDefinition = (index) => {
    setForm((prev) => ({
      ...prev,
      definition: prev.definition.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(form);
  };

  // ================= LOADING =================
  if (isLoading || !form) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-gray-500">
          Memuat data layer schema...
        </div>
      </DashboardLayout>
    );
  }

  // ================= UI =================
  return (
    <DashboardLayout>
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-100">
            <PencilLine className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
              Update <span className="text-indigo-600">Skema</span>
            </h1>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
              UUID: <span className="text-amber-600">{id}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-600 font-black text-[10px] uppercase tracking-widest px-8 py-3.5 rounded-2xl border border-slate-200 shadow-sm transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
      </div>

      <form onSubmit={handleSubmit} className="max-w-5xl space-y-12 pb-32">
        {/* ================= SECTION 1: INFORMASI UMUM ================= */}
        <section className="bg-white border border-slate-200/60 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden">
          {/* Decorative background */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50/50 rounded-full -mr-20 -mt-20 opacity-50" />

          <div className="flex items-center gap-4 mb-10 relative z-10">
            <div className="w-2 h-8 bg-amber-500 rounded-full" />
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">
              Informasi Utama Layer
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-x-10 gap-y-8 relative z-10">
            {/* NAMA LAYER */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Nama Schema
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Contoh: Titik Lokasi Drainase"
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl px-6 py-4 text-sm font-bold text-slate-800 transition-all outline-none"
                required
              />
            </div>

            {/* GEOMETRY TYPE */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Tipe Geometri
              </label>
              <div className="relative">
                <select
                  name="geometryType"
                  value={form.geometryType}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl px-6 py-4 text-sm font-black text-slate-800 transition-all outline-none appearance-none cursor-pointer"
                  required
                >
                  <option value="">Pilih Tipe</option>
                  <option value="POINT">📍 POINT</option>
                  <option value="LINE">🛤️ LINE</option>
                  <option value="POLYGON">⬢ POLYGON</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* DESKRIPSI */}
            <div className="md:col-span-2 space-y-2.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Deskripsi & Catatan Internal
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Jelaskan tujuan penggunaan layer ini..."
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-3xl px-6 py-4 text-sm font-medium text-slate-600 transition-all outline-none leading-relaxed"
              />
            </div>

            {/* IS ACTIVE TOGGLE */}
            <div className="md:col-span-2 flex items-center gap-5 bg-indigo-50/30 p-5 rounded-[1.5rem] border border-indigo-100/50">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={form.is_active}
                  onChange={(e) =>
                    handleChange({
                      target: {
                        name: "is_active",
                        type: "checkbox",
                        checked: e.target.checked,
                      },
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-[20px] after:w-[20px] after:transition-all peer-checked:bg-indigo-600 shadow-inner"></div>
              </label>
              <span className="text-xs font-black text-indigo-900 uppercase tracking-widest">
                {form.is_active
                  ? "Status: Publikasi Aktif"
                  : "Status: Draft / Nonaktif"}
              </span>
            </div>
          </div>
        </section>

        {/* ================= SECTION 2: DEFINISI ATRIBUT ================= */}
        <section className="space-y-8">
          <div className="flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-slate-900 rounded-xl shadow-lg">
                <Database className="w-5 h-5 text-amber-400" />
              </div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">
                Struktur Atribut Metadata
              </h2>
            </div>

            <button
              type="button"
              onClick={addDefinition}
              className="flex items-center gap-2 bg-white hover:bg-indigo-600 hover:text-white text-indigo-600 border border-indigo-200 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4" /> Tambah Kolom
            </button>
          </div>

          <div className="grid gap-8">
            {form.definition.map((def, index) => (
              <div
                key={index}
                className="group relative bg-white border border-slate-200/70 rounded-[2.5rem] p-10 shadow-sm hover:shadow-2xl hover:shadow-indigo-100/30 transition-all duration-500"
              >
                {/* Index Badge */}
                <div className="absolute -left-3 top-10 flex items-center justify-center w-10 h-10 rounded-2xl bg-slate-900 text-amber-400 font-mono text-xs font-black shadow-xl">
                  {(index + 1).toString().padStart(2, "0")}
                </div>

                <div className="flex items-center justify-between mb-10 ml-4 border-b border-slate-100 pb-5">
                  <h3 className="font-black text-slate-900 uppercase text-[11px] tracking-[0.2em]">
                    Konfigurasi Field{" "}
                    <span className="text-indigo-600">#{index + 1}</span>
                  </h3>

                  <button
                    type="button"
                    onClick={() => removeDefinition(index)}
                    className="group/del flex items-center gap-2 text-rose-400 hover:text-rose-600 font-black text-[10px] uppercase tracking-widest transition-all"
                  >
                    <Trash2 className="w-4 h-4" /> Hapus
                  </button>
                </div>

                {/* Form Fields Atribut */}
                <div className="grid md:grid-cols-3 gap-8 ml-4">
                  <div className="space-y-2.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      ID Database (Unique Key)
                    </label>
                    <input
                      value={def.key}
                      onChange={(e) =>
                        handleDefinitionChange(index, "key", e.target.value)
                      }
                      className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 rounded-xl px-5 py-3 text-sm font-mono font-bold text-amber-700 outline-none transition-all"
                      placeholder="e.g. kode_aset"
                      required
                    />
                  </div>

                  <div className="space-y-2.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      Nama Tampilan (Label)
                    </label>
                    <input
                      value={def.label}
                      onChange={(e) =>
                        handleDefinitionChange(index, "label", e.target.value)
                      }
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl px-5 py-3 text-sm font-bold text-slate-800 outline-none transition-all"
                      placeholder="e.g. Nomor Registrasi"
                      required
                    />
                  </div>

                  <div className="space-y-2.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      Tipe Data Backend
                    </label>
                    <select
                      value={def.type}
                      onChange={(e) =>
                        handleDefinitionChange(index, "type", e.target.value)
                      }
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-5 py-3 text-sm font-bold text-slate-700 outline-none transition-all cursor-pointer"
                    >
                      <option value="string">STRING</option>
                      <option value="number">NUMBER (DECIMAL)</option>
                      <option value="integer">INTEGER (WHOLE)</option>
                    </select>
                  </div>

                  <div className="space-y-2.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      Komponen Input (UI)
                    </label>
                    <select
                      value={def.input_type}
                      onChange={(e) =>
                        handleDefinitionChange(
                          index,
                          "input_type",
                          e.target.value,
                        )
                      }
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-5 py-3 text-sm font-bold text-slate-700 outline-none transition-all cursor-pointer"
                    >
                      <option value="text">TEXT FIELD</option>
                      <option value="number">NUMBER FIELD</option>
                      <option value="select">DROPDOWN MENU</option>
                      <option value="year">YEAR PICKER</option>
                    </select>
                  </div>

                  <div className="md:col-span-2 space-y-2.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      Shapefile Import Aliases
                    </label>
                    <input
                      value={def.import_alias.join(", ")}
                      onChange={(e) =>
                        handleArrayInput(index, "import_alias", e.target.value)
                      }
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-5 py-3 text-xs font-bold text-indigo-600 outline-none transition-all"
                      placeholder="Pisahkan dengan koma: NO_REG, REGISTRASI, ID_ASET"
                    />
                  </div>

                  <div className="md:col-span-3 space-y-2.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      Predefined Values (Hanya untuk Dropdown)
                    </label>
                    <input
                      value={def.filter_values.join(", ")}
                      onChange={(e) =>
                        handleArrayInput(index, "filter_values", e.target.value)
                      }
                      className="w-full bg-amber-50/30 border border-amber-100 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 rounded-xl px-5 py-3 text-xs font-medium text-amber-900 outline-none transition-all"
                      placeholder="Contoh: Sangat Baik, Cukup, Rusak"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================= STICKY SUBMIT ================= */}
        <div className="fixed bottom-10 right-10 z-[3000] flex items-center gap-4">
          <div className="hidden md:block bg-white/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Pastikan data sesuai
            </p>
          </div>
          <button
            type="submit"
            disabled={updateMutation.isLoading}
            className="group flex items-center gap-4 bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-5 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-[0_20px_50px_rgba(79,70,229,0.3)] transition-all active:scale-95 disabled:bg-slate-300"
          >
            {updateMutation.isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            )}
            Simpan Perubahan
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default LayerSchemaUpdatePage;
