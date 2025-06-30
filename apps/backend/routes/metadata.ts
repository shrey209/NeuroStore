import express from "express";
import { createMetadata, getMetadataById } from "../controller/metadataController";

const routerMetadata = express.Router();

// POST /app/v1/metadata
routerMetadata.post("/", createMetadata);

// GET /app/v1/metadata/:id
routerMetadata.get("/:id", getMetadataById);

export default routerMetadata;
