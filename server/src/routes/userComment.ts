import { and, asc, desc, eq, isNull } from "drizzle-orm";
import { Router } from "express";

import { db, schema } from "../database";
import { authentification } from "../middlewares/individual";
import { Errors } from "../services/ErrorHandler";

const router = Router();

// CREATE
router.post("/", authentification, async (request, response) => {
	if (!request.body.userId || !request.body.bookId || !request.body.message) {
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

	const book = (
		await db
			.select()
			.from(schema.book)
			.where(eq(schema.book.id, request.body.bookId))
	)[0];

	if (!book) {
		return request.sendError(404, Errors.RESSOURCE_NOT_FOUND);
	}

	if (book.deletedAt !== null) {
		return request.sendError(410, Errors.RESSOURCE_DELETED);
	}

	const result = (
		await db
			.insert(schema.userComment)
			.values({
				userId: user.id,
				bookId: book.id,
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
		const userComment = (
			await db
				.select()
				.from(schema.userComment)
				.where(eq(schema.userComment.id, request.params.id))
		)[0];

		if (!userComment) {
			return request.sendError(404, Errors.RESSOURCE_NOT_FOUND);
		}

		if (userComment.userId !== request.user.id) {
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
			value: userComment,
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

	filterEqual(request.query.userId, schema.userComment.userId);
	filterEqual(request.query.bookId, schema.userComment.bookId);
	filterEqual(request.query.message, schema.userComment.message);
	filterEqual(request.query.like, schema.userComment.like);
	filterEqual(request.query.highlighted, schema.userComment.highlighted);
	filterEqual(request.query.hidden, schema.userComment.hidden);

	const filterNullable = (value: any, column: any) => {
		if (value === undefined) return;
		conditions.push(value === null ? isNull(column) : eq(column, value));
	};

	filterNullable(request.query.createdAt, schema.userComment.createdAt);
	filterNullable(request.query.deletedAt, schema.userComment.deletedAt);
	filterNullable(request.query.modifiedAt, schema.userComment.modifiedAt);

	let query: any = db.select().from(schema.userComment);

	if (conditions.length > 0) {
		query = query.where(and(...conditions));
	}

	const orderMap = [
		"userId",
		"bookId",
		"message",
		"like",
		"highlighted",
		"hidden",
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
				? desc(
						schema.userComment[
							request.query.orderBy as (typeof orderMap)[number]
						],
					)
				: asc(
						schema.userComment[
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
		const userComment = (
			await db
				.select()
				.from(schema.userComment)
				.where(eq(schema.userComment.id, request.params.id))
		)[0];

		if (!userComment) {
			return request.sendError(404, Errors.RESSOURCE_NOT_FOUND);
		}

		if (userComment.userId !== request.user.id) {
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

		const book = (
			await db
				.select()
				.from(schema.book)
				.where(eq(schema.book.id, request.body.bookId))
		)[0];

		if (!book) {
			return request.sendError(404, Errors.RESSOURCE_NOT_FOUND);
		}

		if (book.deletedAt !== null) {
			return request.sendError(410, Errors.RESSOURCE_DELETED);
		}

		const result = (
			await db
				.update(schema.userComment)
				.set({
					modifiedAt: new Date(),
					...(request.body.userId !== undefined && {
						userId: request.body.userId,
					}),
					...(request.body.bookId !== undefined && {
						bookId: request.body.bookId,
					}),
					...(request.body.message !== undefined && {
						message: request.body.message,
					}),
					...(request.body.like !== undefined && { like: request.body.like }),
					...(request.body.highlighted !== undefined && {
						highlighted: request.body.highlighted,
					}),
					...(request.body.hidden !== undefined && {
						hidden: request.body.hidden,
					}),
				})
				.where(eq(schema.userComment.id, request.params.id))
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

	filterEqual(request.query.userId, schema.userComment.userId);
	filterEqual(request.query.bookId, schema.userComment.bookId);
	filterEqual(request.query.message, schema.userComment.message);
	filterEqual(request.query.like, schema.userComment.like);
	filterEqual(request.query.highlighted, schema.userComment.highlighted);
	filterEqual(request.query.hidden, schema.userComment.hidden);

	const filterNullable = (value: any, column: any) => {
		if (value === undefined) return;
		conditions.push(value === null ? isNull(column) : eq(column, value));
	};

	filterNullable(request.query.createdAt, schema.userComment.createdAt);
	filterNullable(request.query.deletedAt, schema.userComment.deletedAt);
	filterNullable(request.query.modifiedAt, schema.userComment.modifiedAt);

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

	if (request.query.bookId) {
		const book = (
			await db
				.select()
				.from(schema.book)
				.where(eq(schema.book.id, request.query.bookId as string))
		)[0];

		if (!book) {
			return request.sendError(404, Errors.RESSOURCE_NOT_FOUND);
		}
	}

	if (request.query.chapterId) {
		const bookChapter = (
			await db
				.select()
				.from(schema.bookChapter)
				.where(eq(schema.bookChapter.id, request.query.chapterId as string))
		)[0];

		if (!bookChapter) {
			return request.sendError(404, Errors.RESSOURCE_NOT_FOUND);
		}
	}

	let query: any = db.update(schema.userComment).set({
		modifiedAt: new Date(),
		...(request.body.userId !== undefined && {
			userId: request.body.userId,
		}),
		...(request.body.bookId !== undefined && {
			bookId: request.body.bookId,
		}),
		...(request.body.message !== undefined && {
			message: request.body.message,
		}),
		...(request.body.like !== undefined && { like: request.body.like }),
		...(request.body.highlighted !== undefined && {
			highlighted: request.body.highlighted,
		}),
		...(request.body.hidden !== undefined && {
			hidden: request.body.hidden,
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
		const userComment = (
			await db
				.select()
				.from(schema.userComment)
				.where(eq(schema.userComment.id, request.params.id))
		)[0];

		if (!userComment) {
			return request.sendError(404, Errors.RESSOURCE_NOT_FOUND);
		}

		if (userComment.deletedAt !== null) {
			return request.sendError(409, Errors.RESSOURCE_ALREADY_DELETED);
		}

		if (userComment.userId !== request.user.id) {
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
				.update(schema.userComment)
				.set({
					deletedAt: new Date(),
				})
				.where(eq(schema.userComment.id, request.params.id))
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

	filterEqual(request.query.userId, schema.userComment.userId);
	filterEqual(request.query.bookId, schema.userComment.bookId);
	filterEqual(request.query.message, schema.userComment.message);
	filterEqual(request.query.like, schema.userComment.like);
	filterEqual(request.query.highlighted, schema.userComment.highlighted);
	filterEqual(request.query.hidden, schema.userComment.hidden);

	const filterNullable = (value: any, column: any) => {
		if (value === undefined) return;
		conditions.push(value === null ? isNull(column) : eq(column, value));
	};

	filterNullable(request.query.createdAt, schema.userComment.createdAt);
	filterNullable(request.query.deletedAt, schema.userComment.deletedAt);
	filterNullable(request.query.modifiedAt, schema.userComment.modifiedAt);

	let query: any = db.update(schema.userComment).set({
		deletedAt: new Date(),
	});

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
