import { useCallback, useEffect, useMemo, useState } from "react";

import { ToastContext, type ToastType, type Toast } from "../../context/toast";

type ToastProps = {
	id: number;
	message: string;
	type: ToastType;
	onClose: (id: number) => void;
};

export function Toast(props: ToastProps) {
	useEffect(() => {
		const timer = setTimeout(() => props.onClose(props.id), 5000);
		return () => clearTimeout(timer);
	}, [props.id, props.onClose]);

	const typeClasses = {
		error: "border-red-500 bg-red-400 text-red-800",
		warning: "border-orange-500 bg-orange-400 text-orange-800",
		success: "border-green-500 bg-green-400 text-green-800",
		info: "border-blue-500 bg-blue-400 text-blue-800",
	};

	return (
		<div
			className={`mb-2 p-3 rounded-lg shadow-md border ${typeClasses[props.type]}`}
			onClick={() => props.onClose(props.id)}
		>
			{props.message}
		</div>
	);
}

type ToastContainerProps = {
	children: React.ReactNode;
};

export default function ToastContainer(props: ToastContainerProps) {
	const [toasts, setToasts] = useState<Toast[]>([]);

	const addToast = useCallback((message: string, type: ToastType) => {
		const id = Date.now();
		const toast = { id, message, type };
		const toasts = sessionStorage.getItem("toasts");
		const filtered = toasts ? JSON.parse(toasts) : [];

		sessionStorage.setItem("toasts", JSON.stringify([...filtered, toast]));

		setToasts((prev) => [...prev, toast]);
	}, []);

	const removeToast = useCallback((id: number) => {
		setToasts((prev) => {
			const filtered = prev.filter((toast) => toast.id !== id);

			sessionStorage.setItem("toasts", JSON.stringify(filtered));

			return filtered;
		});
	}, []);

	const contextValue = useMemo(() => ({ addToast }), [addToast]);

	useEffect(() => {
		const toasts = sessionStorage.getItem("toasts");

		if (toasts) {
			setToasts(JSON.parse(toasts));
		}
	}, []);

	return (
		<ToastContext.Provider value={contextValue}>
			{props.children}
			<div className="fixed top-4 right-4 z-50 w-80 space-y-2">
				{toasts.map((toast) => (
					<Toast
						key={toast.id}
						id={toast.id}
						message={toast.message}
						type={toast.type}
						onClose={removeToast}
					/>
				))}
			</div>
		</ToastContext.Provider>
	);
}
