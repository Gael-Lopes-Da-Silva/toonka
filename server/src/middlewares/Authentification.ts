import "dotenv/config";

import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { Errors } from "../services/ErrorHandler";

export default (request: Request, _response: Response, next: NextFunction) => {
	const authorization = request.header("authorization");

	if (!authorization) return request.sendError(401, Errors.UNAUTHORIZED);

	const token = authorization.startsWith("Bearer ")
		? authorization.split(" ")[0]
		: authorization;

	if (!process.env.API_SECRET)
		return request.sendError(500, Errors.INTERNAL_ERROR);

	try {
		const decoded = jwt.verify(token, process.env.API_SECRET);
		request.user = decoded;
	} catch (error) {
		return request.sendError(401, Errors.UNAUTHORIZED);
	}

	next();
};
