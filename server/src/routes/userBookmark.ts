import { and, eq, isNull } from "drizzle-orm";
import { Router } from "express";

import { db, schema } from "../database";
import { authentification } from "../middlewares/individual";
import { Errors } from "../services/ErrorHandler";

const router = Router();

// CREATE
router.post("/", authentification, async (request, response) => {
	const { userId, bookId, chapterId, status } = request.body ?? {};

	if (!userId || !bookId || !chapterId || !status)
		return request.sendError(400, Errors.REQUIRED_FIELD);

	if (request.user.id !== userId) {
		const userPermissions = (
			await db
				.select()
				.from(schema.userPermission)
				.where(eq(schema.userPermission.userId, request.user.id))
		)[0];

		if (!userPermissions) return request.sendError(401, Errors.INTERNAL_ERROR);

		if (!userPermissions.administrator && !userPermissions.moderator)
			return request.sendError(401, Errors.UNAUTHORIZED);
	}

	const user = (
		await db.select().from(schema.user).where(eq(schema.user.id, userId))
	)[0];

	if (!user) return request.sendError(401, Errors.RESSOURCE_NOT_FOUND);

	if (user.deletedAt !== null)
		return request.sendError(401, Errors.RESSOURCE_DELETED);

	const book = (
		await db.select().from(schema.book).where(eq(schema.book.id, bookId))
	)[0];

	if (!book) return request.sendError(401, Errors.RESSOURCE_NOT_FOUND);

	if (book.deletedAt !== null)
		return request.sendError(401, Errors.RESSOURCE_DELETED);

	const bookChapter = (
		await db
			.select()
			.from(schema.bookChapter)
			.where(eq(schema.bookChapter.id, chapterId))
	)[0];

	if (!bookChapter) return request.sendError(401, Errors.RESSOURCE_NOT_FOUND);

	if (bookChapter.deletedAt !== null)
		return request.sendError(401, Errors.RESSOURCE_DELETED);

	const result = (
		await db
			.insert(schema.userBookmark)
			.values({
				userId: user.id,
				bookId: bookId,
				chapterId: chapterId,
				status: status,
			})
			.returning()
	)[0];

	return response.status(200).json({
		value: result,
		error: 0,
	});
});

// READ
router.get("/:id?", authentification, async (request, response) => {
	const id = request.params.id;

	if (id) {
		const userBookmark = (
			await db
				.select()
				.from(schema.userBookmark)
				.where(eq(schema.userBookmark.id, id))
		)[0];

		if (!userBookmark)
			return request.sendError(404, Errors.RESSOURCE_NOT_FOUND);

		if (request.user.id !== userBookmark.userId) {
			const userPermissions = (
				await db
					.select()
					.from(schema.userPermission)
					.where(eq(schema.userPermission.userId, request.user.id))
			)[0];

			if (!userPermissions)
				return request.sendError(401, Errors.INTERNAL_ERROR);

			if (!userPermissions.administrator && !userPermissions.moderator)
				return request.sendError(401, Errors.UNAUTHORIZED);
		}

		return response.status(200).json({
			value: userBookmark,
			error: 0,
		});
	}

	const {
		userId,
		bookId,
		chapterId,
		status,
		createdAt,
		deletedAt,
		modifiedAt,
		lastReadAt,
	} = request.body ?? {};

	if (userId && request.user.id !== userId) {
		const userPermissions = (
			await db
				.select()
				.from(schema.userPermission)
				.where(eq(schema.userPermission.userId, request.user.id))
		)[0];

		if (!userPermissions) return request.sendError(401, Errors.INTERNAL_ERROR);

		if (!userPermissions.administrator && !userPermissions.moderator)
			return request.sendError(401, Errors.UNAUTHORIZED);
	}

	const conditions: any[] = [];

	const filterEqual = (value: any, column: any) => {
		if (!value) return;
		conditions.push(eq(column, value));
	};

	filterEqual(userId, schema.userBookmark.userId);
	filterEqual(bookId, schema.userBookmark.bookId);
	filterEqual(chapterId, schema.userBookmark.chapterId);
	filterEqual(status, schema.userBookmark.status);

	const filterNullable = (value: any, column: any) => {
		if (value === undefined) return;
		conditions.push(value === null ? isNull(column) : eq(column, value));
	};

	filterNullable(createdAt, schema.userBookmark.createdAt);
	filterNullable(deletedAt, schema.userBookmark.deletedAt);
	filterNullable(modifiedAt, schema.userBookmark.modifiedAt);
	filterNullable(lastReadAt, schema.userBookmark.lastReadAt);

	const userBookmarks = await db
		.select()
		.from(schema.userBookmark)
		.where(and(...conditions));

	return response.status(200).json({
		value: userBookmarks,
		error: 0,
	});
});

// UPDATE
router.put("/:id", authentification, async (request, response) => {
	const id = request.params.id;

	const userBookmark = (
		await db
			.select()
			.from(schema.userBookmark)
			.where(eq(schema.userBookmark.id, id))
	)[0];

	if (!userBookmark) return request.sendError(404, Errors.RESSOURCE_NOT_FOUND);

	if (request.user.id !== userBookmark.userId) {
		const userPermissions = (
			await db
				.select()
				.from(schema.userPermission)
				.where(eq(schema.userPermission.userId, request.user.id))
		)[0];

		if (!userPermissions) return request.sendError(401, Errors.INTERNAL_ERROR);

		if (!userPermissions.administrator && !userPermissions.moderator)
			return request.sendError(401, Errors.UNAUTHORIZED);
	}

	if (userBookmark.deletedAt !== null)
		return request.sendError(400, Errors.RESSOURCE_DELETED);

	const { userId, bookId, chapterId, status } = request.body ?? {};

	const user = (
		await db.select().from(schema.user).where(eq(schema.user.id, userId))
	)[0];

	if (!user) return request.sendError(401, Errors.RESSOURCE_NOT_FOUND);

	if (user.deletedAt !== null)
		return request.sendError(401, Errors.RESSOURCE_DELETED);

	const book = (
		await db.select().from(schema.book).where(eq(schema.book.id, bookId))
	)[0];

	if (!book) return request.sendError(401, Errors.RESSOURCE_NOT_FOUND);

	if (book.deletedAt !== null)
		return request.sendError(401, Errors.RESSOURCE_DELETED);

	const bookChapter = (
		await db
			.select()
			.from(schema.bookChapter)
			.where(eq(schema.bookChapter.id, chapterId))
	)[0];

	if (!bookChapter) return request.sendError(401, Errors.RESSOURCE_NOT_FOUND);

	if (bookChapter.deletedAt !== null)
		return request.sendError(401, Errors.RESSOURCE_DELETED);

	const result = (
		await db
			.update(schema.userBookmark)
			.set({
				modifiedAt: new Date(),
				...(userId !== undefined && { userId }),
				...(bookId !== undefined && { bookId }),
				...(chapterId !== undefined && { chapterId }),
				...(status !== undefined && { status }),
			})
			.where(eq(schema.userBookmark.id, id))
			.returning()
	)[0];

	return response.status(200).json({
		value: result,
		error: 0,
	});
});

// DELETE
router.delete("/:id", authentification, async (request, response) => {
	const id = request.params.id;

	const userBookmark = (
		await db
			.select()
			.from(schema.userBookmark)
			.where(eq(schema.userBookmark.id, id))
	)[0];

	if (!userBookmark) return request.sendError(404, Errors.RESSOURCE_NOT_FOUND);

	if (request.user.id !== userBookmark.userId) {
		const userPermissions = (
			await db
				.select()
				.from(schema.userPermission)
				.where(eq(schema.userPermission.userId, request.user.id))
		)[0];

		if (!userPermissions) return request.sendError(401, Errors.INTERNAL_ERROR);

		if (!userPermissions.administrator && !userPermissions.moderator)
			return request.sendError(401, Errors.UNAUTHORIZED);
	}

	if (userBookmark.deletedAt !== null)
		return request.sendError(400, Errors.RESSOURCE_ALREADY_DELETED);

	const result = (
		await db
			.update(schema.userBookmark)
			.set({
				deletedAt: new Date(),
			})
			.where(eq(schema.userBookmark.id, id))
			.returning()
	)[0];

	return response.status(200).json({
		value: result,
		error: 0,
	});
});

export default router;
