import { Request, Response } from "express";
import { loginWithGitHub } from "../auth/githubAuth";
import type { CookieOptions } from "express";
import { loginWithGoogle } from "../auth/googleAuth";

export async function githubCallbackController(req: Request, res: Response): Promise<void> {
  const code = req.query.code as string;

  if (!code) {
    res.status(400).json({ error: "Missing code in query" });
    return;
  }

  try {
    const { token, user_id } = await loginWithGitHub(code);

    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    };

    res.cookie("token", token, cookieOptions);
    console.log("✅ Login success for:", user_id);

    res.redirect("http://localhost:5173/");
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

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    console.log("✅ Google login success for:", user_id);
    res.redirect("http://localhost:5173/"); // your frontend
  } catch (err) {
    console.error("Google login error:", err);
    res.status(500).json({ error: "Google login failed" });
  }
}