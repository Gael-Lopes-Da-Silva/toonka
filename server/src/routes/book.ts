import "dotenv/config";

import { and, eq, isNull } from "drizzle-orm";
import { Router } from "express";

import { db, schema } from "../database";
import { Errors } from "../services/ErrorHandler";

const router = Router();

router.post("/", async (request, response) => {
	const { type, synopsis, publicationStatus, chaptersAvailable, hidden } =
		request.body ?? {};

	if (!type || !synopsis || !publicationStatus || !chaptersAvailable || !hidden)
		return request.sendError(400, Errors.REQUIRED_FIELD);

	const result = (
		await db
			.insert(schema.book)
			.values({
				type: type,
				synopsis: synopsis,
				publicationStatus: publicationStatus,
				chaptersAvailable: chaptersAvailable,
				hidden: hidden,
			})
			.returning()
	)[0];

	return response.status(200).json({
		value: result,
		error: 0,
	});
});

router.get("/", async (request, response) => {
	const {
		type,
		score,
		synopsis,
		publicationStatus,
		chaptersAvailable,
		hidden,
		createdAt,
		deletedAt,
	} = request.body ?? {};

	const conditions: any[] = [];

	const filterEqual = (value: any, column: any) => {
		if (!value) return;
		conditions.push(eq(column, value));
	};

	filterEqual(type, schema.book.type);
	filterEqual(synopsis, schema.book.synopsis);
	filterEqual(publicationStatus, schema.book.publicationStatus);
	filterEqual(chaptersAvailable, schema.book.chaptersAvailable);
	filterEqual(hidden, schema.book.hidden);

	const filterNullable = (value: any, column: any) => {
		if (value === undefined) return;
		conditions.push(value === null ? isNull(column) : eq(column, value));
	};

	filterNullable(score, schema.book.score);
	filterNullable(createdAt, schema.book.createdAt);
	filterNullable(deletedAt, schema.book.deletedAt);

	const books = await db
		.select()
		.from(schema.book)
		.where(and(...conditions));

	return response.status(200).json({
		value: books,
		error: 0,
	});
});

router.get("/:id", async (request, response) => {
	const id = request.params.id;

	const book = (
		await db.select().from(schema.book).where(eq(schema.book.id, id))
	)[0];

	if (!book) return request.sendError(404, Errors.RESSOURCE_NOT_FOUND);

	return response.status(200).json({
		value: book,
		error: 0,
	});
});

router.put("/:id", async (request, response) => {
	const id = request.params.id;

	const book = (
		await db.select().from(schema.book).where(eq(schema.book.id, id))
	)[0];

	if (!book) return request.sendError(404, Errors.RESSOURCE_NOT_FOUND);

	if (book.deletedAt !== null)
		return request.sendError(404, Errors.RESSOURCE_DELETED);

	const {
		type,
		score,
		synopsis,
		publicationStatus,
		chaptersAvailable,
		hidden,
	} = request.body ?? {};

	const result = (
		await db
			.update(schema.book)
			.set({
				modifiedAt: new Date(),
				...(type !== undefined && { type }),
				...(score !== undefined && { score }),
				...(synopsis !== undefined && { synopsis }),
				...(publicationStatus !== undefined && { publicationStatus }),
				...(chaptersAvailable !== undefined && { chaptersAvailable }),
				...(hidden !== undefined && { hidden }),
			})
			.returning()
	)[0];

	return response.status(200).json({
		value: result,
		error: 0,
	});
});

router.delete("/:id", async (request, response) => {
	const id = request.params.id;

	const book = (
		await db
			.select()
			.from(schema.book)
			.where(and(eq(schema.book.id, id), isNull(schema.book.deletedAt)))
	)[0];

	if (!book) return request.sendError(404, Errors.RESSOURCE_NOT_FOUND);

	if (book.deletedAt !== null)
		return request.sendError(404, Errors.RESSOURCE_ALREADY_DELETED);

	const result = (
		await db
			.update(schema.book)
			.set({
				deletedAt: new Date(),
			})
			.where(eq(schema.book.id, id))
			.returning()
	)[0];

	return response.status(200).json({
		value: result,
		error: 0,
	});
});

export default router;
