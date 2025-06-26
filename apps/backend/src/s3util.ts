import { UploadPayload } from "@neurostore/shared/types";

import {
  S3Client,
  HeadObjectCommand,
  PutObjectCommand,
  HeadObjectCommandInput,
  PutObjectCommandInput,
} from "@aws-sdk/client-s3";

const REGION = "ap-south-1";
const BUCKET = "project-test-12";

// ⚠️ Replace with environment variables in production
const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: "",
    secretAccessKey: "",
  },
});



export async function doesShaExist(sha: string): Promise<boolean> {
  const input: HeadObjectCommandInput = {
    Bucket: BUCKET,
    Key: sha,
  };

  try {
    await s3.send(new HeadObjectCommand(input));
    return true;
  } catch (err: any) {
    if (err.name === "NotFound" || err.$metadata?.httpStatusCode === 404) {
      return false;
    }
    console.error("❌ Error checking existence:", err);
    throw err;
  }
}

export async function uploadIfNotExists(sha: string, data: string): Promise<void> {
  const exists = await doesShaExist(sha);
  if (exists) {
    console.log(`✅ ${sha} already exists.`);
    return;
  }

  const uploadCmd: PutObjectCommandInput = {
    Bucket: BUCKET,
    Key: sha,
    Body: Buffer.from(data, "base64"),
    ContentType: "application/octet-stream",
  };

  await s3.send(new PutObjectCommand(uploadCmd));
  console.log(`🆕 Uploaded: ${sha}`);
}
