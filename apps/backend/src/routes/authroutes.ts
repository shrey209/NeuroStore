// src/routes/authRoutes.ts
import express from "express";
import { githubCallbackController } from "../controller/authController";

const routerAuth = express.Router();

const CLIENT_ID = process.env.CLIENT_ID!;

// 🚀 Step 1: GitHub login initiator
routerAuth.get("/github/login", (_req, res) => {
  const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=http://localhost:4000/auth/github/callback&scope=user`;
  res.redirect(redirectUrl);
});

// 🎯 Step 2: GitHub OAuth callback
routerAuth.get("/github/callback", githubCallbackController);

export default routerAuth;
