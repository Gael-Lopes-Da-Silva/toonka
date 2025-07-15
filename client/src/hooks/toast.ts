import { createContext, useContext } from "react";

export const ToastContext = createContext<
	| {
			addToast: (
				message: string,
				type: "error" | "warning" | "success" | "info",
			) => void;
			removeToast: (id: number) => void;
	  }
	| undefined
>(undefined);

export function useToast() {
	const context = useContext(ToastContext);
	if (!context) {
		throw new Error("The useToast hook must be used within a ToastProvider");
	}
	return context;
}
