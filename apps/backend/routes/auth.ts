import express from "express";

const routerAuth = express.Router();

routerAuth.post("/register").post("/login").post("/refresh");

export default routerAuth;
