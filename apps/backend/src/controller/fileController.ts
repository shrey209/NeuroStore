import { Request, Response } from "express";
import File from "../models/files";
import { SharedFile, FileDataDTO, SearchFilesDTO, ChunkData, UpdateAccessDTO ,AccessLevel} from "@neurostore/shared/types";
import { Types } from "mongoose";
import User from "../models/users";
import Metadata from "../models/metadata";
import { v4 as uuidv4 } from 'uuid';

// GET /api/files/by-ids
export const getFilesByIds = async (req: Request, res: Response) => {
  const idsParam = req.params.ids;

  if (!idsParam) {
    res.status(400).json({ message: "Missing file ids in params" });
    return;
  }

  const ids = idsParam.split(",");

  try {
    const files = await File.find({ file_id: { $in: ids } });
    res.json(files);
  } catch (err) {
    console.error("Error fetching files by ids:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/files/:file_id/metadata/latest
export const getLatestMetadata = async (req: Request, res: Response) => {
  const { file_id } = req.params;
  const user_id = (req as any).user_id;

  try {
    const file = await File.findOne({ file_id });

    if (!file || !file.metadata.length) {
      res.status(404).json({ message: "File or metadata not found" });
      return;
    }

    const latest = file.metadata.reduce((a, b) => (b.version > a.version ? b : a));

    // 1. Owner check
    if (user_id && file.user.toString() === user_id) {
      const metadataDoc = await Metadata.findById(latest._id);
       res.json(metadataDoc);
       return;
    }

    // 2. Public check
    if (file.is_public) {
      const metadataDoc = await Metadata.findById(latest._id);
       res.json(metadataDoc);
       return;
    }

    // 3. Not public and not logged in
    if (!user_id) {
       res.status(401).json({ message: "Unauthorized" });
       return;
    }

    // 4. Get user by _id
    const user = await User.findById(user_id);
    if (!user) {
       res.status(403).json({ message: "User not found" });
       return;
    }

    // 5. Shared access check
    const hasAccess = file.shared_with.some((entry) =>
      (entry.github_id && entry.github_id === user.github_id) ||
      (entry.gmail && entry.gmail === user.gmail)
    );

    if (hasAccess) {
      const metadataDoc = await Metadata.findById(latest._id);
      res.json(metadataDoc);
      return;
    }

    res.status(403).json({ message: "Access denied" });
    return;
  } catch (err) {
    console.error("Error fetching metadata:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

//get chundata by filename 
export const getLatestMetadataByFilename = async (req: Request, res: Response) => {
  const { filename } = req.params;
const user_id = res.locals.user_id;

  if (!user_id) {
     res.status(401).json({ message: "Unauthorized: No user ID" });
     return;
  }

  try {
    // Find the file by filename and user ID (owner)
    let file = await File.findOne({ file_name: filename, user: user_id });

    if (!file) {
      // If not owner, try finding by just filename
      file = await File.findOne({ file_name: filename });

      if (!file || !file.metadata.length) {
         res.status(404).json({ message: "File or metadata not found" });
         return;
      }

      // Check if user has shared access with write permission
      const user = await User.findById(user_id);
      if (!user) {
         res.status(403).json({ message: "User not found" });
         return;
      }

      const hasWriteAccess = file.shared_with.some(entry =>
        (entry.access_level  === "write") &&
        (
          (entry.github_id && entry.github_id === user.github_id) ||
          (entry.gmail && entry.gmail === user.gmail)
        )
      );

      if (!hasWriteAccess) {
         res.status(403).json({ message: "Access denied" });
         return
      }
    }

    // Get the latest metadata
    const latest = file.metadata.reduce((a, b) => (b.version > a.version ? b : a));
    const metadataDoc = await Metadata.findById(latest._id);

    if (!metadataDoc) {
       res.status(404).json({ message: "Metadata not found" });
       return;
    }

    res.json(metadataDoc);
  } catch (err) {
    console.error("Error fetching metadata by filename:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/files
export const uploadFile = async (req: Request, res: Response) => {
 const user_id = res.locals.user_id;
  if (!user_id) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  let dto: FileDataDTO;
  try {
    dto = req.body;
  } catch (err) {
    res.status(400).json({ message: "Invalid body format" });
    return;
  }

  const { file_name, file_extension, mime_type, file_size, chunks } = dto;

  if (!file_name || !chunks?.length) {
    res.status(400).json({ message: "Missing file_name or chunks" });
    return;
  }

  try {
    const metadataDoc = await Metadata.create({ chunks });

    let fileDoc = await File.findOne({ user: user_id, file_name });

    let newVersion = 1;
    if (fileDoc && fileDoc.metadata.length > 0) {
      const versions = fileDoc.metadata.map((m) => m.version);
      versions.sort((a, b) => b - a);
      newVersion = versions[0] + 1;
    }

    const metadataEntry = {
      _id: metadataDoc._id,
      version: newVersion,
    };

    let isNewFile = false;

    if (!fileDoc) {
      fileDoc = new File({
        file_id: uuidv4(),
        user: user_id,
        file_name,
        file_extension,
        file_size,
        mime_type,
        is_public: false,
        shared_with: [],
        tags:[],
        metadata: [metadataEntry],
        uploaded_at: new Date(),
      });
      isNewFile = true;
    } else {
      fileDoc.metadata.push(metadataEntry);
      fileDoc.file_size = file_size;
      fileDoc.mime_type = mime_type;
      fileDoc.file_extension = file_extension;
    }

    const savedFile = await fileDoc.save();

    if (isNewFile) {
      await User.updateOne(
        { _id: user_id },
        { $push: { file_details: savedFile._id } }
      );
    }

    res.status(200).json({ message: "Upload complete", file: savedFile });
  } catch (err) {
    console.error("Error in uploadFile:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/files/:file_id/shared-with
export const getSharedWith = async (req: Request, res: Response) => {
  const { file_id } = req.params;

  try {
    const file = await File.findOne({ file_id });

    if (!file) {
      res.status(404).json({ message: "File not found" });
      return;
    }

    res.json(file.shared_with || []);
  } catch (err) {
    console.error("Error getting shared_with:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/files/:file_id/is-public
export const isPublic = async (req: Request, res: Response) => {
  const { file_id } = req.params;

  try {
    const file = await File.findOne({ file_id });

    if (!file) {
      res.status(404).json({ message: "File not found" });
      return;
    }

    res.json({ is_public: file.is_public });
  } catch (err) {
    console.error("Error checking public status:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};



export const searchFilesByName = async (req: Request, res: Response) => {
  const user_id = res.locals.user_id;
  const { query, page, size } = req.body as SearchFilesDTO;

  try {
    const regex = new RegExp(query, "i"); // case-insensitive regex match
    const pageNumber = Math.max(1, page); // ensure page >= 1
    const pageSize = Math.max(1, size);   // ensure size >= 1

    // Query: only user's own files that match filename pattern
    const filter = {
      user: user_id,
      file_name: { $regex: regex },
    };

    const total = await File.countDocuments(filter);

    const files = await File.find(filter)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort({ uploaded_at: -1 }); // newest first

    res.json({
      files,
      pagination: {
        total,
        page: pageNumber,
        size: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (err) {
    console.error("❌ Error searching files by name:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};


//get latest file data by chunk id 
export const getLatestFileDataByFileId = async (req: Request, res: Response) => {
  const { file_id } = req.params;
  const user_id = res.locals.user_id;

  if (!user_id) {
     res.status(401).json({ message: "Unauthorized: No user ID" });
     return;
  }

  try {
    // Step 1: Try finding file owned by the user
    let file = await File.findOne({ file_id, user: user_id });

    // Step 2: If not owner, try shared file with write access
    if (!file) {
      file = await File.findOne({ file_id });
      if (!file || !file.metadata.length) {
         res.status(404).json({ message: "File or metadata not found" });
         return
      }

      const user = await User.findById(user_id);
      if (!user) {
         res.status(403).json({ message: "User not found" });
         return;
      }

      const hasAccess = file.shared_with.some(entry =>
        entry.access_level === "read" || entry.access_level==="write" &&
        (
          (entry.github_id && entry.github_id === user.github_id) ||
          (entry.gmail && entry.gmail === user.gmail)
        )
      );

      if (!hasAccess) {
         res.status(403).json({ message: "Access denied" });
         return;
      }
    }

    // Step 3: Get latest metadata
    const latest = file.metadata.reduce((a, b) => (b.version > a.version ? b : a));
    const metadataDoc = await Metadata.findById(latest._id);

    if (!metadataDoc) {
       res.status(404).json({ message: "Metadata not found" });
       return;
    }

    // Step 4: Build DTO
    const fileDataDTO: FileDataDTO = {
      file_name: file.file_name,
      file_extension: file.file_extension || "",
      mime_type: file.mime_type || "",
      file_size: file.file_size || 0,
      chunks: metadataDoc.chunks as ChunkData[],
    };

     res.json(fileDataDTO);
     return;
  } catch (err) {
    console.error("Error in getLatestFileDataByFileId:", err);
     res.status(500).json({ message: "Internal server error" });
     return;
  }
};


export const deleteFileById = async (req: Request, res: Response) => {
  const { fileId } = req.params;

  try {
    const deletedFile = await File.findOneAndDelete({ file_id: fileId });

    if (!deletedFile) {
       res.status(404).json({ error: "File not found" });
       return;
    }

     res.status(200).json({ message: "File deleted successfully" });
     return;
  } catch (error) {
    console.error("❌ Failed to delete file:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
};

// PATCH /api/file/:fileId
export const updateFileName = async (req: Request, res: Response) => {
  const { fileId } = req.params;
  const { file_name } = req.body;

  if (!file_name || typeof file_name !== "string") {
     res.status(400).json({ error: "Invalid or missing file_name" });
     return;
  }

  try {
    const updated = await File.findOneAndUpdate(
      { file_id: fileId },
      { file_name },
      { new: true }
    );

    if (!updated) {
       res.status(404).json({ error: "File not found" });
       return;
    }

     res.status(200).json({ message: "File name updated", file: updated });
     return;
  } catch (error) {
    console.error("❌ Failed to update file name:", error);
     res.status(500).json({ error: "Internal server error" });
     return;
  }
};

export const updateFileAccess = async (req: Request, res: Response) => {
  try {
    const { file_id, is_public, shared_with }: UpdateAccessDTO = req.body;

    if (!file_id) {
       res.status(400).json({ message: 'file_id is required' });
       return;
    }
    console.log(file_id)
    const file = await File.findOne({ file_id });

    if (!file) {
       res.status(404).json({ message: 'File not found' });
       return;
    }

    file.is_public = is_public;
    file.set('shared_with', shared_with);


    await file.save();

     res.status(200).json({ message: 'Access updated successfully', file });
     return
  } catch (err) {
    console.error('Error updating file access:', err);
     res.status(500).json({ message: 'Internal server error' });
     return
  }
};