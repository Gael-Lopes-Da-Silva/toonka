import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, schema } from "../../database";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

import { Modal, Input, Alert } from "../../components";

export default function Home() {
	const navigate = useNavigate();

	const [loginModal, setLoginModal] = useState(false);
	const [registerModal, setRegisterModal] = useState(false);

	const [formData, setFormData] = useState(
		{} as {
			login?: {
				type: string;
				message: string;
			};
			register?: {
				type: string;
				message: string;
			};
		},
	);

	const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const data = new FormData(event.currentTarget);
		const email = data.get("email") as string;
		const password = data.get("password") as string;

		const user = await db.query.user.findFirst({
			where: (user, { eq }) => eq(user.email, email),
		});

		if (!user) {
			setFormData({
				login: {
					type: "error",
					message: "Invalid credentials",
				},
			});
			return;
		}

		if (user.token && user.token.split(":")[0] === "ac") {
			setFormData({
				login: {
					type: "error",
					message: "Account not confirmed",
				},
			});
			return;
		}

		const [salt, storedHash] = user.password.split(":");
		const storedHashBuffer = Buffer.from(storedHash, "hex");

		const currentHash = scryptSync(password, salt, 32);
		const currentHashBuffer = Buffer.from(currentHash);

		const match = timingSafeEqual(storedHashBuffer, currentHashBuffer);

		if (!match) {
			setFormData({
				login: {
					type: "error",
					message: "Invalid credentials",
				},
			});
			return;
		}

		const storage =
			data.get("timeframe") === "on" ? localStorage : sessionStorage;

		storage.setItem(
			"authentification",
			JSON.stringify({ id: user.id, loggedAt: Date.now() }),
		);

		navigate("/dashboard");
		return;
	};

	const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const data = new FormData(event.currentTarget);
		const username = data.get("username") as string;
		const email = data.get("email") as string;
		const password = data.get("password") as string;

		const user = await db.query.user.findFirst({
			where: (user, { eq, or }) =>
				or(eq(user.email, email), eq(user.username, username)),
		});

		if (user) {
			setFormData({
				register: {
					type: "error",
					message: "Username or email already used",
				},
			});
			return;
		}

		const salt = randomBytes(16).toString("hex");
		const hash = scryptSync(password, salt, 32).toString("hex");
		const token = "ac:" + randomBytes(32).toString("hex");

		await db.insert(schema.user).values({
			username: username,
			email: email,
			password: `${salt}:${hash}`,
			token: token,
		});

		// TODO: send a confirmation mail

		setFormData({
			register: {
				type: "success",
				message: "Account created. Check your mails",
			},
		});
		return;
	};

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
				<Modal
					onClose={() => setLoginModal(false)}
					main={
						<>
							<form className="flex flex-col p-6" onSubmit={handleLogin}>
								{formData.login && (
									<>
										<Alert
											type={
												formData.login.type as
													| "error"
													| "warning"
													| "success"
													| "info"
											}
										>
											{formData.login.message}
										</Alert>
									</>
								)}

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
						</>
					}
				/>
			)}

			{registerModal && (
				<Modal
					onClose={() => setRegisterModal(false)}
					main={
						<>
							<form className="flex flex-col p-6" onSubmit={handleRegister}>
								{formData.register && (
									<>
										<Alert
											type={
												formData.register.type as
													| "error"
													| "warning"
													| "success"
													| "info"
											}
										>
											{formData.register.message}
										</Alert>
									</>
								)}

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
						</>
					}
				/>
			)}
		</>
	);
}
