import "dotenv/config";

import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { and, asc, desc, eq, isNull, or } from "drizzle-orm";
import { Router } from "express";
import jwt from "jsonwebtoken";

import { db, schema } from "../database";
import { authentification } from "../middlewares/individual";
import { Errors } from "../services/ErrorHandler";

const router = Router();

// LOGIN
router.post("/login", async (request, response) => {
	if (!request.body.email || !request.body.password) {
		return request.sendError(400, Errors.REQUIRED_FIELD);
	}

	const user = (
		await db
			.select()
			.from(schema.user)
			.where(and(eq(schema.user.email, request.body.email)))
	)[0];

	if (!user) {
		return request.sendError(401, Errors.INVALID_EMAIL);
	}

	if (user.deletedAt !== null) {
		return request.sendError(401, Errors.RESSOURCE_DELETED);
	}

	if (user.token?.split(":")[0] == "ac") {
		return request.sendError(401, Errors.USER_NOT_CONFIRMED);
	}

	const [salt, storedHash] = user.password.split(":");

	if (!salt || !storedHash) {
		return request.sendError(500, Errors.INTERNAL_ERROR);
	}

	const storedHashBuffer = Buffer.from(storedHash, "hex");

	const currentHash = scryptSync(request.body.password, salt, 32);
	const currentHashBuffer = Buffer.from(currentHash);

	const match = timingSafeEqual(storedHashBuffer, currentHashBuffer);

	if (!match) {
		return request.sendError(401, Errors.INVALID_PASSWORD);
	}

	if (!process.env.API_SECRET) {
		return request.sendError(500, Errors.INTERNAL_ERROR);
	}

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

// CREATE
router.post("/", async (request, response) => {
	if (!request.body.username || !request.body.email || !request.body.password) {
		return request.sendError(400, Errors.REQUIRED_FIELD);
	}

	const user = (
		await db
			.select()
			.from(schema.user)
			.where(
				or(
					eq(schema.user.email, request.body.email),
					eq(schema.user.username, request.body.username),
				),
			)
	)[0];

	if (user) {
		return request.sendError(
			400,
			user.email === request.body.email
				? Errors.EMAIL_ALREADY_EXISTS
				: Errors.USERNAME_ALREADY_EXISTS,
		);
	}

	const salt = randomBytes(16).toString("hex");
	const hash = scryptSync(request.body.password, salt, 32).toString("hex");

	const token = "ac:" + randomBytes(32).toString("hex");

	const result = (
		await db
			.insert(schema.user)
			.values({
				username: request.body.username,
				email: request.body.email,
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

// READ
router.get("/:id?", authentification, async (request, response) => {
	if (request.params.id) {
		if (request.user.id !== request.params.id) {
			const userPermission = (
				await db
					.select()
					.from(schema.userPermission)
					.where(eq(schema.userPermission.userId, request.user.id))
			)[0];

			if (!userPermission) {
				return request.sendError(401, Errors.INTERNAL_ERROR);
			}

			if (!userPermission.administrator && !userPermission.moderator) {
				return request.sendError(401, Errors.UNAUTHORIZED);
			}
		}

		const user = (
			await db
				.select()
				.from(schema.user)
				.where(eq(schema.user.id, request.params.id))
		)[0];

		if (!user) {
			return request.sendError(404, Errors.RESSOURCE_NOT_FOUND);
		}

		return response.status(200).json({
			value: user,
			error: 0,
		});
	}

	const userPermission = (
		await db
			.select()
			.from(schema.userPermission)
			.where(eq(schema.userPermission.userId, request.user.id))
	)[0];

	if (!userPermission) {
		return request.sendError(401, Errors.INTERNAL_ERROR);
	}

	if (!userPermission.administrator && !userPermission.moderator) {
		return request.sendError(401, Errors.UNAUTHORIZED);
	}

	const conditions: any[] = [];

	const filterEqual = (value: any, column: any) => {
		if (!value) return;
		conditions.push(eq(column, value));
	};

	filterEqual(request.query.username, schema.user.username);
	filterEqual(request.query.email, schema.user.email);
	filterEqual(request.query.token, schema.user.token);

	const filterNullable = (value: any, column: any) => {
		if (value === undefined) return;
		conditions.push(value === null ? isNull(column) : eq(column, value));
	};

	filterNullable(request.query.verifiedAt, schema.user.verifiedAt);
	filterNullable(request.query.createdAt, schema.user.createdAt);
	filterNullable(request.query.deletedAt, schema.user.deletedAt);
	filterNullable(request.query.modifiedAt, schema.user.modifiedAt);

	let query: any = db.select().from(schema.user);

	if (conditions.length > 0) {
		query = query.where(and(...conditions));
	}

	const orderMap = [
		"username",
		"email",
		"token",
		"verifiedAt",
		"createdAt",
		"deletedAt",
		"modifiedAt",
	] as const;

	if (
		request.query.orderBy &&
		orderMap.includes(request.query.orderBy as (typeof orderMap)[number])
	) {
		query = query.orderBy(
			request.query.orderDirection === "desc"
				? desc(schema.user[request.query.orderBy as (typeof orderMap)[number]])
				: asc(schema.user[request.query.orderBy as (typeof orderMap)[number]]),
		);
	}

	const users = await query;

	return response.status(200).json({
		value: users,
		error: 0,
	});
});

// UPDATE
router.put("/:id?", authentification, async (request, response) => {
	if (request.params.id) {
		if (request.user.id !== request.params.id) {
			const userPermissions = (
				await db
					.select()
					.from(schema.userPermission)
					.where(eq(schema.userPermission.userId, request.user.id))
			)[0];

			if (!userPermissions) {
				return request.sendError(401, Errors.INTERNAL_ERROR);
			}

			if (!userPermissions.administrator && !userPermissions.moderator) {
				return request.sendError(401, Errors.UNAUTHORIZED);
			}
		}

		const user = (
			await db
				.select()
				.from(schema.user)
				.where(eq(schema.user.id, request.params.id))
		)[0];

		if (!user) {
			return request.sendError(404, Errors.RESSOURCE_NOT_FOUND);
		}

		if (user.deletedAt !== null) {
			return request.sendError(400, Errors.RESSOURCE_DELETED);
		}

		const result = (
			await db
				.update(schema.user)
				.set({
					modifiedAt: new Date(),
					...(request.body.username !== undefined && {
						username: request.body.username,
					}),
					...(request.body.email !== undefined && {
						email: request.body.email,
					}),
					...(request.body.password !== undefined && {
						password: request.body.password,
					}),
					...(request.body.token !== undefined && {
						token: request.body.token,
					}),
				})
				.where(eq(schema.user.id, request.params.id))
				.returning()
		)[0];

		return response.status(200).json({
			value: result,
			error: 0,
		});
	}

	const userPermission = (
		await db
			.select()
			.from(schema.userPermission)
			.where(eq(schema.userPermission.userId, request.user.id))
	)[0];

	if (!userPermission) {
		return request.sendError(401, Errors.INTERNAL_ERROR);
	}

	if (!userPermission.administrator && !userPermission.moderator) {
		return request.sendError(401, Errors.UNAUTHORIZED);
	}

	const conditions: any[] = [];

	const filterEqual = (value: any, column: any) => {
		if (!value) return;
		conditions.push(eq(column, value));
	};

	filterEqual(request.query.username, schema.user.username);
	filterEqual(request.query.email, schema.user.email);
	filterEqual(request.query.token, schema.user.token);

	const filterNullable = (value: any, column: any) => {
		if (value === undefined) return;
		conditions.push(value === null ? isNull(column) : eq(column, value));
	};

	filterNullable(request.query.verifiedAt, schema.user.verifiedAt);
	filterNullable(request.query.createdAt, schema.user.createdAt);
	filterNullable(request.query.deletedAt, schema.user.deletedAt);
	filterNullable(request.query.modifiedAt, schema.user.modifiedAt);

	let query: any = db.update(schema.user).set({
		modifiedAt: new Date(),
		...(request.body.username !== undefined && {
			username: request.body.username,
		}),
		...(request.body.email !== undefined && { email: request.body.email }),
		...(request.body.password !== undefined && {
			password: request.body.password,
		}),
		...(request.body.token !== undefined && { token: request.body.token }),
	});

	if (conditions.length > 0) {
		query = query.where(and(...conditions));
	}

	const users = await query;

	return response.status(200).json({
		value: users,
		error: 0,
	});
});

// DELETE
router.delete("/:id?", authentification, async (request, response) => {
	if (request.params.id) {
		if (request.user.id !== request.params.id) {
			const userPermissions = (
				await db
					.select()
					.from(schema.userPermission)
					.where(eq(schema.userPermission.userId, request.user.id))
			)[0];

			if (!userPermissions) {
				return request.sendError(401, Errors.INTERNAL_ERROR);
			}

			if (!userPermissions.administrator && !userPermissions.moderator) {
				return request.sendError(401, Errors.UNAUTHORIZED);
			}
		}

		const user = (
			await db
				.select()
				.from(schema.user)
				.where(eq(schema.user.id, request.params.id))
		)[0];

		if (!user) {
			return request.sendError(404, Errors.RESSOURCE_NOT_FOUND);
		}

		if (user.deletedAt !== null) {
			return request.sendError(400, Errors.RESSOURCE_ALREADY_DELETED);
		}

		const result = (
			await db
				.update(schema.user)
				.set({
					deletedAt: new Date(),
				})
				.where(eq(schema.user.id, request.params.id))
				.returning()
		)[0];

		return response.status(200).json({
			value: result,
			error: 0,
		});
	}

	const userPermission = (
		await db
			.select()
			.from(schema.userPermission)
			.where(eq(schema.userPermission.userId, request.user.id))
	)[0];

	if (!userPermission) {
		return request.sendError(401, Errors.INTERNAL_ERROR);
	}

	if (!userPermission.administrator && !userPermission.moderator) {
		return request.sendError(401, Errors.UNAUTHORIZED);
	}

	const conditions: any[] = [];

	const filterEqual = (value: any, column: any) => {
		if (!value) return;
		conditions.push(eq(column, value));
	};

	filterEqual(request.query.username, schema.user.username);
	filterEqual(request.query.email, schema.user.email);
	filterEqual(request.query.token, schema.user.token);

	const filterNullable = (value: any, column: any) => {
		if (value === undefined) return;
		conditions.push(value === null ? isNull(column) : eq(column, value));
	};

	filterNullable(request.query.verifiedAt, schema.user.verifiedAt);
	filterNullable(request.query.createdAt, schema.user.createdAt);
	filterNullable(request.query.deletedAt, schema.user.deletedAt);
	filterNullable(request.query.modifiedAt, schema.user.modifiedAt);

	let query: any = db.update(schema.user).set({
		deletedAt: new Date(),
	});

	if (conditions.length > 0) {
		query = query.where(and(...conditions));
	}

	const users = await query;

	return response.status(200).json({
		value: users,
		error: 0,
	});
});

export default router;
