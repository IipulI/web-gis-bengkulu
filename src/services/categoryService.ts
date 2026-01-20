import axiosInstance from "../api/axiosInstance";

export const categoryService = {
  async getCategory() {
    const response = await axiosInstance.get(`/category`);
    return response.data.data;
  },
  async getSubCategory(category: string) {
    const response = await axiosInstance.get(`/sub-category`, {
      params: category,
    });
    return response.data;
  },
};
