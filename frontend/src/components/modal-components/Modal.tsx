// src/components/Modal.tsx

import React, { useEffect, type ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", onKeyDown);
    } else {
      document.removeEventListener("keydown", onKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center
                    bg-gray-900/20 backdrop-blur-lg"
    >
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 relative">
        {title && (
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-700">{title}</h2>
          </div>
        )}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          aria-label="Close modal"
        >
          ✕
        </button>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
