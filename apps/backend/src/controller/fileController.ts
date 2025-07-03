import { Request, Response } from "express";
import File from "../models/files";
import { SharedFile } from "@neurostore/shared/types";
import { Types } from "mongoose";

// GET /api/files/by-ids
export const getFilesByIds = async (req: Request, res: Response) => {
  const idsParam = req.params.ids; // e.g. "file1,file2,file3"

  if (!idsParam) {
   res.status(400).json({ message: "Missing file ids in params" });
   return;
  }

  const ids = idsParam.split(",");

  try {
    const files = await File.find({ file_id: { $in: ids } });
    res.json(files);
  } catch (err) {
    console.error("Error fetching files by ids:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/files/:file_id/metadata/latest
export const getLatestMetadataId = async (req: Request, res: Response) => {
  const { file_id } = req.params;

  try {
    const file = await File.findOne({ file_id });

    if (!file || !file.metadata.length) {
       res.status(404).json({ message: "File or metadata not found" });
       return;
    }

    // Latest = highest version number
    const latest = file.metadata.reduce((a, b) => (b.version > a.version ? b : a));
    res.json({ metadata_id: latest._id });
  } catch (err) {
    console.error("Error getting latest metadata:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/files
export const createFile = async (req: Request, res: Response) => {
  const {
    file_id,
    file_name,
    file_extension,
    file_size,
    mime_type,
    metadata,
    is_public,
    shared_with,
  } = req.body;

  const user_id = (req as any).user_id;

  if (!file_id || !file_name || !metadata?.length || !user_id) {
     res.status(400).json({ message: "Missing required fields" });
     return;
  }

  try {
    const fileDoc = new File({
      file_id,
      user: user_id,
      file_name,
      file_extension,
      file_size,
      mime_type,
      metadata,
      is_public: !!is_public,
      shared_with: shared_with || [],
    });

    const savedFile = await fileDoc.save();
    res.status(201).json(savedFile);
  } catch (err) {
    console.error("Error creating file:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/files/:file_id/shared-with
export const getSharedWith = async (req: Request, res: Response) => {
  const { file_id } = req.params;

  try {
    const file = await File.findOne({ file_id });

    if (!file) {
      res.status(404).json({ message: "File not found" });
      return;
    }

    res.json(file.shared_with || []);
  } catch (err) {
    console.error("Error getting shared_with:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/files/:file_id/is-public
export const isPublic = async (req: Request, res: Response) => {
  const { file_id } = req.params;

  try {
    const file = await File.findOne({ file_id });

    if (!file) {
       res.status(404).json({ message: "File not found" });
       return;
    }

    res.json({ is_public: file.is_public });
  } catch (err) {
    console.error("Error checking public status:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
