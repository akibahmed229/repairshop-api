import { Request, Response } from "express"; // Default import
import { User, usersTable } from "../models/userSchema";
import { db } from "../../config/db";

export const getAllUsers = async (
  req: Request<{}, {}, User>,
  res: Response,
) => {
  try {
    const users = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        roles: usersTable.roles,
        active: usersTable.active,
        createdAt: usersTable.createdAt,
        updatedAt: usersTable.updatedAt,
      })
      .from(usersTable);

    if (!users.length) {
      return res.status(400).json({ message: "No users found" });
    }

    // response
    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: `Internal Server Error :${error}` });
  }
};
