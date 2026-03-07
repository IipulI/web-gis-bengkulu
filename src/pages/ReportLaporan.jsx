import React, { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Camera,
  ChevronLeft,
  ChevronRight,
  Database,
  Download,
  Eye,
  Filter,
  Layers,
  MapIcon,
  Search,
  Settings,
  X,
} from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { reportService } from "../services/reportService";
import { layerService } from "../services/layerService";
import { attachmentService } from "../services/attachmentService";
import environment from "../config/environment";
import { useParams } from "react-router-dom";

const ReportLaporan = () => {
  const { kategori: kategoriParam } = useParams();

  // --- 1. FILTER STATES ---
  const [search, setSearch] = useState("");
  const [kategori, setKategori] = useState(kategoriParam || "");
  const [subKategori, setSubKategori] = useState("");
  const [kondisi, setKondisi] = useState("");
  const [tahunDibuat, setTahunDibuat] = useState("");
  const [tahunPerbaikan, setTahunPerbaikan] = useState(""); // State baru (Fix Bug)

  // PAGINATION
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(50);
  const [previewIndex, setPreviewIndex] = useState(null);

  // DETAIL MODAL
  const [detailItem, setDetailItem] = useState(null);

  // --- 2. DATA FETCHING ---

  // A. Fetch Kategori (Ringan & Cepat)
  const { data: categoryResponse } = useQuery({
    queryKey: ["report-categories"],
    queryFn: reportService.getCategories,
    staleTime: 1000 * 60 * 5, // Cache 5 menit
  });

  const listKategori = categoryResponse?.data || [];

  // B. Fetch Data Laporan Utama (Tabel)
  const { data, isLoading } = useQuery({
    queryKey: [
      "report-data",
      page,
      perPage,
      kategori,
      subKategori,
      tahunDibuat,
      tahunPerbaikan,
      kondisi,
      search,
    ],
    queryFn: () =>
      reportService.getAll({
        page,
        perPage,
        search,
        kategori,
        subKategori,
        tahunDibuat,
        tahunPerbaikan, // Pastikan service menerima parameter ini
        kondisi,
      }),
    keepPreviousData: true, // UX: Data lama tetap tampil saat loading halaman baru
    enabled: !!kategori,
  });

  const items = data?.data || [];
  const pagination = data?.pagination || {};

  // --- 3. LOGIC UTILITY & OPTIONS ---

  // Opsi Subkategori: Filter dari listKategori berdasarkan kategori yg dipilih
  const subCategoryOptions = useMemo(() => {
    if (!kategori) return [];
    const selected = listKategori.find((cat) => cat.value === kategori);
    return selected?.subCategory || [];
  }, [kategori, listKategori]);

  // Opsi Tahun: Generate dari tahun sekarang mundur ke 1990 (Pengganti allItems)
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= 1990; i--) {
      years.push(i);
    }
    return years;
  }, []);

  // Opsi Kondisi: Hardcode standar (Pengganti allItems)
  const conditionOptions = ["Baik", "Rusak Ringan", "Rusak Berat"];

  // --- 4. DYNAMIC SCHEMA & TABLE COLUMNS ---

  // Ambil layerId dari data item pertama yang muncul di tabel
  const layerId = useMemo(() => {
    if (items && items.length > 0) {
      // Prioritas: Ambil dari data yang sudah di-fetch
      return items[0].layerId || items[0].properties?.layerId;
    }
    return null;
  }, [items]);

  // Fetch Schema hanya jika layerId ditemukan
  const { data: schemaData } = useQuery({
    queryKey: ["schema", layerId],
    enabled: !!layerId,
    queryFn: () => layerService.getOneLayerSchemaReport(layerId),
    staleTime: 1000 * 60 * 10, // Cache schema agar tidak request berulang
  });

  // Generate kolom tabel dari schema
  const tableColumns = useMemo(() => {
    if (!schemaData?.schema?.definition) return [];
    return schemaData.schema.definition.filter(
      (d) => d.is_visible_public !== false,
    );
  }, [schemaData]);

  // --- FETCH ATTACHMENT (HANYA SAAT MODAL TERBUKA) ---
  const { data: attachmentData, isLoading: attachmentLoading } = useQuery({
    queryKey: ["attachment", layerId, detailItem?.id],
    queryFn: () => attachmentService.getAttachment(layerId, detailItem.id),
    enabled: !!detailItem && !!layerId,
    staleTime: 1000 * 60 * 5,
  });

  const hasImages = attachmentData && attachmentData.length > 0;
  const totalImages = attachmentData?.length || 0;

  const nextImage = () => {
    setPreviewIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setPreviewIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
  };

  console.log(attachmentData);
  console.log("detail", detailItem);

  useEffect(() => {
    if (kategoriParam) {
      setKategori(kategoriParam);
    }
  }, [kategoriParam]);

  const isLockedKategori = !!kategoriParam;

  return (
    <DashboardLayout>
      {/* ================= HEADER AREA ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Laporan Data <span className="text-indigo-600">GIS Spasial</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Monitoring dan tabulasi aset infrastruktur secara real-time.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 bg-white border border-slate-200 px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:border-indigo-200 transition-all shadow-sm active:scale-95">
            <Download className="w-4 h-4 text-indigo-600" /> Export Excel
          </button>

          <div className="h-10 w-[1px] bg-slate-200 mx-1 hidden md:block" />

          <div className="bg-amber-50 px-5 py-2.5 rounded-[1.25rem] border border-amber-100 shadow-sm shadow-amber-100/50">
            <p className="text-[9px] font-black text-amber-600 uppercase tracking-[0.2em] mb-0.5">
              Total Record
            </p>
            <p className="text-xl font-black text-amber-700 leading-none">
              {pagination.totalItem || "0"}
            </p>
          </div>
        </div>
      </div>

      {/* ================= FILTER TOOLBAR ================= */}
      <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/30 mb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/40 rounded-full -mr-16 -mt-16" />

        <div className="flex items-center gap-3 mb-8 relative z-10">
          <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
            <Filter className="w-4 h-4 text-white" />
          </div>
          <h2 className="font-black text-slate-900 uppercase text-xs tracking-[0.2em]">
            Penyaringan Data Strategis
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 relative z-10">
          {[
            {
              label: "Kategori",
              value: kategori,
              setter: setKategori,
              options: listKategori,
              placeholder: "Pilih Kategori",
            },
            {
              label: "Subkategori",
              value: subKategori,
              setter: setSubKategori,
              options: subCategoryOptions,
              placeholder: "Semua Sub",
              disabled: !kategori,
            },
            {
              label: "Kondisi",
              value: kondisi,
              setter: setKondisi,
              options: conditionOptions.map((v) => ({ value: v, name: v })),
              placeholder: "Semua Kondisi",
            },
            {
              label: "Thn. Buat",
              value: tahunDibuat,
              setter: setTahunDibuat,
              options: yearOptions.map((v) => ({ value: v, name: v })),
              placeholder: "Semua",
            },
            {
              label: "Thn. Perbaikan",
              value: tahunPerbaikan,
              setter: setTahunPerbaikan,
              options: yearOptions.map((v) => ({ value: v, name: v })),
              placeholder: "Semua",
            },
          ].map((f, i) => (
            <div key={i} className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                {f.label}
              </label>
              <select
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none transition-all disabled:opacity-50 appearance-none cursor-pointer"
                value={f.value}
                disabled={f.disabled || isLockedKategori}
                onChange={(e) => {
                  f.setter(e.target.value);
                  if (f.label === "Kategori") setSubKategori("");
                  setPage(1);
                }}
              >
                <option value="">{f.placeholder}</option>
                {f.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.name}
                  </option>
                ))}
              </select>
            </div>
          ))}

          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Pencarian Spesifik
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl pl-10 pr-4 py-3 text-xs font-bold text-slate-700 outline-none transition-all"
                placeholder="Cari nama aset..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ================= DATA TABLE AREA ================= */}
      <div className="relative bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden transition-all">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-32 space-y-6">
            <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">
              Sinkronisasi Basis Data...
            </p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center p-24">
            <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Database className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="text-slate-900 font-black text-lg uppercase tracking-tight">
              Data Kosong
            </h3>
            <p className="text-slate-400 text-sm font-medium mt-1">
              {!kategori
                ? "Silakan tentukan kategori untuk memuat data"
                : "Tidak ada record yang sesuai dengan kriteria filter"}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900">
                    <th className="px-8 py-5 text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] border-b border-slate-800">
                      No
                    </th>
                    {tableColumns.map((col) => (
                      <th
                        key={col.key}
                        className="px-6 py-5 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] border-b border-slate-800"
                      >
                        {col.label}
                      </th>
                    ))}
                    <th className="px-8 py-5 text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] text-center border-b border-slate-800">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, index) => (
                    <tr
                      key={item.id}
                      className="group hover:bg-indigo-50/40 transition-all duration-300"
                    >
                      <td className="px-8 py-5">
                        <span className="text-[11px] font-mono font-black text-slate-400 bg-slate-50 group-hover:bg-white group-hover:text-indigo-600 px-2.5 py-1 rounded-lg border border-slate-100 transition-all">
                          {((page - 1) * perPage + index + 1)
                            .toString()
                            .padStart(2, "0")}
                        </span>
                      </td>
                      {tableColumns.map((col) => (
                        <td key={col.key} className="px-6 py-5">
                          <p className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors truncate max-w-[200px]">
                            {item[col.key] || item.properties?.[col.key] || "-"}
                          </p>
                        </td>
                      ))}
                      <td className="px-8 py-5 text-center">
                        <button
                          onClick={() => setDetailItem(item)}
                          className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100 transition-all active:scale-90"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION FOOTER */}
            <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Baris Per Halaman:
                </span>
                <select
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-black text-indigo-600 outline-none shadow-sm"
                >
                  {[10, 25, 50].map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-8">
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.1em]">
                  Halaman{" "}
                  <span className="text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg mx-1">
                    {pagination.currentPage}
                  </span>
                  dari{" "}
                  <span className="text-slate-900">{pagination.totalPage}</span>
                </p>
                <div className="flex gap-3">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="p-3 bg-white border border-slate-200 rounded-2xl disabled:opacity-30 hover:bg-white hover:border-indigo-500 hover:text-indigo-600 hover:shadow-lg transition-all active:scale-90"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    disabled={page >= pagination.totalPage}
                    onClick={() => setPage((p) => p + 1)}
                    className="p-3 bg-white border border-slate-200 rounded-2xl disabled:opacity-30 hover:bg-white hover:border-indigo-500 hover:text-indigo-600 hover:shadow-lg transition-all active:scale-90"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ================= DETAIL MODAL (RESIZED) ================= */}
      {detailItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[5000] p-4 animate-in fade-in duration-300">
          {/* max-w-lg membuat modal lebih ramping */}
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300">
            {/* Modal Header - Diperkecil tingginya (h-28) */}
            <div className="relative h-28 bg-slate-900 p-6 flex items-end overflow-hidden">
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-indigo-500/10 rounded-full" />

              <div className="absolute top-4 right-4 flex gap-2 z-20">
                <button
                  onClick={() =>
                    window.open(
                      `/map?layerId=${layerId}&featureId=${detailItem.id}`,
                      "_blank",
                    )
                  }
                  className="bg-amber-500 hover:bg-amber-600 text-slate-900 p-2 rounded-xl shadow-lg transition-transform active:scale-90"
                >
                  <MapIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDetailItem(null)}
                  className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-xl backdrop-blur-md transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="relative z-10">
                <p className="text-amber-400 text-[8px] font-black uppercase tracking-[0.3em] mb-1">
                  Metadata Aset
                </p>
                <h2 className="text-xl font-black text-white leading-none uppercase tracking-tight truncate max-w-[250px]">
                  {detailItem.name || "Detail Objek"}
                </h2>
              </div>
            </div>

            {/* Content Area - Padding dikurangi (p-6) */}
            <div className="p-6">
              {/* Photos Section - Thumbnail lebih mungil */}
              <div className="mb-6">
                <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">
                  Dokumentasi
                </h3>

                {attachmentLoading ? (
                  <div className="flex gap-2 animate-pulse">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-20 w-32 bg-slate-100 rounded-2xl"
                      />
                    ))}
                  </div>
                ) : hasImages ? (
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
                    {attachmentData.map((file) => (
                      <img
                        key={file.id}
                        src={`${environment.IMAGE_URL}${file.fileUrl}`}
                        className="h-20 w-32 object-cover rounded-xl border-2 border-slate-50 hover:border-indigo-500 transition-all snap-center flex-shrink-0"
                        alt="Aset"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl py-4 text-center">
                    <p className="text-slate-400 text-[9px] font-bold uppercase">
                      Tidak Ada Foto
                    </p>
                  </div>
                )}
              </div>

              {/* Info Grid - Spasi antar baris dipersempit */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {[
                  {
                    label: "Kategori",
                    value: detailItem.category,
                    icon: <Layers className="w-3 h-3 text-indigo-500" />,
                  },
                  {
                    label: "Fungsi",
                    value: detailItem.subCategory,
                    icon: <Settings className="w-3 h-3 text-indigo-500" />,
                  },
                  {
                    label: "Kondisi",
                    value: detailItem.condition,
                    isBadge: true,
                  },
                  {
                    label: "Tahun",
                    value: detailItem.yearBuilt,
                    icon: <Calendar className="w-3 h-3 text-indigo-500" />,
                  },
                ].map((info, i) => (
                  <div key={i}>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                      {info.icon} {info.label}
                    </p>
                    {info.isBadge ? (
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider text-white ${
                          info.value === "Baik"
                            ? "bg-emerald-500"
                            : "bg-rose-500"
                        }`}
                      >
                        {info.value || "N/A"}
                      </span>
                    ) : (
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {info.value || "-"}
                      </p>
                    )}
                  </div>
                ))}

                {/* Dinamis Properties - Tampilan lebih ringkas */}
                <div className="col-span-2 mt-2 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                  {tableColumns.slice(0, 4).map((col) => (
                    <div key={col.key}>
                      <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">
                        {col.label}
                      </p>
                      <p className="text-[11px] font-medium text-slate-600 truncate">
                        {detailItem[col.key] ||
                          detailItem.properties?.[col.key] ||
                          "-"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <button
                className="w-full mt-8 bg-indigo-600 hover:bg-slate-900 text-white py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-[0.2em] shadow-lg active:scale-95"
                onClick={() => setDetailItem(null)}
              >
                Tutup Informasi
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ReportLaporan;
