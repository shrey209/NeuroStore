import express from "express";

const routerUtils = express.Router();

routerUtils.get("/health").get("/storage/usage/:user_id");

export default routerUtils;
