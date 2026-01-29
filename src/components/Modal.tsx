import { X } from "lucide-react";

const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
    <div className="bg-white w-full max-w-lg rounded-xl shadow-lg">
      <div className="flex justify-between items-center px-5 py-4 border-b">
        <h2 className="font-semibold text-green-800">{title}</h2>
        <button onClick={onClose}>
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  </div>
);

export default Modal;
