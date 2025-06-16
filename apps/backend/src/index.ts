// index.ts or index.js

import express from "express";
import fs from "fs";
// import path from "path";
import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import { pipeline } from "stream";
import { promisify } from "util";

dotenv.config();

const app = express();
const PORT = 4000;
const BUCKET_NAME = process.env.AWS_S3_BUCKET!;
const REGION = process.env.AWS_REGION;
const FILE_PATH = "./temp.txt";
const MERGED_FILE_PATH = "./merged.txt";

// Initialize S3 Client
const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const streamPipeline = promisify(pipeline);

// Function to break file into chunks and upload each to S3
const uploadChunksToS3 = async () => {
  const fileBuffer = fs.readFileSync(FILE_PATH);
  const chunkSize = 200;
  const totalChunks = Math.ceil(fileBuffer.length / chunkSize);

  console.log(`Total offsets (bytes): ${fileBuffer.length}`);
  console.log(`Uploading ${totalChunks} chunks to S3...`);

  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, fileBuffer.length);
    const chunk = fileBuffer.slice(start, end);

    const objectKey = `chunks/chunk_${i + 1}.txt`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: objectKey,
      Body: chunk,
    });

    try {
      await s3.send(command);
      console.log(`✅ Uploaded: ${objectKey} (${chunk.length} bytes)`);
    } catch (err) {
      console.error(`❌ Error uploading ${objectKey}:`, err);
    }
  }

  console.log("✅ All chunks uploaded.");
};

const listChunksFromS3 = async () => {
  const command = new ListObjectsV2Command({
    Bucket: BUCKET_NAME,
    Prefix: "chunks/",
  });

  const response = await s3.send(command);
  return response.Contents || [];
};

/**
 * Generate a map of each chunk with its S3 URL
 */
const generateChunkMap = (chunks: any) => {
  return chunks.map((chunk: any) => ({
    key: chunk.Key!,
    url: `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${chunk.Key}`,
  }));
};

/**
 * Download all chunks and merge into a single file
 */
const downloadAndMergeChunks = async (chunks: any) => {
  const writeStream = fs.createWriteStream(MERGED_FILE_PATH);

  for (const chunk of chunks) {
    const getCommand = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: chunk.Key!,
    });

    const response = await s3.send(getCommand);
    if (!response.Body || typeof (response.Body as any).pipe !== "function") {
      throw new Error(
        "Chunk download failed: response.Body is not a readable stream."
      );
    }
    await streamPipeline(response.Body as NodeJS.ReadableStream, writeStream, {
      end: false,
    });
  }

  writeStream.end();
};

/**
 * Delete all chunk objects from S3
 */
const deleteAllChunksFromS3 = async (chunks: any) => {
  const deleteCommand = new DeleteObjectsCommand({
    Bucket: BUCKET_NAME,
    Delete: {
      Objects: chunks.map((chunk: any) => ({ Key: chunk.Key! })),
    },
  });

  await s3.send(deleteCommand);
};

/**
 * Master function to perform all tasks
 */
const processChunks = async () => {
  const chunks = await listChunksFromS3();

  if (chunks.length === 0) {
    throw new Error("No chunks found in S3.");
  }

  const chunkMap = generateChunkMap(chunks);
  await downloadAndMergeChunks(chunks);
  await deleteAllChunksFromS3(chunks);

  return chunkMap;
};

/**
 * Endpoint to trigger the merging and serve the file
 */

app.get("/hello", (req, res) => {
  res.send("Hello World");
});

app.get("/merged", async (req, res) => {
  try {
    const chunkMap = await processChunks();

    res.setHeader("Content-Disposition", "attachment; filename=merged.txt");
    const stream = fs.createReadStream(MERGED_FILE_PATH);

    console.log("✅ Chunk Map:\n", chunkMap);

    stream.pipe(res).on("close", () => {
      fs.unlinkSync(MERGED_FILE_PATH); // cleanup
    });
  } catch (err) {
    console.error("❌ Error merging chunks:", err);
    res.status(500).send("Failed to merge chunks.");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  // uploadChunksToS3();
});
