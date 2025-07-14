import { Router } from "express";
import { db, schema } from "../database/index.ts";
import { randomBytes, scryptSync } from "crypto";
import { eq } from "drizzle-orm";

const router = Router();

router.post("/", async (request, response) => {
	const username = request.body.username;
	const email = request.body.email;
	const password = request.body.password;

	if (!username || !email || !password) {
		response.status(404).json({
			from: "user",
			message: "All field are required",
		});
		return;
	}

	const user = await db.query.user.findFirst({
		where: (user, { eq, or, and, isNull }) =>
			and(
				or(eq(user.email, email), eq(user.username, username)),
				isNull(user.deletedAt),
			),
	});

	if (user) {
		response.status(404).json({
			from: "user",
			message: "Username or email already used",
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

	// TODO: send account confirmation mail

	response.status(200).json({
		from: "user",
		message: "User successfully created",
	});
	return;
});

router.get("/", async (request, response) => {
	const users = await db.query.user.findMany({
		where: (user, { isNull }) => isNull(user.deletedAt),
	});

	response.status(200).json({
		from: "user",
		users: users,
		message: "Users successfully fetched",
	});
	return;
});

router.get("/:id", async (request, response) => {
	const id = Number(request.params.id);

	const user = await db.query.user.findFirst({
		where: (user, { eq, and, isNull }) =>
			and(eq(user.id, id), isNull(user.deletedAt)),
	});

	if (!user) {
		response.status(404).json({
			from: "user",
			message: "User not found",
		});
		return;
	}

	response.status(200).json({
		from: "user",
		user: user,
		message: "User successfully fetched",
	});
	return;
});

router.put("/:id", async (request, response) => {
	const id = Number(request.params.id);

	const user = await db.query.user.findFirst({
		where: (user, { eq, and, isNull }) =>
			and(eq(user.id, id), isNull(user.deletedAt)),
	});

	if (!user) {
		response.status(404).json({
			from: "user",
			message: "User not found",
		});
		return;
	}

	const username = request.body.username;
	const email = request.body.email;
	const password = request.body.password;
	const token = request.body.token;

	await db
		.update(schema.user)
		.set({
			username: username ?? user.username,
			email: email ?? user.email,
			password: password ?? user.password,
			token: token ?? user.token,
			modifiedAt: new Date(),
		})
		.where(eq(schema.user.id, id));

	response.status(200).json({
		from: "user",
		message: "User successfully updated",
	});
	return;
});

router.patch("/:id", async (request, response) => {
	const id = Number(request.params.id);

	const user = await db.query.user.findFirst({
		where: (user, { eq, and, isNotNull }) =>
			and(eq(user.id, id), isNotNull(user.deletedAt)),
	});

	if (!user) {
		response.status(404).json({
			from: "user",
			message: "Deleted user not found",
		});
	}

	await db
		.update(schema.user)
		.set({
			deletedAt: null,
		})
		.where(eq(schema.user.id, id));

	response.status(200).json({
		from: "user",
		message: "User successfully restored",
	});
	return;
});

router.delete("/:id", async (request, response) => {
	const id = Number(request.params.id);

	const user = await db.query.user.findFirst({
		where: (user, { eq, and, isNull }) =>
			and(eq(user.id, id), isNull(user.deletedAt)),
	});

	if (!user) {
		response.status(404).json({
			from: "user",
			message: "User not found",
		});
	}

	await db
		.update(schema.user)
		.set({
			deletedAt: new Date(),
		})
		.where(eq(schema.user.id, id));

	response.status(200).json({
		from: "user",
		message: "User successfully deleted",
	});
	return;
});

router.post("/login", async (request, response) => {});

export default router;
