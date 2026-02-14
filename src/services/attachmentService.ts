import axiosInstance from "../api/axiosInstance";

export const attachmentService = {
  async addAttachment(layerId: string, featureId: string, formData: FormData) {
    const response = await axiosInstance.post(
      `/attachment/${layerId}/${featureId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  },

  async getAttachment(layerId: string, featureId: string) {
    const response = await axiosInstance.get(
      `/attachment/${layerId}/${featureId}`,
    );

    return response.data.data;
  },
};
