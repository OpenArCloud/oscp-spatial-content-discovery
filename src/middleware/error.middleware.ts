import HttpException from "../http-exception";
import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  error: HttpException & { status?: number },
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const status = error.statusCode || error.status || 500;
  const message = error.message || "We are having some problems";

  response.status(status).send(message);
};
