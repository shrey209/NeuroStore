import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Share2, Trash2, Edit3 } from 'lucide-react';
import axios from 'axios';
import { BASE_URL } from '../utils/fileUtils';
import { FileDataDTO } from '@neurostore/shared/types';


type Wrapper = {
  chunk_no: number;
  data: string; // base64 encoded
  err?: string | null;
};

function getIframeMimeType(ext: string): string {
  const map: Record<string, string> = {
    pdf: 'application/pdf',
    txt: 'text/plain',
    html: 'text/html',
    htm: 'text/html',
    svg: 'image/svg+xml',
    json: 'application/json',
  };

  return map[ext.toLowerCase()] || 'application/octet-stream'; // fallback
}

const Preview: React.FC = () => {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndDownload = async () => {
      const receivedChunks: Wrapper[] = []; // ✅ initialize it

      try {
        const response = await axios.get<FileDataDTO>(
          `${BASE_URL}/api/file/${fileId}/latest`,
          { withCredentials: true }
        );

        const data = response.data;
        console.log("📦 File metadata:", data);
        console.log("📄 Chunk data:", data.chunks);

        const socket = new WebSocket("ws://localhost:3001/ws-getfile");

        socket.onopen = () => {
          console.log("🔌 WebSocket connected, sending chunks...");
          socket.send(JSON.stringify(data.chunks));
        };

        socket.onmessage = (event) => {
          try {
            const receivedData: Wrapper = JSON.parse(event.data);
            receivedChunks.push(receivedData); // ✅ store it

            if (receivedData.err) {
              console.error(`❌ Error in chunk ${receivedData.chunk_no}:`, receivedData.err);
            } else {
              console.log(`✅ Chunk ${receivedData.chunk_no} received successfully.`);
            }
          } catch (e) {
            console.error("❌ Failed to parse incoming WebSocket message:", e);
          }
        };

        socket.onerror = (err) => {
          console.error("❌ WebSocket error:", err);
        };

        socket.onclose = () => {

               const sortedChunks = receivedChunks
            .filter(chunk => !chunk.err)
            .sort((a, b) => a.chunk_no - b.chunk_no);

         const byteArrays = sortedChunks.map(chunk => {
            const binaryString = atob(chunk.data);
            const byteArray = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              byteArray[i] = binaryString.charCodeAt(i);
            }
            return byteArray;
          });

          // 📦 Combine into one blob
          const combined = new Blob(byteArrays, { type: getIframeMimeType(data.file_extension) });
          const blobURL = URL.createObjectURL(combined);
          setBlobUrl(blobURL);

          console.log("connection closed -____")
        };
      } catch (error) {
        console.error("❌ Failed to fetch file data:", error);
      }
    };

    if (fileId) {
      fetchAndDownload();
    }
  }, [fileId]);

  return (
    <div className="flex h-screen bg-gray-50">
      
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">File Preview</h1>
                <p className="text-sm text-gray-500">File ID: {fileId}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200">
                <Edit3 className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200">
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
              {blobUrl && (
  <button
    onClick={() => {
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `file-${fileId || 'download'}.pdf`; // name the file
      link.click();
    }}
    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-200"
  >
    <Download className="w-4 h-4" />
    <span>Download</span>
  </button>
)}

              <button className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50 transition-colors duration-200">
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>

        {/* Preview Content */}
       {/* Preview Content */}
<div className="flex-1 flex items-center justify-center p-6 bg-white">
  {blobUrl ? (
    <iframe
      src={blobUrl}
      title="PDF Preview"
      className="w-full h-full border rounded-md shadow-md"
    />
  ) : (
    <div className="text-center">
      <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
        <div className="w-12 h-12 bg-gray-300 rounded animate-pulse"></div>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading PDF...</h2>
      <p className="text-gray-500 mb-4">
        Assembling file chunks, please wait.
      </p>
    </div>
  )}
</div>

      </div>
    </div>
  );
};

export default Preview;