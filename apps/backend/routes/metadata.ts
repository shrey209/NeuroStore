import express from "express";

const routerMetadata = express.Router();

routerMetadata.post("/").get("/:metadata_id");

export default routerMetadata;
