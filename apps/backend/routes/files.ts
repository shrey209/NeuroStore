import express from "express";
import {
  createFile,
  getFileWithMetadata,
  downloadFile,
  deleteFile,
  renameFile,
} from "../controller/filesController";

const routerFile = express.Router();

routerFile
  .get("/:file_id", getFileWithMetadata)
  .post("/", createFile)
  .put("/:file_id/rename", renameFile)
  .delete("/:file_id", deleteFile)
  .get("/:file_id/download", downloadFile);

export default routerFile;
