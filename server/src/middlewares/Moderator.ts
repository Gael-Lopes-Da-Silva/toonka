import type { NextFunction, Request, Response } from "express";

import { Errors } from "../services/ErrorHandler";
import { db } from "../database";

export default async (
	request: Request,
	_response: Response,
	next: NextFunction,
) => {
	if (!request.user) return request.sendError(401, Errors.UNAUTHORIZED);

	const permissions = await db.query.userPermission.findFirst({
		where: (permissions, { eq }) => eq(permissions.userId, request.user.id),
	});

	if (!permissions) return request.sendError(401, Errors.UNAUTHORIZED);
	if (!permissions.moderator)
		return request.sendError(401, Errors.UNAUTHORIZED);

	next();
};
