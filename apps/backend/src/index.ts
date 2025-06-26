// server.ts or index.ts
require("dotenv").config();
import express from "express";
import connectionSetup from "../db/connection";
import routerAuth from "../routes/auth";
import routerChunk from "../routes/chunks";
import routerFile from "../routes/files";
import routerMetadata from "../routes/metadata";
import routerUser from "../routes/users";
import routerUtils from "../routes/utils";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Hello from backend!");
});

app.use("/app/v1/auth", routerAuth);
app.use("/app/v1/users", routerUser);
app.use("/app/v1/files/:user_id", routerFile);
app.use("/app/v1/chunks/:user_id/:file_id/:metadata_id/", routerChunk);
app.use("/app/v1/metadata/:user_id/:file_id", routerMetadata);
app.use("/app/v1/utils", routerUtils);

const start = async () => {
  try {
    await connectionSetup()
      .then(() =>
        app.listen(PORT, () => console.log(`Server Started at Port : ${PORT}`))
      )
      .catch((err) => console.log(err));
  } catch (error: any) {
    throw new Error(error);
  }
};

start();
