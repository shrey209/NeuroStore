// routes/fileRoutes.ts
import express from "express";
import {
  getFilesByIds,
  getLatestMetadataId,
  createFile,
  getSharedWith,
  isPublic,
} from "../controller/fileController";

import { verifyAuthMiddleware } from "../middlewares/jwtMiddleware";

const router = express.Router();

router.get("/get/:ids", verifyAuthMiddleware, getFilesByIds);
router.get("/:file_id/metadata/latest", verifyAuthMiddleware, getLatestMetadataId);
router.post("/", verifyAuthMiddleware, createFile);
router.get("/:file_id/shared-with", verifyAuthMiddleware, getSharedWith);
router.get("/:file_id/is-public", isPublic); 

export default router;
