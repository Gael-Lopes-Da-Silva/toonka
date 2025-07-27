import { and, asc, desc, eq } from "drizzle-orm";
import { Router } from "express";

import { db, schema } from "../database";
import { authentification } from "../middlewares/individual";
import { Errors } from "../services/ErrorHandler";

const router = Router();

// CREATE
router.post("/", authentification, async (request, response) => {
	if (!request.body.bookId || !request.body.link) {
		return request.sendError(400, Errors.REQUIRED_FIELD);
	}

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
			.insert(schema.bookCover)
			.values({
				bookId: book.id,
				link: request.body.link,
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
		const bookCover = (
			await db
				.select()
				.from(schema.bookCover)
				.where(eq(schema.bookCover.id, request.params.id))
		)[0];

		if (!bookCover) {
			return request.sendError(404, Errors.RESSOURCE_NOT_FOUND);
		}

		return response.status(200).json({
			value: bookCover,
			error: 0,
		});
	}

	const conditions: any[] = [];

	const filterEqual = (value: any, column: any) => {
		if (!value) return;
		conditions.push(eq(column, value));
	};

	filterEqual(request.query.bookId, schema.bookCover.bookId);
	filterEqual(request.query.link, schema.bookCover.link);

	let query: any = db.select().from(schema.bookCover);

	if (conditions.length > 0) {
		query = query.where(and(...conditions));
	}

	const orderMap = ["bookId", "link"] as const;

	if (
		request.query.orderBy &&
		orderMap.includes(request.query.orderBy as (typeof orderMap)[number])
	) {
		query = query.orderBy(
			request.query.orderDirection === "desc"
				? desc(
						schema.bookCover[
							request.query.orderBy as (typeof orderMap)[number]
						],
					)
				: asc(
						schema.bookCover[
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

		const bookCover = (
			await db
				.select()
				.from(schema.bookCover)
				.where(eq(schema.bookCover.id, request.params.id))
		)[0];

		if (!bookCover) {
			return request.sendError(404, Errors.RESSOURCE_NOT_FOUND);
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

		const result = (
			await db
				.update(schema.bookCover)
				.set({
					...(request.body.bookId !== undefined && {
						bookId: request.body.bookId,
					}),
					...(request.body.link !== undefined && {
						link: request.body.link,
					}),
				})
				.where(eq(schema.bookCover.id, request.params.id))
				.returning()
		)[0];

		return response.status(202).json({
			value: result,
			error: 0,
		});
	}

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

	const conditions: any[] = [];

	const filterEqual = (value: any, column: any) => {
		if (!value) return;
		conditions.push(eq(column, value));
	};

	filterEqual(request.query.bookId, schema.bookCover.bookId);
	filterEqual(request.query.link, schema.bookCover.link);

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

	let query: any = db.update(schema.bookCover).set({
		...(request.body.bookId !== undefined && {
			bookId: request.body.bookId,
		}),
		...(request.body.link !== undefined && {
			link: request.body.link,
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

		const bookCover = (
			await db
				.select()
				.from(schema.bookCover)
				.where(eq(schema.bookCover.id, request.params.id))
		)[0];

		if (!bookCover) {
			return request.sendError(404, Errors.RESSOURCE_NOT_FOUND);
		}

		const result = (
			await db
				.delete(schema.bookCover)
				.where(eq(schema.bookCover.id, request.params.id))
				.returning()
		)[0];

		return response.status(202).json({
			value: result,
			error: 0,
		});
	}

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

	const conditions: any[] = [];

	const filterEqual = (value: any, column: any) => {
		if (!value) return;
		conditions.push(eq(column, value));
	};

	filterEqual(request.query.bookId, schema.bookChapter.bookId);
	filterEqual(request.query.link, schema.bookChapter.link);

	let query: any = db.delete(schema.bookCover);

	if (conditions.length > 0) {
		query = query.where(and(...conditions));
	}

	const result = await query.returning();

	return response.status(result.length > 0 ? 202 : 204).json({
		value: result,
		error: 0,
	});
});

export default router;
