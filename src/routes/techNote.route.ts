import express, { Router } from "express";
import {
  createNewNote,
  deleteNote,
  getAllNotes,
  updateNote,
} from "../controllers/techNote.controller";

export const techNoteRouter: Router = express.Router();

techNoteRouter
  .route("/techNotes")
  .get(getAllNotes)
  .post(createNewNote)
  .put(updateNote)
  .delete(deleteNote);
