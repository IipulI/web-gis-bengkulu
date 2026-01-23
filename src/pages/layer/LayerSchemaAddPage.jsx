import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import DashboardLayout from "../../layouts/DashboardLayout";
import { layerService } from "../../services/layerService";
import { categoryService } from "../../services/categoryService";

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

  console.log(form.definition);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-green-800 mb-8">
          Tambah Layer Skema
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* BASIC INFO */}
          <div className="bg-white rounded-2xl shadow p-6 grid grid-cols-2 gap-4">
            <select
              name="name"
              value={form.name}
              onChange={handleChange}
              className="border rounded-lg p-2"
              required
            >
              <option value="">Pilih Category</option>
              {categories?.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* SUB CATEGORY */}
            <select
              name="subCategory"
              value={form.subCategory}
              onChange={handleChange}
              className="border rounded-lg p-2"
              required
              disabled={!form.name}
            >
              <option value="">Pilih Sub Category</option>
              {subCategories?.map((s) => (
                <option key={s.value} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>

            <select
              name="geometryType"
              value={form.geometryType}
              onChange={handleChange}
              className="border rounded-lg p-2"
            >
              <option value="POINT">POINT</option>
              <option value="LINE">LINE</option>
              <option value="POLYGON">POLYGON</option>
            </select>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Deskripsi"
              className="border rounded-lg p-2 col-span-2"
            />

            <label className="flex items-center gap-2 col-span-2">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
              />
              Aktif
            </label>
          </div>

          {/* DEFINITION */}
          <div className="space-y-4">
            {form.definition.map((def, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow p-6 space-y-3"
              >
                <div className="grid grid-cols-3 gap-3">
                  <input
                    placeholder="Key"
                    value={def.key}
                    onChange={(e) =>
                      handleDefinitionChange(index, "key", e.target.value)
                    }
                    className="border rounded-lg p-2"
                    required
                  />
                  <input
                    placeholder="Label"
                    value={def.label}
                    onChange={(e) =>
                      handleDefinitionChange(index, "label", e.target.value)
                    }
                    className="border rounded-lg p-2"
                    required
                  />
                  <select
                    value={def.type}
                    onChange={(e) =>
                      handleDefinitionChange(index, "type", e.target.value)
                    }
                    className="border rounded-lg p-2"
                  >
                    <option value="string">string</option>
                    <option value="number">number</option>
                    <option value="integer">integer</option>
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <select
                    value={def.input_type}
                    onChange={(e) =>
                      handleDefinitionChange(
                        index,
                        "input_type",
                        e.target.value,
                      )
                    }
                    className="border rounded-lg p-2"
                  >
                    <option value="text">text</option>
                    <option value="number">number</option>
                    <option value="select">select</option>
                    <option value="year">year</option>
                  </select>
                  <input
                    placeholder="Export Alias"
                    value={def.export_alias}
                    onChange={(e) =>
                      handleDefinitionChange(
                        index,
                        "export_alias",
                        e.target.value,
                      )
                    }
                    className="border rounded-lg p-2"
                  />

                  <input
                    placeholder="Import Alias (pisahkan koma)"
                    onChange={(e) =>
                      handleArrayField(index, "import_alias", e.target.value)
                    }
                    className="border rounded-lg p-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    placeholder="Filter Values (pisahkan koma)"
                    onChange={(e) =>
                      handleArrayField(index, "filter_values", e.target.value)
                    }
                    className="border rounded-lg p-2"
                  />

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={def.strict_options}
                      onChange={(e) =>
                        handleDefinitionChange(
                          index,
                          "strict_options",
                          e.target.checked,
                        )
                      }
                    />
                    Strict Options
                  </label>
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={def.required}
                      onChange={(e) =>
                        handleDefinitionChange(
                          index,
                          "required",
                          e.target.checked,
                        )
                      }
                    />
                    Required
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={def.is_visible_public}
                      onChange={(e) =>
                        handleDefinitionChange(
                          index,
                          "is_visible_public",
                          e.target.checked,
                        )
                      }
                    />
                    Visible Public
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => removeDefinition(index)}
                  className="text-red-600 text-sm"
                >
                  Hapus Field
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addDefinition}
            className="px-4 py-2 rounded-xl bg-green-100 text-green-800"
          >
            + Tambah Field
          </button>

          <div className="pt-6">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-6 py-3 rounded-xl bg-green-700 text-white"
            >
              {mutation.isPending ? "Menyimpan..." : "Simpan Skema"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default LayerSchemaAddPage;
