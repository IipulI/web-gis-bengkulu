import React, { useMemo, useState } from "react";
import { Eye, Filter } from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { reportService } from "../services/reportService";
import { layerService } from "../services/layerService";

const ReportLaporan = () => {
  // --- 1. FILTER STATES ---
  const [search, setSearch] = useState("");
  const [kategori, setKategori] = useState("");
  const [subKategori, setSubKategori] = useState("");
  const [kondisi, setKondisi] = useState("");
  const [tahunDibuat, setTahunDibuat] = useState("");
  const [tahunPerbaikan, setTahunPerbaikan] = useState(""); // State baru (Fix Bug)

  // PAGINATION
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(50);

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
    enabled: !!kategori
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
      (d) => d.is_visible_public !== false
    );
  }, [schemaData]);


  return (
    <DashboardLayout>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-green-800">Laporan Data GIS</h1>
      </div>

      {/* FILTER CARD */}
      <div className="bg-white border border-green-200 rounded-xl p-5 shadow-sm mb-8">
        <h2 className="font-semibold text-green-800 mb-4 flex items-center gap-2">
          <Filter className="w-4 h-4" /> Filter Data Aset
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {/* SEARCH */}
          <input
            className="border border-green-300 rounded-lg px-3 py-2 focus:ring-green-400 focus:border-green-500"
            placeholder="Cari nama aset..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />

          {/* KATEGORI */}
          <select
            className="border border-green-300 rounded-lg px-3 py-2"
            value={kategori}
            onChange={(e) => {
              setKategori(e.target.value);
              setSubKategori(""); // Reset subkategori
              setPage(1);
            }}
          >
            <option value="">Semua Kategori</option>
            {listKategori.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* SUBKATEGORI */}
          <select
            disabled={!kategori}
            className="border border-green-300 rounded-lg px-3 py-2 disabled:bg-gray-100 disabled:text-gray-400"
            value={subKategori}
            onChange={(e) => {
              setSubKategori(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Semua Subkategori</option>
            {subCategoryOptions.map((sub) => (
              <option key={sub.value} value={sub.value}>
                {sub.name}
              </option>
            ))}
          </select>

          {/* KONDISI */}
          <select
            className="border border-green-300 rounded-lg px-3 py-2"
            value={kondisi}
            onChange={(e) => {
              setKondisi(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Semua Kondisi</option>
            {conditionOptions.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>

          {/* TAHUN DIBUAT */}
          <select
            className="border border-green-300 rounded-lg px-3 py-2"
            value={tahunDibuat}
            onChange={(e) => {
              setTahunDibuat(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Tahun Dibuat</option>
            {yearOptions.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>

          {/* TAHUN PERBAIKAN */}
          <select
            className="border border-green-300 rounded-lg px-3 py-2"
            value={tahunPerbaikan} // FIX: Menggunakan state yang benar
            onChange={(e) => {
              setTahunPerbaikan(e.target.value); // FIX: Setter yang benar
              setPage(1);
            }}
          >
            <option value="">Tahun Perbaikan</option>
            {yearOptions.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      {/* TABLE */}
      {/* Jika belum pilih kategori atau data kosong, tampilkan pesan/loading */}
      {isLoading ? (
         <div className="text-center p-12 bg-white rounded-xl border border-green-200">
            <span className="text-green-600 font-medium">Memuat data...</span>
         </div>
      ) : items.length === 0 ? (
        <div className="text-center text-gray-500 p-8 bg-white rounded-xl border border-green-200">
           {!kategori ? "Silakan pilih kategori untuk menampilkan data" : "Data tidak ditemukan"}
        </div>
      ) : (
        <>
          <div className="bg-white border border-green-200 rounded-xl shadow-sm overflow-x-auto">
            <table className="min-w-max w-full text-sm">
              <thead className="bg-green-50 text-green-800 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">No</th>
                  {/* Render Kolom Dinamis */}
                  {tableColumns.map((col) => (
                    <th key={col.key} className="px-4 py-3 text-left">
                      {col.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {items.map((item, index) => (
                  <tr key={item.id} className="hover:bg-green-50/40 transition-colors">
                    <td className="px-4 py-3">
                      {(page - 1) * perPage + index + 1}
                    </td>

                    {/* Render Data Dinamis Sesuai Kolom */}
                    {tableColumns.map((col) => (
                      <td key={col.key} className="px-4 py-3">
                        {item[col.key] || item.properties?.[col.key] || "-"}
                      </td>
                    ))}

                    <td className="px-4 py-3 text-center">
                      <button
                        className="border border-green-400 text-green-600 rounded-lg px-2 py-1 hover:bg-green-100 transition"
                        onClick={() => setDetailItem(item)}
                        title="Lihat Detail"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* FOOTER: LIMIT & PAGINATION */}
          <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
            
            {/* Limit Per Page */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Tampilkan:</span>
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setPage(1);
                }}
                className="border border-green-300 rounded-lg px-2 py-1 text-sm focus:ring-green-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-600">
                Halaman <span className="font-bold">{pagination.currentPage}</span> dari {pagination.totalPage}
              </p>

              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Prev
                </button>

                <button
                  disabled={page >= pagination.totalPage}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* MODAL */}
      {detailItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-green-100 relative">
            <h2 className="text-xl font-bold text-green-800 mb-4 border-b pb-2">
              {detailItem.name || "Detail Aset"}
            </h2>

            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="col-span-2 md:col-span-1">
                <p className="text-gray-500 text-xs mb-1">Kategori</p>
                <p className="font-semibold">{detailItem.category}</p>
              </div>
              <div className="col-span-2 md:col-span-1">
                <p className="text-gray-500 text-xs mb-1">Subkategori</p>
                <p className="font-semibold">{detailItem.subCategory}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Kondisi</p>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    detailItem.condition === 'Baik' ? 'bg-green-100 text-green-700' : 
                    detailItem.condition?.includes('Rusak') ? 'bg-red-100 text-red-700' : 'bg-gray-100'
                }`}>
                    {detailItem.condition || "-"}
                </span>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Tahun Dibuat</p>
                <p className="font-semibold">{detailItem.yearBuilt || "-"}</p>
              </div>
              
               {/* Render field dinamis di modal juga jika perlu */}
               {tableColumns.slice(0, 4).map(col => (
                  <div key={col.key}>
                      <p className="text-gray-500 text-xs mb-1">{col.label}</p>
                      <p className="font-medium text-gray-800">
                        {detailItem[col.key] || detailItem.properties?.[col.key] || "-"}
                      </p>
                  </div>
               ))}
            </div>

            <button
              className="w-full mt-6 bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 transition font-medium shadow-lg shadow-green-200"
              onClick={() => setDetailItem(null)}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ReportLaporan;
