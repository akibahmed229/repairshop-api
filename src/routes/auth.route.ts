import express, { Router } from "express";
import {
  getUserByToken,
  jwtVerification,
  login,
  signup,
} from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/authMiddleware";
import { apiRateLimiter } from "../middleware/apiRateLimiter";

export const authRouter: Router = express.Router();

authRouter.route("/sginup").post(apiRateLimiter, signup);

authRouter.route("/login").post(apiRateLimiter, login);

authRouter.route("/jwt").post(jwtVerification);

authRouter.route("/user").get(authMiddleware, getUserByToken);
