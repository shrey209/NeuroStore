import { Request, Response } from "express";
import MetadataModel from "../models/Metadata";

// POST /metadata
export const createMetadata = async (req: Request, res: Response) => {
  try {
    const { chunks } = req.body;

    const metadata = new MetadataModel({ chunks });
    const savedMetadata = await metadata.save();

    res.status(201).json(savedMetadata);
  } catch (error) {
    console.error("Error creating metadata:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// GET /metadata/:id
export const getMetadataById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const metadata = await MetadataModel.findById(id);
    res.status(200).json(metadata);
    
  } catch (error) {
    console.error("Error fetching metadata:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
