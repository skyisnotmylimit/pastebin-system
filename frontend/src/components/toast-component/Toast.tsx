// src/components/Toast.tsx
import React, { useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

type ToastVariant = "success" | "failure";

interface ToastProps {
  message: string;
  variant: ToastVariant;
  duration?: number; // optional auto-dismiss (ms)
  onClose?: () => void;
}

const Toast: React.FC<ToastProps> = ({
  message,
  variant,
  duration,
  onClose,
}) => {
  const [visible, setVisible] = useState(true);

  // Auto-dismiss only if duration is provided
  useEffect(() => {
    if (!duration) return;

    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onClose?.(), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const baseStyles =
    "fixed top-5 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl text-white max-w-md w-full transition-all duration-300";
  const variantStyles = variant === "success" ? "bg-green-600" : "bg-red-600";

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => onClose?.(), 300);
  };

  return (
    <div
      className={`${baseStyles} ${variantStyles} ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-5"
      }`}
    >
      {variant === "success" ? (
        <CheckCircle2 size={24} className="text-white" />
      ) : (
        <XCircle size={24} className="text-white" />
      )}
      <span className="flex-1">{message}</span>
      <button
        onClick={handleClose}
        className="ml-2 text-white hover:text-gray-200"
      >
        ✖
      </button>
    </div>
  );
};

export default Toast;
