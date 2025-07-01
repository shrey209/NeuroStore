import { Request, Response } from "express";
import { loginWithGitHub } from "../../auth/githubAuth";
import type { CookieOptions } from "express";

export async function githubCallbackController(req: Request, res: Response): Promise<void> {
  const code = req.query.code as string;

  if (!code) {
    res.status(400).json({ error: "Missing code in query" });
    return; // 🧠 this return prevents execution of code below
  }

  try {
    const { token, fakeUserId } = await loginWithGitHub(code);

    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    };

    res.cookie("token", token, cookieOptions);
    console.log("✅ Login success for:", fakeUserId);

    res.redirect("http://localhost:5173/");
  } catch (err: any) {
    console.error("GitHub login failed:", err);
    res.status(500).json({ error: "GitHub login failed" });
  }
}
