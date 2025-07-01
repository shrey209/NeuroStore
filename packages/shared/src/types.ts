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
  user_id: string;
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