import { Request, Response } from "express"; // Default import
import {
    NewTechNotes,
    TechNotes,
    techNotesTable,
} from "../models/techNoteSchema";
import { db } from "../../config/db";
import { and, eq, sql } from "drizzle-orm";
import { usersTable } from "../models/userSchema";
import { log } from "console";

export const getAllNotes = async (
    req: Request<{}, {}, TechNotes>,
    res: Response,
) => {
    try {
        const notes = await db.select().from(techNotesTable);

        if (!notes?.length) {
            return res.status(400).json({ message: "No notes found" });
        }

        const notesWithUsers = await db
            .select({
                id: techNotesTable.id,
                userId: techNotesTable.userId,
                title: techNotesTable.title,
                content: techNotesTable.content,
                completed: techNotesTable.completed,
                createdAt: techNotesTable.createdAt,
                updatedAt: techNotesTable.updatedAt,
                userName: usersTable.name,
                userEmail: usersTable.email,
            })
            .from(techNotesTable)
            .innerJoin(usersTable, eq(techNotesTable.userId, usersTable.id));

        return res.json(notesWithUsers);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: `Internal Server Error :${error}` });
    }
};

export const createNewNote = async (
    req: Request<{}, {}, NewTechNotes>,
    res: Response,
) => {
    try {
        // destructure body
        const { userId, title, content } = req.body;

        // confirm data
        if (!userId || !title || !content) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // check for duplicate title
        const duplicate = await db
            .select()
            .from(techNotesTable)
            .where(eq(techNotesTable.title, title));

        if (duplicate.length > 0) {
            return res.status(409).json({ message: "Duplicate title" });
        }

        const newTechNote = {
            userId,
            title,
            content,
        };

        // create and store the new note
        const note = await db
            .insert(techNotesTable)
            .values(newTechNote)
            .returning();

        if (note) return res.status(201).json(...note);
        else return res.status(400).json({ message: "Invalid note data received" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: `Internal Server Error :${error}` });
    }
};

export const updateNote = async (
    req: Request<{}, {}, TechNotes>,
    res: Response,
) => {
    try {
        // destructure body
        const { id, userId, title, content, completed } = req.body;

        // confirm data
        if (
            !id ||
            !userId ||
            !title ||
            !content ||
            typeof completed !== "boolean"
        ) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // confirm if note exist
        const [note] = await db
            .select()
            .from(techNotesTable)
            .where(eq(techNotesTable.id, id));

        if (!note) {
            return res.status(400).json({ message: "Note not found" });
        }

        // check for duplicate title
        const [duplicate] = await db
            .select()
            .from(techNotesTable)
            .where(
                and(eq(techNotesTable.title, title), eq(techNotesTable.userId, userId)),
            );

        if (duplicate && duplicate?.id !== id) {
            return res.status(409).json({ message: "Duplicate title" });
        }

        // update new note
        const [updatedNote] = await db
            .update(techNotesTable)
            .set({
                userId,
                title,
                content,
                completed,
                updatedAt: new Date(),
            })
            .where(eq(techNotesTable.id, id))
            .returning();

        return res.json(`'${updatedNote.title}' updated`);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: `Internal Server Error :${error}` });
    }
};

export const deleteNote = async (
    req: Request<{}, {}, TechNotes>,
    res: Response,
) => {
    try {
        const { id } = req.body;

        // confirm data
        if (!id) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // confirm note exist to delete
        const note = await db
            .select()
            .from(techNotesTable)
            .where(eq(techNotesTable.id, id));

        if (!note.length) {
            return res.status(400).json({ message: "Note not found" });
        }

        // delete the note
        const [deletedNote] = await db
            .delete(techNotesTable)
            .where(eq(techNotesTable.id, id))
            .returning();

        return res.json(
            `Note '${deletedNote.title}' with ID ${deletedNote.id} deleted`,
        );
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: `Internal Server Error :${error}` });
    }
};

export const syncAllNotes = async (
    req: Request<{}, {}, TechNotes[]>,
    res: Response,
) => {
    try {
        const taskList = req.body;

        if (!taskList || taskList.length === 0) {
            return res.status(200).json({ message: "No tasks to sync" });
        }

        const tasksToInsert = taskList.map(task => ({
            id: task.id,
            userId: task.userId,
            title: task.title,
            content: task.content,
            // Completed field conversion (since it's 0/1 on client but bool on DB schema)
            completed: typeof task.completed === 'number' ? (task.completed === 1) : task.completed,

            // Date conversion using null-check
            createdAt: task.createdAt ? new Date(task.createdAt) : null,
            updatedAt: task.updatedAt ? new Date(task.updatedAt) : null,
        }));

        const syncTasks = await db
            .insert(techNotesTable)
            .values(tasksToInsert)
            .onConflictDoUpdate({
                target: techNotesTable.id,
                set: {
                    // to reference the incoming data row.
                    userId: sql.raw(`excluded.${techNotesTable.userId.name}`),
                    title: sql.raw(`excluded.${techNotesTable.title.name}`),
                    content: sql.raw(`excluded.${techNotesTable.content.name}`),
                    completed: sql.raw(`excluded.${techNotesTable.completed.name}`),
                    createdAt: techNotesTable.createdAt,
                    updatedAt: new Date(), // Use server time for the update event
                },
            })
            .returning();

        res.status(201).json(syncTasks);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: `Internal Server Error: ${error}` });
    }
};
