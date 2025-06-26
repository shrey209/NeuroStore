import { uploadToS3, checkChunkInS3 } from "../services/s3Service";

export const storeChunkToS3 = async (req, res) => {
  try {
    const { buffer, hash } = req.body;
    const s3Key = `${req.params.user_id}/${req.params.file_id}/${req.params.metadata_id}`;
    await uploadToS3(s3Key, buffer);
    res.status(201).json({ message: "Chunk uploaded", s3Key });
  } catch (err) {
    res.status(500).json({ error: "Chunk upload failed" });
  }
};

export const checkChunkHash = async (req, res) => {
  try {
    const exists = await checkChunkInS3(req.params.hash);
    res.json({ exists });
  } catch (err) {
    res.status(500).json({ error: "Check failed" });
  }
};
