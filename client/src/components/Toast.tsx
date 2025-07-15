import { useEffect, useState } from "react";

import { ToastContext } from "../hooks/toast";

type Toast = {
	id: number;
	message: string;
	type: "error" | "warning" | "success" | "info";
};

type ToastItemProps = {
	toast: Toast;
	removeToast: (id: number) => void;
};

function ToastItem(props: ToastItemProps) {
	useEffect(() => {
		const timer = setTimeout(() => props.removeToast(props.toast.id), 3000);
		return () => clearTimeout(timer);
	}, [props.toast.id, props.removeToast]);

	return (
		<div
			className={`${
				{
					error: "",
					warning: "",
					success: "",
					info: "",
				}[props.toast.type]
			}`}
			id={`${props.toast.id}`}
		>
			{props.toast.message}
		</div>
	);
}

type ToastProps = {
	children: React.ReactNode;
};

export default function Toast(props: ToastProps) {
	const [toasts, setToasts] = useState<Toast[]>([]);

	const addToast = (
		message: string,
		type: "error" | "warning" | "success" | "info",
	) => {
		const id = Date.now();
		setToasts((previous) => [...previous, { id, message, type }]);
	};

	const removeToast = (id: number) => {
		setToasts((previous) => previous.filter((toast) => toast.id !== id));
	};

	return (
		<>
			<ToastContext.Provider value={{ addToast, removeToast }}>
				{props.children}
				<div className="fixed top-4 right-4 z-50">
					{toasts.map((toast) => (
						<ToastItem key={toast.id} toast={toast} removeToast={removeToast} />
					))}
				</div>
			</ToastContext.Provider>
		</>
	);
}
