import { useEffect, useId, useRef } from "react";

const modalStack = (window.modalStack = window.modalStack || []);

export default function Modal(props) {
	const id = useId();

	const modalRef = useRef(null);

	const handleClick = (event) => {
		if (modalStack[modalStack.length - 1] === modalRef.current) {
			if (!modalRef.current?.contains(event.target)) {
				props.onClose();
			}
		}
	};

	const handleKeydown = (event) => {
		if (
			event.key === "Escape" &&
			modalStack[modalStack.length - 1] === modalRef.current
		) {
			props.onClose();
		}
	};

	useEffect(() => {
		const currentModal = modalRef.current;
		modalStack.push(currentModal);

		const timer = setTimeout(() => {
			document.addEventListener("mousedown", handleClick, true);
			document.addEventListener("keydown", handleKeydown);
		}, 0);

		return () => {
			const index = modalStack.indexOf(currentModal);
			if (index !== -1) {
				modalStack.splice(index, 1);
			}
			document.removeEventListener("mousedown", handleClick, true);
			document.removeEventListener("keydown", handleKeydown);
			clearTimeout(timer);
		};
	}, [props.onClose]);

	return (
		<>
			<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
				<div
					id={id}
					className="bg-white border-5 border-dashed border-black rounded-lg shadow-md min-w-[200px] min-h-[150px] max-w-full max-h-full overflow-auto"
					role="dialog"
					tabIndex={-1}
					ref={modalRef}
				>
					{props.header && <header>{props.header}</header>}
					<main>{props.main}</main>
					{props.footer && <footer>{props.footer}</footer>}
				</div>
			</div>
		</>
	);
}
