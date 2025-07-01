import { Request, Response } from "express";
import User from "../models/users";
import { User as SharedUser } from "@neurostore/shared/types";
import { IUserModel } from "../models/users";


const toSharedUser = (doc: IUserModel): SharedUser => ({
  user_id: doc.user_id,
  user_name: doc.user_name,
  provider: doc.provider,
  gmail: doc.gmail,
  profile_picture: doc.profile_picture,
  email_verified: doc.email_verified,
  file_details: doc.file_details.map((id) => id.toString()),
  created_at: doc.created_at.toISOString(),
  google_sub_id: doc.google_sub_id,
  github_id: doc.github_id,
});


export const createUser = async (req: Request, res: Response) => {
  try {
    const {
      user_id,
      user_name,
      provider,
      gmail,
      profile_picture,
      email_verified,
      google_sub_id,
      github_id,
    } = req.body;

   const orConditions: Record<string, any>[] = [{ user_id }];
if (google_sub_id) orConditions.push({ google_sub_id });
if (github_id) orConditions.push({ github_id });


    const existingUser = await User.findOne({ $or: orConditions });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const userDoc = new User({
      user_id,
      user_name,
      provider,
      gmail,
      profile_picture,
      email_verified,
      google_sub_id,
      github_id,
    });

    const savedUser = await userDoc.save();
    res.status(201).json(toSharedUser(savedUser));
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).populate("file_details");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(toSharedUser(user));
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const getUserByGithubId = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ github_id: req.params.githubId }).populate("file_details");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(toSharedUser(user));
  } catch (err) {
    console.error("Error fetching user by GitHub ID:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const getUserByGoogleSubId = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ google_sub_id: req.params.subId }).populate("file_details");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(toSharedUser(user));
  } catch (err) {
    console.error("Error fetching user by Google sub ID:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
