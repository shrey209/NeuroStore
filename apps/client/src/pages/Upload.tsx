import React, { useEffect, useRef, useState, ChangeEvent } from 'react';
import { ChunkData ,FileDataDTO } from '@neurostore/shared/types';
import axios from "axios";
import { BASE_URL } from '../utils/fileUtils';


type WasmInstance = {
  instance: WebAssembly.Instance;
  memory: WebAssembly.Memory;
  malloc: (size: number) => number;
  free: (ptr: number) => void;
  process_chunk: (ptr: number, length: number, isLastChunk: number) => void;
  reset_chunking_state: () => void;
  get_block_count: () => number;
  get_block: (index: number) => number;
  get_blocks_json: () => number;
};


 const uploadFileToServer = async (file: File, chunks: ChunkData[]): Promise<boolean> => {
  try {
    const fileDataDTO: FileDataDTO = buildFileDataDto(file, chunks);

    console.log("📦 Uploading FileDataDTO to server:", fileDataDTO);

    const response = await axios.post(`${BASE_URL}/api/file/upload`, fileDataDTO, {
      withCredentials: true,
    });

    console.log("✅ Upload successful! Server responded with:", response.data);
    return true;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error("❌ Axios error:", err.response?.data || err.message);
    } else {
      console.error("❌ Unknown error:", err);
    }
    return false;
  }

};
 const getOldMetadata = async (filename: string): Promise<ChunkData[]> => {
  try {
  const safeFilename = encodeURIComponent(filename);
const response = await axios.get(`${BASE_URL}/api/file/filename/${safeFilename}/metadata/latest`, {
  withCredentials: true,
});
    // Assuming server returns: { chunks: ChunkData[] }
    const chunks = response.data?.chunks;
    if (!Array.isArray(chunks)) {
      throw new Error("Invalid response format: missing 'chunks' array");
    }

    console.log("📥 Retrieved metadata chunks:", chunks);
    return chunks;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error("❌ Axios error:", err.response?.data || err.message);
    } else {
      console.error("❌ Unknown error:", err);
    }
    return []; // Return empty if error
  }
};

 function buildFileDataDto(file: File, chunks: ChunkData[]): FileDataDTO {
  const file_name = file.name;
  const file_size = file.size;
  const mime_type = file.type;
  const file_extension = file.name.includes(".")
    ? file.name.split(".").pop() || ""
    : "";

  return {
    file_name: file_name,
    file_extension: file_extension,
    mime_type: mime_type,
    file_size: file_size,
    chunks: chunks,
  };
}

 function finddiff(arr1: ChunkData[], arr2: ChunkData[]): ChunkData[] {
  if(arr2.length==0)return arr1
  const shaSet = new Set(arr2.map(chunk => chunk.sha));
  return arr1.filter(chunk => !shaSet.has(chunk.sha));
}


const Upload: React.FC = () => {
  const [blocks, setBlocks] = useState<ChunkData[]>([]);
  const [filename, setFilename] = useState("");
  const [extension, setExtension] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const wasmRef = useRef<WasmInstance | null>(null);
  const fileRef = useRef<File | null>(null);

  useEffect(() => {
    const loadWasm = async () => {
      const response = await fetch('/chunker.wasm');
      const buffer = await response.arrayBuffer();
      const { instance } = await WebAssembly.instantiate(buffer, {});
      wasmRef.current = {
        instance,
        memory: instance.exports.memory as WebAssembly.Memory,
        malloc: instance.exports.malloc as (size: number) => number,
        free: instance.exports.free as (ptr: number) => void,
        process_chunk: instance.exports.process_chunk as (ptr: number, length: number, isLastChunk: number) => void,
        reset_chunking_state: instance.exports.reset_chunking_state as () => void,
        get_block_count: instance.exports.get_block_count as () => number,
        get_block: instance.exports.get_block as (index: number) => number,
        get_blocks_json: instance.exports.get_blocks_json as () => number,
      };
    };
    loadWasm();
  }, []);



  //this is where things starts
  const uploadChunksViaWebSocket = async (chunks: ChunkData[], file: File) => {
      const file_name : string =file.name 

      const old_chunks: ChunkData[] = await getOldMetadata(file_name);
      console.log(old_chunks)

      chunks=finddiff(chunks,old_chunks)
       
      if(chunks.length==0){
        console.log("unfortunatlety there is no update in the file")
        return
      }
       const success = await uploadFileToServer(file, chunks);

  if (success) {
    console.log(" Upload completed and logged successfully");
  } else {
    console.error("Upload failed");
  } 


 const ws = new WebSocket("ws://localhost:3000/ws/upload");
  
  let totalSentBytes = 0;

  await new Promise<void>((resolve, reject) => {
    ws.onopen = () => resolve();
    ws.onerror = reject;
  });

  for (let i = 0; i < chunks.length; i++) {
    const block = chunks[i];
    const { sha, start, end } = block;

    const slice = file.slice(start, end + 1); 
    const buffer = await slice.arrayBuffer();
    const view = new Uint8Array(buffer);
    totalSentBytes += view.length;

    
    const base64 = btoa([...view].map(b => String.fromCharCode(b)).join(""));

    const message = JSON.stringify({
      chunk_no: i + 1,
      sha,
      filename: file.name,
      data: base64
    });

    ws.send(message);
  }

  console.log(` Total bytes read and sent: ${totalSentBytes}`);
  console.log(` Original file size: ${file.size}`);
  if (totalSentBytes !== file.size) {
    console.error(" MISMATCH in file size vs total bytes sent!");
  }

  ws.send("__EOF__");

  await new Promise<void>((resolve) => {
    ws.onclose = () => {
      console.log("✅ WebSocket connection closed");
      resolve();
    };
  });
};

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !wasmRef.current) return;

    fileRef.current = file;

    // 🧠 Set file name, extension, size
    setFilename(file.name);
    setExtension(file.name.split('.').pop() || '');
    setFileSize(file.size);

    const wasm = wasmRef.current;
    wasm.reset_chunking_state();

    const CHUNK_SIZE = 4096;
    const buffer = await file.arrayBuffer();
    const data = new Uint8Array(buffer);
    const totalChunks = Math.ceil(data.length / CHUNK_SIZE);

    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(data.length, start + CHUNK_SIZE);
      const chunk = data.slice(start, end);

      const ptr = wasm.malloc(chunk.length);
      const mem = new Uint8Array(wasm.memory.buffer, ptr, chunk.length);
      mem.set(chunk);

      const isLastChunk = i === totalChunks - 1;
      wasm.process_chunk(ptr, chunk.length, isLastChunk ? 1 : 0);
      wasm.free(ptr);
    }

    const jsonPtr = wasm.get_blocks_json();
    const memory = new Uint8Array(wasm.memory.buffer);
    let json = '';
    for (let i = jsonPtr; memory[i] !== 0; i++) {
      json += String.fromCharCode(memory[i]);
    }

    try {
      const parsed: ChunkData[] = JSON.parse(json);
      setBlocks(parsed);

      if (fileRef.current) {
        await uploadChunksViaWebSocket(parsed, fileRef.current);
      }
    } catch (err) {
      console.error(" Failed to parse/upload:", err);
    }
  };

  
const sendToBackend = async () => {
  try {
    const response = await fetch("http://localhost:3001/getfile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(blocks)
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const result = await response.json();
    console.log("📤 Sent blocks to backend. Response:", result);
  } catch (err) {
    console.error("❌ Failed to send to backend:", err);
  }
};



  return (
    <div className="p-4 font-mono">
      <h1 className="text-2xl font-bold mb-4">📦 WASM Chunker (WebSocket)</h1>

      <label className="block w-fit px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer mb-4">
        Browse File
        <input
          type="file"
          onChange={handleFile}
          className="hidden"
        />
      </label>

      {blocks.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-700">
            📄 <strong>{filename}</strong> ({extension}) — {Math.round(fileSize / 1024)} KB
          </p>

          <button
            onClick={sendToBackend}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mb-2"
          >
            🚀 Send JSON to Backend
          </button>

          {blocks.map((b, i) => (
            <div key={i} className="p-2 border rounded bg-gray-100">
              <strong>Chunk #{b.chunk_no}</strong><br />
              <span>Offset: {b.start} - {b.end}</span><br />
              <span>SHA256: <code className="break-all text-blue-700">{b.sha}</code></span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Upload;
