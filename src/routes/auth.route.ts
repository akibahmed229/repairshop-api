import express, { Router } from "express";
import {
  getAllUsers,
  jwtVerification,
  login,
  signup,
} from "../controllers/auth.controller";
import { loginLimiter } from "../middleware/loginLimiter";
import { authMiddleware } from "../middleware/authMiddleware";

export const authRouter: Router = express.Router();

authRouter.route("/sginup").post(signup);

authRouter.route("/login").post(loginLimiter, login);

authRouter.route("/jwt").post(jwtVerification);

authRouter.route("/users").get(authMiddleware, getAllUsers);
