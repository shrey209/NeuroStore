import { Request, Response } from "express";
import { loginWithGitHub } from "../auth/githubAuth";
import { loginWithGoogle } from "../auth/googleAuth";
import { verifyJWT } from "../auth/jwtutils";
import type { CookieOptions } from "express";

const isProduction = process.env.NODE_ENV === "production";

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction, 
  sameSite: isProduction ? "none" : "lax", 
  maxAge: 24 * 60 * 60 * 1000, 
};

export async function githubCallbackController(req: Request, res: Response): Promise<void> {
  const code = req.query.code as string;

  if (!code) {
    res.status(400).json({ error: "Missing code in query" });
    return;
  }

  try {
    const { token, user_id } = await loginWithGitHub(code);
    res.cookie("token", token, cookieOptions);
    console.log("✅ GitHub login success for:", user_id);
    res.redirect("http://localhost:5173/dashboard");
  } catch (err: any) {
    console.error("GitHub login failed:", err);
    res.status(500).json({ error: "GitHub login failed" });
  }
}

export async function googleCallbackController(req: Request, res: Response) {
  const code = req.query.code as string;

  if (!code) {
    res.status(400).json({ error: "Missing authorization code" });
    return;
  }

  try {
    const { token, user_id } = await loginWithGoogle(code);
    res.cookie("token", token, cookieOptions);
    console.log("✅ Google login success for:", user_id);
    res.redirect("http://localhost:5173/dashboard");
  } catch (err) {
    console.error("Google login error:", err);
    res.status(500).json({ error: "Google login failed" });
  }
}

export async function checkSessionController(req: Request, res: Response) {
  console.log("🔍 All cookies received:", req.cookies); // 👈 Logs ALL cookies

  const token = req.cookies?.token;

  if (!token) {
    console.log("❌ No JWT found in cookie");
    res.status(200).json({ isLoggedIn: false });
    return;
  }

  const [isValid] = verifyJWT(token);
  console.log("✅ JWT is valid:", isValid);

  res.status(200).json({ isLoggedIn: isValid });
}

export function logoutController(req: Request, res: Response) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });

  res.status(200).json({ message: "Logged out successfully" });
}
