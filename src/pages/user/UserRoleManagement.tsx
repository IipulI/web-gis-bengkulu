import React, { useState } from "react";
import {
  Plus,
  Pencil,
  Trash,
  ShieldCheck,
  Eye,
  CheckCircle2,
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
      {/* ================= HEADER ================= */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg bg-green-100 text-green-700">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h1 className="text-3xl font-bold text-green-800">Manajemen Role</h1>
        </div>
        <p className="text-sm text-gray-600">
          Kelola peran dan hak akses pengguna
        </p>
      </div>

      {/* ================= FILTER ================= */}
      <div className="bg-white border border-green-200 rounded-xl px-5 py-4 shadow-sm mb-6 flex justify-between">
        <input
          className="border border-green-300 rounded-lg px-4 py-2 w-72"
          placeholder="Cari nama role..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />

        <button
          onClick={() => setOpenCreate(true)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
        >
          <Plus className="w-4 h-4" />
          Tambah Role
        </button>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white border border-green-200 rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-green-50">
            <tr>
              <th className="px-5 py-4">No</th>
              <th className="px-5 py-4 text-left">Nama Role</th>
              <th className="px-5 py-4 text-left">Deskripsi</th>
              <th className="px-5 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {roles?.map((role, index) => (
              <tr key={role.id} className="hover:bg-green-50/50">
                <td className="px-5 py-3">
                  {(page - 1) * perPage + index + 1}
                </td>
                <td className="px-5 py-3 font-medium text-green-800">
                  {role.name}
                </td>
                <td className="px-5 py-3">{role.description}</td>
                <td className="px-5 py-3 flex gap-2 justify-center">
                  {/* 👁️ PERMISSION */}
                  {/* <button
                    onClick={() => openPermissionModal(role)}
                    className="border border-emerald-400 text-emerald-600 rounded-lg p-1.5"
                    title="Kelola Permission"
                  >
                    <Eye className="w-4 h-4" />
                  </button> */}

                  <button
                    onClick={() => openEditModal(role)}
                    className="border border-blue-400 text-blue-600 rounded-lg p-1.5"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => deleteMutation.mutate(selectedRole.id)}
                    className="border border-red-400 text-red-600 rounded-lg p-1.5"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= MODAL PERMISSION ================= */}
      {openPermission && selectedRole && (
        <Modal
          title={`Permission Role: ${selectedRole.name}`}
          onClose={() => setOpenPermission(false)}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PERMISSION_LIST.map((perm) => {
              const active = selectedRole.permissions.includes(perm.key);

              return (
                <div
                  key={perm.key}
                  onClick={() => togglePermission(perm.key)}
                  className={`cursor-pointer flex items-center justify-between rounded-xl border p-3 transition
                    ${
                      active
                        ? "bg-green-50 border-green-400"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    }`}
                >
                  <div>
                    <p className="text-sm font-medium">{perm.label}</p>
                    <p className="text-xs text-gray-500">{perm.key}</p>
                  </div>
                  {active && (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  )}
                </div>
              );
            })}
          </div>

          <p className="mt-4 text-xs text-gray-500">
            Klik permission untuk mengaktifkan / menonaktifkan. Perubahan
            disimpan otomatis.
          </p>
        </Modal>
      )}

      {/* ================= MODAL CREATE ================= */}
      {openCreate && (
        <Modal title="Tambah Role" onClose={() => setOpenCreate(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              placeholder="Nama Role"
              value={createForm.name}
              onChange={(e) =>
                setCreateForm({ ...createForm, name: e.target.value })
              }
            />
            <Input
              placeholder="Deskripsi"
              value={createForm.description}
              onChange={(e) =>
                setCreateForm({
                  ...createForm,
                  description: e.target.value,
                })
              }
            />
            <ModalFooter loading={createMutation.isPending} />
          </form>
        </Modal>
      )}

      {/* ================= MODAL EDIT ================= */}
      {openEdit && selectedRole && (
        <Modal title="Edit Role" onClose={() => setOpenEdit(false)}>
          <form onSubmit={handleUpdate} className="space-y-4">
            <Input
              placeholder="Nama Role"
              value={editForm.name}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
            />
            <Input
              placeholder="Deskripsi"
              value={editForm.description}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  description: e.target.value,
                })
              }
            />
            <ModalFooter loading={updateMutation.isPending} />
          </form>
        </Modal>
      )}

      {/* ================= MODAL DELETE ================= */}
      {openDelete && selectedRole && (
        <Modal title="Hapus Role" onClose={() => setOpenDelete(false)}>
          <div className="space-y-4">
            <p className="text-sm">Yakin ingin menghapus role berikut?</p>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm">
              <p>
                <b>Role:</b> {selectedRole.name}
              </p>
              <p>
                <b>Deskripsi:</b> {selectedRole.description}
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                onClick={() => setOpenDelete(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Batal
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg">
                Ya, Hapus
              </button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
};

export default UserRoleManagement;
