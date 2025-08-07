import { UUID } from "crypto";
import { eq } from "drizzle-orm";
import { Request, Response, NextFunction } from "express"; // Default import
import { TokenExpiredError } from "jsonwebtoken";
import { usersTable } from "../models/userSchema";
import { db } from "../../config/db";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: UUID;
  token?: string;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.header("x-auth-token");

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token provided, authorization denied" });
    }

    // verify the token is valid
    const verify = jwt.verify(token, process.env.JWT_SECRET!);

    if (!verify) {
      res.status(401).json({ message: "Token is not valid" });
      return;
    }

    // get the user if the token is valid
    const verifiedToken = verify as { id: UUID };

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, verifiedToken.id));

    if (!user) {
      res.status(401).json({ message: "Users not found!" });
      return;
    }

    req.user = verifiedToken.id;
    req.token = token;

    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      res.status(401).json({ message: "Token expired" });
    } else {
      res.status(500).json({ message: `Internal Server Error :${error}` });
    }
  }
};
