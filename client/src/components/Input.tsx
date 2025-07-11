import { useId } from "react";

type InputProps = {
	type: string;
	name?: string;
	label?: React.ReactNode;
	value?: string;
	placeholder?: string;
	required?: boolean;
	icon?: React.ReactNode;
	min?: string;
	max?: string;
};

export default function Input(props: InputProps) {
	const id = useId();

	return (
		<>
			{[
				"text",
				"email",
				"password",
				"hidden",
				"tel",
				"date",
				"datetime",
				"datetime-local",
				"time",
				"week",
				"month",
				"number",
			].includes(props.type) && (
				<>
					{props.label && (
						<label className="mb-2 block text-sm font-medium" htmlFor={id}>
							{props.label}
						</label>
					)}
					<div className="relative">
						{props.icon && (
							<div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3.5">
								{props.icon}
							</div>
						)}
						<input
							id={id}
							className={`block w-full rounded-lg text-black placeholder-stone-500 border border-stone-300 bg-stone-50 p-2.5 text-sm transition hover:bg-stone-100 focus:ring-4 focus:ring-blue-300 focus:outline-none ${props.icon ? "ps-10" : ""}`}
							type={props.type}
							name={props.name}
							value={props.value}
							placeholder={props.placeholder}
							min={props.min}
							max={props.max}
							required={props.required}
						/>
					</div>
				</>
			)}

			{["submit", "button"].includes(props.type) && (
				<>
					<input
						id={id}
						className="w-full rounded-lg border border-blue-300 bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 focus:outline-none transition cursor-pointer"
						type={props.type}
						name={props.name}
						value={props.value}
					/>
				</>
			)}

			{["checkbox", "radio"].includes(props.type) && (
				<>
					<div className="flex items-center">
						<input
							id={id}
							className="h-4 w-4 shrink-0 appearance-none rounded-sm border border-stone-300 bg-stone-50 transition checked:bg-blue-600 focus:ring-4 focus:ring-blue-300 focus:outline-none"
							type={props.type}
							name={props.name}
							value={props.value}
							required={props.required}
						/>
						{props.label && (
							<>
								<label className="ms-2 text-xs font-medium" htmlFor={id}>
									{props.label}
								</label>
							</>
						)}
					</div>
				</>
			)}
		</>
	);
}
