import express from "express";

const routerChunk = express.Router();

routerChunk.post("/storeS3").get("/:hash");

export default routerChunk;
