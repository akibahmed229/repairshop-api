import { Request, Response } from "express"; // Default import
import { NewUser, User, usersTable } from "../models/userSchema";
import { db } from "../config/db";
import bcrypt from "bcryptjs";
import { and, eq, ilike, not } from "drizzle-orm";
import { techNotesTable } from "../models/techNoteSchema";

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
        // destructure body
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

        // check for duplicate user
        const duplicate = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, email));

        if (duplicate.length) {
            return res.status(400).json({ message: "User already exists" });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // create user object
        const newUser: NewUser = {
            name,
            email,
            password: hashedPassword,
            roles: roles as NewUser['roles'],
        };

        // store the user object into the DB
        const [user] = await db.insert(usersTable).values(newUser).returning();

        if (user) {
            // created
            res.status(201).json(user);
        } else {
            res.status(400).json({ message: "Invalid user data received" });
        }
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
        // destructure body
        const { id, name, email, password, roles } = req.body;

        // confirm essential data
        if (!id) {
            return res.status(400).json({ message: "User ID is required for update." });
        }

        // find user
        const findUser = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, email));

        if (!findUser.length) {
            return res.status(400).json({ message: "User doesn't exists" });
        }

        // check for duplicate
        const duplicate = await db.select({ id: usersTable.id, name: usersTable.name })
            .from(usersTable)
            .where(
                // Find users where the name matches (case-insensitive)
                and(
                    ilike(usersTable.name, name),
                    // Excludes the row belonging to the user whose profile is currently being updated.
                    not(eq(usersTable.id, id))
                )
            )
            .limit(1);

        // allow updates to the original user
        if (duplicate[0]) {
            return res.status(409).json({ message: "Duplicate username" });
        }

        //  build the conditional update payload (Partial<NewUser>)
        const updatePayload: Partial<NewUser> = {};

        // name update
        if (name !== undefined) {
            updatePayload.name = name;
        }

        // email update
        if (email !== undefined) {
            updatePayload.email = email;
        }

        // roles update (must be an array)
        if (roles !== undefined && Array.isArray(roles) && roles.length > 0) {
            // Assert type for Drizzle schema compliance
            updatePayload.roles = roles as NewUser['roles'];
        }

        // password update (ONLY if a new password is provided)
        if (password) {
            updatePayload.password = await bcrypt.hash(password, 10);
        }

        // always update the timestamp
        updatePayload.updatedAt = new Date();

        // execute update (Only if there are fields to update)
        if (Object.keys(updatePayload).length === 1 && 'updatedAt' in updatePayload) {
            return res.status(200).json({ message: "No data provided for update." });
        }

        const [user] = await db.update(usersTable).
            set(updatePayload).
            where(eq(usersTable.id, id))
            .returning();

        // Clean up response
        const { password: _, ...userWithoutPassword } = user;

        res.status(201).json(userWithoutPassword);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: `Internal Server Error :${error}` });
    }
};


export const deleteUser = async (
    req: Request<{}, {}, UpdateUser>,
    res: Response,
) => {
    try {
        // destructure body
        const { id } = req.body;

        // confirm essential data
        if (!id) {
            return res.status(400).json({ message: "User ID is required for delete a user." });
        }

        // find user note
        const notes = await db.select()
            .from(techNotesTable)
            .where(eq(techNotesTable.userId, id));

        if (notes?.length) {
            res.status(400).json({ message: "User has assigned notes" });
        }

        // define user
        const user = await db.select()
            .from(usersTable)
            .where(eq(usersTable.id, id));

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // delete user 
        const [result] = await db
            .delete(usersTable)
            .where(eq(usersTable.id, id))
            .returning();

        // message to send
        const reply = `Username ${result.name} with ID ${result.id} deleted`;

        res.json(reply);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: `Internal Server Error :${error}` });
    }
};
