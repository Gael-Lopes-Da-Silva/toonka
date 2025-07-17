import type { NextFunction, Request, Response } from "express";

import { Errors } from "../../services/ErrorHandler";
import { db } from "../../database";

export default (
	level: "moderator" | "administrator",
	config?: {
		bypassUserId?: boolean;
	},
) => {
	return async (request: Request, _response: Response, next: NextFunction) => {
		if (!request.user) return request.sendError(401, Errors.UNAUTHORIZED);

		const permissions = await db.query.userPermission.findFirst({
			where: (permissions, { eq }) => eq(permissions.userId, request.user.id),
		});

		if (!permissions) return request.sendError(401, Errors.UNAUTHORIZED);

		if (config?.bypassUserId && request.params.id == request.user.id) {
			return next();
		}

		switch (level) {
			case "moderator":
				if (!permissions.moderator && !permissions.administrator)
					return request.sendError(401, Errors.UNAUTHORIZED);
				break;

			case "administrator":
				if (!permissions.administrator)
					return request.sendError(401, Errors.UNAUTHORIZED);
				break;
		}

		return next();
	};
};
