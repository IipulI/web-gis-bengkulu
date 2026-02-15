import axiosInstance from "../api/axiosInstance";

export const layerService = {
  // Ambil semua kursus
  async getAll() {
    const response = await axiosInstance.get("/layer");

    return response.data.data;
  },

  async getSpecificLayer(layerId: string) {
    const response = await axiosInstance.get(`/layer/${layerId}/geojson`);

    return response.data;
  },

  async getSpecificLayerDashboard(layerId: string, { page, size }) {
    const response = await axiosInstance.get(`/layer/${layerId}`, {
      params: {
        page,
        size,
      },
    });

    return response.data;
  },
  async createLayer(payload: {
    fileSHP: FormData;
    color: string;
    category: string;
  }) {
    const response = await axiosInstance.post(`/layer/imports`, payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  async updateLayer(
    layerId: string,
    payload: {
      name: string;
    },
  ) {
    return await axiosInstance.put(`/layer/${layerId}`, payload);
  },

  async updateSpatialItem(layerId: string, featureId: string, payload: any) {
    const response = await axiosInstance.put(`/feature/${layerId}/${featureId}`, payload);

    return response.data;
  },

  async deleteLayer(layerId: string) {
    const response = await axiosInstance.delete(`/layer/${layerId}`);
    return response.data;
  },

  async exportData(id: string, format: string) {
    const response = await axiosInstance.get(`/layer/${id}/export`, {
      params: { format },
      responseType: "blob",
    });

    return response.data;
  },
  async getAllLayerSchema() {
    const response = await axiosInstance.get(`/layer-schema`);
    return response.data;
  },
  async createLayerSchema(payload) {
    const response = await axiosInstance.post(`/layer-schema`, payload);
    return response.data;
  },
  async updateLayerSchema(id, payload) {
    const response = await axiosInstance.put(`/layer-schema/${id}`, payload);
    return response.data;
  },

  async getOneLayerSchema(id) {
    const response = await axiosInstance.get(`/layer-schema/${id}`);
    return response.data;
  },

  async getOneLayerSchemaReport(id) {
    const response = await axiosInstance.get(`/layer/${id}`);
    return response.data;
  },

  async updateExistingLayerImport(id, data) {
    const response = await axiosInstance.post(`/layer/${id}/imports`, data);
    return response.data;
  },
};
