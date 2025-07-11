import { useEffect, useId, useRef } from "react";

type ModalProps = {
	onClose: () => void;
	header?: React.ReactNode;
	main?: React.ReactNode;
	footer?: React.ReactNode;
};

export default function Modal(props: ModalProps) {
	const id = useId();
	const modalRef = useRef<HTMLDivElement>(null);

	const handleClick = (event: MouseEvent) => {
		if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
			props.onClose();
		}
	};

	const handleKeydown = (event: KeyboardEvent) => {
		if (event.key === "Escape") {
			props.onClose();
		}
	};

	useEffect(() => {
		document.addEventListener("mousedown", handleClick, true);
		document.addEventListener("keydown", handleKeydown);

		return () => {
			document.removeEventListener("mousedown", handleClick, true);
			document.removeEventListener("keydown", handleKeydown);
		};
	}, [props.onClose]);

	return (
		<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
			<div
				id={id}
				className="bg-white border border-stone-300 rounded-lg shadow-md min-w-[250px] min-h-[180px] max-w-full max-h-full overflow-auto"
				role="dialog"
				tabIndex={-1}
				ref={modalRef}
			>
				{props.header && <header>{props.header}</header>}
				<main>{props.main}</main>
				{props.footer && <footer>{props.footer}</footer>}
			</div>
		</div>
	);
}
