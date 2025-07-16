import "dotenv/config";

import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { eq } from "drizzle-orm";
import { Router } from "express";
import jwt from "jsonwebtoken";

import { db, schema } from "../database/index.ts";
import { Errors, type Error } from "../services/ErrorHandler.ts";

const router = Router();

router.post("/", async (request, response) => {
	const { username, email, password } = request.body;

	const sendError = (status: number, error: Error) =>
		response.status(status).json({
			from: "user",
			error: error,
		});

	if (!username) return sendError(400, Errors.USERNAME_NOT_PROVIDED);
	if (!email) return sendError(400, Errors.EMAIL_NOT_PROVIDED);
	if (!password) return sendError(400, Errors.PASSWORD_NOT_PROVIDED);

	const user = await db.query.user.findFirst({
		where: (user, { eq, or, and, isNull }) =>
			and(
				or(eq(user.email, email), eq(user.username, username)),
				isNull(user.deletedAt),
			),
	});

	if (user)
		return sendError(
			400,
			user.email === email
				? Errors.EMAIL_ALREADY_USED
				: Errors.USERNAME_ALREADY_USED,
		);

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

	return response.status(200).json({
		from: "user",
		error: 0,
	});
});

router.get("/", async (request, response) => {
	const {
		username,
		email,
		token,
		verifiedAt,
		createdAt,
		deletedAt,
		modifiedAt,
	} = request.body;

	const users = await db.query.user.findMany({
		where: (user, { and, eq, isNull }) => {
			const conditions = [];

			if (username) conditions.push(eq(user.username, username));
			if (email) conditions.push(eq(user.email, email));
			if (token) conditions.push(eq(user.token, token));

			const filterNullable = (value: any, column: any) => {
				if (value === undefined) return;
				conditions.push(value === null ? isNull(column) : eq(column, value));
			};

			filterNullable(verifiedAt, user.verifiedAt);
			filterNullable(createdAt, user.createdAt);
			filterNullable(deletedAt, user.deletedAt);
			filterNullable(modifiedAt, user.modifiedAt);

			return and(...conditions);
		},
	});

	return response.status(200).json({
		from: "user",
		users: users,
		error: 0,
	});
});

router.get("/:id", async (request, response) => {
	const id = Number(request.params.id);

	const sendError = (status: number, error: Error) =>
		response.status(status).json({
			from: "user",
			error: error,
		});

	if (isNaN(id)) return sendError(400, Errors.INVALID_ID);

	const user = await db.query.user.findFirst({
		where: (user, { eq, and, isNull }) =>
			and(eq(user.id, id), isNull(user.deletedAt)),
	});

	if (!user) return sendError(404, Errors.USER_NOT_FOUND);

	return response.status(200).json({
		from: "user",
		user: user,
		error: 0,
	});
});

router.put("/:id", async (request, response) => {
	const id = Number(request.params.id);

	const sendError = (status: number, error: Error) =>
		response.status(status).json({
			from: "user",
			error: error,
		});

	if (isNaN(id)) return sendError(400, Errors.INVALID_ID);

	const user = await db.query.user.findFirst({
		where: (user, { eq, and, isNull }) =>
			and(eq(user.id, id), isNull(user.deletedAt)),
	});

	if (!user) return sendError(404, Errors.USER_NOT_FOUND);

	const { username, email, password, token } = request.body;

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

	return response.status(200).json({
		from: "user",
		error: 0,
	});
});

router.patch("/:id", async (request, response) => {
	const id = Number(request.params.id);

	const sendError = (status: number, error: Error) =>
		response.status(status).json({
			from: "user",
			error: error,
		});

	if (isNaN(id)) return sendError(400, Errors.INVALID_ID);

	const user = await db.query.user.findFirst({
		where: (user, { eq, and, isNotNull }) =>
			and(eq(user.id, id), isNotNull(user.deletedAt)),
	});

	if (!user) return sendError(404, Errors.USER_NOT_FOUND);

	await db
		.update(schema.user)
		.set({
			deletedAt: null,
		})
		.where(eq(schema.user.id, id));

	return response.status(200).json({
		from: "user",
		error: 0,
	});
});

router.delete("/:id", async (request, response) => {
	const id = Number(request.params.id);

	const sendError = (status: number, error: Error) =>
		response.status(status).json({
			from: "user",
			error: error,
		});

	if (isNaN(id)) return sendError(400, Errors.INVALID_ID);

	const user = await db.query.user.findFirst({
		where: (user, { eq, and, isNull }) =>
			and(eq(user.id, id), isNull(user.deletedAt)),
	});

	if (!user) return sendError(404, Errors.USER_NOT_FOUND);

	await db
		.update(schema.user)
		.set({
			deletedAt: new Date(),
		})
		.where(eq(schema.user.id, id));

	return response.status(200).json({
		from: "user",
		error: 0,
	});
});

router.post("/login", async (request, response) => {
	const { email, password } = request.body;

	const sendError = (status: number, error: Error) =>
		response.status(status).json({
			from: "user",
			error: error,
		});

	if (!email) return sendError(400, Errors.EMAIL_NOT_PROVIDED);
	if (!password) return sendError(400, Errors.PASSWORD_NOT_PROVIDED);

	const user = await db.query.user.findFirst({
		where: (user, { eq, and, isNull }) =>
			and(eq(user.email, email), isNull(user.deletedAt)),
	});

	if (!user) return sendError(401, Errors.INVALID_EMAIL);

	if (user.token?.split(":")[0] == "ac")
		return sendError(401, Errors.USER_NOT_CONFIRMED);

	const [salt, storedHash] = user.password.split(":");

	if (!salt || !storedHash) return sendError(500, Errors.INTERNAL_ERROR);

	const storedHashBuffer = Buffer.from(storedHash, "hex");

	const currentHash = scryptSync(password, salt, 32);
	const currentHashBuffer = Buffer.from(currentHash);

	const match = timingSafeEqual(storedHashBuffer, currentHashBuffer);

	if (!match) return sendError(401, Errors.INVALID_PASSWORD);

	if (!process.env.API_SECRET) return sendError(500, Errors.INTERNAL_ERROR);

	const token = jwt.sign(
		{
			id: user.id,
			username: user.username,
			email: user.email,
		},
		process.env.API_SECRET,
		{ expiresIn: "7d" },
	);

	return response.status(200).json({
		from: "user",
		token: token,
		error: 0,
	});
});

export default router;
