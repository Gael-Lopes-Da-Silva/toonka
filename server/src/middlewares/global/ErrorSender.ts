import "dotenv/config";

import type { NextFunction, Request, Response } from "express";

import { type Error } from "../../services/ErrorHandler";

export default () => {
	return (request: Request, response: Response, next: NextFunction) => {
		request.sendError = (status: number, error: Error) =>
			response.status(status).json({
				error: error,
			});

		next();
	};
};
