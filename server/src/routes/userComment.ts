import { and, eq, isNull } from "drizzle-orm";
import { Router } from "express";

import { db, schema } from "../database";
import { authentification } from "../middlewares/individual";
import { Errors } from "../services/ErrorHandler";

const router = Router();

// CREATE
router.post("/", authentification, async (request, response) => {
	const { userId, bookId, message } = request.body ?? {};

	if (!userId || !bookId || !message)
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

	const result = (
		await db
			.insert(schema.userComment)
			.values({
				userId: user.id,
				bookId: bookId,
				message: message,
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
		const userComment = (
			await db
				.select()
				.from(schema.userComment)
				.where(eq(schema.userComment.id, id))
		)[0];

		if (!userComment) return request.sendError(404, Errors.RESSOURCE_NOT_FOUND);

		if (request.user.id !== userComment.userId) {
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
			value: userComment,
			error: 0,
		});
	}

	const {
		userId,
		bookId,
		message,
		like,
		highlighted,
		hidden,
		createdAt,
		deletedAt,
		modifiedAt,
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

	filterEqual(userId, schema.userComment.userId);
	filterEqual(bookId, schema.userComment.bookId);
	filterEqual(message, schema.userComment.message);
	filterEqual(like, schema.userComment.like);
	filterEqual(highlighted, schema.userComment.highlighted);
	filterEqual(hidden, schema.userComment.hidden);

	const filterNullable = (value: any, column: any) => {
		if (value === undefined) return;
		conditions.push(value === null ? isNull(column) : eq(column, value));
	};

	filterNullable(createdAt, schema.userComment.createdAt);
	filterNullable(deletedAt, schema.userComment.deletedAt);
	filterNullable(modifiedAt, schema.userComment.modifiedAt);

	const userComments = await db
		.select()
		.from(schema.userComment)
		.where(and(...conditions));

	return response.status(200).json({
		value: userComments,
		error: 0,
	});
});

// UPDATE
router.put("/:id", async (request, response) => {
	const id = request.params.id;

	const userComment = (
		await db
			.select()
			.from(schema.userComment)
			.where(eq(schema.userComment.id, id))
	)[0];

	if (!userComment) return request.sendError(404, Errors.RESSOURCE_NOT_FOUND);

	if (request.user.id !== userComment.userId) {
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

	if (userComment.deletedAt !== null)
		return request.sendError(400, Errors.RESSOURCE_DELETED);

	const { userId, bookId, message, like, highlighted, hidden } =
		request.body ?? {};

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

	const result = (
		await db
			.update(schema.userComment)
			.set({
				modifiedAt: new Date(),
				...(userId !== undefined && { userId }),
				...(bookId !== undefined && { bookId }),
				...(message !== undefined && { message }),
				...(like !== undefined && { like }),
				...(highlighted !== undefined && { highlighted }),
				...(hidden !== undefined && { hidden }),
			})
			.where(eq(schema.userComment.id, id))
			.returning()
	)[0];

	return response.status(200).json({
		value: result,
		error: 0,
	});
});

// DELETE
router.delete("/:id", async (request, response) => {
	const id = request.params.id;

	const userComment = (
		await db
			.select()
			.from(schema.userComment)
			.where(eq(schema.userComment.id, id))
	)[0];

	if (!userComment) return request.sendError(404, Errors.RESSOURCE_NOT_FOUND);

	if (request.user.id !== userComment.userId) {
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

	if (userComment.deletedAt !== null)
		return request.sendError(400, Errors.RESSOURCE_ALREADY_DELETED);

	const result = (
		await db
			.update(schema.userComment)
			.set({
				deletedAt: new Date(),
			})
			.where(eq(schema.userComment.id, id))
			.returning()
	)[0];

	return response.status(200).json({
		value: result,
		error: 0,
	});
});

export default router;
