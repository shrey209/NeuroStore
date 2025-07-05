export type webUser = {
  id: string;
  name: string;
};


export type ChunkData={
  chunk_no:number,
  start:number,
  end:number,
  sha:string
}


export interface UploadPayload {
  sha: string;
  data: string; 
}



export type AuthProvider = "google" | "github";

export interface User {
  user_name: string;
  provider: AuthProvider;
  gmail?: string;
  profile_picture?: string;
  email_verified: boolean;
  file_details: string[];
  created_at: string;

  // 🔽 NEW fields for lookup
  google_sub_id?: string;
  github_id?: string;
}




export type ChunkCallback = (chunk: Buffer) => void;

// Shared type for file metadata versioning
export interface FileMetadataEntry {
  _id: string;
  version: number;
}

// Shared access level enum
export type AccessLevel = "read" | "write";

// Shared type for access permissions
export interface SharedAccessEntry {
  user_id?: string;
  github_id?: string;
  gmail?: string;
  access_level: AccessLevel;
}

// Main File type (shared)
export interface SharedFile {
  file_id: string;
  user: string; // user._id as string
  file_name: string;
  file_extension?: string;
  file_size?: number;
  mime_type?: string;
  is_public: boolean;
  shared_with: SharedAccessEntry[];
  metadata: FileMetadataEntry[];
  uploaded_at: string; // ISO string
  tags: string[]
}


export interface FileDataDTO {
  file_name: string;
  file_extension: string;
  mime_type: string;
  file_size: number;
  chunks: ChunkData[];
}

export interface SearchFilesDTO {
  query: string;    // filename search string (regex match)
  page: number;     // current page number (1-based)
  size: number;     // number of results per page
}


