import { useContext } from "react";

import { ToastContext } from "../context/toast";

export default function useToast() {
	const context = useContext(ToastContext);
	if (!context) {
		throw new Error("useToast must be used within a ToastProvider");
	}
	return context;
}
