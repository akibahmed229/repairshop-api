import express, { Router } from "express";
import { createNewNote, getAllNotes } from "../controllers/techNote.controller";

export const techNoteRouter: Router = express.Router();

techNoteRouter.route("/techNotes").get(getAllNotes).post(createNewNote);
