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
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Skema <span className="text-amber-500">Layer</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-bold">
            Kelola struktur data dan konfigurasi geometri aset kota.
          </p>
        </div>

        <button
          onClick={() => navigate("/dashboard/layer-schema/create")}
          className="group flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-2xl transition-all shadow-lg shadow-indigo-200 active:scale-95"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          <span className="font-black text-sm uppercase tracking-wide">
            Tambah Skema Baru
          </span>
        </button>
      </div>

      {/* ================= FILTER CARD ================= */}
      <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-7 shadow-sm mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-amber-50 rounded-xl">
            <Filter className="w-5 h-5 text-amber-600" />
          </div>
          <h2 className="font-black text-slate-800 uppercase text-xs tracking-widest">
            Filter Pencarian
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {/* SEARCH */}
          <div className="relative col-span-1 md:col-span-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="w-full bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-amber-500 rounded-2xl pl-11 pr-4 py-3.5 text-sm transition-all outline-none font-medium"
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
            className="bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 rounded-2xl px-4 py-3.5 text-sm outline-none transition-all appearance-none cursor-pointer font-bold text-slate-700"
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
            className="bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 rounded-2xl px-4 py-3.5 text-sm outline-none transition-all appearance-none cursor-pointer font-bold text-slate-700"
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
      <div className="bg-white border border-slate-200/60 rounded-[2rem] shadow-sm overflow-hidden">
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
                    className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]"
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
                    className="hover:bg-indigo-50/30 transition-colors group"
                  >
                    <td className="px-8 py-5 text-slate-400 font-mono text-xs font-bold">
                      {String((page - 1) * perPage + index + 1).padStart(
                        2,
                        "0",
                      )}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-800 text-base group-hover:text-indigo-600 transition-colors">
                          {item.name}
                        </span>
                        <span className="text-slate-400 text-xs mt-0.5 font-medium line-clamp-1">
                          {item.description || "Tidak ada deskripsi"}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight">
                        {item.subCategory}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-2.5 h-2.5 rounded-full shadow-sm ${
                            item.geometryType?.toLowerCase().includes("point")
                              ? "bg-amber-400"
                              : item.geometryType
                                    ?.toLowerCase()
                                    .includes("poly")
                                ? "bg-indigo-500"
                                : "bg-teal-400"
                          }`}
                        />
                        <span className="font-black text-slate-700 uppercase text-[10px] tracking-widest">
                          {item.geometryType}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/dashboard/layer-schema/${item.id}/detail`}
                          className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all shadow-sm border border-transparent hover:border-indigo-100"
                          title="Detail"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                        <Link
                          to={`/dashboard/layer-schema/${item.id}/update`}
                          className="p-2.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-2xl transition-all shadow-sm border border-transparent hover:border-amber-100"
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
          <div className="py-24 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-[5px] border-amber-100 border-t-amber-500 rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
              Sinkronisasi Data...
            </p>
          </div>
        )}

        {/* EMPTY STATE */}
        {!isLoading && items.length === 0 && (
          <div className="py-24 text-center">
            <div className="inline-flex p-4 bg-slate-50 rounded-full mb-4">
              <Search className="w-8 h-8 text-slate-200" />
            </div>
            <p className="text-slate-400 font-black uppercase text-xs tracking-widest">
              Data skema tidak ditemukan.
            </p>
          </div>
        )}
      </div>

      {/* ================= FOOTER CONTROLS ================= */}
      <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-6 pb-12">
        <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl border border-slate-200/60 shadow-sm">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Tampilkan
          </span>
          <select
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value));
              setPage(1);
            }}
            className="bg-transparent font-black text-sm text-amber-600 outline-none cursor-pointer"
          >
            {[10, 25, 50].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-8">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Halaman{" "}
            <span className="text-indigo-600">{pagination.currentPage}</span>{" "}
            dari <span className="text-slate-800">{pagination.totalPage}</span>
          </p>

          <div className="flex gap-3">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-3.5 border border-slate-200 rounded-2xl hover:bg-white hover:shadow-xl hover:border-amber-200 disabled:opacity-30 transition-all bg-white"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <button
              disabled={page === pagination.totalPage}
              onClick={() => setPage((p) => p + 1)}
              className="p-3.5 bg-indigo-600 text-white rounded-2xl hover:bg-amber-500 disabled:bg-slate-200 transition-all shadow-lg shadow-indigo-100 disabled:shadow-none"
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
