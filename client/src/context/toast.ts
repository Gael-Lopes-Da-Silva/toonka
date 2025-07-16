import { createContext } from "react";

export type Toast = {
	id: number;
	message: string;
	type: ToastType;
};

export type ToastType = "error" | "warning" | "success" | "info";

export type ToastContextType = {
	addToast: (message: string, type: ToastType) => void;
};

export const ToastContext = createContext<ToastContextType | undefined>(
	undefined,
);
