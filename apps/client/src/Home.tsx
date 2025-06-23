import React, { useEffect, useRef, useState, ChangeEvent } from 'react';
import { ChunkData } from '@neurostore/shared/types';

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

const Home: React.FC = () => {
  const [blocks, setBlocks] = useState<ChunkData[]>([]);
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

  const uploadChunksViaWebSocket = async (chunks: ChunkData[], file: File) => {
    const ws = new WebSocket("ws://localhost:3000/ws/upload");

    ws.onopen = async () => {
      for (const block of chunks) {
        const { sha, start, end } = block;
        const slice = file.slice(start, end + 1);
        const buffer = await slice.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
        const message = JSON.stringify({ sha, data: base64 });
        ws.send(message);
      }

      // Signal the end of the stream
      ws.send("__EOF__");
    };

    ws.onerror = (err) => {
      console.error("❌ WebSocket error", err);
    };

    ws.onclose = () => {
      console.log("✅ WebSocket connection closed");
    };
  };

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !wasmRef.current) return;

    fileRef.current = file;
    const wasm = wasmRef.current;
    wasm.reset_chunking_state();

    const CHUNK_SIZE = 2000;
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    let currentChunk = 0;

    const reader = file.stream().getReader();
    let done = false;

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      if (value) {
        currentChunk++;
        const ptr = wasm.malloc(value.length);
        const mem = new Uint8Array(wasm.memory.buffer, ptr, value.length);
        mem.set(value);

        const isLastChunk = currentChunk === totalChunks;
        wasm.process_chunk(ptr, value.length, isLastChunk ? 1 : 0);
        wasm.free(ptr);
      }
      done = readerDone;
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
      console.error("❌ Failed to parse/upload:", err);
    }
  };

  return (
    <div className="p-4 font-mono">
      <h1 className="text-2xl font-bold mb-4">📦 WASM Chunker (WebSocket)</h1>
      <input type="file" onChange={handleFile} className="mb-4" />

      {blocks.length > 0 && (
        <div className="space-y-2">
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

export default Home;
