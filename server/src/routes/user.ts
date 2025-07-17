import "dotenv/config";

import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { and, eq, isNotNull, isNull, or } from "drizzle-orm";
import { Router } from "express";
import jwt from "jsonwebtoken";

import { db, schema } from "../database";
import { Errors } from "../services/ErrorHandler";

const router = Router();

router.post("/", async (request, response) => {
	const { username, email, password } = request.body ?? {};

	if (!username) return request.sendError(400, Errors.REQUIRED_USERNAME);
	if (!email) return request.sendError(400, Errors.REQUIRED_EMAIL);
	if (!password) return request.sendError(400, Errors.REQUIRED_PASSWORD);

	const user = (
		await db
			.select()
			.from(schema.user)
			.where(
				and(
					or(eq(schema.user.email, email), eq(schema.user.username, username)),
					isNull(schema.user.deletedAt),
				),
			)
	)[0];

	if (user)
		return request.sendError(
			400,
			user.email === email
				? Errors.EMAIL_ALREADY_EXISTS
				: Errors.USERNAME_ALREADY_EXISTS,
		);

	const salt = randomBytes(16).toString("hex");
	const hash = scryptSync(password, salt, 32).toString("hex");

	const token = "ac:" + randomBytes(32).toString("hex");

	const userId = (
		await db
			.insert(schema.user)
			.values({
				username: username,
				email: email,
				password: `${salt}:${hash}`,
				token: token,
			})
			.returning()
	)[0].id;

	await db.insert(schema.userPermission).values({
		userId: userId,
		member: true,
		moderator: false,
		administrator: false,
	});

	// TODO: send account confirmation mail

	return response.status(200).json({
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
	} = request.body ?? {};

	const conditions = [];
	if (username) conditions.push(eq(schema.user.username, username as string));
	if (email) conditions.push(eq(schema.user.email, email as string));
	if (token) conditions.push(eq(schema.user.token, token as string));

	const filterNullable = (value: any, column: any) => {
		if (value === undefined) return;
		conditions.push(value === null ? isNull(column) : eq(column, value));
	};

	filterNullable(verifiedAt, schema.user.verifiedAt);
	filterNullable(createdAt, schema.user.createdAt);
	filterNullable(deletedAt, schema.user.deletedAt);
	filterNullable(modifiedAt, schema.user.modifiedAt);

	const users = await db
		.select()
		.from(schema.user)
		.where(and(...conditions));

	return response.status(200).json({
		value: users,
		error: 0,
	});
});

router.get("/:id", async (request, response) => {
	const id = Number(request.params.id);

	if (isNaN(id)) return request.sendError(400, Errors.INVALID_ID);

	const user = (
		await db.select().from(schema.user).where(eq(schema.user.id, id))
	)[0];

	if (!user) return request.sendError(404, Errors.USER_NOT_FOUND);

	return response.status(200).json({
		value: user,
		error: 0,
	});
});

router.put("/:id", async (request, response) => {
	const id = Number(request.params.id);

	if (isNaN(id)) return request.sendError(400, Errors.INVALID_ID);

	const user = (
		await db
			.select()
			.from(schema.user)
			.where(and(eq(schema.user.id, id), isNull(schema.user.deletedAt)))
	)[0];

	if (!user) return request.sendError(404, Errors.USER_NOT_FOUND);

	const { username, email, password, token } = request.body ?? {};

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
		error: 0,
	});
});

router.patch("/:id", async (request, response) => {
	const id = Number(request.params.id);

	if (isNaN(id)) return request.sendError(400, Errors.INVALID_ID);

	const user = (
		await db
			.select()
			.from(schema.user)
			.where(and(eq(schema.user.id, id), isNotNull(schema.user.deletedAt)))
	)[0];

	if (!user) return request.sendError(404, Errors.USER_NOT_FOUND);

	await db
		.update(schema.user)
		.set({
			deletedAt: null,
		})
		.where(eq(schema.user.id, id));

	return response.status(200).json({
		error: 0,
	});
});

router.delete("/:id", async (request, response) => {
	const id = Number(request.params.id);
	if (isNaN(id)) return request.sendError(400, Errors.INVALID_ID);

	const user = (
		await db
			.select()
			.from(schema.user)
			.where(and(eq(schema.user.id, id), isNull(schema.user.deletedAt)))
	)[0];

	if (!user) return request.sendError(404, Errors.USER_NOT_FOUND);

	await db
		.update(schema.user)
		.set({
			deletedAt: new Date(),
		})
		.where(eq(schema.user.id, id));

	return response.status(200).json({
		error: 0,
	});
});

router.post("/login", async (request, response) => {
	const { email, password } = request.body ?? {};

	if (!email) return request.sendError(400, Errors.REQUIRED_EMAIL);
	if (!password) return request.sendError(400, Errors.REQUIRED_PASSWORD);

	const user = (
		await db
			.select()
			.from(schema.user)
			.where(and(eq(schema.user.email, email), isNull(schema.user.deletedAt)))
	)[0];

	if (!user) return request.sendError(401, Errors.INVALID_EMAIL);

	if (user.token?.split(":")[0] == "ac")
		return request.sendError(401, Errors.USER_NOT_CONFIRMED);

	const [salt, storedHash] = user.password.split(":");

	if (!salt || !storedHash)
		return request.sendError(500, Errors.INTERNAL_ERROR);

	const storedHashBuffer = Buffer.from(storedHash, "hex");

	const currentHash = scryptSync(password, salt, 32);
	const currentHashBuffer = Buffer.from(currentHash);

	const match = timingSafeEqual(storedHashBuffer, currentHashBuffer);

	if (!match) return request.sendError(401, Errors.INVALID_PASSWORD);

	if (!process.env.API_SECRET)
		return request.sendError(500, Errors.INTERNAL_ERROR);

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
		value: token,
		error: 0,
	});
});

export default router;
