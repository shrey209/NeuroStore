// routes/fileRoutes.ts
import express from "express";
import {
  getFilesByIds,
  getLatestMetadata,
  uploadFile,
  getSharedWith,
  isPublic,
  getLatestMetadataByFilename,
  searchFilesByName,
  getLatestFileDataByFileId,
} from "../controller/fileController";

import { verifyAuthMiddleware,optionalAuthMiddleware } from "../middlewares/jwtMiddleware";

const filerouter = express.Router();

filerouter.get("/get/:ids", verifyAuthMiddleware, getFilesByIds);
filerouter.get("/:file_id/metadata/latest", optionalAuthMiddleware, getLatestMetadata);
filerouter.post("/upload", verifyAuthMiddleware, uploadFile);
filerouter.get("/:file_id/shared-with", verifyAuthMiddleware, getSharedWith);
filerouter.get("/:file_id/is-public", isPublic); 
filerouter.get("/filename/:filename/metadata/latest", verifyAuthMiddleware,getLatestMetadataByFilename);
filerouter.post("/search", verifyAuthMiddleware, searchFilesByName);
filerouter.get("/:file_id/latest",verifyAuthMiddleware,getLatestFileDataByFileId)
export default filerouter;
