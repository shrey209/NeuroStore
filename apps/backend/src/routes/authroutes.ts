import express from "express";
import { githubCallbackController, googleCallbackController ,logoutController,checkSessionController} from "../controller/authController";
import { updateFileAccess } from "../controller/fileController";

const routerAuth = express.Router();

const GITHUB_CLIENT_ID = process.env.CLIENT_ID!;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;

// 🚀 GitHub OAuth entry point
routerAuth.get("/github/login", (_req, res) => {
  const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=http://localhost:4000/auth/github/callback&scope=user`;
  res.redirect(redirectUrl);
});

// ✅ Google OAuth entry point
routerAuth.get("/google/login", (_req, res) => {
  const redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_REDIRECT_URI}&response_type=code&scope=openid%20email%20profile`;
  res.redirect(redirectUrl);
});

// 🔁 Callbacks
routerAuth.get("/github/callback", githubCallbackController);
routerAuth.get("/session", checkSessionController);
routerAuth.get("/google/callback", googleCallbackController);
routerAuth.post("/logout", logoutController);
routerAuth.post("/update-access",updateFileAccess);

export default routerAuth;
