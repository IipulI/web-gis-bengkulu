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
          <div className="p-3 bg-amber-100 rounded-2xl shadow-inner">
            <PencilLine className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              Update <span className="text-emerald-600">Skema</span>
            </h1>
            <p className="text-slate-500 text-sm font-medium italic mt-0.5">
              ID: {id}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-2xl border border-slate-100 shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
      </div>

      <form onSubmit={handleSubmit} className="max-w-5xl space-y-10 pb-20">
        {/* ================= SECTION 1: INFORMASI UMUM ================= */}
        <section className="bg-white/70 backdrop-blur-md border border-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50">
          <div className="flex items-center gap-3 mb-8 border-b border-slate-50 pb-5">
            <div className="w-1.5 h-8 bg-emerald-500 rounded-full" />
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
              Informasi Utama Layer
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
            {/* NAMA LAYER */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">
                Nama Schema
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Contoh: Titik Lokasi Drainase"
                className="w-full bg-slate-50/50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-700 transition-all outline-none"
                required
              />
            </div>

            {/* GEOMETRY TYPE */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">
                Tipe Geometri
              </label>
              <select
                name="geometryType"
                value={form.geometryType}
                onChange={handleChange}
                className="w-full bg-slate-50/50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-700 transition-all outline-none appearance-none cursor-pointer"
                required
              >
                <option value="">Pilih Tipe</option>
                <option value="POINT">📍 POINT</option>
                <option value="LINE">🛤️ LINE</option>
                <option value="POLYGON">⬢ POLYGON</option>
              </select>
            </div>

            {/* DESKRIPSI */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">
                Deskripsi & Catatan
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Jelaskan tujuan penggunaan layer ini..."
                className="w-full bg-slate-50/50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 rounded-2xl px-5 py-3.5 text-sm font-medium text-slate-600 transition-all outline-none"
              />
            </div>

            {/* IS ACTIVE TOGGLE */}
            <div className="md:col-span-2 flex items-center gap-4 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50">
              <div className="relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors duration-200 focus:outline-none">
                <input
                  type="checkbox"
                  name="is_active"
                  id="is_active"
                  checked={form.is_active}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div
                  onClick={() =>
                    handleChange({
                      target: {
                        name: "is_active",
                        type: "checkbox",
                        checked: !form.is_active,
                      },
                    })
                  }
                  className="w-11 h-6 bg-slate-200 peer-focus:ring-2 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 transition-all shadow-sm"
                ></div>
              </div>
              <label
                htmlFor="is_active"
                className="text-xs font-bold text-emerald-800 uppercase tracking-widest cursor-pointer"
              >
                {form.is_active ? "Layer Sedang Aktif" : "Nonaktifkan Layer"}
              </label>
            </div>
          </div>
        </section>

        {/* ================= SECTION 2: DEFINISI ATRIBUT ================= */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-900 rounded-xl">
                <Database className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                Atribut Metadata
              </h2>
            </div>

            <button
              type="button"
              onClick={addDefinition}
              className="flex items-center gap-2 bg-slate-900 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg active:scale-95"
            >
              <Plus className="w-4 h-4" /> Tambah Kolom
            </button>
          </div>

          <div className="grid gap-6">
            {form.definition.map((def, index) => (
              <div
                key={index}
                className="group relative bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 overflow-hidden"
              >
                {/* Header Atribut */}
                <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 text-white font-mono text-xs font-bold">
                      {(index + 1).toString().padStart(2, "0")}
                    </span>
                    <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest">
                      Konfigurasi Atribut #{index + 1}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeDefinition(index)}
                    className="p-2 text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Form Fields Atribut */}
                <div className="grid md:grid-cols-3 gap-6">
                  {/* KEY */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Database Key
                    </label>
                    <input
                      value={def.key}
                      onChange={(e) =>
                        handleDefinitionChange(index, "key", e.target.value)
                      }
                      className="w-full bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-emerald-700 outline-none transition-all"
                      placeholder="e.g. luas_wilayah"
                      required
                    />
                  </div>

                  {/* LABEL */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Display Label
                    </label>
                    <input
                      value={def.label}
                      onChange={(e) =>
                        handleDefinitionChange(index, "label", e.target.value)
                      }
                      className="w-full bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none transition-all"
                      placeholder="e.g. Luas Wilayah (Ha)"
                      required
                    />
                  </div>

                  {/* DATA TYPE */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Data Type
                    </label>
                    <select
                      value={def.type}
                      onChange={(e) =>
                        handleDefinitionChange(index, "type", e.target.value)
                      }
                      className="w-full bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none transition-all"
                    >
                      <option value="string">STRING</option>
                      <option value="number">NUMBER</option>
                      <option value="integer">INTEGER</option>
                    </select>
                  </div>

                  {/* INPUT TYPE */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Control Type
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
                      className="w-full bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none transition-all"
                    >
                      <option value="text">TEXT INPUT</option>
                      <option value="number">NUMBER INPUT</option>
                      <option value="select">DROPDOWN / SELECT</option>
                      <option value="year">YEAR PICKER</option>
                    </select>
                  </div>

                  {/* IMPORT ALIAS */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      SHP Import Alias
                    </label>
                    <input
                      value={def.import_alias.join(", ")}
                      onChange={(e) =>
                        handleArrayInput(index, "import_alias", e.target.value)
                      }
                      className="w-full bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-[11px] font-medium text-slate-500 outline-none transition-all"
                      placeholder="Separated by comma (e.g. LUAS, AREA, SIZE)"
                    />
                  </div>

                  {/* FILTER VALUES */}
                  <div className="md:col-span-3 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Dropdown Options (Predefined Values)
                    </label>
                    <input
                      value={def.filter_values.join(", ")}
                      onChange={(e) =>
                        handleArrayInput(index, "filter_values", e.target.value)
                      }
                      className="w-full bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-[11px] font-medium text-slate-500 outline-none transition-all"
                      placeholder="e.g. Baik, Rusak Ringan, Rusak Berat"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================= STICKY SUBMIT ================= */}
        <div className="fixed bottom-10 right-10 z-[3000]">
          <button
            type="submit"
            disabled={updateMutation.isLoading}
            className="group flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-[0_20px_50px_rgba(16,185,129,0.3)] transition-all active:scale-95 disabled:bg-slate-300"
          >
            {updateMutation.isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-5 h-5 group-hover:animate-bounce" />
            )}
            Simpan Perubahan
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default LayerSchemaUpdatePage;
