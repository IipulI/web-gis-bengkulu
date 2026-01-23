import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react";
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
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-green-800">
          Update Layer Schema
        </h1>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 border px-4 py-2 rounded-lg hover:bg-green-50"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* INFORMASI UMUM */}
        <div className="bg-white border border-green-200 rounded-xl p-6">
          <h2 className="font-semibold text-green-800 mb-4">
            Informasi Umum Layer
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Nama Layer</label>
              <p className="text-xs text-gray-500 mb-1">
                Nama unik schema layer
              </p>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="border rounded-lg px-4 py-2 w-full"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Geometry Type</label>
              <p className="text-xs text-gray-500 mb-1">
                Tipe geometri data spasial
              </p>
              <select
                name="geometryType"
                value={form.geometryType}
                onChange={handleChange}
                className="border rounded-lg px-4 py-2 w-full"
                required
              >
                <option value="">Pilih Geometry</option>
                <option value="POINT">POINT</option>
                <option value="LINE">LINE</option>
                <option value="POLYGON">POLYGON</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium">Deskripsi</label>
              <p className="text-xs text-gray-500 mb-1">
                Penjelasan singkat fungsi layer
              </p>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                className="border rounded-lg px-4 py-2 w-full"
              />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="is_active"
                checked={form.is_active}
                onChange={handleChange}
              />
              Layer aktif dan dapat digunakan
            </label>
          </div>
        </div>

        {/* DEFINISI ATRIBUT */}
        <div className="bg-white border border-green-200 rounded-xl p-6">
          <div className="flex justify-between mb-4">
            <h2 className="font-semibold text-green-800">
              Definisi Atribut Layer
            </h2>
            <button
              type="button"
              onClick={addDefinition}
              className="flex gap-2 bg-green-600 text-white px-4 py-2 rounded-lg"
            >
              <Plus className="w-4 h-4" /> Tambah Atribut
            </button>
          </div>

          <div className="space-y-6">
            {form.definition.map((def, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 relative bg-green-50/40"
              >
                <button
                  type="button"
                  onClick={() => removeDefinition(index)}
                  className="absolute top-3 right-3 text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Key</label>
                    <p className="text-xs text-gray-500 mb-1">
                      Nama field di database (snake_case)
                    </p>
                    <input
                      value={def.key}
                      onChange={(e) =>
                        handleDefinitionChange(index, "key", e.target.value)
                      }
                      className="border rounded px-3 py-2 w-full"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Label</label>
                    <p className="text-xs text-gray-500 mb-1">
                      Nama field yang ditampilkan ke user
                    </p>
                    <input
                      value={def.label}
                      onChange={(e) =>
                        handleDefinitionChange(index, "label", e.target.value)
                      }
                      className="border rounded px-3 py-2 w-full"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Tipe Data</label>
                    <p className="text-xs text-gray-500 mb-1">
                      Tipe Data (String(text) )
                    </p>
                    <select
                      value={def.type}
                      onChange={(e) =>
                        handleDefinitionChange(index, "type", e.target.value)
                      }
                      className="border rounded px-3 py-2 w-full"
                    >
                      <option value="string">String</option>
                      <option value="number">Number</option>
                      <option value="integer">Integer</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Input Type</label>
                    <p className="text-xs text-gray-500 mb-1">
                      Tipe Data (Text/Number/Year)
                    </p>
                    <select
                      value={def.input_type}
                      onChange={(e) =>
                        handleDefinitionChange(
                          index,
                          "input_type",
                          e.target.value,
                        )
                      }
                      className="border rounded px-3 py-2 w-full"
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="select">Select</option>
                      <option value="year">Year</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">
                      Import Alias (SHP)
                    </label>
                    <p className="text-xs text-gray-500 mb-1">
                      Nama kolom pada file SHP (pisahkan dengan koma)
                    </p>
                    <input
                      value={def.import_alias.join(", ")}
                      onChange={(e) =>
                        handleArrayInput(index, "import_alias", e.target.value)
                      }
                      className="border rounded px-3 py-2 w-full"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">Filter Values</label>
                    <p className="text-xs text-gray-500 mb-1">
                      Nilai filter (khusus select)
                    </p>
                    <input
                      value={def.filter_values.join(", ")}
                      onChange={(e) =>
                        handleArrayInput(index, "filter_values", e.target.value)
                      }
                      className="border rounded px-3 py-2 w-full"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SUBMIT */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={updateMutation.isLoading}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl"
          >
            <Save className="w-4 h-4" />
            Simpan Perubahan
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default LayerSchemaUpdatePage;
