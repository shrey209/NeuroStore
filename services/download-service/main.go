package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"sort"

	"github.com/gorilla/websocket"
	"github.com/rs/cors"
)

type ChunkData struct {
	ChunkNo int    `json:"chunk_no"`
	SHA     string `json:"sha"`
	Start   int    `json:"start"`
	End     int    `json:"end"`
}

// func merge(chunks []ChunkMeta) []ChunkMeta {
// 	if len(chunks) == 0 {
// 		return []ChunkMeta{}
// 	}

// 	sort.Slice(chunks, func(i, j int) bool {
// 		return chunks[i].Start < chunks[j].Start
// 	})

// 	result := []ChunkMeta{}
// 	cur := chunks[0]

// 	for i := 1; i < len(chunks); i++ {
// 		next := chunks[i]
// 		if cur.End+1 == next.Start {

// 			cur.End = next.End
// 		} else {
// 			result = append(result, cur)
// 			cur = next
// 		}
// 	}

// 	result = append(result, cur)
// 	return result
// }

func OrganizeAndSortChunks(metas []ChunkMeta) map[string][][]int {
	// sort.Slice(metas, func(i, j int) bool {
	// 	if metas[i].Filename == metas[j].Filename {
	// 		return metas[i].Start < metas[j].Start
	// 	}
	// 	return metas[i].Filename < metas[j].Filename
	// })

	filerange := make(map[string][][]int)

	if len(metas) == 0 {
		return filerange
	}

	cur_chunkno := metas[0].No
	cur_start := metas[0].Start
	cur_end := metas[0].End
	cur_file := metas[0].Filename

	for i := 1; i < len(metas); i++ {
		next := metas[i]
		if cur_end+1 == next.Start && cur_file == next.Filename {
			cur_end = next.End
		} else {
			filerange[cur_file] = append(filerange[cur_file], []int{cur_chunkno, cur_start, cur_end})
			cur_chunkno = next.No
			cur_start = next.Start
			cur_end = next.End
			cur_file = next.Filename
		}
	}
	// add the last range
	filerange[cur_file] = append(filerange[cur_file], []int{cur_chunkno, cur_start, cur_end})

	// 🔍 Debug print map:
	fmt.Println("📦 Final merged file ranges:")
	for file, ranges := range filerange {
		fmt.Printf("File: %s -> ", file)
		for _, r := range ranges {
			fmt.Printf("[No=%d Start=%d End=%d] ", r[0], r[1], r[2])
		}
		fmt.Println()
	}

	return filerange
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
		fmt.Println(" Failed to parse JSON:", err)
		return
	}

	sort.Slice(chunks, func(i, j int) bool {
		return chunks[i].ChunkNo < chunks[j].ChunkNo
	})

	var shaKeys []string
	for _, c := range chunks {
		fmt.Printf("Chunk %d: SHA=%s, Offset=%d-%d",
			c.ChunkNo, c.SHA, c.Start, c.End)
		shaKeys = append(shaKeys, c.SHA)
	}

	// Fetch metadata from Redis
	metas, err := FetchChunkMetadata(RedisClient, shaKeys)
	if err != nil {
		http.Error(w, "Failed to fetch metadata", http.StatusInternalServerError)
		fmt.Println(" Redis fetch error:", err)
		return
	}

	grouped := OrganizeAndSortChunks(metas)
	//print the map i wanna see something first

	DownloadAndAssembleFiles(grouped)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status":"ok"}`))
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins (customize as needed)
	},
}

type WSMessage struct {
	Type string      `json:"type"` // "chunk" or "end"
	Data []ChunkData `json:"data"`
}

func wsGetFileHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(" WebSocket upgrade failed:", err)
		return
	}
	defer conn.Close()

	log.Println(" WebSocket connection established")

	var collectedChunks []ChunkData // <-- collect until we receive "end"

	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			log.Println(" WebSocket read error:", err)
			break
		}

		log.Println(" WebSocket received data:")
		log.Println(string(message))

		var msg WSMessage
		if err := json.Unmarshal(message, &msg); err != nil {
			log.Println(" Failed to parse WSMessage:", err)
			conn.WriteJSON(map[string]string{
				"error": "Invalid message format",
			})
			continue
		}

		switch msg.Type {
		case "chunk":
			collectedChunks = append(collectedChunks, msg.Data...)
			log.Printf(" Appended %d chunks (total: %d)", len(msg.Data), len(collectedChunks))

		case "end":
			log.Println(" Received 'end' signal. Processing chunks...")

			sort.Slice(collectedChunks, func(i, j int) bool {
				return collectedChunks[i].ChunkNo < collectedChunks[j].ChunkNo
			})

			var shaKeys []string
			for _, c := range collectedChunks {
				log.Printf("Chunk %d: SHA=%s, Offset=%d-%d", c.ChunkNo, c.SHA, c.Start, c.End)
				shaKeys = append(shaKeys, c.SHA)
			}

			metas, err := FetchChunkMetadata(RedisClient, shaKeys)
			if err != nil {
				conn.WriteJSON(map[string]string{
					"error": "Failed to fetch metadata",
				})
				break
			}

			grouped := OrganizeAndSortChunks(metas)
			DownloadAndStreamChunks(grouped, conn)
			log.Println(" File streaming complete. Closing connection.")
			return // or break

		default:
			log.Println(" Unknown message type:", msg.Type)
			conn.WriteJSON(map[string]string{
				"error": "Unknown message type",
			})
		}
	}
}

func main() {
	InitRedis()
	InitS3()

	mux := http.NewServeMux()
	mux.HandleFunc("/getfile", getFileHandler)
	mux.HandleFunc("/ws-getfile", wsGetFileHandler)

	handler := cors.Default().Handler(mux)

	fmt.Println("🚀 Server running on http://localhost:3001")
	if err := http.ListenAndServe(":3001", handler); err != nil {
		log.Fatal("Server failed:", err)
	}
}
