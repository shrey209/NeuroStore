import File from "../models/files";
import Metadata from "../models/Metadata";
import { Request, Response } from "express";

export const createFile = async (req: Request, res: Response) => {
  try {
    const { file_name } = req.body;
    const file = await File.create({
      file_id: crypto.randomUUID(),
      user_id: req.params.user_id,
      file_name,
    });
    res.status(201).json(file);
  } catch (err) {
    res.status(500).json({ error: "Failed to create file" });
  }
};

export const getFileWithMetadata = async (req: Request, res: Response) => {
  try {
    const file = await File.findOne({
      file_id: req.params.file_id,
      user_id: req.params.user_id,
    });
    const metadata = await Metadata.find({ file_id: req.params.file_id });
    res.json({ file, metadata });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch file info" });
  }
};

export const renameFile = async (req: Request, res: Response) => {
  try {
    const updated = await File.findOneAndUpdate(
      { file_id: req.params.file_id, user_id: req.params.user_id },
      { file_name: req.body.new_name },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Rename failed" });
  }
};

export const deleteFile = async (req: Request, res: Response) => {
  try {
    await Metadata.deleteMany({ file_id: req.params.file_id });
    await File.deleteOne({
      file_id: req.params.file_id,
      user_id: req.params.user_id,
    });
    res.json({ message: "File and metadata deleted" });
  } catch (err) {
    res.status(500).json({ error: "Deletion failed" });
  }
};

export const downloadFile = async (req: Request, res: Response) => {
  try {
    // Logic to fetch chunks from S3, concatenate, stream as response
    res.send("Download logic to be implemented");
  } catch (err) {
    res.status(500).json({ error: "Download failed" });
  }
};
