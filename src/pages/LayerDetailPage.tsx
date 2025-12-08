/* eslint-disable */

import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash, X } from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import { layerService } from "../services/layerService";
import { featureService } from "../services/featureService";

import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Polygon,
  useMapEvents,
} from "react-leaflet";

const GeometryDrawer = ({ type, onChange }) => {
  const [points, setPoints] = useState([]);

  useMapEvents({
    click(e) {
      const newPoint = [e.latlng.lng, e.latlng.lat];
      const updated = [...points, newPoint];

      setPoints(updated);
      onChange(updated);
    },
  });

  return (
    <>
      {type === "Point" && points[0] && (
        <Marker position={[points[0][1], points[0][0]]} />
      )}

      {type === "LineString" && points.length > 1 && (
        <Polyline positions={points.map((p) => [p[1], p[0]])} />
      )}

      {type === "Polygon" && points.length > 2 && (
        <Polygon positions={points.map((p) => [p[1], p[0]])} />
      )}
    </>
  );
};

const LayerDetailPage = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const [isOpenAddModal, setIsOpenAddModal] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedFeatureId, setSelectedFeatureId] = useState(null);
  const [geomType, setGeomType] = useState("Point");
  const [coordinates, setCoordinates] = useState([]);

  const { data: layer, isLoading: loadingLayer } = useQuery({
    queryKey: ["layer", id],
    queryFn: () => layerService.getSpecificLayer(id),
  });

  const { data: detailLayer } = useQuery({
    queryKey: ["details-layer", id],
    queryFn: () => layerService.getSpecificLayerDashboard(id),
  });

  const features = detailLayer?.spatialItem || [];

  const { data: selectedFeature, isLoading: featureLoading } = useQuery({
    queryKey: ["feature", id, selectedFeatureId],
    queryFn: () => featureService.getOne(id, selectedFeatureId),
    enabled: !!selectedFeatureId,
  });

  // ADD NEW FEATURE
  const addMutation = useMutation({
    mutationFn: (payload) => featureService.createDetail(layer.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["details-layer", id] });
      setIsOpenAddModal(false);
      setCoordinates([]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (fid) => featureService.delete(id, fid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["details-layer", id] });
    },
  });

  const handleSubmitAdd = (e) => {
    e.preventDefault();
    const form = new FormData(e.target);

    addMutation.mutate({
      name: form.get("name"),
      properties: {
        JNSRSR: form.get("JNSRSR"),
        NAMOBJ: form.get("NAMOBJ"),
        ORDE01: form.get("ORDE01"),
        ORDE02: form.get("ORDE02"),
        REMARK: form.get("REMARK"),
        SBDATA: form.get("SBDATA"),
        STSJRN: form.get("STSJRN"),
        WADMKK: form.get("WADMKK"),
        WADMPR: form.get("WADMPR"),
      },
      geom: {
        type: geomType,
        coordinates: geomType === "Polygon" ? [coordinates] : coordinates,
      },
    });
  };

  if (loadingLayer) return <p>Loading...</p>;

  return (
    <DashboardLayout>
      {/* HEADER */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Detail Layer: {layer?.name}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage fitur dan geometry dari layer ini.
          </p>
        </div>

        <button
          onClick={() => {
            setCoordinates([]);
            setGeomType("Point");
            setIsOpenAddModal(true);
          }}
          className="bg-green-600 hover:bg-green-700 transition text-white px-5 py-2.5 rounded-lg shadow flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Tambah Detail
        </button>
      </div>

      {/* CARD LIST */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="font-semibold text-gray-700 mb-4">
          Daftar Detail Layer
        </h2>

        {features.length === 0 ? (
          <p className="text-gray-500 text-sm">Belum ada detail.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border rounded-lg overflow-hidden">
              <thead className="bg-gray-100 text-xs text-gray-600 uppercase">
                <tr>
                  <th className="p-3 border">Nama</th>
                  <th className="p-3 border">Geometry</th>
                  <th className="p-3 border">Properties</th>
                  <th className="p-3 border">Dibuat</th>
                  <th className="p-3 border">Action</th>
                </tr>
              </thead>
              <tbody>
                {features.map((f) => (
                  <tr
                    key={f.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="p-3 border">{f.name}</td>
                    <td className="p-3 border text-center">{f.geom?.type}</td>

                    <td className="p-3 border">
                      <pre className="text-xs bg-gray-50 p-2 rounded-lg overflow-auto max-h-40">
                        {JSON.stringify(f.properties, null, 2)}
                      </pre>
                    </td>

                    <td className="p-3 border text-sm text-gray-600">
                      {f.createdAt}
                    </td>

                    <td className="p-3 border flex gap-3">
                      <Pencil
                        onClick={() => {
                          setSelectedFeatureId(f.id);
                          setEditModalOpen(true);
                        }}
                        className="cursor-pointer text-blue-600 hover:text-blue-800"
                      />
                      <Trash
                        className="cursor-pointer text-red-600 hover:text-red-800"
                        onClick={() => deleteMutation.mutate(f.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD MODAL */}
      {isOpenAddModal && (
        <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-xl shadow-lg p-6 relative overflow-y-auto max-h-[95vh]">
            <button
              onClick={() => setIsOpenAddModal(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-black"
            >
              <X />
            </button>

            <h2 className="text-xl font-semibold mb-5">Tambah Detail Layer</h2>

            <form onSubmit={handleSubmitAdd} className="space-y-6">
              <div>
                <label className="font-medium">Nama</label>
                <input
                  name="name"
                  required
                  className="w-full p-2 border rounded-lg mt-1"
                />
              </div>

              <div>
                <label className="font-medium">Properties</label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {[
                    "JNSRSR",
                    "NAMOBJ",
                    "ORDE01",
                    "ORDE02",
                    "REMARK",
                    "SBDATA",
                    "STSJRN",
                    "WADMKK",
                    "WADMPR",
                  ].map((p) => (
                    <input
                      key={p}
                      name={p}
                      placeholder={p}
                      className="p-2 border rounded-lg"
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="font-medium">Tipe Geometry</label>
                <select
                  value={geomType}
                  onChange={(e) => {
                    setGeomType(e.target.value);
                    setCoordinates([]);
                  }}
                  className="w-full p-2 border rounded-lg mt-1"
                >
                  <option value="Point">Point</option>
                  <option value="LineString">LineString</option>
                  <option value="Polygon">Polygon</option>
                </select>
              </div>

              <div>
                <label className="font-medium">Gambar Geometry</label>
                <div className="h-[350px] border rounded-lg mt-2 overflow-hidden">
                  <MapContainer
                    center={[-3.8205, 102.2815]}
                    zoom={15}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <GeometryDrawer
                      type={geomType}
                      onChange={(coords) => setCoordinates(coords)}
                    />
                  </MapContainer>
                </div>
              </div>

              <textarea
                readOnly
                className="w-full p-2 border rounded-lg text-xs"
                value={JSON.stringify(coordinates, null, 2)}
              />

              <button className="bg-green-600 hover:bg-green-700 text-white w-full py-2.5 rounded-lg transition">
                Simpan Detail Layer
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL (placeholder) */}
      {editModalOpen && selectedFeature && !featureLoading && (
        <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-xl shadow-lg p-6 relative">
            <button
              onClick={() => setEditModalOpen(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-black"
            >
              <X />
            </button>

            <h2 className="text-xl font-semibold mb-4">
              Edit Feature: {selectedFeature.name}
            </h2>

            {/* Tempat form edit */}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default LayerDetailPage;
