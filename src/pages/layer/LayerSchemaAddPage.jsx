import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import DashboardLayout from "../../layouts/DashboardLayout";
import { layerService } from "../../services/layerService";
import { categoryService } from "../../services/categoryService";
import {
  ArrowLeft,
  ChevronLeft,
  Database,
  Plus,
  Save,
  Settings2,
  Trash2,
} from "lucide-react";

const emptyDefinition = {
  key: "",
  label: "",
  type: "string",
  input_type: "text",
  required: false,
  is_visible_public: false,
  export_alias: "",
  import_alias: [],
  filter_values: [],
  strict_options: false,
};

const LayerSchemaAddPage = () => {
  const [form, setForm] = useState({
    name: "",
    category: "",
    subCategory: "",
    geometryType: "LINE",
    description: "",
    isActive: true,
    definition: [{ ...emptyDefinition }],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.getCategory(),
    select: (res) => res.data,
  });

  const { data: subCategories = [] } = useQuery({
    queryKey: ["sub-categories", form.name],
    queryFn: () =>
      categoryService.getSubCategory({
        category: form.name,
      }),
    enabled: !!form.name, // hanya jalan kalau category dipilih
    select: (res) => res.data,
  });

  const mutation = useMutation({
    mutationFn: (payload) => layerService.createLayerSchema(payload),
  });

  console.log(categories);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleDefinitionChange = (index, field, value) => {
    const updated = [...form.definition];
    updated[index][field] = value;
    setForm((prev) => ({ ...prev, definition: updated }));
  };

  const handleArrayField = (index, field, value) => {
    handleDefinitionChange(
      index,
      field,
      value.split(",").map((v) => v.trim()),
    );
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
    mutation.mutate(form);
  };

  console.log(categories);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto pb-20">
        {/* ================= HEADER ================= */}
        <div className="flex items-center gap-4 mb-10">
          <button
            onClick={() => navigate(-1)}
            className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-amber-600 hover:border-amber-200 transition-all shadow-sm"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Tambah <span className="text-amber-500">Skema Layer</span>
            </h1>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">
              Konfigurasi Atribut & Geometri Baru
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* ================= BASIC INFO CARD ================= */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm p-8 group transition-all">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-indigo-50 rounded-xl">
                <Settings2 className="w-5 h-5 text-indigo-600" />
              </div>
              <h2 className="font-black text-slate-800 uppercase text-xs tracking-widest">
                Informasi Utama
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-4">
                  Kategori Utama
                </label>
                <select
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-amber-500 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none transition-all appearance-none cursor-pointer"
                  required
                >
                  <option value="">Pilih Kategori</option>
                  {categories?.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-4">
                  Sub Kategori
                </label>
                <select
                  name="subCategory"
                  value={form.subCategory}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-amber-500 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none transition-all appearance-none cursor-pointer disabled:opacity-50"
                  required
                  disabled={!form.name}
                >
                  <option value="">Pilih Sub Kategori</option>
                  {subCategories?.map((s) => (
                    <option key={s.value} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-4">
                  Tipe Geometri
                </label>
                <select
                  name="geometryType"
                  value={form.geometryType}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 rounded-2xl px-5 py-3.5 text-sm font-black outline-none transition-all"
                >
                  <option value="POINT">POINT (Titik)</option>
                  <option value="LINE">LINE (Garis)</option>
                  <option value="POLYGON">POLYGON (Area)</option>
                </select>
              </div>

              <div className="flex items-end pb-4 ml-4">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  <span className="ml-3 text-sm font-black text-slate-700 uppercase tracking-wider">
                    Skema Aktif
                  </span>
                </label>
              </div>

              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-4">
                  Deskripsi Skema
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Jelaskan tujuan penggunaan layer ini..."
                  className="w-full bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-amber-500 rounded-[1.5rem] px-5 py-4 text-sm font-medium outline-none transition-all min-h-[100px]"
                />
              </div>
            </div>
          </div>

          {/* ================= DEFINITION SECTION ================= */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 rounded-xl">
                  <Database className="w-5 h-5 text-amber-600" />
                </div>
                <h2 className="font-black text-slate-800 uppercase text-xs tracking-[0.2em]">
                  Struktur Atribut (Fields)
                </h2>
              </div>
              <button
                type="button"
                onClick={addDefinition}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white font-black text-xs uppercase transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" /> Tambah Field
              </button>
            </div>

            <div className="space-y-4">
              {form.definition.map((def, index) => (
                <div
                  key={index}
                  className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm p-6 hover:border-amber-200 transition-all relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <input
                      placeholder="ID Kolom (Database Key)"
                      value={def.key}
                      onChange={(e) =>
                        handleDefinitionChange(index, "key", e.target.value)
                      }
                      className="bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-amber-500 rounded-xl px-4 py-3 text-xs font-bold outline-none"
                      required
                    />
                    <input
                      placeholder="Label Tampilan (UI)"
                      value={def.label}
                      onChange={(e) =>
                        handleDefinitionChange(index, "label", e.target.value)
                      }
                      className="bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-amber-500 rounded-xl px-4 py-3 text-xs font-bold outline-none"
                      required
                    />
                    <select
                      value={def.type}
                      onChange={(e) =>
                        handleDefinitionChange(index, "type", e.target.value)
                      }
                      className="bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-amber-500 rounded-xl px-4 py-3 text-xs font-black outline-none"
                    >
                      <option value="string">String (Teks)</option>
                      <option value="number">Number (Desimal)</option>
                      <option value="integer">Integer (Angka Bulat)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <select
                      value={def.input_type}
                      onChange={(e) =>
                        handleDefinitionChange(
                          index,
                          "input_type",
                          e.target.value,
                        )
                      }
                      className="bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-3 text-xs font-bold outline-none"
                    >
                      <option value="text">Input Teks</option>
                      <option value="number">Input Angka</option>
                      <option value="select">Dropdown (Pilihan)</option>
                      <option value="year">Pilih Tahun</option>
                    </select>
                    <input
                      placeholder="Export Alias (cth: Nama_Aset)"
                      value={def.export_alias}
                      onChange={(e) =>
                        handleDefinitionChange(
                          index,
                          "export_alias",
                          e.target.value,
                        )
                      }
                      className="bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-3 text-xs font-bold outline-none"
                    />
                    <input
                      placeholder="Import Alias (pisahkan koma)"
                      onChange={(e) =>
                        handleArrayField(index, "import_alias", e.target.value)
                      }
                      className="bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-3 text-xs font-bold outline-none"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
                    <div className="flex flex-wrap gap-6">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                          checked={def.required}
                          onChange={(e) =>
                            handleDefinitionChange(
                              index,
                              "required",
                              e.target.checked,
                            )
                          }
                        />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-amber-600 transition-colors">
                          Wajib Diisi
                        </span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-slate-300 text-indigo-500 focus:ring-indigo-500"
                          checked={def.is_visible_public}
                          onChange={(e) =>
                            handleDefinitionChange(
                              index,
                              "is_visible_public",
                              e.target.checked,
                            )
                          }
                        />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">
                          Publik
                        </span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-slate-300 text-slate-500 focus:ring-slate-500"
                          checked={def.strict_options}
                          onChange={(e) =>
                            handleDefinitionChange(
                              index,
                              "strict_options",
                              e.target.checked,
                            )
                          }
                        />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-800 transition-colors">
                          Strict Option
                        </span>
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeDefinition(index)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-red-500 hover:bg-red-50 font-black text-[10px] uppercase tracking-widest transition-all"
                    >
                      <Trash2 className="w-4 h-4" /> Hapus Kolom
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ================= ACTIONS ================= */}
          <div className="pt-10 flex justify-end gap-4 border-t border-slate-200/60">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-8 py-4 rounded-[1.5rem] bg-slate-100 text-slate-600 hover:bg-slate-200 font-black text-sm uppercase tracking-widest transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex items-center gap-3 px-10 py-4 rounded-[1.5rem] bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-slate-300 font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-indigo-200 active:scale-95"
            >
              {mutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" /> Simpan Skema
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      <Save />
    </DashboardLayout>
  );
};

export default LayerSchemaAddPage;
