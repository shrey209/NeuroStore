import express from "express";
import {
  createUser,
  getUserById,
  getUserByGithubId,
 getUserByGoogleSubId}
  from "../controller/userController"
import { verifyAuthMiddleware } from "../middlewares/jwtMiddleware";
const userRouter = express.Router();

// Create new user
userRouter.post("/", createUser);

// Get user by MongoDB _id
userRouter.get("/get", verifyAuthMiddleware, getUserById);


// Get user by GitHub ID
userRouter.get("/github/:githubId", getUserByGithubId);

// Get user by Google sub ID
userRouter.get("/google/:subId", getUserByGoogleSubId);

export default userRouter;
