import React from "react";

const ModalFooter = ({ loading }) => (
  <div className="flex justify-end pt-4 border-t">
    <button
      type="submit"
      disabled={loading}
      className="px-4 py-2 bg-green-600 text-white rounded-lg"
    >
      {loading ? "Menyimpan..." : "Simpan"}
    </button>
  </div>
);

export default ModalFooter;
