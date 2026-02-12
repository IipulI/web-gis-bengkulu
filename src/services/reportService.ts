import axiosInstance from "../api/axiosInstance";

interface ReportParams {
  page?: number;
  perPage?: number;
  search?: string;
  kondisi?: string;
  tahunDibuat?: number;
  kategori?: string;
  subKategori?: string;
}

export const reportService = {
  async getAll(params: ReportParams = {}) {
    const response = await axiosInstance.get("/report", {
      params: {
        page: params.page,
        size: params.perPage, // ← berubah
        search: params.search,
        condition: params.kondisi,
        yearBuilt: params.tahunDibuat,
        category: params.kategori,
        subCategory: params.subKategori,
      },
    });

    return {
      data: response.data.data,
      pagination: response.data.pagination,
    };
  },

  async getAllForFilter() {
    const response = await axiosInstance.get("/report", {
      params: {
        page: 1,
        size: 9999, // ambil semua data (hanya untuk filter)
      },
    });

    return response.data.data;
  },

  async getCategories() {
    // Sesuaikan path endpoint dengan API Anda
    const response = await axiosInstance.get("/category"); 
    return response.data; 
  },
};
