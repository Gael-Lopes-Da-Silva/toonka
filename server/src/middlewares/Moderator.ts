import type { NextFunction, Request, Response } from "express";

export default (request: Request, response: Response, next: NextFunction) => {
	next();
};
