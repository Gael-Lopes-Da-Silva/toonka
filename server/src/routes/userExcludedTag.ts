import { and, asc, desc, eq } from "drizzle-orm";
import { Router } from "express";

import { db, schema } from "../database";
import { authentification } from "../middlewares/individual";
import { Errors } from "../services/ErrorHandler";

const router = Router();

// CREATE
router.post("/", authentification, async (request, response) => {
	if (!request.body.userId || !request.body.tagId) {
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

	const bookTag = (
		await db
			.select()
			.from(schema.bookTag)
			.where(eq(schema.bookTag.id, request.body.tagId))
	)[0];

	if (!bookTag) {
		return request.sendError(404, Errors.RESSOURCE_NOT_FOUND);
	}

	if (bookTag.deletedAt !== null) {
		return request.sendError(410, Errors.RESSOURCE_DELETED);
	}

	const result = (
		await db
			.insert(schema.userComment)
			.values({
				userId: user.id,
				bookId: bookTag.id,
				message: request.body.message,
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
		const userExcludedTag = (
			await db
				.select()
				.from(schema.userExcludedTag)
				.where(eq(schema.userExcludedTag.id, request.params.id))
		)[0];

		if (!userExcludedTag) {
			return request.sendError(404, Errors.RESSOURCE_NOT_FOUND);
		}

		if (userExcludedTag.userId !== request.user.id) {
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
			value: userExcludedTag,
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

	filterEqual(request.query.userId, schema.userExcludedTag.userId);
	filterEqual(request.query.tagId, schema.userExcludedTag.tagId);

	let query: any = db.select().from(schema.userComment);

	if (conditions.length > 0) {
		query = query.where(and(...conditions));
	}

	const orderMap = ["userId", "tagId"] as const;

	if (
		request.query.orderBy &&
		orderMap.includes(request.query.orderBy as (typeof orderMap)[number])
	) {
		query = query.orderBy(
			request.query.orderDirection === "desc"
				? desc(
						schema.userExcludedTag[
							request.query.orderBy as (typeof orderMap)[number]
						],
					)
				: asc(
						schema.userExcludedTag[
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
		const userExcludedTag = (
			await db
				.select()
				.from(schema.userExcludedTag)
				.where(eq(schema.userExcludedTag.id, request.params.id))
		)[0];

		if (!userExcludedTag) {
			return request.sendError(404, Errors.RESSOURCE_NOT_FOUND);
		}

		if (userExcludedTag.userId !== request.user.id) {
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

		const bookTag = (
			await db
				.select()
				.from(schema.bookTag)
				.where(eq(schema.bookTag.id, request.body.tagId))
		)[0];

		if (!bookTag) {
			return request.sendError(404, Errors.RESSOURCE_NOT_FOUND);
		}

		if (bookTag.deletedAt !== null) {
			return request.sendError(410, Errors.RESSOURCE_DELETED);
		}

		const result = (
			await db
				.update(schema.userExcludedTag)
				.set({
					...(request.body.userId !== undefined && {
						userId: request.body.userId,
					}),
					...(request.body.tagId !== undefined && {
						tagId: request.body.tagId,
					}),
				})
				.where(eq(schema.userExcludedTag.id, request.params.id))
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

	filterEqual(request.query.userId, schema.userExcludedTag.userId);
	filterEqual(request.query.tagId, schema.userExcludedTag.tagId);

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

	if (request.query.tagId) {
		const book = (
			await db
				.select()
				.from(schema.bookTag)
				.where(eq(schema.bookTag.id, request.query.tagId as string))
		)[0];

		if (!book) {
			return request.sendError(404, Errors.RESSOURCE_NOT_FOUND);
		}
	}

	let query: any = db.update(schema.userExcludedTag).set({
		...(request.body.userId !== undefined && {
			userId: request.body.userId,
		}),
		...(request.body.tagId !== undefined && {
			tagId: request.body.tagId,
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
		const userExcludedTag = (
			await db
				.select()
				.from(schema.userExcludedTag)
				.where(eq(schema.userExcludedTag.id, request.params.id))
		)[0];

		if (!userExcludedTag) {
			return request.sendError(404, Errors.RESSOURCE_NOT_FOUND);
		}

		if (userExcludedTag.userId !== request.user.id) {
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
				.delete(schema.userExcludedTag)
				.where(eq(schema.userExcludedTag.id, request.params.id))
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

	filterEqual(request.query.userId, schema.userExcludedTag.userId);
	filterEqual(request.query.tagId, schema.userExcludedTag.tagId);

	let query: any = db.delete(schema.userExcludedTag);

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
