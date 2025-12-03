import express, { Router } from "express";
import { createNewUser, getAllUsers, updateUser } from "../controllers/users.controller";

export const userRouter: Router = express.Router();

userRouter.route("/users").
    get(getAllUsers)
    .post(createNewUser)
    .put(updateUser);
