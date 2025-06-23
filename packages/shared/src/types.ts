export type User = {
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

export type ChunkCallback = (chunk: Buffer) => void;