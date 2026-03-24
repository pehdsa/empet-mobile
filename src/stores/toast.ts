import { create } from "zustand";

type ToastVariant = "success" | "error";

interface ToastState {
  message: string | null;
  variant: ToastVariant;
  visible: boolean;
  show: (message: string, variant?: ToastVariant) => void;
  hide: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  variant: "success",
  visible: false,
  show: (message, variant = "success") => {
    set({ message, variant, visible: true });
  },
  hide: () => {
    set({ visible: false });
  },
}));
