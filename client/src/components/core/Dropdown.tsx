import { useEffect, useId, useRef, useState } from "react";

type DropdownProps = {
	position: "top" | "bottom" | "left" | "right";
	children: React.ReactNode;
	content: React.ReactNode;
};

export default function Dropdown(props: DropdownProps) {
	const id = useId();
	const dropdownRef = useRef<HTMLDivElement>(null);

	const [visible, setVisible] = useState(false);

	const handleClick = (event: MouseEvent) => {
		if (
			dropdownRef.current &&
			!dropdownRef.current.contains(event.target as Node)
		) {
			setVisible(false);
		}
	};

	const handleKeydown = (event: KeyboardEvent) => {
		if (event.key === "Escape") {
			setVisible(false);
		}
	};

	useEffect(() => {
		document.addEventListener("mousedown", handleClick, true);
		document.addEventListener("keydown", handleKeydown);

		return () => {
			document.removeEventListener("mousedown", handleClick, true);
			document.removeEventListener("keydown", handleKeydown);
		};
	}, []);

	return (
		<>
			<div className="relative inline-block" id={id} ref={dropdownRef}>
				<div onClick={() => setVisible(true)}>{props.children}</div>
				{visible && (
					<div
						className={`absolute bg-stone-100 border border-stone-200 rounded-lg shadow-md ${
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
			</div>
		</>
	);
}
