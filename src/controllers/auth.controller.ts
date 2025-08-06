import { Request, Response, NextFunction } from "express"; // Default import
import { NewUser, usersTable } from "../models/userSechema";
import { db } from "../../config/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import { verify } from "crypto";
import { AuthRequest } from "../middleware/authMiddleware";

interface UserSignUpBody {
  name: string;
  email: string;
  password: string;
}

interface UserLogInBody {
  email: string;
  password: string;
}

// Request<{}, {}, User> first {} is for params, second {} is for query, third {} is for body
// Ex: /users/:id for params, /users?id=1 for query, /users for body
export const signup = async (
  req: Request<{}, {}, UserSignUpBody>,
  res: Response,
) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (existingUser.length) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser: NewUser = {
      name,
      email,
      password: hashedPassword,
    };

    const [user] = await db.insert(usersTable).values(newUser).returning();

    res.status(201).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: `Internal Server Error :${error}` });
  }
};

export const login = async (
  req: Request<{}, {}, UserLogInBody>,
  res: Response,
) => {
  try {
    const { email, password } = req.body;

    const [existingUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (!existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email doesn't exist!" });
    }

    // compare hash pass
    const isMatched = await bcrypt.compare(password, existingUser.password);

    if (!isMatched) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // create jwt token
    const token = jwt.sign({ id: existingUser.id }, process.env.JWT_SECRET!);

    return res.status(200).json({ token, ...existingUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: `Internal Server Error :${error}` });
  }
};

export const jwtVerification = async (req: Request, res: Response) => {
  try {
    const token = req.header("x-auth-token");

    if (!token) {
      return res.json(false);
    }

    // verify if token valid
    const verify = jwt.verify(token, process.env.JWT_SECRET!);

    if (!verify) {
      return res.json(false);
    }

    // get the user if the token is valid
    const verifiedToken = verify as { id: string };

    // get user
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, verifiedToken.id));

    if (!user) {
      return res.json(false);
    }

    return res.json(true);
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      res.status(401).json({ message: "Token expired" });
    } else {
      res.status(500).json({ message: `Internal Server Error :${error}` });
    }
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "No user found!" });
      return;
    }

    // get the user if the token is valid
    const userId = req.user;

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    if (!user) {
      res.status(401).json({ message: "Users not found!" });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: `Internal Server Error :${error}` });
  }
};
