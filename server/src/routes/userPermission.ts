import { and, asc, desc, eq, isNull } from "drizzle-orm";
import { Router } from "express";

import { db, schema } from "../database";
import { authentification } from "../middlewares/individual";
import { Errors } from "../services/ErrorHandler";

const router = Router();

// CREATE
router.post("/", authentification, async (request, response) => {
	if (!request.body.userId) {
		return request.sendError(400, Errors.REQUIRED_FIELD);
	}

	if (request.body.userId !== request.user.id) {
		const userPermissions = (
			await db
				.select()
				.from(schema.userPermission)
				.where(eq(schema.userPermission.userId, request.user.id))
		)[0];

		if (!userPermissions) {
			return request.sendError(500, Errors.INTERNAL_ERROR);
		}

		if (!userPermissions.administrator && !userPermissions.moderator) {
			return request.sendError(403, Errors.FORBIDDEN);
		}
	}

	const user = (
		await db
			.select()
			.from(schema.user)
			.where(eq(schema.user.id, request.body.userId))
	)[0];

	if (!user) {
		return request.sendError(404, Errors.RESSOURCE_NOT_FOUND);
	}

	if (user.deletedAt !== null) {
		return request.sendError(410, Errors.RESSOURCE_DELETED);
	}

	const result = (
		await db
			.insert(schema.userPermission)
			.values({
				userId: user.id,
			})
			.returning()
	)[0];

	return response.status(201).json({
		value: result,
		error: 0,
	});
});

// READ
router.get("/:id?", authentification, async (request, response) => {
	if (request.params.id) {
		const userPermission = (
			await db
				.select()
				.from(schema.userPermission)
				.where(eq(schema.userPermission.id, request.params.id))
		)[0];

		if (!userPermission) {
			return request.sendError(404, Errors.RESSOURCE_NOT_FOUND);
		}

		if (userPermission.userId !== request.user.id) {
			const userPermissions = (
				await db
					.select()
					.from(schema.userPermission)
					.where(eq(schema.userPermission.userId, request.user.id))
			)[0];

			if (!userPermissions) {
				return request.sendError(500, Errors.INTERNAL_ERROR);
			}

			if (!userPermissions.administrator && !userPermissions.moderator) {
				return request.sendError(403, Errors.FORBIDDEN);
			}
		}

		return response.status(200).json({
			value: userPermission,
			error: 0,
		});
	}

	if (request.query.userId && request.query.userId !== request.user.id) {
		const userPermissions = (
			await db
				.select()
				.from(schema.userPermission)
				.where(eq(schema.userPermission.userId, request.user.id))
		)[0];

		if (!userPermissions) {
			return request.sendError(500, Errors.INTERNAL_ERROR);
		}

		if (!userPermissions.administrator && !userPermissions.moderator) {
			return request.sendError(403, Errors.FORBIDDEN);
		}
	}

	const conditions: any[] = [];

	const filterEqual = (value: any, column: any) => {
		if (!value) return;
		conditions.push(eq(column, value));
	};

	filterEqual(request.query.userId, schema.userPermission.userId);
	filterEqual(request.query.member, schema.userPermission.member);
	filterEqual(request.query.moderator, schema.userPermission.moderator);
	filterEqual(request.query.administrator, schema.userPermission.administrator);

	const filterNullable = (value: any, column: any) => {
		if (value === undefined) return;
		conditions.push(value === null ? isNull(column) : eq(column, value));
	};

	filterNullable(request.query.modifiedAt, schema.userPermission.modifiedAt);

	let query: any = db.select().from(schema.userPermission);

	if (conditions.length > 0) {
		query = query.where(and(...conditions));
	}

	const orderMap = ["userId", "member", "moderator", "administrator"] as const;

	if (
		request.query.orderBy &&
		orderMap.includes(request.query.orderBy as (typeof orderMap)[number])
	) {
		query = query.orderBy(
			request.query.orderDirection === "desc"
				? desc(
						schema.userPermission[
							request.query.orderBy as (typeof orderMap)[number]
						],
					)
				: asc(
						schema.userPermission[
							request.query.orderBy as (typeof orderMap)[number]
						],
					),
		);
	}

	const result = await query;

	return response.status(result.length > 0 ? 200 : 204).json({
		value: result,
		error: 0,
	});
});

// UPDATE
router.put("/:id?", authentification, async (request, response) => {
	if (request.params.id) {
		const userPermission = (
			await db
				.select()
				.from(schema.userPermission)
				.where(eq(schema.userPermission.id, request.params.id))
		)[0];

		if (!userPermission) {
			return request.sendError(404, Errors.RESSOURCE_NOT_FOUND);
		}

		if (userPermission.userId !== request.user.id) {
			const userPermissions = (
				await db
					.select()
					.from(schema.userPermission)
					.where(eq(schema.userPermission.userId, request.user.id))
			)[0];

			if (!userPermissions) {
				return request.sendError(500, Errors.INTERNAL_ERROR);
			}

			if (!userPermissions.administrator && !userPermissions.moderator) {
				return request.sendError(403, Errors.FORBIDDEN);
			}
		}

		const user = (
			await db
				.select()
				.from(schema.user)
				.where(eq(schema.user.id, request.body.userId))
		)[0];

		if (!user) {
			return request.sendError(404, Errors.RESSOURCE_NOT_FOUND);
		}

		if (user.deletedAt !== null) {
			return request.sendError(410, Errors.RESSOURCE_DELETED);
		}

		const result = (
			await db
				.update(schema.userPermission)
				.set({
					modifiedAt: new Date(),
					...(request.body.userId !== undefined && {
						userId: request.body.userId,
					}),
					...(request.body.member !== undefined && {
						member: request.body.member,
					}),
					...(request.body.moderator !== undefined && {
						moderator: request.body.moderator,
					}),
					...(request.body.administrator !== undefined && {
						administrator: request.body.administrator,
					}),
				})
				.where(eq(schema.userPermission.id, request.params.id))
				.returning()
		)[0];

		return response.status(202).json({
			value: result,
			error: 0,
		});
	}

	if (request.query.userId && request.query.userId !== request.user.id) {
		const userPermissions = (
			await db
				.select()
				.from(schema.userPermission)
				.where(eq(schema.userPermission.userId, request.user.id))
		)[0];

		if (!userPermissions) {
			return request.sendError(500, Errors.INTERNAL_ERROR);
		}

		if (!userPermissions.administrator && !userPermissions.moderator) {
			return request.sendError(403, Errors.FORBIDDEN);
		}
	}

	const conditions: any[] = [];

	const filterEqual = (value: any, column: any) => {
		if (!value) return;
		conditions.push(eq(column, value));
	};

	filterEqual(request.query.userId, schema.userPermission.userId);
	filterEqual(request.query.member, schema.userPermission.member);
	filterEqual(request.query.moderator, schema.userPermission.moderator);
	filterEqual(request.query.administrator, schema.userPermission.administrator);

	const filterNullable = (value: any, column: any) => {
		if (value === undefined) return;
		conditions.push(value === null ? isNull(column) : eq(column, value));
	};

	filterNullable(request.query.modifiedAt, schema.userPermission.modifiedAt);

	if (request.query.userId) {
		const user = (
			await db
				.select()
				.from(schema.user)
				.where(eq(schema.user.id, request.query.userId as string))
		)[0];

		if (!user) {
			return request.sendError(404, Errors.RESSOURCE_NOT_FOUND);
		}
	}

	let query: any = db.update(schema.userPermission).set({
		modifiedAt: new Date(),
		...(request.body.userId !== undefined && {
			userId: request.body.userId,
		}),
		...(request.body.member !== undefined && {
			member: request.body.member,
		}),
		...(request.body.moderator !== undefined && {
			moderator: request.body.moderator,
		}),
		...(request.body.administrator !== undefined && {
			administrator: request.body.administrator,
		}),
	});

	if (conditions.length > 0) {
		query = query.where(and(...conditions));
	}

	const result = await query.returning();

	return response.status(result.length > 0 ? 202 : 204).json({
		value: result,
		error: 0,
	});
});

// DELETE
router.delete("/:id?", authentification, async (request, response) => {
	if (request.params.id) {
		const userPermission = (
			await db
				.select()
				.from(schema.userPermission)
				.where(eq(schema.userPermission.id, request.params.id))
		)[0];

		if (!userPermission) {
			return request.sendError(404, Errors.RESSOURCE_NOT_FOUND);
		}

		if (userPermission.userId !== request.user.id) {
			const userPermissions = (
				await db
					.select()
					.from(schema.userPermission)
					.where(eq(schema.userPermission.userId, request.user.id))
			)[0];

			if (!userPermissions) {
				return request.sendError(500, Errors.INTERNAL_ERROR);
			}

			if (!userPermissions.administrator && !userPermissions.moderator) {
				return request.sendError(403, Errors.FORBIDDEN);
			}
		}

		const result = (
			await db
				.delete(schema.userPermission)
				.where(eq(schema.userPermission.id, request.params.id))
				.returning()
		)[0];

		return response.status(202).json({
			value: result,
			error: 0,
		});
	}

	if (request.query.userId && request.query.userId !== request.user.id) {
		const userPermissions = (
			await db
				.select()
				.from(schema.userPermission)
				.where(eq(schema.userPermission.userId, request.user.id))
		)[0];

		if (!userPermissions) {
			return request.sendError(500, Errors.INTERNAL_ERROR);
		}

		if (!userPermissions.administrator && !userPermissions.moderator) {
			return request.sendError(403, Errors.FORBIDDEN);
		}
	}

	const conditions: any[] = [];

	const filterEqual = (value: any, column: any) => {
		if (!value) return;
		conditions.push(eq(column, value));
	};

	filterEqual(request.query.userId, schema.userPermission.userId);
	filterEqual(request.query.member, schema.userPermission.member);
	filterEqual(request.query.moderator, schema.userPermission.moderator);
	filterEqual(request.query.administrator, schema.userPermission.administrator);

	const filterNullable = (value: any, column: any) => {
		if (value === undefined) return;
		conditions.push(value === null ? isNull(column) : eq(column, value));
	};

	filterNullable(request.query.modifiedAt, schema.userPermission.modifiedAt);

	let query: any = db.delete(schema.userPermission);

	if (conditions.length > 0) {
		query = query.where(and(...conditions));
	}

	const result = await query;

	return response.status(result.length > 0 ? 202 : 204).json({
		value: result,
		error: 0,
	});
});

export default router;
