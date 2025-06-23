package main

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"sort"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var globalQueue = NewConcurrentChunkDeque()
var GlobalPool = NewWorkerPool(5)

func saveChunksToFile(chunks []Chunk) error {
	sort.Slice(chunks, func(i, j int) bool {
		return chunks[i].ChunkNo < chunks[j].ChunkNo
	})

	var fileData []byte
	var outputFile string

	for i, chunk := range chunks {
		decoded, err := base64.StdEncoding.DecodeString(chunk.Data)
		if err != nil {
			return fmt.Errorf("failed to decode chunk %d: %v", chunk.ChunkNo, err)
		}
		fileData = append(fileData, decoded...)

		if i == 0 {
			outputFile = chunk.FileName
			if outputFile == "" {
				outputFile = "output.pdf"
			}
		}
	}

	return os.WriteFile(outputFile, fileData, 0644)
}

type Chunk struct {
	ChunkNo  int    `json:"chunk_no"`
	SHA      string `json:"sha"`
	UserID   string `json:"user_id"`
	FileName string `json:"filename"`
	Data     string `json:"data"`
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func handleWebSocketUpload(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println("WebSocket upgrade error:", err)
		return
	}
	defer conn.Close()

	fmt.Println("WebSocket client connected")

	var allChunks []Chunk

	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			log.Println("Error reading from WebSocket:", err)
			break
		}

		if string(msg) == "__EOF__" {
			fmt.Println("Upload complete")
			break
		}

		var chunk Chunk
		if err := json.Unmarshal(msg, &chunk); err != nil {
			log.Println("Failed to unmarshal chunk:", err)
			continue
		}

		allChunks = append(allChunks, chunk)
	}

	if len(allChunks) == 0 {
		fmt.Println("No chunks received")
		return
	}

	globalQueue.EnqueueBack(allChunks)
	fmt.Printf("Enqueued %d chunks into queue\n", len(allChunks))

	// Optional:
	// if err := saveChunksToFile(allChunks); err != nil {
	// 	log.Println("Failed to write file:", err)
	// } else {
	// 	log.Println("File saved successfully")
	// }
}

func main() {
	InitRedis()
	InitS3()

	StartDispatcher(globalQueue)

	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST"},
		AllowHeaders:     []string{"Content-Type"},
		AllowCredentials: true,
	}))

	r.GET("/ws/upload", handleWebSocketUpload)

	fmt.Println("Server running on http://localhost:3000")
	r.Run(":3000")
}
