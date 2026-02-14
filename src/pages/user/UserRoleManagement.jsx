import React, { useState } from "react";
import {
  Plus,
  Pencil,
  Trash,
  ShieldCheck,
  Eye,
  CheckCircle2,
  Search,
  KeySquare,
  X,
} from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "../../layouts/DashboardLayout";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import ModalFooter from "../../components/ModalFooter";
import { Permission } from "../../permission/permission";
import { roleService } from "../../services/roleService";
import { useMutation, useQuery } from "@tanstack/react-query";
/* ================= PERMISSION LIST (AUTO DARI ENUM) ================= */
const PERMISSION_LIST = Object.values(Permission).map((p) => ({
  key: p,
  label: p
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase()),
}));

const UserRoleManagement = () => {
  // ================= STATE =================
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openPermission, setOpenPermission] = useState(false);

  const [selectedRole, setSelectedRole] = useState(null);

  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
  });

  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
  });

  const { data: roles } = useQuery({
    queryKey: ["roles", search, page],
    queryFn: () => roleService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (payload) => roleService.createRole(payload),
    onSuccess: () => {
      toast.success("Role berhasil ditambahkan");
      setOpenCreate(false);
      setCreateForm({ name: "", description: "" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ roleId, payload }) =>
      roleService.updateRole(roleId, payload),
    onSuccess: () => {
      toast.success("Role berhasil diperbarui");
      setOpenEdit(false);
      setOpenPermission(false);
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (roleId) => roleService.deleteRole(roleId),
    onSuccess: () => {
      toast.success("Role berhasil dihapus");
      setOpenDelete(false);
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });

  // ================= HANDLER =================
  const openEditModal = (role) => {
    setSelectedRole(role);
    setEditForm(role);
    setOpenEdit(true);
  };

  const openDeleteModal = (role) => {
    setSelectedRole(role);
    setOpenDelete(true);
  };

  const openPermissionModal = (role) => {
    setSelectedRole(role);
    setOpenPermission(true);
  };

  const togglePermission = (permissionId) => {
    const exists = selectedRole.permissions.includes(permissionId);

    const updatedPermissions = exists
      ? selectedRole.permissions.filter((p) => p !== permissionId)
      : [...selectedRole.permissions, permissionId];

    const updatedRole = {
      ...selectedRole,
      permissions: updatedPermissions,
    };

    setSelectedRole(updatedRole);

    updateMutation.mutate({
      roleId: selectedRole.id,
      payload: {
        name: selectedRole.name,
        description: selectedRole.description,
        permissions: updatedPermissions,
      },
    });

    toast.success(
      exists ? "Permission dinonaktifkan" : "Permission diaktifkan",
    );
  };

  const handleCreate = (e) => {
    e.preventDefault();

    createMutation.mutate({
      name: createForm.name,
      description: createForm.description,
      permissions: [], // default kosong
    });
  };

  const handleUpdate = (e) => {
    e.preventDefault();

    updateMutation.mutate({
      roleId: selectedRole.id,
      payload: {
        name: editForm.name,
        description: editForm.description,
        permissions: selectedRole.permissions,
      },
    });
  };

  return (
    <DashboardLayout>
      {/* ================= HEADER AREA ================= */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-[1.2rem] bg-emerald-600 shadow-lg shadow-emerald-200 text-white">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none">
              Manajemen <span className="text-emerald-600">Role</span>
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-1.5">
              Definisikan struktur jabatan dan kendali akses fitur aplikasi.
            </p>
          </div>
        </div>

        <button
          onClick={() => setOpenCreate(true)}
          className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-xl shadow-slate-200 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Tambah Role Baru
        </button>
      </div>

      {/* ================= FILTER TOOLBAR ================= */}
      <div className="bg-white border border-slate-100 rounded-[2rem] p-5 shadow-sm mb-8">
        <div className="relative group max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          <input
            className="w-full bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 rounded-2xl pl-11 pr-4 py-3 text-sm font-bold text-slate-700 outline-none transition-all placeholder:font-medium placeholder:text-slate-400"
            placeholder="Cari nama role..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* ================= TABLE AREA ================= */}
      <div className="bg-white border border-slate-100 rounded-[2rem] shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  No
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Nama Role
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Deskripsi Otoritas
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {roles?.map((role, index) => (
                <tr
                  key={role.id}
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
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 font-bold text-xs">
                        {role.name.charAt(0)}
                      </div>
                      <span className="text-sm font-bold text-slate-800 uppercase tracking-tight">
                        {role.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-500 font-medium max-w-xs truncate lg:max-w-md">
                      {role.description || "Tidak ada deskripsi tersedia."}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => openPermissionModal(role)}
                        className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-emerald-600 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-50 transition-all active:scale-90"
                        title="Atur Hak Akses"
                      >
                        <KeySquare className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(role)}
                        className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all active:scale-90"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(role)}
                        className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:shadow-lg hover:shadow-rose-50 transition-all active:scale-90"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL PERMISSION (UPGRADED) ================= */}
      {openPermission && selectedRole && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[500] p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full p-8 border border-white relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none">
                  Hak Akses Role
                </h3>
                <p className="text-sm font-medium text-slate-400 mt-1 uppercase tracking-widest">
                  {selectedRole.name}
                </p>
              </div>
              <button
                onClick={() => setOpenPermission(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
              {PERMISSION_LIST.map((perm) => {
                const active = selectedRole.permissions.includes(perm.key);
                return (
                  <div
                    key={perm.key}
                    onClick={() => togglePermission(perm.key)}
                    className={`group cursor-pointer flex items-center justify-between rounded-2xl border-2 p-4 transition-all duration-200 ${
                      active
                        ? "bg-emerald-50 border-emerald-500 shadow-md shadow-emerald-100"
                        : "bg-white border-slate-100 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex gap-3 items-center">
                      <div
                        className={`p-2 rounded-lg ${active ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"}`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p
                          className={`text-sm font-black ${active ? "text-emerald-900" : "text-slate-700"}`}
                        >
                          {perm.label}
                        </p>
                        <p className="text-[10px] font-mono text-slate-400 tracking-tighter uppercase">
                          {perm.key}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div> */}

            <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-xs text-slate-500 font-medium leading-relaxed italic text-center">
                Perubahan hak akses disimpan secara instan ke sistem. Pengguna
                dengan role ini akan menerima perubahan setelah muat ulang
                halaman.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL CREATE & EDIT ================= */}
      {(openCreate || openEdit) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[500] p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-8 border border-white">
            <h3 className="text-xl font-black text-slate-800 tracking-tight mb-6">
              {openCreate ? "Buat Role Baru" : "Update Role"}
            </h3>
            <form
              onSubmit={openCreate ? handleCreate : handleUpdate}
              className="space-y-4"
            >
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">
                  Nama Role
                </label>
                <input
                  value={openCreate ? createForm.name : editForm.name}
                  onChange={(e) =>
                    openCreate
                      ? setCreateForm({ ...createForm, name: e.target.value })
                      : setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="w-full bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 rounded-2xl px-5 py-3 text-sm font-bold outline-none transition-all"
                  placeholder="Contoh: EDITOR_KONTEN"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">
                  Deskripsi
                </label>
                <textarea
                  rows="3"
                  value={
                    openCreate ? createForm.description : editForm.description
                  }
                  onChange={(e) =>
                    openCreate
                      ? setCreateForm({
                          ...createForm,
                          description: e.target.value,
                        })
                      : setEditForm({
                          ...editForm,
                          description: e.target.value,
                        })
                  }
                  className="w-full bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 rounded-2xl px-5 py-3 text-sm font-bold outline-none transition-all"
                  placeholder="Jelaskan otoritas role ini..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setOpenCreate(false);
                    setOpenEdit(false);
                  }}
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                  className="flex-2 px-8 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all shadow-lg active:scale-95"
                >
                  Simpan Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ================= MODAL DELETE (FIXED) ================= */}
      {openDelete && selectedRole && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[500] p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-sm w-full p-8 border border-white text-center">
            {/* Icon Warning */}
            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash className="w-10 h-10" />
            </div>

            <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">
              Hapus Role?
            </h3>
            <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">
              Anda akan menghapus role{" "}
              <span className="font-bold text-slate-800">
                "{selectedRole.name}"
              </span>
              . Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setOpenDelete(false)}
                className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => deleteMutation.mutate(selectedRole.id)}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-3 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-100 active:scale-95 disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default UserRoleManagement;
