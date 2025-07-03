// src/routes/metadataRoutes.ts
import express from "express";
import { createMetadata, getMetadataById } from "../controller/metadataController";

const router = express.Router();

router.post("/metadata", createMetadata);
router.get("/metadata/:id", getMetadataById);

export default router;
