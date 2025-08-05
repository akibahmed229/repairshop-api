import { Request, Response, NextFunction } from "express"; // Default import
import { logEvents } from "./logEvents";

// Define a custom error type that extends the base Error
interface CustomError extends Error {
  status?: number; // optional HTTP status
  code?: string; // optional error code
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logEvents(`${err.name}: ${err.message}`, "errLogs.txt");
  console.log(err.stack);

  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
};
