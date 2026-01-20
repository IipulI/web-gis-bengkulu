import axiosInstance from "../api/axiosInstance";

export const dashboardService = {
  async getStatistic() {
    const response = await axiosInstance.get(`/feature/statistic`);

    return response.data.data;
  },
};
