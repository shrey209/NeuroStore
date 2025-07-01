import { Request, Response } from "express";
import FileModel from "../models/files";


export const createFile = async (req: Request, res: Response) => {
  try {
    const {
      file_id,
      user,
      file_name,
      file_size,
      mime_type,
      metadata,
    } = req.body;

    if (!file_id || !file_name || !user) {
       res.status(400).json({ message: "Missing required fields" });
       return ;
    }

    const existing = await FileModel.findOne({ file_id });
    if (existing) {
       res.status(409).json({ message: "File ID already exists" });
       return;
    }

    const file = new FileModel({
      file_id,
      user,
      file_name,
      file_size,
      mime_type,
      metadata,
    });

    const saved = await file.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Error creating file:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const getFileByFileId = async (req: Request, res: Response) => {
  try {
    const { file_id } = req.params;
    const file = await FileModel.findOne({ file_id }).populate("metadata._id");

    if (!file) {
       res.status(404).json({ message: "File not found" });
       return ;
    }

    res.json(file);
  } catch (err) {
    console.error("Error fetching file:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const getFilesByUserId = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const files = await FileModel.find({ user: userId }).populate("metadata._id");

    res.json(files);
  } catch (err) {
    console.error("Error fetching files for user:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
