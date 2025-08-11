import express, { Router } from "express";
import { getAllUsers } from "../controllers/users.controller";

export const userRouter: Router = express.Router();

userRouter.route("/users").get(getAllUsers);
