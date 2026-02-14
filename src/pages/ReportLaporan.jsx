import React, { useEffect, useMemo, useState } from "react";
import {
  Calendar,
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Laporan Data <span className="text-emerald-600">GIS Spasial</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Monitoring dan tabulasi aset infrastruktur secara real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <Download className="w-4 h-4" /> Export Excel
          </button>
          <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden md:block" />
          <div className="bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
              Total Record
            </p>
            <p className="text-lg font-bold text-emerald-700 leading-none">
              {pagination.totalItem || "-"}
            </p>
          </div>
        </div>
      </div>

      {/* ================= FILTER TOOLBAR ================= */}
      <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-xl shadow-slate-200/40 mb-8">
        <div className="flex items-center gap-2 mb-6 px-1">
          <div className="p-1.5 bg-emerald-600 rounded-lg">
            <Filter className="w-4 h-4 text-white" />
          </div>
          <h2 className="font-black text-slate-800 uppercase text-xs tracking-[0.2em]">
            Penyaringan Data
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {[
            {
              label: "Kategori",
              value: kategori,
              setter: setKategori,
              options: listKategori,
              placeholder: "Semua Kategori",
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
              placeholder: "Tahun Dibuat",
            },
            {
              label: "Thn. Perbaikan",
              value: tahunPerbaikan,
              setter: setTahunPerbaikan,
              options: yearOptions.map((v) => ({ value: v, name: v })),
              placeholder: "Tahun Perbaikan",
            },
          ].map((f, i) => (
            <div key={i} className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                {f.label}
              </label>
              <select
                className="w-full bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none transition-all disabled:opacity-50"
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

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
              Pencarian
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                className="w-full bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-slate-700 outline-none transition-all"
                placeholder="Nama aset..."
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
      <div className="relative bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden transition-all">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-24 space-y-4">
            <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
            <p className="text-slate-400 text-sm font-bold animate-pulse uppercase tracking-widest">
              Sinkronisasi Data...
            </p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center p-20">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Database className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-bold tracking-tight">
              {!kategori
                ? "Silakan tentukan kategori terlebih dahulu"
                : "Data tidak ditemukan dalam kriteria ini"}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900">
                    <th className="px-6 py-4 text-[10px] font-black text-emerald-400 uppercase tracking-widest rounded-tl-[2rem]">
                      No
                    </th>
                    {tableColumns.map((col) => (
                      <th
                        key={col.key}
                        className="px-6 py-4 text-[10px] font-black text-emerald-400 uppercase tracking-widest"
                      >
                        {col.label}
                      </th>
                    ))}
                    <th className="px-6 py-4 text-[10px] font-black text-emerald-400 uppercase tracking-widest text-center rounded-tr-[2rem]">
                      Detail
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {items.map((item, index) => (
                    <tr
                      key={item.id}
                      className="group hover:bg-emerald-50/30 transition-all cursor-default"
                    >
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">
                          {((page - 1) * perPage + index + 1)
                            .toString()
                            .padStart(2, "0")}
                        </span>
                      </td>
                      {tableColumns.map((col) => (
                        <td key={col.key} className="px-6 py-4">
                          <p className="text-sm font-bold text-slate-700 truncate max-w-[200px]">
                            {item[col.key] || item.properties?.[col.key] || "-"}
                          </p>
                        </td>
                      ))}
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setDetailItem(item)}
                          className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-emerald-600 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-100 transition-all active:scale-90"
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
            <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Rows per page:
                </span>
                <select
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                  className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-600 outline-none"
                >
                  {[10, 25, 50].map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-6">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">
                  Page{" "}
                  <span className="text-slate-900">
                    {pagination.currentPage}
                  </span>{" "}
                  / {pagination.totalPage}
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-emerald-50 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-600" />
                  </button>
                  <button
                    disabled={page >= pagination.totalPage}
                    onClick={() => setPage((p) => p + 1)}
                    className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-emerald-50 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ================= DETAIL MODAL ================= */}
      {detailItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[5000] p-4 animate-in fade-in zoom-in duration-200">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full overflow-hidden border border-white">
            {/* Modal Header */}
            <div className="relative h-32 bg-slate-900 p-8 flex items-end">
              <div className="absolute top-6 right-6 flex gap-2">
                <button
                  onClick={() =>
                    window.open(
                      `/map?layerId=${layerId}&featureId=${detailItem.id}`,
                      "_blank",
                    )
                  }
                  className="bg-emerald-500 hover:bg-emerald-600 text-white p-2.5 rounded-2xl shadow-lg transition-transform active:scale-90"
                >
                  <MapIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setDetailItem(null)}
                  className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-2xl backdrop-blur-md transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div>
                <h2 className="text-2xl font-black text-white leading-tight uppercase tracking-tight">
                  {detailItem.name || "Identitas Aset"}
                </h2>
                <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em]">
                  Metadata Details
                </p>
              </div>
            </div>

            <div className="p-8">
              {/* Photos */}
              <div className="mb-8">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                  Dokumentasi Visual
                </h3>
                {attachmentLoading ? (
                  <div className="flex gap-3 animate-pulse">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-24 w-full bg-slate-100 rounded-2xl"
                      />
                    ))}
                  </div>
                ) : hasImages ? (
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {attachmentData.map((file, idx) => (
                      <img
                        key={file.id}
                        src={`${environment.IMAGE_URL}${file.fileUrl}`}
                        className="h-28 w-40 object-cover rounded-2xl border-2 border-slate-50 hover:border-emerald-500 transition-all cursor-zoom-in"
                        alt="asset"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-50 border-2 border-dashed border-slate-100 rounded-2xl p-6 text-center text-slate-400 text-xs font-bold">
                    ( Tidak Ada Foto Lampiran )
                  </div>
                )}
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                {[
                  {
                    label: "Kategori Utama",
                    value: detailItem.category,
                    icon: <Layers className="w-3 h-3" />,
                  },
                  {
                    label: "Sub-Fungsi",
                    value: detailItem.subCategory,
                    icon: <Settings className="w-3 h-3" />,
                  },
                  {
                    label: "Status Kondisi",
                    value: detailItem.condition,
                    isBadge: true,
                  },
                  {
                    label: "Tahun Konstruksi",
                    value: detailItem.yearBuilt,
                    icon: <Calendar className="w-3 h-3" />,
                  },
                ].map((info, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-2">
                      {info.icon} {info.label}
                    </p>
                    {info.isBadge ? (
                      <span
                        className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
                          info.value === "Baik"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {info.value || "N/A"}
                      </span>
                    ) : (
                      <p className="text-sm font-bold text-slate-700">
                        {info.value || "-"}
                      </p>
                    )}
                  </div>
                ))}

                {/* Dinamis Properties */}
                <div className="col-span-2 mt-4 pt-6 border-t border-slate-50 grid grid-cols-2 gap-6">
                  {tableColumns.slice(0, 4).map((col) => (
                    <div key={col.key}>
                      <p className="text-[9px] font-black text-slate-500 uppercase">
                        {col.label}
                      </p>
                      <p className="text-sm font-medium text-slate-600">
                        {detailItem[col.key] ||
                          detailItem.properties?.[col.key] ||
                          "-"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <button
                className="w-full mt-10 bg-slate-900 hover:bg-emerald-600 text-white py-4 rounded-2xl transition-all font-black text-xs uppercase tracking-[0.2em] shadow-xl active:scale-[0.98]"
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
