import { Request, Response } from "express"; // Default import
import { NewUser, User, usersTable } from "../models/userSchema";
import { db } from "../config/db";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

interface CreateNewUserBody {
    name: string;
    email: string;
    password: string;
    roles: string[];
}

interface UpdateUser extends CreateNewUserBody {
    id: string
}


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

export const createNewUser = async (
    req: Request<{}, {}, CreateNewUserBody>,
    res: Response,
) => {
    try {
        const { name, email, password, roles } = req.body;

        // confirm data
        if (!name
            || !email
            || !password
            || !roles
            || !Array.isArray(roles)
            || roles.length === 0) {
            return res.status(400).json({ message: "All fields are required" });
        }

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
            roles: roles as NewUser['roles'],
        };

        const [user] = await db.insert(usersTable).values(newUser).returning();

        res.status(201).json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: `Internal Server Error :${error}` });
    }
};

export const updateUser = async (
    req: Request<{}, {}, UpdateUser>,
    res: Response,
) => {
    try {
        const { id, name, email, password, roles } = req.body;

        // confirm data
        if (
            !id
            || !name
            || !email
            || !password
            || !roles
            || !Array.isArray(roles)
            || roles.length === 0
        ) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const ifUserExist = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, email));

        if (!ifUserExist.length) {
            return res.status(400).json({ message: "User doesn't exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const updatedUser: NewUser = {
            name,
            email,
            password: hashedPassword,
            roles: roles as NewUser['roles'],
            updatedAt: new Date(),
        };

        const [user] = await db.update(usersTable).
            set(updatedUser).
            where(eq(usersTable.id, id))
            .returning();

        res.status(201).json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: `Internal Server Error :${error}` });
    }
};

