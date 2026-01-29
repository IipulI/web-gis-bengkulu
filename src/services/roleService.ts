import axiosInstance from "../api/axiosInstance";

export const roleService = {
  async getAll() {
    const response = await axiosInstance.get(`/role`);
    return response.data.data;
  },
  async createRole(data) {
    const response = await axiosInstance.post(`/role`, data);
    return response.data;
  },
  async updateRole(roleId, data) {
    const response = await axiosInstance.put(`/role/${roleId}`, data);
    return response.data;
  },
  async deleteRole(roleId) {
    const response = await axiosInstance.delete(`/role/${roleId}`);
    return response.data;
  },
};
