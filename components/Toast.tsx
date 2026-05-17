"use client";

import { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";

export type ToastData = { label?: string; message: string };

interface ToastProps {
  data: ToastData;
  onClose: () => void;
}

export default function Toast({ data, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 2200);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-2xl shadow-lg text-sm font-medium transition-all duration-300 whitespace-nowrap max-w-[calc(100vw-2rem)] overflow-hidden
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
    >
      <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
      {data.label && <span className="truncate max-w-[8rem]">"{data.label}"</span>}
      <span className="shrink-0">{data.message}</span>
    </div>
  );
}
