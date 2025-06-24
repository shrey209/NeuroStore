package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"sort"

	"github.com/rs/cors"
)

type ChunkData struct {
	ChunkNo  int    `json:"chunk_no"`
	SHA      string `json:"sha"`
	UserID   string `json:"user_id"`
	FileName string `json:"filename"`
	Data     string `json:"data"`
	Start    int    `json:"start"`
	End      int    `json:"end"`
}

// Group and sort by filename + start offset
func OrganizeAndSortChunks(metaMap map[string]ChunkMeta) map[string][]ChunkMeta {
	fileChunks := make(map[string][]ChunkMeta)

	for _, meta := range metaMap {
		fileChunks[meta.Filename] = append(fileChunks[meta.Filename], meta)
	}

	for filename := range fileChunks {
		sort.Slice(fileChunks[filename], func(i, j int) bool {
			return fileChunks[filename][i].Start < fileChunks[filename][j].Start
		})
	}

	return fileChunks
}

func getFileHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Only POST allowed", http.StatusMethodNotAllowed)
		return
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	fmt.Println("🔵 Raw JSON received:")
	fmt.Println(string(body))

	var chunks []ChunkData
	if err := json.Unmarshal(body, &chunks); err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		fmt.Println("❌ Failed to parse JSON:", err)
		return
	}

	var shaKeys []string
	for _, c := range chunks {
		fmt.Printf("Chunk %d: SHA=%s, Offset=%d-%d, File=%s, User=%s\n",
			c.ChunkNo, c.SHA, c.Start, c.End, c.FileName, c.UserID)
		shaKeys = append(shaKeys, c.SHA)
	}

	// Fetch metadata from Redis
	metas, err := FetchChunkMetadata(RedisClient, shaKeys)
	if err != nil {
		http.Error(w, "Failed to fetch metadata", http.StatusInternalServerError)
		fmt.Println("❌ Redis fetch error:", err)
		return
	}

	fmt.Println("📦 Retrieved ChunkMeta from Redis:")
	for sha, meta := range metas {
		fmt.Printf("SHA: %s => Filename: %s, Start: %d, End: %d\n", sha, meta.Filename, meta.Start, meta.End)
	}

	// Group and sort
	grouped := OrganizeAndSortChunks(metas)

	// Download and write files
	DownloadAndAssembleFiles(grouped)

	// Response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status":"ok"}`))
}

func main() {
	InitRedis()
	InitS3()

	mux := http.NewServeMux()
	mux.HandleFunc("/getfile", getFileHandler)

	handler := cors.Default().Handler(mux)

	fmt.Println("🚀 Server running on http://localhost:3001")
	if err := http.ListenAndServe(":3001", handler); err != nil {
		log.Fatal("Server failed:", err)
	}
}
