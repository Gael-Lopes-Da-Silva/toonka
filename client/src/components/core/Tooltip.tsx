import { useState } from "react";

type TooltipProps = {
	position: "top" | "bottom" | "left" | "right";
	content: React.ReactNode;
	children: React.ReactNode;
};

export default function Tooltip(props: TooltipProps) {
	const [visible, setVisible] = useState(false);

	return (
		<>
			<div
				className="relative inline-block"
				onMouseEnter={() => setVisible(true)}
				onMouseLeave={() => setVisible(false)}
			>
				{visible && (
					<div
						className={`absolute bg-stone-100 border border-stone-200 rounded-lg px-2 py-1 shadow-md ${
							{
								top: "top-0 -translate-y-full left-1/2 -translate-x-1/2",
								bottom: "bottom-0 translate-y-full left-1/2 -translate-x-1/2",
								left: "left-0 -translate-x-full top-1/2 -translate-y-1/2",
								right: "right-0 translate-x-full top-1/2 -translate-y-1/2",
							}[props.position]
						}`}
					>
						{props.content}
					</div>
				)}
				{props.children}
			</div>
		</>
	);
}
