import { Request, Response } from "express";
import MetadataModel, { MetadataDocument } from "../models/metadata";


export const createMetadata = async (req: Request, res: Response) => {
  try {
    const { chunks } = req.body;

    if (!chunks || !Array.isArray(chunks)) {
       res.status(400).json({ message: "Invalid chunks payload" });
       return;
    }

    const newMetadata = new MetadataModel({ chunks });
    const saved = await newMetadata.save();

    res.status(201).json(saved);
  } catch (err) {
    console.error("Error creating metadata:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const getMetadataById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const metadata = await MetadataModel.findById(id);
    if (!metadata) {
       res.status(404).json({ message: "Metadata not found" });
       return;
    }

    res.json(metadata);
  } catch (err) {
    console.error("Error fetching metadata:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
