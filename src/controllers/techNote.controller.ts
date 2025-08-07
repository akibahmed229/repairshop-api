import { Request, Response } from "express"; // Default import
import {
  NewTechNotes,
  TechNotes,
  techNotesTable,
} from "../models/techNoteSchema";
import { db } from "../../config/db";
import { eq } from "drizzle-orm";
import { usersTable } from "../models/userSchema";

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

    res.json(notesWithUsers);
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
