import { and, asc, desc, eq, isNull } from "drizzle-orm";
import { Router } from "express";

import { db, schema } from "../database";
import { authentification } from "../middlewares/individual";
import { Errors } from "../services/ErrorHandler";

const router = Router();

// CREATE
router.post("/", authentification, async (request, response) => {
	if (
		!request.body.type ||
		!request.body.synopsis ||
		!request.body.publicationStatus ||
		!request.body.chaptersAvailable ||
		!request.body.hidden
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

	const result = (
		await db
			.insert(schema.book)
			.values({
				type: request.body.type,
				synopsis: request.body.synopsis,
				publicationStatus: request.body.publicationStatus,
				chaptersAvailable: request.body.chaptersAvailable,
				hidden: request.body.hidden,
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
		const book = (
			await db
				.select()
				.from(schema.book)
				.where(eq(schema.book.id, request.params.id))
		)[0];

		if (!book) {
			return request.sendError(404, Errors.RESSOURCE_NOT_FOUND);
		}

		return response.status(200).json({
			value: book,
			error: 0,
		});
	}

	const conditions: any[] = [];

	const filterEqual = (value: any, column: any) => {
		if (!value) return;
		conditions.push(eq(column, value));
	};

	filterEqual(request.query.type, schema.book.type);
	filterEqual(request.query.synopsis, schema.book.synopsis);
	filterEqual(request.query.publicationStatus, schema.book.publicationStatus);
	filterEqual(request.query.chaptersAvailable, schema.book.chaptersAvailable);
	filterEqual(request.query.hidden, schema.book.hidden);

	const filterNullable = (value: any, column: any) => {
		if (value === undefined) return;
		conditions.push(value === null ? isNull(column) : eq(column, value));
	};

	filterNullable(request.query.createdAt, schema.book.createdAt);
	filterNullable(request.query.deletedAt, schema.book.deletedAt);
	filterNullable(request.query.modifiedAt, schema.book.modifiedAt);

	let query: any = db.select().from(schema.book);

	if (conditions.length > 0) {
		query = query.where(and(...conditions));
	}

	const orderMap = [
		"type",
		"synopsis",
		"publicationStatus",
		"chaptersAvailable",
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
				? desc(schema.book[request.query.orderBy as (typeof orderMap)[number]])
				: asc(schema.book[request.query.orderBy as (typeof orderMap)[number]]),
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
		const book = (
			await db
				.select()
				.from(schema.book)
				.where(eq(schema.book.id, request.params.id))
		)[0];

		if (!book) {
			return request.sendError(404, Errors.RESSOURCE_NOT_FOUND);
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
				.update(schema.book)
				.set({
					modifiedAt: new Date(),
					...(request.body.type !== undefined && {
						type: request.body.type,
					}),
					...(request.body.synopsis !== undefined && {
						synopsis: request.body.synopsis,
					}),
					...(request.body.publicationStatus !== undefined && {
						publicationStatus: request.body.publicationStatus,
					}),
					...(request.body.chaptersAvailable !== undefined && {
						chaptersAvailable: request.body.chaptersAvailable,
					}),
					...(request.body.hidden !== undefined && {
						hidden: request.body.hidden,
					}),
				})
				.where(eq(schema.book.id, request.params.id))
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

	filterEqual(request.query.type, schema.book.type);
	filterEqual(request.query.synopsis, schema.book.synopsis);
	filterEqual(request.query.publicationStatus, schema.book.publicationStatus);
	filterEqual(request.query.chaptersAvailable, schema.book.chaptersAvailable);
	filterEqual(request.query.hidden, schema.book.hidden);

	const filterNullable = (value: any, column: any) => {
		if (value === undefined) return;
		conditions.push(value === null ? isNull(column) : eq(column, value));
	};

	filterNullable(request.query.createdAt, schema.book.createdAt);
	filterNullable(request.query.deletedAt, schema.book.deletedAt);
	filterNullable(request.query.modifiedAt, schema.book.modifiedAt);

	let query: any = db.update(schema.book).set({
		modifiedAt: new Date(),
		...(request.body.type !== undefined && {
			type: request.body.type,
		}),
		...(request.body.synopsis !== undefined && {
			synopsis: request.body.synopsis,
		}),
		...(request.body.publicationStatus !== undefined && {
			publicationStatus: request.body.publicationStatus,
		}),
		...(request.body.chaptersAvailable !== undefined && {
			chaptersAvailable: request.body.chaptersAvailable,
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
		const book = (
			await db
				.select()
				.from(schema.book)
				.where(eq(schema.book.id, request.params.id))
		)[0];

		if (!book) {
			return request.sendError(404, Errors.RESSOURCE_NOT_FOUND);
		}

		if (book.deletedAt !== null) {
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
				.update(schema.book)
				.set({
					deletedAt: new Date(),
				})
				.where(eq(schema.book.id, request.params.id))
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

	filterEqual(request.query.type, schema.book.type);
	filterEqual(request.query.synopsis, schema.book.synopsis);
	filterEqual(request.query.publicationStatus, schema.book.publicationStatus);
	filterEqual(request.query.chaptersAvailable, schema.book.chaptersAvailable);
	filterEqual(request.query.hidden, schema.book.hidden);

	const filterNullable = (value: any, column: any) => {
		if (value === undefined) return;
		conditions.push(value === null ? isNull(column) : eq(column, value));
	};

	filterNullable(request.query.createdAt, schema.book.createdAt);
	filterNullable(request.query.deletedAt, schema.book.deletedAt);
	filterNullable(request.query.modifiedAt, schema.book.modifiedAt);

	let query: any = db.update(schema.book).set({
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
