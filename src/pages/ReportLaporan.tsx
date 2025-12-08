import React, { useState } from "react";
import { FileText, BarChart3, Calendar, Eye, Filter } from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";

// Dummy data
const datasetDummy = [
  {
    id: 1,
    nomorRegistrasi: "ADM-001",
    nama: "Jaringan Energi",
    kategori: "Jaringan",
    subKategori: "#",
    kondisi: "Baik",
    tahunDibuat: 2022,
    tahunDiperbaiki: 2025,
    gambar: "https://images.pexels.com/photos/267507/pexels-photo-267507.jpeg",
    deskripsi:
      "Data Aset batas wilayah administratif yang digunakan sebagai dasar peta GIS regional.",
  },
  {
    id: 2,
    nomorRegistrasi: "IRG-014",
    nama: "Jaringan air",
    kategori: "Garis",
    subKategori: "#",
    kondisi: "Perlu Pembaruan",
    tahunDibuat: 2023,
    tahunDiperbaiki: 2024,
    gambar:
      "https://images.pexels.com/photos/3791671/pexels-photo-3791671.jpeg",
    deskripsi: "Sebaran titik lokasi Jaringan Air",
  },
  {
    id: 3,
    nomorRegistrasi: "JLN-087",
    nama: "Jaringan Jalan",
    kategori: "Transportasi",
    subKategori: "Infrastruktur",
    kondisi: "Baik",
    tahunDibuat: 2021,
    tahunDiperbaiki: 2023,
    gambar: "https://images.pexels.com/photos/242246/pexels-photo-242246.jpeg",
    deskripsi:
      "Data Aset jaringan jalan utama dan lokal untuk analisis aksesibilitas transportasi.",
  },
  {
    id: 4,
    nomorRegistrasi: "ADM-009",
    nama: "Zona",
    kategori: "Administrasi",
    subKategori: "Demografi",
    kondisi: "Cukup",
    tahunDibuat: 2020,
    tahunDiperbaiki: 2023,
    gambar: "https://images.pexels.com/photos/590021/pexels-photo-590021.jpeg",
    deskripsi:
      "Data Aset kependudukan berdasarkan wilayah RT/RW untuk analisis pelayanan publik.",
  },
  {
    id: 5,
    nomorRegistrasi: "IRG-022",
    nama: "Irigasi",
    kategori: "Irigasi",
    subKategori: "#",
    kondisi: "Baik",
    tahunDibuat: 2022,
    tahunDiperbaiki: 2025,
    gambar: "https://images.pexels.com/photos/236089/pexels-photo-236089.jpeg",
    deskripsi: "Data Aset Irigasi",
  },
  {
    id: 6,
    nomorRegistrasi: "IRG-027",
    nama: "Irigasi",
    kategori: "Irigasi",
    subKategori: "#",
    kondisi: "Perlu Diperbaiki",
    tahunDibuat: 2022,
    tahunDiperbaiki: 2025,
    gambar: "https://images.pexels.com/photos/236089/pexels-photo-236089.jpeg",
    deskripsi: "Data Aset Irigasi",
  },
  {
    id: 7,
    nomorRegistrasi: "IRG-030",
    nama: "Irigasi",
    kategori: "Irigasi",
    subKategori: "#",
    kondisi: "Baik",
    tahunDibuat: 2022,
    tahunDiperbaiki: 2025,
    gambar: "https://images.pexels.com/photos/236089/pexels-photo-236089.jpeg",
    deskripsi: "Data Aset Irigasi",
  },
];

const ReportLaporan = () => {
  const [filterKategori, setFilterKategori] = useState("");
  const [filterSubKategori, setFilterSubKategori] = useState("");
  const [filterTahunDibuat, setFilterTahunDibuat] = useState("");
  const [filterTahunDiperbaiki, setFilterTahunDiperbaiki] = useState("");
  const [filterKondisi, setFilterKondisi] = useState("");
  const [search, setSearch] = useState("");
  const [detailItem, setDetailItem] = useState(null);

  const filteredData = datasetDummy.filter((item) => {
    return (
      (filterKategori === "" || item.kategori === filterKategori) &&
      (filterSubKategori === "" || item.subkategori === filterSubKategori) &&
      (filterTahunDibuat === "" ||
        item.tahunDibuat === Number(filterTahunDibuat)) &&
      (filterTahunDiperbaiki === "" ||
        item.tahunDiperbaiki === Number(filterTahunDiperbaiki)) &&
      (filterKondisi === "" || item.kondisi === filterKondisi) &&
      (search === "" || item.nama.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const kategoriCount = {};
  datasetDummy.forEach((d) => {
    kategoriCount[d.kategori] = (kategoriCount[d.kategori] || 0) + 1;
  });

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-800">
          Laporan Data GIS
        </h1>
        <button className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl shadow flex items-center gap-2">
          <FileText className="w-4 h-4" /> Unduh Excel
        </button>
      </div>

      {/* Summary Cards – auto follow kategori */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        {Object.entries(kategoriCount).map(([kategori, jumlah]) => (
          <div
            key={kategori}
            className="bg-white border rounded-xl p-5 shadow-sm hover:shadow transition"
          >
            <h3 className="font-semibold mb-2">{kategori}</h3>
            <p className="text-3xl font-bold">{jumlah}</p>
            <p className="text-xs text-gray-500 mt-1">Data Aset terdaftar</p>
          </div>
        ))}
      </div> */}

      {/* Filter */}
      <div className="bg-white border rounded-xl p-5 shadow-sm mb-8">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Filter className="w-4 h-4" /> Filter Data Aset
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <input
            className="border rounded-lg px-3 py-2"
            placeholder="Cari nama..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="border rounded-lg px-3 py-2"
            onChange={(e) => setFilterKategori(e.target.value)}
          >
            <option value="">Kategori</option>
            {[...new Set(datasetDummy.map((d) => d.kategori))].map((kat) => (
              <option key={kat} value={kat}>
                {kat}
              </option>
            ))}
          </select>

          <select
            className="border rounded-lg px-3 py-2"
            onChange={(e) => setFilterSubKategori(e.target.value)}
          >
            <option value="">Sub Kategori</option>
            {[...new Set(datasetDummy.map((d) => d.subkategori))].map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>

          <select
            className="border rounded-lg px-3 py-2"
            onChange={(e) => setFilterKondisi(e.target.value)}
          >
            <option value="">Kondisi</option>
            <option value="Baik">Baik</option>
            <option value="Rusak">Rusak</option>
            <option value="Perlu Validasi">Perlu Validasi</option>
          </select>

          <select
            className="border rounded-lg px-3 py-2"
            onChange={(e) => setFilterTahunDibuat(e.target.value)}
          >
            <option value="">Tahun Dibuat</option>
            {[...new Set(datasetDummy.map((d) => d.tahunDibuat))].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            className="border rounded-lg px-3 py-2"
            onChange={(e) => setFilterTahunDiperbaiki(e.target.value)}
          >
            <option value="">Tahun Diperbaiki</option>
            {[...new Set(datasetDummy.map((d) => d.tahunDiperbaiki))].map(
              (t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="bg-white border rounded-xl shadow-sm overflow-x-auto">
        <table className="min-w-max w-full text-sm text-left">
          <thead className="text-xs uppercase bg-gray-50 border-b">
            <tr>
              {[
                "No",
                "Nomor Registrasi",
                "Nama",
                "Kategori",
                "Sub Kategori",
                "Kondisi",
                "Tahun Dibuat",
                "Tahun Diperbaiki",
                "Aksi",
              ].map((col) => (
                <th key={col} className="px-4 py-3 whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y">
            {filteredData.map((item, index) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{index + 1}</td>
                <td className="px-4 py-3">{item.nomorRegistrasi}</td>
                <td className="px-4 py-3 font-medium">{item.nama}</td>
                <td className="px-4 py-3">{item.kategori}</td>
                <td className="px-4 py-3">{item.subKategori}</td>
                <td className="px-4 py-3">{item.kondisi}</td>
                <td className="px-4 py-3">{item.tahunDibuat}</td>
                <td className="px-4 py-3">{item.tahunDiperbaiki}</td>
                <td className="px-4 py-3">
                  <button
                    className="border rounded-lg px-2 py-1 hover:bg-gray-100"
                    onClick={() => setDetailItem(item)}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {detailItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full overflow-hidden">
            <img
              src={detailItem.gambar}
              alt="Preview"
              className="w-full h-56 object-cover"
            />

            <div className="p-5 space-y-3">
              <h3 className="text-xl font-semibold">{detailItem.nama}</h3>
              <p className="text-sm text-gray-600">{detailItem.deskripsi}</p>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <p>
                  <span className="font-medium">Kategori:</span>{" "}
                  {detailItem.kategori}
                </p>
                <p>
                  <span className="font-medium">Subkategori:</span>{" "}
                  {detailItem.subkategori}
                </p>
                <p>
                  <span className="font-medium">Kondisi:</span>{" "}
                  {detailItem.kondisi}
                </p>
                <p>
                  <span className="font-medium">Tahun Dibuat:</span>{" "}
                  {detailItem.tahunDibuat}
                </p>
                <p>
                  <span className="font-medium">Diperbaiki:</span>{" "}
                  {detailItem.tahunDiperbaiki}
                </p>
              </div>

              <button
                className="w-full mt-2 border py-2 rounded-lg hover:bg-gray-100"
                onClick={() => setDetailItem(null)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ReportLaporan;
