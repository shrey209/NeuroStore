// apps/backend/src/index.ts
import express, { Request, Response, NextFunction } from "express";

import cors from "cors";
import { uploadIfNotExists } from "./s3util";
import { streamObjectChunks } from "./streamFileChunks";

const app = express();
const port = 3000;

// ✅ Enable CORS
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
}));

// ✅ Parse JSON bodies
app.use(express.json());

// ✅ Type for upload payload item
export interface UploadPayloadItem {
  sha: string;
  data: string; // base64-encoded
}

app.post("/api/upload", (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    const list = req.body as UploadPayloadItem[];

    if (!Array.isArray(list)) {
      return res.status(400).json({ error: "Expected an array of { sha, data } objects" });
    }

    try {
      for (const { sha, data } of list) {
        await uploadIfNotExists(sha, data);
      }
      res.json({ message: "Upload completed" });
    } catch (err) {
      console.error("❌ Upload failed:", err);
      next(err); // 👈 send to Express error handler
    }
  })();
});

app.get("/api/stream/:sha", async (req: Request, res: Response) => {
  const sha = req.params.sha;
  res.setHeader("Content-Type", "application/json");

  try {
    await streamObjectChunks(sha, (chunk) => {
      res.write(chunk);
    });
    res.end();
  } catch (err) {
    console.error(" Streaming failed:", err);
    res.status(500).json({ error: "Streaming failed" });
  }
});

// ✅ Start server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
