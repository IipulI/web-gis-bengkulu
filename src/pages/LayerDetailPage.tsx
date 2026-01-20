/* eslint-disable */

import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash, Upload, X } from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import { layerService } from "../services/layerService";
import { featureService } from "../services/featureService";
import { ImagePlus } from "lucide-react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Polygon,
  useMapEvents,
} from "react-leaflet";
import { attachmentService } from "../services/attachmentService";

const layerTableConfig = {
  Jembatan: [
    {
      key: "name",
      label: "Nama",
      render: (f) => f.name,
      field: "name",
      editable: true,
    },
    {
      key: "lokasi",
      label: "Lokasi",
      render: (f) => f.properties?.lokasi || "-",
      field: "properties.lokasi",
      editable: true,
    },
    {
      key: "fungsi",
      label: "Fungsi Jalan Dihubungkan",
      render: (f) => f.properties?.fungsiJalanDihubungkan || "-",
      field: "properties.fungsiJalanDihubungkan",
      editable: true,
    },
    {
      key: "tahun",
      label: "Tahun Pengadaan",
      align: "center",
      render: (f) => f.properties?.tahunPengadaan || f.yearBuilt || "-",
      field: "properties.tahunPengadaan",
      editable: true,
      type: "number",
    },
    {
      key: "geometry",
      label: "Geometry",
      align: "center",
      render: (f) => (
        <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs">
          {f.geom?.type}
        </span>
      ),
    },
    {
      key: "condition",
      label: "Kondisi",
      render: (f) => f.condition || "-",
      field: "condition",
      editable: true,
    },
    {
      key: "managedBy",
      label: "Pengelola",
      render: (f) => f.managedBy || "-",
      field: "managedBy",
      editable: true,
    },
  ],

  Jalan: [
    {
      key: "nama",
      label: "Nama Jalan",
      render: (f) => f.properties?.nama || f.name || "-",
      field: "properties.nama",
      editable: true,
    },
    {
      key: "fungsi",
      label: "Fungsi",
      render: (f) => f.properties?.fungsi || "-",
      field: "properties.fungsi",
      editable: true,
    },
    {
      key: "nomorRuas",
      label: "No Ruas",
      align: "center",
      render: (f) => f.properties?.nomorRuas || "-",
      field: "properties.nomorRuas",
      editable: true,
    },
    {
      key: "panjang",
      label: "Panjang (m)",
      align: "right",
      render: (f) =>
        typeof f.properties?.panjangJalan === "number"
          ? f.properties.panjangJalan.toFixed(2)
          : "-",
      field: "properties.panjangJalan",
      editable: true,
      type: "number",
    },
    {
      key: "tahun",
      label: "Tahun Pengadaan",
      align: "center",
      render: (f) => f.properties?.tahunPengadaan || f.yearBuilt || "-",
      field: "properties.tahunPengadaan",
      editable: true,
      type: "number",
    },
    {
      key: "geometry",
      label: "Geometry",
      align: "center",
      render: (f) => (
        <span className="px-2 py-1 rounded bg-purple-100 text-purple-700 text-xs">
          {f.geom?.type}
        </span>
      ),
    },
    {
      key: "sumber",
      label: "Sumber Data",
      render: (f) => f.properties?.sumberData || "-",
      field: "properties.sumberData",
      editable: true,
    },
    {
      key: "condition",
      label: "Kondisi",
      render: (f) => f.condition || "-",
      field: "condition",
      editable: true,
    },
  ],

  "Bangunan Gedung": [
    {
      key: "namaBangunan",
      label: "Nama Bangunan",
      render: (f) =>
        f.properties?.namaBangun || f.properties?.NAME || f.name || "-",
      field: "properties.namaBangun",
      editable: true,
    },
    {
      key: "jenis",
      label: "Jenis Bangunan",
      render: (f) => f.properties?.jenisBangu || "-",
      field: "properties.jenisBangu",
      editable: true,
    },
    {
      key: "lokasi",
      label: "Lokasi",
      render: (f) => f.properties?.lokasi || "-",
      field: "properties.lokasi",
      editable: true,
    },
    {
      key: "tahun",
      label: "Tahun",
      align: "center",
      render: (f) =>
        f.properties?.tahunPenga || f.properties?.TAHUN || f.yearBuilt || "-",
      field: "properties.TAHUN",
      editable: true,
      type: "number",
    },
    {
      key: "luas",
      label: "Luas (m²)",
      align: "right",
      render: (f) =>
        typeof f.properties?.luasBangun === "number"
          ? f.properties.luasBangun.toFixed(2)
          : "-",
      field: "properties.luasBangun",
      editable: true,
      type: "number",
    },
    {
      key: "geometry",
      label: "Geometry",
      align: "center",
      render: (f) => (
        <span className="px-2 py-1 rounded bg-red-100 text-red-700 text-xs">
          {f.geom?.type}
        </span>
      ),
    },
    {
      key: "condition",
      label: "Kondisi",
      render: (f) => f.condition || f.properties?.KONDISI || "-",
      field: "condition",
      editable: true,
    },
    {
      key: "managedBy",
      label: "Pengelola",
      render: (f) => f.managedBy || f.properties?.PEMILIK || "-",
      field: "managedBy",
      editable: true,
    },
    {
      key: "sumber",
      label: "Sumber Data",
      render: (f) => f.properties?.SUMBER || f.dataSource || "-",
      field: "properties.SUMBER",
      editable: true,
    },
  ],
  "Air Minum": [
    {
      key: "name",
      label: "Nama Jaringan",
      render: (f) => f.name || "-",
      field: "name",
      editable: true,
    },
    {
      key: "namaObjek",
      label: "Nama Objek",
      render: (f) => f.properties?.NAMOBJ || "-",
      field: "properties.NAMOBJ",
      editable: true,
    },
    {
      key: "jenis",
      label: "Jenis Jaringan",
      render: (f) => f.properties?.JNSRSR || f.assetCode || "-",
      field: "properties.JNSRSR",
      editable: true,
    },
    {
      key: "kota",
      label: "Kota / Kabupaten",
      render: (f) => f.properties?.WADMKK || "-",
      field: "properties.WADMKK",
      editable: true,
    },
    {
      key: "provinsi",
      label: "Provinsi",
      render: (f) => f.properties?.WADMPR || "-",
      field: "properties.WADMPR",
      editable: true,
    },
    {
      key: "tahun",
      label: "Tahun",
      align: "center",
      render: (f) => f.yearBuilt || "-",
      field: "yearBuilt",
      editable: true,
      type: "number",
    },
    {
      key: "geometry",
      label: "Geometry",
      align: "center",
      render: (f) => (
        <span className="px-2 py-1 rounded bg-cyan-100 text-cyan-700 text-xs">
          {f.geom?.type}
        </span>
      ),
    },
    {
      key: "condition",
      label: "Kondisi",
      render: (f) => f.condition || "-",
      field: "condition",
      editable: true,
    },
    {
      key: "managedBy",
      label: "Pengelola",
      render: (f) => f.managedBy || "-",
      field: "managedBy",
      editable: true,
    },
    {
      key: "sumber",
      label: "Sumber Data",
      render: (f) => f.properties?.SBDATA || "-",
      field: "properties.SBDATA",
      editable: true,
    },
  ],
  "Batas Desa": [
    {
      key: "name",
      label: "Nama Batas",
      render: (f) => f.name || "-",
      field: "name",
      editable: true,
    },
    {
      key: "desa",
      label: "Nama Desa",
      render: (f) => f.properties?.NAMDES || "-",
      field: "properties.NAMDES",
      editable: true,
    },
    {
      key: "kecamatan",
      label: "Kecamatan",
      render: (f) => f.properties?.NAMKEC || "-",
      field: "properties.NAMKEC",
      editable: true,
    },
    {
      key: "kabupaten",
      label: "Kabupaten / Kota",
      render: (f) => f.properties?.NAMKAB || "-",
      field: "properties.NAMKAB",
      editable: true,
    },
    {
      key: "provinsi",
      label: "Provinsi",
      render: (f) => f.properties?.NAMPROV || "-",
      field: "properties.NAMPROV",
      editable: true,
    },
    {
      key: "tahun",
      label: "Tahun Penetapan",
      align: "center",
      render: (f) => f.yearBuilt || "-",
      field: "yearBuilt",
      editable: true,
      type: "number",
    },
    {
      key: "geometry",
      label: "Geometry",
      align: "center",
      render: (f) => (
        <span className="px-2 py-1 rounded bg-indigo-100 text-indigo-700 text-xs">
          {f.geom?.type}
        </span>
      ),
    },
    {
      key: "condition",
      label: "Kondisi",
      render: (f) => f.condition || "-",
      field: "condition",
      editable: true,
    },
    {
      key: "managedBy",
      label: "Pengelola",
      render: (f) => f.managedBy || "-",
      field: "managedBy",
      editable: true,
    },
    {
      key: "keterangan",
      label: "Keterangan",
      render: (f) => f.properties?.REMARK || "-",
      field: "properties.REMARK",
      editable: true,
    },
  ],
  Drainase: [
    {
      key: "name",
      label: "Nama Drainase",
      render: (f) => f.name || f.properties?.NAMOBJ || "-",
      field: "name",
      editable: true,
    },
    {
      key: "jenis",
      label: "Jenis Drainase",
      render: (f) => f.properties?.NAMOBJ || "-",
      field: "properties.NAMOBJ",
      editable: true,
    },
    {
      key: "statusJaringan",
      label: "Status Jaringan",
      align: "center",
      render: (f) => {
        const map = {
          1: "Primer",
          2: "Sekunder",
          3: "Tersier",
        };
        return map[f.properties?.STSJRN] || "-";
      },
      field: "properties.STSJRN",
      editable: true,
      type: "number",
    },
    {
      key: "kodeAset",
      label: "Kode Aset",
      align: "center",
      render: (f) => f.assetCode || f.properties?.JNSRSR || "-",
      field: "assetCode",
      editable: true,
    },
    {
      key: "panjang",
      label: "Panjang (derajat)",
      align: "right",
      render: (f) =>
        typeof f.properties?.Shape_Length === "number"
          ? f.properties.Shape_Length.toFixed(4)
          : "-",
    },
    {
      key: "kota",
      label: "Kab/Kota",
      render: (f) => f.properties?.WADMKK || "-",
      field: "properties.WADMKK",
      editable: true,
    },
    {
      key: "provinsi",
      label: "Provinsi",
      render: (f) => f.properties?.WADMPR || "-",
      field: "properties.WADMPR",
      editable: true,
    },
    {
      key: "tahun",
      label: "Tahun Pembangunan",
      align: "center",
      render: (f) => f.yearBuilt || "-",
      field: "yearBuilt",
      editable: true,
      type: "number",
    },
    {
      key: "geometry",
      label: "Geometry",
      align: "center",
      render: (f) => (
        <span className="px-2 py-1 rounded bg-pink-100 text-pink-700 text-xs">
          {f.geom?.type}
        </span>
      ),
    },
    {
      key: "condition",
      label: "Kondisi",
      render: (f) => f.condition || "-",
      field: "condition",
      editable: true,
    },
    {
      key: "managedBy",
      label: "Pengelola",
      render: (f) => f.managedBy || "-",
      field: "managedBy",
      editable: true,
    },
    {
      key: "sumber",
      label: "Sumber Data",
      render: (f) => f.properties?.SBDATA || "-",
      field: "properties.SBDATA",
      editable: true,
    },
    {
      key: "keterangan",
      label: "Keterangan",
      render: (f) => f.properties?.REMARK || "-",
      field: "properties.REMARK",
      editable: true,
    },
  ],
  Energi: [
    {
      key: "name",
      label: "Nama Jaringan",
      render: (f) => f.name || f.properties?.NAMOBJ || "-",
      field: "name",
      editable: true,
    },
    {
      key: "jenis",
      label: "Jenis Energi",
      render: (f) => f.properties?.NAMOBJ || "-",
      field: "properties.NAMOBJ",
      editable: true,
    },
    {
      key: "statusJaringan",
      label: "Status Jaringan",
      align: "center",
      render: (f) => {
        const map = {
          1: "Primer",
          2: "Sekunder",
          3: "Tersier",
        };
        return map[f.properties?.STSJRN] || "-";
      },
      field: "properties.STSJRN",
      editable: true,
      type: "number",
    },
    {
      key: "kodeJaringan",
      label: "Kode Jaringan",
      align: "center",
      render: (f) => f.properties?.JNSRSR || f.assetCode || "-",
      field: "properties.JNSRSR",
      editable: true,
    },
    {
      key: "panjang",
      label: "Panjang (derajat)",
      align: "right",
      render: (f) =>
        typeof f.properties?.Shape_Length === "number"
          ? f.properties.Shape_Length.toFixed(4)
          : "-",
    },
    {
      key: "kota",
      label: "Kab/Kota",
      render: (f) => f.properties?.WADMKK || "-",
      field: "properties.WADMKK",
      editable: true,
    },
    {
      key: "provinsi",
      label: "Provinsi",
      render: (f) => f.properties?.WADMPR || "-",
      field: "properties.WADMPR",
      editable: true,
    },
    {
      key: "tahun",
      label: "Tahun Pembangunan",
      align: "center",
      render: (f) => f.yearBuilt || "-",
      field: "yearBuilt",
      editable: true,
      type: "number",
    },
    {
      key: "geometry",
      label: "Geometry",
      align: "center",
      render: (f) => (
        <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs">
          {f.geom?.type}
        </span>
      ),
    },
    {
      key: "condition",
      label: "Kondisi",
      render: (f) => f.condition || "-",
      field: "condition",
      editable: true,
    },
    {
      key: "managedBy",
      label: "Pengelola",
      render: (f) => f.managedBy || "-",
      field: "managedBy",
      editable: true,
    },
    {
      key: "sumber",
      label: "Sumber Data",
      render: (f) => f.properties?.SBDATA || "-",
      field: "properties.SBDATA",
      editable: true,
    },
    {
      key: "keterangan",
      label: "Keterangan",
      render: (f) => f.properties?.REMARK || "-",
      field: "properties.REMARK",
      editable: true,
    },
  ],
  Persampahan: [
    {
      key: "name",
      label: "Nama Fasilitas",
      render: (f) => f.name || f.properties?.NAMOBJ || "-",
      field: "name",
      editable: true,
    },
    {
      key: "jenis",
      label: "Jenis Persampahan",
      render: (f) => f.properties?.NAMOBJ || "-",
      field: "properties.NAMOBJ",
      editable: true,
    },
    {
      key: "kode",
      label: "Kode Objek",
      align: "center",
      render: (f) => f.properties?.JNSRSR || "-",
      field: "properties.JNSRSR",
      editable: true,
    },
    {
      key: "kota",
      label: "Kab/Kota",
      render: (f) => f.properties?.WADMKK || "-",
      field: "properties.WADMKK",
      editable: true,
    },
    {
      key: "provinsi",
      label: "Provinsi",
      render: (f) => f.properties?.WADMPR || "-",
      field: "properties.WADMPR",
      editable: true,
    },
    {
      key: "tahun",
      label: "Tahun Pembangunan",
      align: "center",
      render: (f) => f.yearBuilt || "-",
      field: "yearBuilt",
      editable: true,
      type: "number",
    },
    {
      key: "geometry",
      label: "Geometry",
      align: "center",
      render: (f) => (
        <span className="px-2 py-1 rounded bg-orange-100 text-orange-700 text-xs">
          {f.geom?.type}
        </span>
      ),
    },
    {
      key: "condition",
      label: "Kondisi",
      render: (f) => f.condition || "-",
      field: "condition",
      editable: true,
    },
    {
      key: "managedBy",
      label: "Pengelola",
      render: (f) => f.managedBy || "-",
      field: "managedBy",
      editable: true,
    },
    {
      key: "sumber",
      label: "Sumber Data",
      render: (f) => f.properties?.SBDATA || "-",
      field: "properties.SBDATA",
      editable: true,
    },
    {
      key: "keterangan",
      label: "Keterangan",
      render: (f) => f.properties?.REMARK || "-",
      field: "properties.REMARK",
      editable: true,
    },
  ],
  "Prasarana Lainnya": [
    {
      key: "name",
      label: "Nama Prasarana",
      render: (f) => f.name || f.properties?.NAMOBJ || "-",
      field: "name",
      editable: true,
    },
    {
      key: "jenis",
      label: "Jenis Prasarana",
      render: (f) => f.properties?.NAMOBJ || "-",
      field: "properties.NAMOBJ",
      editable: true,
    },
    {
      key: "kode",
      label: "Kode Objek",
      align: "center",
      render: (f) => f.properties?.JNSRSR || "-",
      field: "properties.JNSRSR",
      editable: true,
    },
    {
      key: "panjang",
      label: "Panjang (m)",
      align: "right",
      render: (f) =>
        typeof f.properties?.Shape_Length === "number"
          ? (f.properties.Shape_Length * 111_319).toFixed(2)
          : "-",
      field: "properties.Shape_Length",
      editable: false,
    },
    {
      key: "kota",
      label: "Kab/Kota",
      render: (f) => f.properties?.WADMKK || "-",
      field: "properties.WADMKK",
      editable: true,
    },
    {
      key: "provinsi",
      label: "Provinsi",
      render: (f) => f.properties?.WADMPR || "-",
      field: "properties.WADMPR",
      editable: true,
    },
    {
      key: "tahun",
      label: "Tahun Pembangunan",
      align: "center",
      render: (f) => f.yearBuilt || "-",
      field: "yearBuilt",
      editable: true,
      type: "number",
    },
    {
      key: "geometry",
      label: "Geometry",
      align: "center",
      render: (f) => (
        <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-700 text-xs">
          {f.geom?.type}
        </span>
      ),
    },
    {
      key: "condition",
      label: "Kondisi",
      render: (f) => f.condition || "-",
      field: "condition",
      editable: true,
    },
    {
      key: "managedBy",
      label: "Pengelola",
      render: (f) => f.managedBy || "-",
      field: "managedBy",
      editable: true,
    },
    {
      key: "sumber",
      label: "Sumber Data",
      render: (f) => f.properties?.SBDATA || "-",
      field: "properties.SBDATA",
      editable: true,
    },
    {
      key: "keterangan",
      label: "Keterangan",
      render: (f) => f.properties?.REMARK || "-",
      field: "properties.REMARK",
      editable: true,
    },
  ],
  SDA: [
    {
      key: "name",
      label: "Nama SDA",
      render: (f) => f.name || f.properties?.NAMOBJ || "-",
      field: "name",
      editable: true,
    },
    {
      key: "jenis",
      label: "Jenis Jaringan",
      render: (f) => f.properties?.NAMOBJ || "-",
      field: "properties.NAMOBJ",
      editable: true,
    },
    {
      key: "kode",
      label: "Kode Objek",
      align: "center",
      render: (f) => f.properties?.JNSRSR || "-",
      field: "properties.JNSRSR",
      editable: true,
    },
    {
      key: "orde1",
      label: "Orde I",
      align: "center",
      render: (f) => f.properties?.ORDE01 || "-",
      field: "properties.ORDE01",
      editable: true,
    },
    {
      key: "orde2",
      label: "Orde II",
      align: "center",
      render: (f) => f.properties?.ORDE02 || "-",
      field: "properties.ORDE02",
      editable: true,
    },
    {
      key: "panjang",
      label: "Panjang (m)",
      align: "right",
      render: (f) =>
        typeof f.properties?.Shape_Length === "number"
          ? (f.properties.Shape_Length * 111_319).toFixed(2)
          : "-",
      field: "properties.Shape_Length",
      editable: false,
    },
    {
      key: "kota",
      label: "Kab/Kota",
      render: (f) => f.properties?.WADMKK || "-",
      field: "properties.WADMKK",
      editable: true,
    },
    {
      key: "provinsi",
      label: "Provinsi",
      render: (f) => f.properties?.WADMPR || "-",
      field: "properties.WADMPR",
      editable: true,
    },
    {
      key: "tahun",
      label: "Tahun Pembangunan",
      align: "center",
      render: (f) => f.yearBuilt || "-",
      field: "yearBuilt",
      editable: true,
      type: "number",
    },
    {
      key: "geometry",
      label: "Geometry",
      align: "center",
      render: (f) => (
        <span className="px-2 py-1 rounded bg-amber-100 text-amber-700 text-xs">
          {f.geom?.type}
        </span>
      ),
    },
    {
      key: "condition",
      label: "Kondisi",
      render: (f) => f.condition || "-",
      field: "condition",
      editable: true,
    },
    {
      key: "managedBy",
      label: "Pengelola",
      render: (f) => f.managedBy || "-",
      field: "managedBy",
      editable: true,
    },
    {
      key: "sumber",
      label: "Sumber Data",
      render: (f) => f.properties?.SBDATA || "-",
      field: "properties.SBDATA",
      editable: true,
    },
    {
      key: "keterangan",
      label: "Keterangan",
      render: (f) => f.properties?.REMARK || "-",
      field: "properties.REMARK",
      editable: true,
    },
  ],
  Telekomunikasi: [
    {
      key: "name",
      label: "Nama Jaringan",
      render: (f) => f.name || f.properties?.NAMOBJ || "-",
      field: "name",
      editable: true,
    },
    {
      key: "jenis",
      label: "Jenis Telekomunikasi",
      render: (f) => f.properties?.NAMOBJ || "-",
      field: "properties.NAMOBJ",
      editable: true,
    },
    {
      key: "kode",
      label: "Kode Objek",
      align: "center",
      render: (f) => f.properties?.JNSRSR || "-",
      field: "properties.JNSRSR",
      editable: true,
    },
    {
      key: "orde1",
      label: "Orde I",
      align: "center",
      render: (f) => f.properties?.ORDE01 || "-",
      field: "properties.ORDE01",
      editable: true,
    },
    {
      key: "orde2",
      label: "Orde II",
      align: "center",
      render: (f) => f.properties?.ORDE02 || "-",
      field: "properties.ORDE02",
      editable: true,
    },
    {
      key: "panjang",
      label: "Panjang (m)",
      align: "right",
      render: (f) =>
        typeof f.properties?.Shape_Length === "number"
          ? (f.properties.Shape_Length * 111_319).toFixed(2)
          : "-",
      editable: false,
    },
    {
      key: "kota",
      label: "Kab/Kota",
      render: (f) => f.properties?.WADMKK || "-",
      field: "properties.WADMKK",
      editable: true,
    },
    {
      key: "provinsi",
      label: "Provinsi",
      render: (f) => f.properties?.WADMPR || "-",
      field: "properties.WADMPR",
      editable: true,
    },
    {
      key: "tahun",
      label: "Tahun Pembangunan",
      align: "center",
      render: (f) => f.yearBuilt || "-",
      field: "yearBuilt",
      editable: true,
      type: "number",
    },
    {
      key: "geometry",
      label: "Geometry",
      align: "center",
      render: (f) => (
        <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-700 text-xs">
          {f.geom?.type}
        </span>
      ),
    },
    {
      key: "condition",
      label: "Kondisi",
      render: (f) => f.condition || "-",
      field: "condition",
      editable: true,
    },
    {
      key: "managedBy",
      label: "Pengelola",
      render: (f) => f.managedBy || "-",
      field: "managedBy",
      editable: true,
    },
    {
      key: "sumber",
      label: "Sumber Data",
      render: (f) => f.properties?.SBDATA || "-",
      field: "properties.SBDATA",
      editable: true,
    },
    {
      key: "keterangan",
      label: "Keterangan",
      render: (f) => f.properties?.REMARK || "-",
      field: "properties.REMARK",
      editable: true,
    },
  ],
  "Pusat Pelayanan": [
    {
      key: "name",
      label: "Nama Pusat Pelayanan",
      render: (f) => f.name || f.properties?.NAMOBJ || "-",
      field: "name",
      editable: true,
    },
    {
      key: "jenis",
      label: "Jenis Pusat",
      render: (f) => f.properties?.NAMOBJ || "-",
      field: "properties.NAMOBJ",
      editable: true,
    },
    {
      key: "kode",
      label: "Kode Objek",
      align: "center",
      render: (f) => f.properties?.JNSRSR || "-",
      field: "properties.JNSRSR",
      editable: true,
    },
    {
      key: "orde1",
      label: "Orde I",
      align: "center",
      render: (f) => f.properties?.ORDE01 || "-",
      field: "properties.ORDE01",
      editable: true,
    },
    {
      key: "orde2",
      label: "Orde II",
      align: "center",
      render: (f) => f.properties?.ORDE02 || "-",
      field: "properties.ORDE02",
      editable: true,
    },
    {
      key: "status",
      label: "Status Jaringan",
      align: "center",
      render: (f) => f.properties?.STSJRN ?? "-",
      field: "properties.STSJRN",
      editable: true,
      type: "number",
    },
    {
      key: "kota",
      label: "Kab / Kota",
      render: (f) => f.properties?.WADMKK || "-",
      field: "properties.WADMKK",
      editable: true,
    },
    {
      key: "provinsi",
      label: "Provinsi",
      render: (f) => f.properties?.WADMPR || "-",
      field: "properties.WADMPR",
      editable: true,
    },
    {
      key: "geometry",
      label: "Geometry",
      align: "center",
      render: (f) => (
        <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs">
          {f.geom?.type}
        </span>
      ),
    },
    {
      key: "tahun",
      label: "Tahun Penetapan",
      align: "center",
      render: (f) => f.yearBuilt || "-",
      field: "yearBuilt",
      editable: true,
      type: "number",
    },
    {
      key: "condition",
      label: "Kondisi",
      render: (f) => f.condition || "-",
      field: "condition",
      editable: true,
    },
    {
      key: "managedBy",
      label: "Pengelola",
      render: (f) => f.managedBy || "-",
      field: "managedBy",
      editable: true,
    },
    {
      key: "sumber",
      label: "Sumber Data",
      render: (f) => f.properties?.SBDATA || "-",
      field: "properties.SBDATA",
      editable: true,
    },
    {
      key: "keterangan",
      label: "Keterangan",
      render: (f) => f.properties?.REMARK || "-",
      field: "properties.REMARK",
      editable: true,
    },
  ],
  Transportasi: [
    {
      key: "name",
      label: "Nama Jalan",
      render: (f) => f.name || f.properties?.NAMOBJ || "-",
      field: "name",
      editable: true,
    },
    {
      key: "jenis",
      label: "Jenis Jalan",
      render: (f) => f.properties?.NAMOBJ || "-",
      field: "properties.NAMOBJ",
      editable: true,
    },
    {
      key: "kode",
      label: "Kode Objek",
      align: "center",
      render: (f) => f.properties?.JNSRSR || "-",
      field: "properties.JNSRSR",
      editable: true,
    },
    {
      key: "orde1",
      label: "Orde I",
      align: "center",
      render: (f) => f.properties?.ORDE01 || "-",
      field: "properties.ORDE01",
      editable: true,
    },
    {
      key: "orde2",
      label: "Orde II",
      align: "center",
      render: (f) => f.properties?.ORDE02 || "-",
      field: "properties.ORDE02",
      editable: true,
    },
    {
      key: "status",
      label: "Status Jalan",
      align: "center",
      render: (f) => f.properties?.STSJRN ?? "-",
      field: "properties.STSJRN",
      editable: true,
      type: "number",
    },
    {
      key: "keterangan",
      label: "Nama / Keterangan",
      render: (f) => f.properties?.REMARK || "-",
      field: "properties.REMARK",
      editable: true,
    },
    {
      key: "kota",
      label: "Kab / Kota",
      render: (f) => f.properties?.WADMKK || "-",
      field: "properties.WADMKK",
      editable: true,
    },
    {
      key: "provinsi",
      label: "Provinsi",
      render: (f) => f.properties?.WADMPR || "-",
      field: "properties.WADMPR",
      editable: true,
    },
    {
      key: "panjang",
      label: "Panjang (derajat)",
      align: "right",
      render: (f) =>
        f.properties?.Shape_Length ? f.properties.Shape_Length.toFixed(6) : "-",
    },
    {
      key: "geometry",
      label: "Geometry",
      align: "center",
      render: (f) => (
        <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-700 text-xs">
          {f.geom?.type}
        </span>
      ),
    },
    {
      key: "tahun",
      label: "Tahun",
      align: "center",
      render: (f) => f.yearBuilt || "-",
      field: "yearBuilt",
      editable: true,
      type: "number",
    },
    {
      key: "condition",
      label: "Kondisi",
      render: (f) => f.condition || "-",
      field: "condition",
      editable: true,
    },
    {
      key: "managedBy",
      label: "Pengelola",
      render: (f) => f.managedBy || "-",
      field: "managedBy",
      editable: true,
    },
    {
      key: "sumber",
      label: "Sumber Data",
      render: (f) => f.properties?.SBDATA || "-",
      field: "properties.SBDATA",
      editable: true,
    },
  ],
  Zona: [
    {
      key: "nama",
      label: "Nama Zona",
      render: (f) => f.name || f.properties?.NAMOBJ || "-",
      field: "name",
      editable: true,
    },
    {
      key: "jenis",
      label: "Jenis Zona",
      render: (f) => f.properties?.NAMOBJ || "-",
      field: "properties.NAMOBJ",
      editable: true,
    },
    {
      key: "kodeZona",
      label: "Kode Zona",
      align: "center",
      render: (f) => f.properties?.KODZON || "-",
      field: "properties.KODZON",
      editable: true,
    },
    {
      key: "kodeSubZona",
      label: "Kode Sub Zona",
      align: "center",
      render: (f) => f.properties?.KODSZN || "-",
      field: "properties.KODSZN",
      editable: true,
    },
    {
      key: "blok",
      label: "Blok",
      align: "center",
      render: (f) => f.properties?.KODBLK || "-",
      field: "properties.KODBLK",
      editable: true,
    },
    {
      key: "wilayahPerencanaan",
      label: "WP",
      align: "center",
      render: (f) => f.properties?.KODEWP || "-",
      field: "properties.KODEWP",
      editable: true,
    },
    {
      key: "swp",
      label: "SWP",
      align: "center",
      render: (f) => f.properties?.KODSWP || "-",
      field: "properties.KODSWP",
      editable: true,
    },
    {
      key: "kecamatan",
      label: "Kecamatan",
      render: (f) => f.properties?.WADMKC || "-",
      field: "properties.WADMKC",
      editable: true,
    },
    {
      key: "kelurahan",
      label: "Kelurahan",
      render: (f) => f.properties?.WADMKD || "-",
      field: "properties.WADMKD",
      editable: true,
    },
    {
      key: "kota",
      label: "Kota",
      render: (f) => f.properties?.WADMKK || "-",
      field: "properties.WADMKK",
      editable: true,
    },
    {
      key: "provinsi",
      label: "Provinsi",
      render: (f) => f.properties?.WADMPR || "-",
      field: "properties.WADMPR",
      editable: true,
    },
    {
      key: "luas",
      label: "Luas (Ha)",
      align: "right",
      render: (f) =>
        f.properties?.LUASHA ? Number(f.properties.LUASHA).toFixed(4) : "-",
    },
    {
      key: "area",
      label: "Shape Area",
      align: "right",
      render: (f) =>
        f.properties?.Shape_Area
          ? f.properties.Shape_Area.toExponential(3)
          : "-",
    },
    {
      key: "perimeter",
      label: "Shape Length",
      align: "right",
      render: (f) =>
        f.properties?.Shape_Length ? f.properties.Shape_Length.toFixed(6) : "-",
    },
    {
      key: "keterangan",
      label: "Keterangan",
      render: (f) => f.properties?.REMARK || "-",
      field: "properties.REMARK",
      editable: true,
    },
    {
      key: "geometry",
      label: "Geometry",
      align: "center",
      render: (f) => (
        <span className="px-2 py-1 rounded bg-slate-100 text-slate-700 text-xs">
          {f.geom?.type}
        </span>
      ),
    },
  ],
};

const layerSearchConfig = {
  Jembatan: (f, keyword) =>
    [
      f.name,
      f.properties?.lokasi,
      f.properties?.fungsiJalanDihubungkan,
      f.properties?.tahunPengadaan,
    ]
      .join(" ")
      .toLowerCase()
      .includes(keyword),

  Jalan: (f, keyword) =>
    [
      f.name,
      f.properties?.nama,
      f.properties?.fungsi,
      f.properties?.nomorRuas,
      f.properties?.sumberData,
      f.properties?.tahunPengadaan,
    ]
      .join(" ")
      .toLowerCase()
      .includes(keyword),

  "Bangunan Gedung": (f, keyword) =>
    [
      f.name,
      f.properties?.namaBangun,
      f.properties?.jenisBangu,
      f.properties?.SUMBER,
      f.properties?.TAHUN,
      f.managedBy,
    ]
      .join(" ")
      .toLowerCase()
      .includes(keyword),

  "Air Minum": (f, keyword) =>
    [
      f.name,
      f.properties?.NAMOBJ,
      f.properties?.JNSRSR,
      f.properties?.WADMKK,
      f.properties?.WADMPR,
      f.properties?.SBDATA,
      f.condition,
      f.managedBy,
      f.yearBuilt,
    ]
      .join(" ")
      .toLowerCase()
      .includes(keyword),
  "Batas Desa": (f, keyword) =>
    [
      f.name,
      f.properties?.NAMDES,
      f.properties?.NAMKEC,
      f.properties?.NAMKAB,
      f.properties?.NAMPROV,
      f.properties?.REMARK,
      f.condition,
      f.managedBy,
      f.yearBuilt,
    ]
      .join(" ")
      .toLowerCase()
      .includes(keyword),
  Drainase: (f, keyword) =>
    [
      f.name,
      f.properties?.NAMOBJ,
      f.properties?.REMARK,
      f.properties?.SBDATA,
      f.properties?.WADMKK,
      f.properties?.WADMPR,
      f.assetCode,
      f.condition,
      f.managedBy,
      f.yearBuilt,
    ]
      .join(" ")
      .toLowerCase()
      .includes(keyword),
  Energi: (f, keyword) =>
    [
      f.name,
      f.properties?.NAMOBJ,
      f.properties?.REMARK,
      f.properties?.SBDATA,
      f.properties?.WADMKK,
      f.properties?.WADMPR,
      f.properties?.JNSRSR,
      f.assetCode,
      f.condition,
      f.managedBy,
      f.yearBuilt,
    ]
      .join(" ")
      .toLowerCase()
      .includes(keyword),

  Persampahan: (f, keyword) =>
    [
      f.name,
      f.properties?.NAMOBJ,
      f.properties?.REMARK,
      f.properties?.SBDATA,
      f.properties?.WADMKK,
      f.properties?.WADMPR,
      f.properties?.JNSRSR,
      f.condition,
      f.managedBy,
      f.yearBuilt,
    ]
      .join(" ")
      .toLowerCase()
      .includes(keyword),

  "Prasarana Lainnya": (f, keyword) =>
    [
      f.name,
      f.properties?.NAMOBJ,
      f.properties?.REMARK,
      f.properties?.SBDATA,
      f.properties?.WADMKK,
      f.properties?.WADMPR,
      f.properties?.JNSRSR,
      f.condition,
      f.managedBy,
      f.yearBuilt,
    ]
      .join(" ")
      .toLowerCase()
      .includes(keyword),

  SDA: (f, keyword) =>
    [
      f.name,
      f.properties?.NAMOBJ,
      f.properties?.REMARK,
      f.properties?.SBDATA,
      f.properties?.WADMKK,
      f.properties?.WADMPR,
      f.properties?.JNSRSR,
      f.properties?.ORDE01,
      f.properties?.ORDE02,
      f.condition,
      f.managedBy,
      f.yearBuilt,
    ]
      .join(" ")
      .toLowerCase()
      .includes(keyword),

  Telekomunikasi: (f, keyword) =>
    [
      f.name,
      f.properties?.NAMOBJ,
      f.properties?.REMARK,
      f.properties?.SBDATA,
      f.properties?.WADMKK,
      f.properties?.WADMPR,
      f.properties?.JNSRSR,
      f.properties?.ORDE01,
      f.properties?.ORDE02,
      f.condition,
      f.managedBy,
      f.yearBuilt,
    ]
      .join(" ")
      .toLowerCase()
      .includes(keyword),
  "Pusat Pelayanan": (f, keyword) =>
    [
      f.name,
      f.properties?.NAMOBJ,
      f.properties?.REMARK,
      f.properties?.SBDATA,
      f.properties?.WADMKK,
      f.properties?.WADMPR,
      f.properties?.JNSRSR,
      f.properties?.ORDE01,
      f.properties?.ORDE02,
      f.properties?.STSJRN,
      f.condition,
      f.managedBy,
    ]
      .join(" ")
      .toLowerCase()
      .includes(keyword),

  Transportasi: (f, keyword) =>
    [
      f.name,
      f.properties?.NAMOBJ,
      f.properties?.REMARK,
      f.properties?.SBDATA,
      f.properties?.WADMKK,
      f.properties?.WADMPR,
      f.properties?.JNSRSR,
      f.properties?.ORDE01,
      f.properties?.ORDE02,
      f.properties?.STSJRN,
      f.condition,
      f.managedBy,
    ]
      .join(" ")
      .toLowerCase()
      .includes(keyword),

  Zona: (f, keyword) =>
    [
      f.name,
      f.properties?.NAMOBJ,
      f.properties?.KODZON,
      f.properties?.KODSZN,
      f.properties?.KODBLK,
      f.properties?.KODEWP,
      f.properties?.KODSWP,
      f.properties?.WADMKC,
      f.properties?.WADMKD,
      f.properties?.WADMKK,
      f.properties?.WADMPR,
      f.properties?.REMARK,
    ]
      .join(" ")
      .toLowerCase()
      .includes(keyword),
};

const getValueByPath = (obj, path) =>
  path.split(".").reduce((o, k) => o?.[k], obj);

const setValueByPath = (obj, path, value) => {
  const keys = path.split(".");
  const last = keys.pop();
  const target = keys.reduce((o, k) => (o[k] ??= {}), obj);
  target[last] = value;
};

const getExportFilename = (layerName, format) => {
  const safeName = layerName?.replace(/\s+/g, "_").toLowerCase() || "layer";

  switch (format) {
    case "shp":
      return `${safeName}.zip`;
    case "geojson":
      return `${safeName}.geojson`;
    case "kml":
      return `${safeName}.kml`;
    default:
      return `${safeName}`;
  }
};

const LayerDetailPage = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const location = useLocation();

  const layerName = location.state;

  const [isOpenAddModal, setIsOpenAddModal] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedFeatureId, setSelectedFeatureId] = useState(null);
  const [geomType, setGeomType] = useState("Point");
  const [coordinates, setCoordinates] = useState([]);
  const [editForm, setEditForm] = useState({});
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadFeatureId, setUploadFeatureId] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);

  const [search, setSearch] = useState("");

  const { data: layer, isLoading: loadingLayer } = useQuery({
    queryKey: ["layer", id],
    queryFn: () => layerService.getSpecificLayer(id),
  });

  const { data: detailLayer } = useQuery({
    queryKey: ["details-layer", id, page, size],
    queryFn: () => layerService.getSpecificLayerDashboard(id, page, size),
  });

  const features = detailLayer?.data?.spatialItem || [];
  const pagination = detailLayer?.pagination;

  const { data: selectedFeature, isLoading: featureLoading } = useQuery({
    queryKey: ["feature", id, selectedFeatureId],
    queryFn: () => featureService.getOne(id, selectedFeatureId),
    enabled: !!selectedFeatureId,
  });

  const layerKey = layerName;
  const columns = layerTableConfig[layerKey] || [];

  useEffect(() => {
    if (selectedFeature) {
      setEditForm(structuredClone(selectedFeature));
    }
  }, [selectedFeature]);

  // ADD NEW FEATURE
  const addMutation = useMutation({
    mutationFn: (payload) => featureService.createDetail(layer.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["details-layer", id] });
      setIsOpenAddModal(false);
      setCoordinates([]);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => featureService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["details-layer", id] });
      setEditModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (fid) => featureService.delete(id, fid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["details-layer", id] });
    },
  });

  const uploadAttachmentMutation = useMutation({
    mutationFn: ({ layerId, featureId, file }) => {
      const formData = new FormData();
      formData.append("file", file);

      return attachmentService.addAttachment(layerId, featureId, formData);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["details-layer", id] });
      setUploadModalOpen(false);
      setImageFile(null);
      setUploadFeatureId(null);
    },
  });

  const handleExport = async (format) => {
    const res = await layerService.exportData(id, format);

    const blob = new Blob([res.data]);
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = getExportFilename(layer?.name, format);
    a.click();

    window.URL.revokeObjectURL(url);
  };

  if (loadingLayer) return <p>Loading...</p>;

  const keyword = search.toLowerCase();

  const filteredFeatures = !search
    ? features
    : layerSearchConfig[layerKey]
    ? features.filter((f) => layerSearchConfig[layerKey](f, keyword))
    : features;

  console.log("selected", selectedFeature);

  return (
    <DashboardLayout>
      {/* HEADER */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Detail Layer: {layer?.name}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage fitur dan geometry dari layer ini.
          </p>
        </div>

        <div className="relative group">
          <button className="bg-green-600 hover:bg-green-700 transition text-white px-5 py-2.5 rounded-lg shadow flex items-center gap-2">
            <Upload className="w-4 h-4" /> Export Data
          </button>

          <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition pointer-events-none group-hover:pointer-events-auto z-50">
            <button
              onClick={() => handleExport("shp")}
              className="w-full px-4 py-2 text-sm hover:bg-gray-100 text-left"
            >
              Export SHP
            </button>
            <button
              onClick={() => handleExport("geojson")}
              className="w-full px-4 py-2 text-sm hover:bg-gray-100 text-left"
            >
              Export GeoJSON
            </button>
            <button
              onClick={() => handleExport("kml")}
              className="w-full px-4 py-2 text-sm hover:bg-gray-100 text-left"
            >
              Export KML
            </button>
          </div>
        </div>
      </div>

      {/* CARD LIST */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="font-semibold text-gray-700 mb-4">List Data</h2>

        {features.length === 0 ? (
          <p className="text-gray-500 text-sm">Belum ada data.</p>
        ) : (
          <div className="overflow-x-auto">
            <div className="flex justify-between items-center mb-3">
              <input
                type="text"
                placeholder={`Cari ${layer?.name || "data"}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />

              <span className="text-xs text-gray-500">
                {filteredFeatures.length} data
              </span>
            </div>

            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-100 text-xs text-gray-600 uppercase">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={`p-3 border text-${col.align || "left"}`}
                    >
                      {col.label}
                    </th>
                  ))}
                  <th className="p-3 border text-center">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {filteredFeatures.map((f) => (
                  <tr
                    key={f.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`p-3 border text-${col.align || "left"}`}
                      >
                        {col.render ? col.render(f) : "-"}
                      </td>
                    ))}

                    <td className="p-3 border text-center">
                      <div className="flex justify-center gap-3">
                        <Pencil
                          onClick={() => {
                            setSelectedFeatureId(f.id);
                            setEditModalOpen(true);
                          }}
                          className="w-4 h-4 cursor-pointer text-blue-600 hover:text-blue-800"
                        />

                        <ImagePlus
                          onClick={() => {
                            setUploadFeatureId(f.id);
                            setUploadModalOpen(true);
                          }}
                          className="w-4 h-4 cursor-pointer text-green-600 hover:text-green-800"
                          title="Upload Gambar"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {pagination && (
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-gray-500">
              Menampilkan{" "}
              {(pagination.currentPage - 1) * pagination.perPage + 1}–
              {Math.min(
                pagination.currentPage * pagination.perPage,
                pagination.totalItems
              )}{" "}
              dari {pagination.totalItems} data
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={pagination.currentPage === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 border rounded-lg text-sm disabled:opacity-40"
              >
                Prev
              </button>

              <span className="text-sm font-medium">
                Page {pagination.currentPage} / {pagination.totalPage}
              </span>

              <button
                disabled={pagination.currentPage === pagination.totalPage}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 border rounded-lg text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
      {/* EDIT MODAL (placeholder) */}
      {editModalOpen && selectedFeature && !featureLoading && (
        <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-xl shadow-lg p-6 relative">
            <button
              onClick={() => setEditModalOpen(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-black"
            >
              <X />
            </button>

            <h2 className="text-xl font-semibold mb-4">
              Edit Feature: {selectedFeature.name}
            </h2>

            {/* Tempat form edit */}

            <form
              onSubmit={(e) => {
                e.preventDefault();

                updateMutation.mutate({
                  id: selectedFeature.id,
                  data: editForm,
                });
              }}
              className="grid grid-cols-2 gap-4"
            >
              {columns
                .filter((c) => c.editable)
                .map((col) => {
                  const value = getValueByPath(editForm, col.field);

                  return (
                    <div key={col.key} className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-600">
                        {col.label}
                      </label>

                      <input
                        type={col.type || "text"}
                        value={value ?? ""}
                        onChange={(e) => {
                          const updated = structuredClone(editForm);
                          setValueByPath(updated, col.field, e.target.value);
                          setEditForm(updated);
                        }}
                        className="border px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  );
                })}

              <div className="col-span-2 flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 text-sm border rounded-lg"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {uploadModalOpen && uploadFeatureId && (
        <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6 relative">
            <button
              onClick={() => setUploadModalOpen(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-black"
            >
              <X />
            </button>

            <h2 className="text-lg font-semibold mb-4">Upload Gambar</h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();

                if (!imageFile) return;

                uploadAttachmentMutation.mutate({
                  layerId: id,
                  featureId: uploadFeatureId,
                  file: imageFile,
                });
              }}
              className="flex flex-col gap-4"
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="border px-3 py-2 rounded-lg text-sm"
                required
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 text-sm border rounded-lg"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={uploadAttachmentMutation.isLoading}
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg disabled:opacity-50"
                >
                  {uploadAttachmentMutation.isLoading
                    ? "Mengunggah..."
                    : "Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default LayerDetailPage;
