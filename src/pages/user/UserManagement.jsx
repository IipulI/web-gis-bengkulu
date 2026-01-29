import React, { useState } from "react";
import { Eye, Users, Plus, X, Pencil, Trash, KeyRound } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import DashboardLayout from "../../layouts/DashboardLayout";
import { userService } from "../../services/userService";
import { toast } from "sonner";
import Modal from "../../components/Modal";
import ModalFooter from "../../components/ModalFooter";
import Input from "../../components/Input";
const UserManagement = () => {
  // ================= FILTER =================
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");

  // ================= MODAL =================
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openResetPassword, setOpenResetPassword] = useState(false);

  // ================= SELECTED USER =================
  const [selectedUser, setSelectedUser] = useState(null);

  // ================= FORM CREATE =================
  const [createForm, setCreateForm] = useState({
    username: "",
    fullName: "",
    email: "",
    password: "",
  });

  // ================= FORM EDIT =================
  const [editForm, setEditForm] = useState({
    username: "",
    fullName: "",
    email: "",
  });

  const [resetPasswordForm, setResetPasswordForm] = useState({
    password: "",
  });

  console.log("value lupa password", resetPasswordForm);

  // ================= DEBOUNCE =================
  const [debouncedSearch] = useDebounce(search, 500);

  // ================= PAGINATION =================
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const queryClient = useQueryClient();

  // ================= FETCH USERS =================
  const { data, isLoading } = useQuery({
    queryKey: ["users", page, perPage, debouncedSearch, role],
    queryFn: () =>
      userService.getAllUsers({
        page,
        perPage,
        search: debouncedSearch,
        role,
      }),
    keepPreviousData: true,
  });

  const users = data?.data || [];
  const pagination = data?.pagination || {};
  const roles = [...new Set(users.map((u) => u.role?.name).filter(Boolean))];

  // ================= CREATE USER =================
  const createUserMutation = useMutation({
    mutationFn: (payload) => userService.createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      setOpenCreate(false);
      setCreateForm({
        username: "",
        fullName: "",
        email: "",
        password: "",
      });

      toast.success("Pengguna berhasil ditambahkan", {
        description: "Akun pengguna baru telah dibuat.",
      });
    },
    onError: (error) => {
      toast.error("Gagal menambahkan pengguna", {
        description:
          error?.response?.data?.message ||
          "Terjadi kesalahan saat menambahkan pengguna.",
      });
    },
  });

  // ================= UPDATE USER =================
  const updateUserMutation = useMutation({
    mutationFn: ({ id, payload }) => userService.updateUser(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      setOpenEdit(false);
      setSelectedUser(null);

      toast.success("Pengguna berhasil diperbarui", {
        description: "Data pengguna telah berhasil diubah.",
      });
    },
    onError: (error) => {
      toast.error("Gagal memperbarui pengguna", {
        description:
          error?.response?.data?.message ||
          "Terjadi kesalahan saat mengubah data pengguna.",
      });
    },
  });

  // ================= DELETE USER =================
  const deleteUserMutation = useMutation({
    mutationFn: (id) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      setOpenDelete(false);
      setSelectedUser(null);

      toast.success("Pengguna berhasil dihapus", {
        description: "Data pengguna telah dihapus dari sistem.",
      });
    },
    onError: (error) => {
      toast.error("Gagal menghapus pengguna", {
        description:
          error?.response?.data?.message ||
          "Terjadi kesalahan saat menghapus pengguna.",
      });
    },
  });

  // ================= HANDLERS =================
  const handleCreateChange = (e) => {
    setCreateForm({
      ...createForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    createUserMutation.mutate(createForm);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    updateUserMutation.mutate({
      id: selectedUser.id,
      payload: editForm,
    });
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditForm({
      username: user.username,
      fullName: user.fullName,
      email: user.email,
    });
    setOpenEdit(true);
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setOpenDelete(true);
  };

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, payload }) => userService.resetPassword(id, payload),
    onSuccess: () => {
      setOpenResetPassword(false);
      setResetPasswordForm({ password: "" });

      toast.success("Password berhasil direset", {
        description: "Password baru telah disimpan.",
      });
    },
    onError: (err) =>
      toast.error("Gagal reset password", {
        description: err?.response?.data?.message,
      }),
  });

  // ================= HANDLER =================
  const openResetPasswordModal = (user) => {
    setSelectedUser(user);
    setOpenResetPassword(true);
  };

  return (
    <DashboardLayout>
      {/* ================= HEADER ================= */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg bg-green-100 text-green-700">
            <Users className="w-5 h-5" />
          </div>
          <h1 className="text-3xl font-bold text-green-800">
            Manajemen Pengguna
          </h1>
        </div>
        <p className="text-sm text-gray-600">
          Kelola akun pengguna dan peran akses sistem
        </p>
      </div>

      {/* ================= FILTER ================= */}
      <div className="bg-white border border-green-200 rounded-xl px-5 py-4 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex gap-3">
            <input
              className="border border-green-300 rounded-lg px-4 py-2 w-72"
              placeholder="Cari nama, username, email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />

            <select
              className="border border-green-300 rounded-lg px-3 py-2 w-48"
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Semua Role</option>
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setOpenCreate(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            <Plus className="w-4 h-4" />
            Tambah Pengguna
          </button>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white border border-green-200 rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-green-50">
            <tr>
              <th className="px-5 py-4">No</th>
              <th className="px-5 py-4 text-left">Nama Lengkap</th>
              <th className="px-5 py-4 text-left">Username</th>
              <th className="px-5 py-4 text-left">Email</th>
              <th className="px-5 py-4 text-left">Role</th>
              <th className="px-5 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {!isLoading &&
              users.map((user, index) => (
                <tr key={user.id} className="hover:bg-green-50/50">
                  <td className="px-5 py-3">
                    {(page - 1) * perPage + index + 1}
                  </td>
                  <td className="px-5 py-3 font-medium text-green-800">
                    {user.fullName}
                  </td>
                  <td className="px-5 py-3">{user.username}</td>
                  <td className="px-5 py-3">{user.email}</td>
                  <td className="px-5 py-3">
                    <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700">
                      {user.role?.name}
                    </span>
                  </td>
                  <td className="px-5 py-3 flex gap-2 justify-center">
                    <button
                      onClick={() => openEditModal(user)}
                      className="border border-blue-400 text-blue-600 rounded-lg p-1.5"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => openDeleteModal(user)}
                      className="border border-red-400 text-red-600 rounded-lg p-1.5"
                    >
                      <Trash className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => openResetPasswordModal(user)}
                      className="border border-yellow-400 text-yellow-600 rounded-lg p-1.5"
                    >
                      <KeyRound className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* ================= MODAL CREATE ================= */}
      {openCreate && (
        <Modal title="Tambah Pengguna" onClose={() => setOpenCreate(false)}>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <Input
              name="username"
              value={createForm.username}
              onChange={handleCreateChange}
              placeholder="Username"
            />
            <Input
              name="fullName"
              value={createForm.fullName}
              onChange={handleCreateChange}
              placeholder="Nama Lengkap"
            />
            <Input
              name="email"
              value={createForm.email}
              onChange={handleCreateChange}
              placeholder="Email"
            />
            <Input
              name="password"
              type="password"
              value={createForm.password}
              onChange={handleCreateChange}
              placeholder="Password"
            />
            <ModalFooter loading={createUserMutation.isLoading} />
          </form>
        </Modal>
      )}

      {/* ================= MODAL EDIT ================= */}
      {openEdit && selectedUser && (
        <Modal title="Edit Pengguna" onClose={() => setOpenEdit(false)}>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <Input
              name="username"
              value={editForm.username}
              onChange={handleEditChange}
              placeholder="Username"
            />
            <Input
              name="fullName"
              value={editForm.fullName}
              onChange={handleEditChange}
              placeholder="Nama Lengkap"
            />
            <Input
              name="email"
              value={editForm.email}
              onChange={handleEditChange}
              placeholder="Email"
            />
            <ModalFooter loading={updateUserMutation.isLoading} />
          </form>
        </Modal>
      )}

      {/* ================= MODAL DELETE ================= */}
      {openDelete && selectedUser && (
        <Modal title="Hapus Pengguna" onClose={() => setOpenDelete(false)}>
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              Apakah kamu yakin ingin menghapus pengguna berikut?
            </p>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm">
              <p>
                <strong>Nama:</strong> {selectedUser.fullName}
              </p>
              <p>
                <strong>Email:</strong> {selectedUser.email}
              </p>
            </div>

            <p className="text-xs text-red-600">
              Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                onClick={() => setOpenDelete(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={() => deleteUserMutation.mutate(selectedUser.id)}
                disabled={deleteUserMutation.isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                {deleteUserMutation.isLoading ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </Modal>
      )}
      {/* ================= MODAL RESET PASSWORD ================= */}
      {openResetPassword && selectedUser && (
        <Modal
          title="Reset Password Pengguna"
          onClose={() => setOpenResetPassword(false)}
        >
          <p className="text-sm text-gray-600 mb-4">
            Gunakan fitur ini untuk <b>mengganti / mereset password</b> pengguna
            berikut:
          </p>

          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-4 text-sm">
            <p>
              <b>Nama:</b> {selectedUser.fullName}
            </p>
            <p>
              <b>Email:</b> {selectedUser.email}
            </p>
          </div>

          <input
            type="password"
            placeholder="Password baru"
            className="w-full border rounded-lg px-4 py-2 mb-4"
            value={resetPasswordForm.password}
            onChange={(e) => setResetPasswordForm({ password: e.target.value })}
          />

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setOpenResetPassword(false)}
              className="border px-4 py-2 rounded-lg"
            >
              Batal
            </button>
            <button
              onClick={() =>
                resetPasswordMutation.mutate({
                  id: selectedUser.id,
                  payload: resetPasswordForm,
                })
              }
              disabled={resetPasswordMutation.isLoading}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg"
            >
              {resetPasswordMutation.isLoading
                ? "Menyimpan..."
                : "Reset Password"}
            </button>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
};

/* ================= REUSABLE ================= */

export default UserManagement;
