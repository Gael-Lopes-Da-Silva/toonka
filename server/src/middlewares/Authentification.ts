import "dotenv/config";

import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { Errors, type Error } from "../services/ErrorHandler";

export default (request: Request, response: Response, next: NextFunction) => {
	const authorization = request.header("authorization");

	const sendError = (status: number, error: Error) =>
		response.status(status).json({
			from: "authentification",
			error: error,
		});

	if (!authorization) return sendError(401, Errors.UNAUTHORIZED);

	const token = authorization.startsWith("Bearer ")
		? authorization.split(" ")[0]
		: authorization;

	if (!process.env.API_SECRET) return sendError(500, Errors.INTERNAL_ERROR);

	try {
		const decoded = jwt.verify(token, process.env.API_SECRET);
		request.user = decoded;
		next();
	} catch (error) {
		return sendError(401, Errors.UNAUTHORIZED);
	}

	next();
};
