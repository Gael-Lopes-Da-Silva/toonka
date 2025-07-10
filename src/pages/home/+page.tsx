import { useState } from "react";
import { Modal } from "../../components";

const Home = () => {
	let [showModal, setShowModal] = useState(false);

	return (
		<>
			<button
				onClick={() => {
					setShowModal(true);
				}}
			>
				test
			</button>
			{showModal && (
				<Modal
					main={<>test</>}
					onClose={() => {
						setShowModal(false);
					}}
				/>
			)}
		</>
	);
};

export default Home;
