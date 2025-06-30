// server.ts or index.ts

require("dotenv").config();
import cors from "cors";
import express from "express";
import connectionSetup from "../db/connection"; // ✅ fixed relative path
import routerAuth from "../routes/authRoutes";   // ✅ match actual file name

// These are left as-is for later
// import routerChunk from "./routes/chunks";
// import routerFile from "./routes/files";
// import routerMetadata from "./routes/metadata";
// import routerUser from "./routes/users";
// import routerUtils from "./routes/utils";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173", // frontend origin
    credentials: true, // allow cookies (for JWT in cookies)
  })
);

app.get("/", (_req, res) => {
  res.send("Hello from backend!");
});

// ✅ Only mounting auth routes for now
app.use("/auth", routerAuth);

// These are commented out for now, as requested
// app.use("/app/v1/users", routerUser);
// app.use("/app/v1/files/:user_id", routerFile);
// app.use("/app/v1/chunks/:user_id/:file_id/:metadata_id/", routerChunk);
// app.use("/app/v1/metadata", routerMetadata);
// app.use("/app/v1/utils", routerUtils);

const start = async () => {
  try {
    // await connectionSetup();
    app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));
  } catch (error: any) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

start();
