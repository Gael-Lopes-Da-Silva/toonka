import "dotenv/config";

import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { and, eq, isNull, or } from "drizzle-orm";
import { Router } from "express";
import jwt from "jsonwebtoken";

import { db, schema } from "../database";
import { authentification, permissions } from "../middlewares/individual";
import { Errors } from "../services/ErrorHandler";

const router = Router();

router.post("/login", async (request, response) => {
	const { email, password } = request.body ?? {};

	if (!email || !password) return request.sendError(400, Errors.REQUIRED_FIELD);

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

router.post("/", async (request, response) => {
	const { username, email, password } = request.body ?? {};

	if (!username || !email || !password)
		return request.sendError(400, Errors.REQUIRED_FIELD);

	const user = (
		await db
			.select()
			.from(schema.user)
			.where(
				or(eq(schema.user.email, email), eq(schema.user.username, username)),
			)
	)[0];

	if (user) {
		if (user.email === email)
			return request.sendError(400, Errors.EMAIL_ALREADY_EXISTS);
		if (user.username === username)
			return request.sendError(400, Errors.USERNAME_ALREADY_EXISTS);
	}

	const salt = randomBytes(16).toString("hex");
	const hash = scryptSync(password, salt, 32).toString("hex");

	const token = "ac:" + randomBytes(32).toString("hex");

	const result = (
		await db
			.insert(schema.user)
			.values({
				username: username,
				email: email,
				password: `${salt}:${hash}`,
				token: token,
			})
			.returning()
	)[0];

	// FIXME: should be done via trigger
	await db.insert(schema.userPermission).values({
		userId: result.id,
	});

	// TODO: send account confirmation mail

	return response.status(200).json({
		value: result,
		error: 0,
	});
});

router.get(
	"/",
	authentification,
	permissions("moderator"),
	async (request, response) => {
		const {
			username,
			email,
			token,
			verifiedAt,
			createdAt,
			deletedAt,
			modifiedAt,
		} = request.body ?? {};

		const conditions: any[] = [];

		const filterEqual = (value: any, column: any) => {
			if (!value) return;
			conditions.push(eq(column, value));
		};

		filterEqual(username, schema.user.username);
		filterEqual(email, schema.user.email);
		filterEqual(token, schema.user.token);

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
	},
);

router.get(
	"/:id",
	authentification,
	permissions("moderator", {
		bypassUserId: true,
	}),
	async (request, response) => {
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
	},
);

router.put(
	"/:id",
	authentification,
	permissions("moderator", {
		bypassUserId: true,
	}),
	async (request, response) => {
		const id = Number(request.params.id);
		if (isNaN(id)) return request.sendError(400, Errors.INVALID_ID);

		if (id !== request.user.id)
			return request.sendError(401, Errors.UNAUTHORIZED);

		const user = (
			await db.select().from(schema.user).where(eq(schema.user.id, id))
		)[0];

		if (!user) return request.sendError(404, Errors.USER_NOT_FOUND);

		if (user.deletedAt !== null)
			return request.sendError(400, Errors.RESSOURCE_DELETED);

		const { username, email, password, token } = request.body ?? {};

		const result = (
			await db
				.update(schema.user)
				.set({
					modifiedAt: new Date(),
					...(username !== undefined && { username }),
					...(email !== undefined && { email }),
					...(password !== undefined && { password }),
					...(token !== undefined && { token }),
				})
				.where(eq(schema.user.id, id))
				.returning()
		)[0];

		return response.status(200).json({
			value: result,
			error: 0,
		});
	},
);

router.delete(
	"/:id",
	authentification,
	permissions("moderator", {
		bypassUserId: true,
	}),
	async (request, response) => {
		const id = Number(request.params.id);
		if (isNaN(id)) return request.sendError(400, Errors.INVALID_ID);

		if (id !== request.user.id)
			return request.sendError(401, Errors.UNAUTHORIZED);

		const user = (
			await db.select().from(schema.user).where(eq(schema.user.id, id))
		)[0];

		if (!user) return request.sendError(404, Errors.USER_NOT_FOUND);

		if (user.deletedAt !== null)
			return request.sendError(400, Errors.RESSOURCE_ALREADY_DELETED);

		const result = (
			await db
				.update(schema.user)
				.set({
					deletedAt: new Date(),
				})
				.where(eq(schema.user.id, id))
				.returning()
		)[0];

		return response.status(200).json({
			value: result,
			error: 0,
		});
	},
);

export default router;
