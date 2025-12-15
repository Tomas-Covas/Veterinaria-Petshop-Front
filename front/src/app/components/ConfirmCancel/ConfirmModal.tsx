// src/components/ConfirmModal.tsx
import React from "react";
import ReactDOM from "react-dom";

interface ConfirmModalProps {
  message: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  message,
  onConfirm,
  onCancel,
  confirmText = "Sí",
  cancelText = "No",
}) => {
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-cyan-700/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-[90%] max-w-sm text-center animate-fadeIn">
        <p className="font-semibold text-gray-800 mb-4">{message}</p>
        <div className="flex justify-center gap-3 mt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmModal;
