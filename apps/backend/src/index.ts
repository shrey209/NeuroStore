require("dotenv").config();

import cors from "cors";
import express from "express";
import connectionSetup from "./db/connection"; 
import routerAuth from "./routes/authroutes";
import { verifyAuthMiddleware } from "./middlewares/jwtMiddleware";
import cookieParser from "cookie-parser";
import userRouter from "./routes/users";
import filerouter from "./routes/filesroutes"
// These are left as-is for later
// import routerChunk from "./routes/chunks";
// import routerFile from "./routes/files";
// import routerMetadata from "./routes/metadata";
// import routerUser from "./routes/users";
// import routerUtils from "./routes/utils";

const app = express();

const PORT = Number(process.env.PORT) || 4000;

app.use(
  cors({
    origin: "http://localhost:5173", 
    credentials: true, 
  })
);
app.use(express.json({ limit: "50mb" })); 
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser()); 

app.get("/", (_req, res) => {
  res.send("Hello from backend!");
});


app.use("/auth", routerAuth);

// These are commented out for now, as requested
 app.use("/api/users",userRouter);
app.use("/api/file/", filerouter);
// app.use("/app/v1/chunks/:user_id/:file_id/:metadata_id/", routerChunk);
// app.use("/app/v1/metadata", routerMetadata);
// app.use("/app/v1/utils", routerUtils);

const start = async () => {
  try {
     await connectionSetup();
    app.listen(PORT, () => console.log(` Server started on port ${PORT}`));
  } catch (error: any) {
    console.error(" Failed to start server:", error);
    process.exit(1);
  }
};

start();
