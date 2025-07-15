import { useState } from "react";

import { Modal, Input, Alert, Tooltip, Dropdown } from "../../components";
import { useToast } from "../../hooks/toast";

export default function Home() {
	const [loginModal, setLoginModal] = useState(false);
	const [registerModal, setRegisterModal] = useState(false);

	const { addToast } = useToast();

	const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {};
	const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {};

	return (
		<>
			<header>
				<div>
					<div>
						<a href="#">features</a>
						<a href="#">search</a>
						<a href="#">contact</a>
					</div>
					<div>
						<a href="/dashboard">Go to dashboard</a>
						<button onClick={() => setLoginModal(true)}>Log in</button>
						<button onClick={() => setRegisterModal(true)}>Register</button>
					</div>
				</div>
			</header>

			{loginModal && (
				<Modal onClose={() => setLoginModal(false)}>
					<form className="flex flex-col p-6" onSubmit={handleLogin}>
						<div className="mb-6">
							<Input
								type="email"
								name="email"
								placeholder="john.doe@gmail.com"
								label={<>Email</>}
								icon={
									<svg
										className="w-4 h-4 text-stone-500"
										xmlns="http://www.w3.org/2000/svg"
										width="32"
										height="32"
										viewBox="0 0 24 24"
									>
										<path
											fill="currentColor"
											d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 4l-8 5l-8-5V6l8 5l8-5z"
										/>
									</svg>
								}
								required
							/>
						</div>

						<div className="mb-6">
							<Input
								type="password"
								name="password"
								placeholder="••••••••"
								label={<>Password</>}
								icon={
									<svg
										className="w-4 h-4 text-stone-500"
										xmlns="http://www.w3.org/2000/svg"
										width="32"
										height="32"
										viewBox="0 0 24 24"
									>
										<path
											fill="currentColor"
											d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2m-6 9c-1.1 0-2-.9-2-2s.9-2 2-2s2 .9 2 2s-.9 2-2 2m3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1z"
										/>
									</svg>
								}
								required
							/>
						</div>

						<div className="mb-6">
							<Input
								type="checkbox"
								name="timeframe"
								label={<>Stay logged in for 2 month</>}
							/>
						</div>

						<Input type="submit" value="Submit" />
					</form>
				</Modal>
			)}

			{registerModal && (
				<Modal onClose={() => setRegisterModal(false)}>
					<form className="flex flex-col p-6" onSubmit={handleRegister}>
						<div className="mb-6">
							<Input
								type="text"
								name="username"
								placeholder="john_doe"
								label={<>Username</>}
								icon={
									<svg
										className="w-4 h-4 text-stone-500"
										xmlns="http://www.w3.org/2000/svg"
										width="32"
										height="32"
										viewBox="0 0 24 24"
									>
										<path
											fill="currentColor"
											d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4s-4 1.79-4 4s1.79 4 4 4m0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4"
										/>
									</svg>
								}
								required
							/>
						</div>

						<div className="mb-6">
							<Input
								type="email"
								name="email"
								placeholder="john.doe@gmail.com"
								label={<>Email</>}
								icon={
									<svg
										className="w-4 h-4 text-stone-500"
										xmlns="http://www.w3.org/2000/svg"
										width="32"
										height="32"
										viewBox="0 0 24 24"
									>
										<path
											fill="currentColor"
											d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 4l-8 5l-8-5V6l8 5l8-5z"
										/>
									</svg>
								}
								required
							/>
						</div>

						<div className="mb-6">
							<Input
								type="password"
								name="password"
								placeholder="••••••••"
								label={<>Password</>}
								icon={
									<svg
										className="w-4 h-4 text-stone-500"
										xmlns="http://www.w3.org/2000/svg"
										width="32"
										height="32"
										viewBox="0 0 24 24"
									>
										<path
											fill="currentColor"
											d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2m-6 9c-1.1 0-2-.9-2-2s.9-2 2-2s2 .9 2 2s-.9 2-2 2m3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1z"
										/>
									</svg>
								}
								required
							/>
						</div>

						<div className="mb-6">
							<Input
								type="checkbox"
								label={
									<>
										I agree with the{" "}
										<a className="text-blue-600 hover:underline" href="#">
											terms and conditions
										</a>
									</>
								}
								required
							/>
						</div>

						<Input type="submit" value="Submit" />
					</form>
				</Modal>
			)}

			<button onClick={() => addToast("oskour", "error")}>oskour</button>
		</>
	);
}
