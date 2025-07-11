import { useId } from "react";

type AlertProps = {
	type: "error" | "warning" | "success" | "info";
	children: React.ReactNode;
};

export default function Alert(props: AlertProps) {
	const id = useId();

	const typeClass = {
		error: "border-red-400 bg-red-300",
		warning: "border-orange-400 bg-orange-300",
		success: "border-green-400 bg-green-300",
		info: "border-blue-400 bg-blue-300",
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
