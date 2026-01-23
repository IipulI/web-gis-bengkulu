import React, { useState } from "react";
import { Filter, Eye, Plus, Pencil } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { layerService } from "../../services/layerService";

const LayerSchemaPage = () => {
  const navigate = useNavigate();

  // ================= FILTER STATES =================
  const [search, setSearch] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [geometryType, setGeometryType] = useState("");

  // ================= PAGINATION =================
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // ================= FETCH DATA =================
  const { data, isLoading } = useQuery({
    queryKey: [
      "layer-schema",
      page,
      perPage,
      search,
      subCategory,
      geometryType,
    ],
    queryFn: () =>
      layerService.getAllLayerSchema({
        page,
        perPage,
        search,
        subCategory,
        geometryType,
      }),
    keepPreviousData: true,
  });

  const items = data?.data || [];
  const pagination = data?.pagination || {};

  // ================= UTIL =================
  const extractUnique = (key) => {
    if (!items) return [];
    return [...new Set(items.map((item) => item[key]).filter(Boolean))];
  };

  return (
    <DashboardLayout>
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-green-800">
          Manajemen Skema Layer
        </h1>

        <button
          onClick={() => navigate("/dashboard/layer-schema/create")}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm shadow"
        >
          <Plus className="w-4 h-4" />
          Tambah Layer Schema
        </button>
      </div>

      {/* ================= FILTER CARD ================= */}
      <div className="bg-white border border-green-200 rounded-xl p-5 shadow-sm mb-8">
        <h2 className="font-semibold text-green-800 mb-4 flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filter Skema Layer
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* SEARCH */}
          <input
            className="border border-green-300 rounded-lg px-3 py-2"
            placeholder="Cari nama layer..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />

          {/* SUB CATEGORY */}
          <select
            className="border border-green-300 rounded-lg px-3 py-2"
            value={subCategory}
            onChange={(e) => {
              setSubCategory(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Sub Kategori</option>
            {extractUnique("subCategory").map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>

          {/* GEOMETRY TYPE */}
          <select
            className="border border-green-300 rounded-lg px-3 py-2"
            value={geometryType}
            onChange={(e) => {
              setGeometryType(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Geometry Type</option>
            {extractUnique("geometryType").map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white border border-green-200 rounded-xl shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-green-50 text-green-800 text-xs uppercase">
            <tr>
              {[
                "No",
                "Nama Layer",
                "Sub Kategori",
                "Geometry",
                "Deskripsi",
                "Aksi",
              ].map((col) => (
                <th key={col} className="px-4 py-3 text-left">
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y">
            {!isLoading &&
              items.map((item, index) => (
                <tr key={item.id} className="hover:bg-green-50/40">
                  <td className="px-4 py-3">
                    {(page - 1) * perPage + index + 1}
                  </td>
                  <td className="px-4 py-3 font-medium text-green-700">
                    {item.name}
                  </td>
                  <td className="px-4 py-3">{item.subCategory}</td>
                  <td className="px-4 py-3">{item.geometryType}</td>
                  <td className="px-4 py-3">{item.description || "-"}</td>
                  <td className="px-4 py-3 flex gap-2 justify-center">
                    <Link
                      to={`/dashboard/layer-schema/${item.id}/update`}
                      className="border border-blue-400 text-blue-600 rounded-lg p-1.5"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <Link
                      to={`/dashboard/layer-schema/${item.id}/detail`}
                      className="border border-green-400 text-green-600 rounded-lg items-center px-2 py-1 hover:bg-green-100"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}

            {isLoading && (
              <tr>
                <td colSpan={6} className="text-center p-6 text-gray-500">
                  Memuat data...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= PER PAGE ================= */}
      <div className="flex items-center gap-3 mt-4">
        <span className="text-sm text-gray-700">Tampilkan:</span>
        <select
          value={perPage}
          onChange={(e) => {
            setPerPage(Number(e.target.value));
            setPage(1);
          }}
          className="border border-green-300 rounded-lg px-3 py-2"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
      </div>

      {/* ================= PAGINATION ================= */}
      <div className="flex justify-between items-center mt-6">
        <p className="text-sm text-gray-600">
          Halaman {pagination.currentPage} dari {pagination.totalPage}
        </p>

        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 border rounded-lg hover:bg-green-50 disabled:opacity-40"
          >
            Prev
          </button>

          <button
            disabled={page === pagination.totalPage}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 border rounded-lg hover:bg-green-50 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LayerSchemaPage;
