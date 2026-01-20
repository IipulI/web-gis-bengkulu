import React, { useState } from "react";
import { FileText, Eye, Filter } from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { reportService } from "../services/reportService";
// import reportService from "../services/reportService";

const ReportLaporan = () => {
  // FILTER STATES
  const [search, setSearch] = useState("");
  const [kategori, setKategori] = useState("");
  const [subKategori, setSubKategori] = useState("");
  const [tahunDibuat, setTahunDibuat] = useState("");
  const [kondisi, setKondisi] = useState("");

  // PAGINATION
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(50);

  const { data: allItems } = useQuery({
    queryKey: ["all-report-items"],
    queryFn: reportService.getAllForFilter,
  });

  // FETCH DATA
  const { data, isLoading } = useQuery({
    queryKey: [
      "report-data",
      page,
      perPage,
      kategori,
      subKategori,
      tahunDibuat,
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
        kondisi,
      }),
  });

  const items = data?.data || [];
  const pagination = data?.pagination || {};

  console.log(items);

  // DETAIL MODAL
  const [detailItem, setDetailItem] = useState(null);

  const extractUnique = (key) => {
    if (!allItems) return [];
    return [...new Set(allItems.map((item) => item[key]).filter(Boolean))];
  };

  console.log("detail item", detailItem);

  return (
    <DashboardLayout>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-green-800">Laporan Data GIS</h1>

        {/* <button className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl shadow-md flex items-center gap-2 transition">
          <FileText className="w-4 h-4" /> Unduh Excel
        </button> */}
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
              setPage(1);
            }}
          >
            <option value="">Kategori</option>
            {extractUnique("category").map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>

          {/* SUBKATEGORI */}
          <select
            className="border border-green-300 rounded-lg px-3 py-2"
            value={subKategori}
            onChange={(e) => {
              setSubKategori(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Subkategori</option>
            {extractUnique("subCategory").map((v) => (
              <option key={v}>{v}</option>
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
            <option value="">Kondisi</option>
            {extractUnique("condition").map((v) => (
              <option key={v}>{v}</option>
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
            {extractUnique("yearBuilt").map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>

          {/* TAHUN PERBAIKAN */}
          <select
            className="border border-green-300 rounded-lg px-3 py-2"
            value={tahunDibuat}
            onChange={(e) => {
              setTahunDibuat(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Tahun Perbaikan</option>
            {extractUnique("properties.tahunPerbaikanTerakhir").map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-green-200 rounded-xl shadow-sm overflow-x-auto">
        <table className="min-w-max w-full text-sm">
          <thead className="bg-green-50 text-green-800 text-xs uppercase">
            <tr>
              {[
                "No",
                "Nama",
                "Kategori",
                "Subkategori",
                "Kondisi",
                "Tahun Dibuat",
                "Terakhir Perbaikan",
                "Aksi",
              ].map((col) => (
                <th key={col} className="px-4 py-3">
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
                  <td className="px-4 py-3">{item.category}</td>
                  <td className="px-4 py-3">{item.subCategory}</td>
                  <td className="px-4 py-3">{item.condition || "-"}</td>
                  <td className="px-4 py-3">{item.yearBuilt}</td>
                  <td className="px-4 py-3">
                    {item.properties.tahunPerbaikanTerakhir}
                  </td>

                  <td className="px-4 py-3">
                    <button
                      className="border border-green-400 text-green-600 rounded-lg px-2 py-1 hover:bg-green-100 transition"
                      onClick={() => setDetailItem(item)}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}

            {isLoading && (
              <tr>
                <td colSpan="10" className="text-center p-6 text-gray-500">
                  Memuat data...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <span className="text-sm text-gray-700">Tampilkan:</span>
        <select
          value={perPage}
          onChange={(e) => {
            setPerPage(Number(e.target.value));
            setPage(1); // reset ke halaman 1
          }}
          className="border border-green-300 rounded-lg px-3 py-2"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
      </div>

      {/* PAGINATION */}
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

      {/* MODAL */}
      {detailItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-5 border border-green-300">
            <h2 className="text-xl font-bold text-green-800 mb-3">
              {detailItem.name}
            </h2>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <p>
                <b>Kategori:</b> {detailItem.category}
              </p>
              <p>
                <b>Subkategori:</b> {detailItem.subCategory}
              </p>
              <p>
                <b>Kondisi:</b> {detailItem.condition || "-"}
              </p>
              <p>
                <b>Tahun Dibuat:</b> {detailItem.yearBuilt}
              </p>
              <p>
                <b>Tipe Aset:</b> {detailItem.assetType}
              </p>
            </div>

            <button
              className="w-full mt-4 border border-green-400 py-2 rounded-lg hover:bg-green-100 text-green-700 transition"
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
