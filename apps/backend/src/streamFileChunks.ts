import { ChunkCallback } from "@neurostore/shared/types";



import {
  S3Client,
  GetObjectCommand,
  GetObjectCommandInput,
} from "@aws-sdk/client-s3";
import { Readable } from "stream";


const REGION = "ap-south-1";
const BUCKET = "project-test-12";

const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: "",
    secretAccessKey: "",
  },
});



export async function streamObjectChunks(
  sha: string,
  onChunk: ChunkCallback
): Promise<void> {
  const input: GetObjectCommandInput = {
    Bucket: BUCKET,
    Key: sha,
  };

  const response = await s3.send(new GetObjectCommand(input));
  const stream = response.Body as Readable;

  return new Promise((resolve, reject) => {
    stream.on("data", (chunk: Buffer) => onChunk(chunk));
    stream.on("end", () => {
      console.log(` Finished streaming ${sha}`);
      resolve();
    });
    stream.on("error", (err) => {
      console.error(` Error streaming ${sha}:`, err);
      reject(err);
    });
  });
}
