import User from "../models/users";
import File from "../models/files";
import { Request, Response } from "express";

export const getUserInfo = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ user_id: req.params.user_id });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

export const getUserFiles = async (req: Request, res: Response) => {
  try {
    const files = await File.find({ user_id: req.params.user_id });
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
