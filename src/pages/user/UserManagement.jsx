import React, { useState } from "react";
import {
  Eye,
  Users,
  Plus,
  X,
  Pencil,
  Trash,
  KeyRound,
  Search,
  Filter,
  ChevronDown,
  Mail,
  Trash2,
  ShieldAlert,
} from "lucide-react";
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
      {/* ================= HEADER AREA ================= */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-[1.2rem] bg-emerald-600 shadow-lg shadow-emerald-200 text-white">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none">
              Manajemen <span className="text-emerald-600">Pengguna</span>
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-1.5">
              Otorisasi akses dan manajemen akun personil sistem secara
              terpusat.
            </p>
          </div>
        </div>

        <button
          onClick={() => setOpenCreate(true)}
          className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-xl shadow-slate-200 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Tambah Pengguna
        </button>
      </div>

      {/* ================= FILTER & SEARCH TOOLBAR ================= */}
      <div className="bg-white border border-slate-100 rounded-[2rem] p-5 shadow-sm mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <input
              className="w-full bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 rounded-2xl pl-11 pr-4 py-3 text-sm font-bold text-slate-700 outline-none transition-all placeholder:font-medium placeholder:text-slate-400"
              placeholder="Cari berdasarkan nama, username, atau email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {/* Role Filter */}
          <div className="relative min-w-[200px]">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <select
              className="w-full appearance-none bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 rounded-2xl pl-10 pr-10 py-3 text-sm font-bold text-slate-700 outline-none transition-all cursor-pointer"
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
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ================= TABLE AREA ================= */}
      <div className="bg-white border border-slate-100 rounded-[2rem] shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  ID
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Info Pengguna
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Kontak
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Hak Akses
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">
                  Tindakan
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {!isLoading &&
                users.map((user, index) => (
                  <tr
                    key={user.id}
                    className="group hover:bg-emerald-50/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono font-bold text-slate-400">
                        {((page - 1) * perPage + index + 1)
                          .toString()
                          .padStart(2, "0")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm border-2 border-white shadow-sm">
                          {user.fullName?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 tracking-tight uppercase leading-none">
                            {user.fullName}
                          </p>
                          <p className="text-[11px] font-semibold text-slate-400 mt-1 italic">
                            @{user.username}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="w-3.5 h-3.5 opacity-40" />
                        <span className="text-sm font-medium">
                          {user.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg shadow-sm border ${
                          user.role?.name === "Admin"
                            ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                            : "bg-blue-100 text-blue-700 border-blue-200"
                        }`}
                      >
                        {user.role?.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all active:scale-90"
                          title="Edit Profil"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openResetPasswordModal(user)}
                          className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-amber-600 hover:border-amber-200 hover:shadow-lg hover:shadow-amber-50 transition-all active:scale-90"
                          title="Reset Password"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(user)}
                          className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:shadow-lg hover:shadow-rose-50 transition-all active:scale-90"
                          title="Hapus Pengguna"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL COMPONENTS ================= */}
      {/* (Saran: Buat pembungkus Modal yang seragam dengan style berikut) */}

      {/* MODAL RESET PASSWORD EXAMPLE */}
      {openResetPassword && selectedUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[500] p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-8 border border-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -mr-16 -mt-16 z-0" />

            <div className="relative z-10">
              <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mb-6">
                <ShieldAlert className="w-7 h-7" />
              </div>

              <h3 className="text-xl font-black text-slate-800 tracking-tight">
                Atur Ulang Kata Sandi
              </h3>
              <p className="text-sm text-slate-500 font-medium mt-2 mb-6 leading-relaxed">
                Keamanan akun adalah prioritas. Pastikan pengguna{" "}
                <span className="text-slate-900 font-bold uppercase underline decoration-emerald-500">
                  {selectedUser.fullName}
                </span>{" "}
                menerima informasi password baru melalui kanal yang aman.
              </p>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Email
                </div>
                <p className="text-xs font-black text-slate-600 truncate">
                  {selectedUser.email}
                </p>
              </div>

              <div className="space-y-2 mb-8">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">
                  Password Baru
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-amber-500 rounded-2xl px-5 py-3 text-sm font-bold outline-none transition-all"
                  value={resetPasswordForm.password}
                  onChange={(e) =>
                    setResetPasswordForm({ password: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setOpenResetPassword(false)}
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors"
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
                  className="flex-2 px-8 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-amber-600 transition-all shadow-lg active:scale-95"
                >
                  {resetPasswordMutation.isLoading
                    ? "Proses..."
                    : "Update Password"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DELETE EXAMPLE */}
      {openDelete && selectedUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[500] p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-sm w-full p-8 border border-white text-center">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-6">
              <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-8 h-8" />
              </div>
            </div>
            <h3 className="text-xl font-black text-slate-800">Hapus Akun?</h3>
            <p className="text-sm text-slate-500 font-medium mt-3 mb-8">
              Data pengguna <b>{selectedUser.fullName}</b> akan dihapus
              permanen. Akses masuk sistem akan segera dicabut.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => deleteUserMutation.mutate(selectedUser.id)}
                className="w-full py-4 bg-rose-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-100"
              >
                Ya, Hapus Permanen
              </button>
              <button
                onClick={() => setOpenDelete(false)}
                className="w-full py-3 bg-white text-slate-400 text-xs font-bold hover:text-slate-600 transition-colors"
              >
                Batalkan
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ================= MODAL CREATE ================= */}
      {openCreate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[500] p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full p-8 border border-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-black text-slate-800 tracking-tight mb-6">
                Tambah Pengguna Baru
              </h3>
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">
                      Username
                    </label>
                    <input
                      name="username"
                      value={createForm.username}
                      onChange={handleCreateChange}
                      placeholder="johndoe"
                      className="w-full bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 rounded-2xl px-5 py-3 text-sm font-bold outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">
                      Nama Lengkap
                    </label>
                    <input
                      name="fullName"
                      value={createForm.fullName}
                      onChange={handleCreateChange}
                      placeholder="John Doe"
                      className="w-full bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 rounded-2xl px-5 py-3 text-sm font-bold outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={createForm.email}
                    onChange={handleCreateChange}
                    placeholder="john@example.com"
                    className="w-full bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 rounded-2xl px-5 py-3 text-sm font-bold outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">
                    Password
                  </label>
                  <input
                    name="password"
                    type="password"
                    value={createForm.password}
                    onChange={handleCreateChange}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 rounded-2xl px-5 py-3 text-sm font-bold outline-none transition-all"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setOpenCreate(false)}
                    className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={createUserMutation.isLoading}
                    className="flex-2 px-8 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg active:scale-95"
                  >
                    {createUserMutation.isLoading
                      ? "Menyimpan..."
                      : "Buat Akun"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL EDIT ================= */}
      {openEdit && selectedUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[500] p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full p-8 border border-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-black text-slate-800 tracking-tight mb-6">
                Edit Profil Pengguna
              </h3>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">
                    Nama Lengkap
                  </label>
                  <input
                    name="fullName"
                    value={editForm.fullName}
                    onChange={handleEditChange}
                    className="w-full bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 rounded-2xl px-5 py-3 text-sm font-bold outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">
                      Username
                    </label>
                    <input
                      name="username"
                      value={editForm.username}
                      onChange={handleEditChange}
                      className="w-full bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 rounded-2xl px-5 py-3 text-sm font-bold outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">
                      Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={editForm.email}
                      onChange={handleEditChange}
                      className="w-full bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 rounded-2xl px-5 py-3 text-sm font-bold outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setOpenEdit(false)}
                    className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={updateUserMutation.isLoading}
                    className="flex-2 px-8 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg active:scale-95"
                  >
                    {updateUserMutation.isLoading
                      ? "Memperbarui..."
                      : "Simpan Perubahan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

/* ================= REUSABLE ================= */

export default UserManagement;
