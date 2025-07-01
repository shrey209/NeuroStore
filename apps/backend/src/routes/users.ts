import express, { Request, Response, NextFunction } from "express";
import { getUserFiles, getUserInfo } from "../controller/usersController";

const routerUser = express.Router();

routerUser.get(
  "/:user_id",
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(getUserInfo(req, res)).catch(next);
  }
);
routerUser.get(
  "/:user_id/files",
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(getUserFiles(req, res)).catch(next);
  }
);

export default routerUser;
