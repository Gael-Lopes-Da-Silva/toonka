import { and, asc, desc, eq, isNull } from "drizzle-orm";
import { Router } from "express";

import { db, schema } from "../database";
import { authentification } from "../middlewares/individual";
import { Errors } from "../services/ErrorHandler";

const router = Router();

// CREATE
router.post("/", authentification, async (request, response) => {
	if (
		!request.body.bookId ||
		!request.body.name ||
		!request.body.link ||
		!request.body.number
	) {
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
			.insert(schema.bookChapter)
			.values({
				bookId: book.id,
				name: request.body.name,
				link: request.body.link,
				number: request.body.number,
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
		const bookChapter = (
			await db
				.select()
				.from(schema.bookChapter)
				.where(eq(schema.bookChapter.id, request.params.id))
		)[0];

		if (!bookChapter) {
			return request.sendError(404, Errors.RESSOURCE_NOT_FOUND);
		}

		return response.status(200).json({
			value: bookChapter,
			error: 0,
		});
	}

	const conditions: any[] = [];

	const filterEqual = (value: any, column: any) => {
		if (!value) return;
		conditions.push(eq(column, value));
	};

	filterEqual(request.query.bookId, schema.bookChapter.bookId);
	filterEqual(request.query.name, schema.bookChapter.name);
	filterEqual(request.query.link, schema.bookChapter.link);
	filterEqual(request.query.number, schema.bookChapter.number);

	const filterNullable = (value: any, column: any) => {
		if (value === undefined) return;
		conditions.push(value === null ? isNull(column) : eq(column, value));
	};

	filterNullable(request.query.createdAt, schema.bookChapter.createdAt);
	filterNullable(request.query.deletedAt, schema.bookChapter.deletedAt);
	filterNullable(request.query.modifiedAt, schema.bookChapter.modifiedAt);

	let query: any = db.select().from(schema.bookChapter);

	if (conditions.length > 0) {
		query = query.where(and(...conditions));
	}

	const orderMap = [
		"bookId",
		"name",
		"link",
		"number",
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
						schema.bookChapter[
							request.query.orderBy as (typeof orderMap)[number]
						],
					)
				: asc(
						schema.bookChapter[
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

		const bookChapter = (
			await db
				.select()
				.from(schema.bookChapter)
				.where(eq(schema.bookChapter.id, request.params.id))
		)[0];

		if (!bookChapter) {
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
				.update(schema.bookChapter)
				.set({
					modifiedAt: new Date(),
					...(request.body.bookId !== undefined && {
						bookId: request.body.bookId,
					}),
					...(request.body.name !== undefined && {
						name: request.body.name,
					}),
					...(request.body.link !== undefined && {
						link: request.body.link,
					}),
					...(request.body.number !== undefined && {
						number: request.body.number,
					}),
				})
				.where(eq(schema.bookChapter.id, request.params.id))
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
	filterEqual(request.query.name, schema.bookChapter.name);
	filterEqual(request.query.link, schema.bookChapter.link);
	filterEqual(request.query.number, schema.bookChapter.number);

	const filterNullable = (value: any, column: any) => {
		if (value === undefined) return;
		conditions.push(value === null ? isNull(column) : eq(column, value));
	};

	filterNullable(request.query.createdAt, schema.bookChapter.createdAt);
	filterNullable(request.query.deletedAt, schema.bookChapter.deletedAt);
	filterNullable(request.query.modifiedAt, schema.bookChapter.modifiedAt);

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

	let query: any = db.update(schema.bookChapter).set({
		modifiedAt: new Date(),
		...(request.body.bookId !== undefined && {
			bookId: request.body.bookId,
		}),
		...(request.body.name !== undefined && {
			name: request.body.name,
		}),
		...(request.body.link !== undefined && {
			link: request.body.link,
		}),
		...(request.body.number !== undefined && {
			number: request.body.number,
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
		const bookChapter = (
			await db
				.select()
				.from(schema.bookChapter)
				.where(eq(schema.bookChapter.id, request.params.id))
		)[0];

		if (!bookChapter) {
			return request.sendError(404, Errors.RESSOURCE_NOT_FOUND);
		}

		if (bookChapter.deletedAt !== null) {
			return request.sendError(409, Errors.RESSOURCE_ALREADY_DELETED);
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

		const result = (
			await db
				.update(schema.bookChapter)
				.set({
					deletedAt: new Date(),
				})
				.where(eq(schema.bookChapter.id, request.params.id))
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
	filterEqual(request.query.name, schema.bookChapter.name);
	filterEqual(request.query.link, schema.bookChapter.link);
	filterEqual(request.query.number, schema.bookChapter.number);

	const filterNullable = (value: any, column: any) => {
		if (value === undefined) return;
		conditions.push(value === null ? isNull(column) : eq(column, value));
	};

	filterNullable(request.query.createdAt, schema.bookChapter.createdAt);
	filterNullable(request.query.deletedAt, schema.bookChapter.deletedAt);
	filterNullable(request.query.modifiedAt, schema.bookChapter.modifiedAt);

	let query: any = db.update(schema.bookChapter).set({
		deletedAt: new Date(),
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

export default router;
