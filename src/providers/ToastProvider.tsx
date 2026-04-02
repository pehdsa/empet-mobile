import type { ReactNode } from "react";
import { Toast } from "@/components/ui/Toast";

export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toast />
    </>
  );
}
