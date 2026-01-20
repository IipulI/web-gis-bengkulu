import { useParams, useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Upload, ArrowLeft, LayoutDashboard } from "lucide-react";
import { attachmentService } from "../../services/attachmentService";
import { featureService } from "../../services/featureService";
import DashboardLayout from "../../layouts/DashboardLayout";

// =============================
// TYPE DEFINITIONS
// =============================
interface Attachment {
  id: string;
  filename: string;
  url: string;
}

interface FeatureData {
  id: string;
  name: string;
  properties: Record<string, any>;
  attachments: Attachment[];
}

interface UpdatePayload {
  name: FormDataEntryValue | null;
  properties: Record<string, any>;
}

const FeatureEditPage = () => {
  const { layerId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [uploadOpen, setUploadOpen] = useState(false);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // ============================================================
  // GET FEATURE DATA
  // ============================================================
  const { data: feature, isLoading } = useQuery<FeatureData>({
    queryKey: ["features"],
    queryFn: () => featureService.getOne(layerId, feature.id),
  });

  // ============================================================
  // EDIT MUTATION — HARUS DIATAS RETURN
  // ============================================================
  const editMutation = useMutation({
    mutationFn: (data: UpdatePayload) =>
      featureService.update(layerId, featureId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["feature", layerId, featureId],
      });
      navigate(`/layers/${layerId}`);
    },
  });

  // ============================================================
  // UPLOAD MUTATION — HARUS DIATAS RETURN
  // ============================================================
  const uploadMutation = useMutation({
    mutationFn: () => {
      const formData = new FormData();
      formData.append("file", selectedFile as File);

      return attachmentService.addAttachment(layerId, feature.id, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["feature", layerId, feature],
      });
      setUploadOpen(false);
      setSelectedFile(null);
    },
  });

  // ============================================================
  // FORM SUBMIT
  // ============================================================
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = new FormData(e.currentTarget);
    const payload: UpdatePayload = {
      name: form.get("name"),
      properties: {},
    };

    form.forEach((value, key) => {
      if (key !== "name") {
        payload.properties[key] = value;
      }
    });

    // editMutation.mutate(payload);
  };

  const handleUploadInput = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const handleUploadSubmit = () => {
    if (!selectedFile) return;
    uploadMutation.mutate();
  };

  // ============================================================
  // RENDER — AMAN, TIDAK ADA RETURN SEBELUM HOOK
  // ============================================================
  return (
    <DashboardLayout>
      <div className="p-4 max-w-3xl mx-auto">
        {/* LOADING */}
        {isLoading && <div className="p-4">Loading...</div>}

        {/* NOT FOUND */}
        {!isLoading && !feature && (
          <div className="p-4">Feature tidak ditemukan</div>
        )}

        {/* CONTENT */}
        {!isLoading && feature && (
          <>
            {/* HEADER */}
            <div className="flex items-center mb-4">
              <button
                className="p-2 mr-3"
                onClick={() => navigate(`/dashboard/map-layer`)}
              >
                <ArrowLeft />
              </button>
              <h1 className="text-xl font-bold">Edit Feature</h1>
            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="space-y-3 bg-white p-4 shadow rounded-xl"
            >
              <div>
                <label className="text-sm font-medium">Nama</label>
                <input
                  name="name"
                  defaultValue={feature.name}
                  className="w-full p-2 border rounded"
                />
              </div>

              <h3 className="mt-4 font-semibold">Properties</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(feature.properties || {}).map(
                  ([key, value]) => (
                    <div key={key}>
                      <label className="text-xs font-medium">{key}</label>
                      <input
                        name={key}
                        defaultValue={String(value)}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  ),
                )}
              </div>

              <button
                className="bg-blue-600 text-white w-full py-2 rounded mt-3"
                disabled={editMutation.isPending}
              >
                {editMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </form>

            {/* ATTACHMENTS */}
            <div className="bg-white p-4 shadow rounded-xl mt-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">Attachment</h3>
                <button
                  className="flex items-center gap-2 bg-green-600 text-white px-3 py-1 rounded"
                  onClick={() => setUploadOpen(true)}
                >
                  <Upload size={16} /> Upload
                </button>
              </div>

              {feature.attachments?.length === 0 && (
                <p className="text-gray-500 text-sm">Belum ada attachment.</p>
              )}

              <div className="space-y-2">
                {feature.attachments?.map((att: Attachment) => (
                  <div
                    key={att.id}
                    className="border p-3 rounded flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{att.filename}</p>
                      <a
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline text-sm"
                      >
                        Buka File
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* UPLOAD MODAL */}
            {uploadOpen && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-3 z-[9999]">
                <div className="bg-white w-full max-w-md rounded-xl p-5 relative">
                  <button
                    onClick={() => setUploadOpen(false)}
                    className="absolute top-3 right-3"
                  >
                    <X />
                  </button>

                  <h2 className="text-lg font-semibold mb-3">
                    Upload Attachment
                  </h2>

                  <input
                    type="file"
                    ref={uploadInputRef}
                    onChange={handleUploadInput}
                    className="border w-full p-2 rounded"
                  />

                  <button
                    onClick={handleUploadSubmit}
                    className="bg-blue-600 text-white w-full py-2 rounded mt-4"
                    disabled={!selectedFile || uploadMutation.isPending}
                  >
                    {uploadMutation.isPending ? "Mengupload..." : "Upload"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FeatureEditPage;
