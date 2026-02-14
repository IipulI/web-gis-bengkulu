import React, { useState } from "react";
import {
  Filter,
  Eye,
  Plus,
  Pencil,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Skema <span className="text-emerald-600">Layer</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Kelola struktur data dan konfigurasi geometri aset kota.
          </p>
        </div>

        <button
          onClick={() => navigate("/dashboard/layer-schema/create")}
          className="group flex items-center gap-2 bg-slate-900 hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl transition-all shadow-lg active:scale-95"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          <span className="font-bold text-sm">Tambah Skema Baru</span>
        </button>
      </div>

      {/* ================= FILTER CARD ================= */}
      <div className="bg-white/70 backdrop-blur-md border border-slate-100 rounded-3xl p-6 shadow-sm mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <Filter className="w-5 h-5 text-emerald-600" />
          </div>
          <h2 className="font-bold text-slate-700">Filter Pencarian</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {/* SEARCH */}
          <div className="relative col-span-1 md:col-span-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="w-full bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 rounded-2xl pl-11 pr-4 py-3 text-sm transition-all outline-none"
              placeholder="Cari nama layer atau deskripsi..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {/* SUB CATEGORY */}
          <select
            className="bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 rounded-2xl px-4 py-3 text-sm outline-none transition-all appearance-none cursor-pointer"
            value={subCategory}
            onChange={(e) => {
              setSubCategory(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Semua Sub Kategori</option>
            {extractUnique("subCategory").map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>

          {/* GEOMETRY TYPE */}
          <select
            className="bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 rounded-2xl px-4 py-3 text-sm outline-none transition-all appearance-none cursor-pointer"
            value={geometryType}
            onChange={(e) => {
              setGeometryType(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Semua Geometri</option>
            {extractUnique("geometryType").map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ================= TABLE AREA ================= */}
      <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                {[
                  "No",
                  "Informasi Layer",
                  "Sub Kategori",
                  "Geometri",
                  "Aksi",
                ].map((col) => (
                  <th
                    key={col}
                    className="px-6 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {!isLoading &&
                items.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-emerald-50/30 transition-colors group"
                  >
                    <td className="px-6 py-5 text-slate-400 font-mono text-xs">
                      {String((page - 1) * perPage + index + 1).padStart(
                        2,
                        "0",
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-base group-hover:text-emerald-700 transition-colors">
                          {item.name}
                        </span>
                        <span className="text-slate-400 text-xs mt-0.5 line-clamp-1">
                          {item.description || "Tidak ada deskripsi"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[11px] font-bold">
                        {item.subCategory}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            item.geometryType?.toLowerCase().includes("point")
                              ? "bg-amber-400"
                              : item.geometryType
                                    ?.toLowerCase()
                                    .includes("poly")
                                ? "bg-blue-400"
                                : "bg-emerald-400"
                          }`}
                        />
                        <span className="font-semibold text-slate-700 uppercase text-[10px] tracking-wider">
                          {item.geometryType}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/dashboard/layer-schema/${item.id}/detail`}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                          title="Detail"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                        <Link
                          to={`/dashboard/layer-schema/${item.id}/update`}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          title="Edit"
                        >
                          <Pencil className="w-5 h-5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* LOADING STATE */}
        {isLoading && (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              Sinkronisasi Data...
            </p>
          </div>
        )}

        {/* EMPTY STATE */}
        {!isLoading && items.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-slate-400 font-medium">
              Data skema tidak ditemukan.
            </p>
          </div>
        )}
      </div>

      {/* ================= FOOTER CONTROLS ================= */}
      <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-6 pb-12">
        <div className="flex items-center gap-4 bg-white px-5 py-2 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Tampilkan
          </span>
          <select
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value));
              setPage(1);
            }}
            className="bg-transparent font-bold text-sm text-emerald-600 outline-none cursor-pointer"
          >
            {[10, 25, 50].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Halaman{" "}
            <span className="text-slate-800">{pagination.currentPage}</span>{" "}
            dari <span className="text-slate-800">{pagination.totalPage}</span>
          </p>

          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-3 border border-slate-200 rounded-xl hover:bg-white hover:shadow-md disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <button
              disabled={page === pagination.totalPage}
              onClick={() => setPage((p) => p + 1)}
              className="p-3 bg-slate-900 text-white rounded-xl hover:bg-emerald-600 disabled:bg-slate-200 transition-all shadow-lg shadow-slate-200"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LayerSchemaPage;
