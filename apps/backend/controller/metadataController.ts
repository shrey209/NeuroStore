import Metadata from "../models/Metadata";
import { Request, Response } from "express";

export const postMetadata = async (req: Request, res: Response) => {
  try {
    const file_id = req.params.file_id;
    const user_id = req.params.user_id;
    const metadataList = req.body; // assume array
    await Metadata.insertMany(
      metadataList.map((meta) => ({ ...meta, file_id }))
    );
    res.status(201).json({ message: "Metadata saved" });
  } catch (err) {
    res.status(500).json({ error: "Metadata save failed" });
  }
};

export const getMetadataById = async (req: Request, res: Response) => {
  try {
    const metadata = await Metadata.findOne({
      metadata_id: req.params.metadata_id,
      file_id: req.params.file_id,
    });
    res.json(metadata);
  } catch (err) {
    res.status(500).json({ error: "Metadata fetch failed" });
  }
};
