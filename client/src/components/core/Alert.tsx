import { useId } from "react";

type AlertProps = {
	type: "error" | "warning" | "success" | "info";
	children: React.ReactNode;
};

export default function Alert(props: AlertProps) {
	const id = useId();

	const typeClass = {
		error: "border-red-500 bg-red-400 text-red-800",
		warning: "border-orange-500 bg-orange-400 text-orange-800",
		success: "border-green-500 bg-green-400 text-green-800",
		info: "border-blue-500 bg-blue-400 text-blue-800",
	};

	return (
		<>
			<div
				id={id}
				className={`flex items-center rounded-lg text-sm p-4 border ${typeClass[props.type]}`}
			>
				{props.children}
			</div>
		</>
	);
}
