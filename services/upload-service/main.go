package main

import (
	"encoding/json"
	"fmt"
	"log"
	"log/slog"
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

// Queue thats gonna hold the chunks for each file
var globalQueue = NewConcurrentChunkDeque()

// worker pool currently have 5 go routines ,push task here and it will be done by goruotines
var GlobalPool = NewWorkerPool(5)

// chunk object
type Chunk struct {
	ChunkNo  int    `json:"chunk_no"` // denotes number of each chunk
	SHA      string `json:"sha"`      //denotes the sha
	UserID   string `json:"user_id"`  //denotes the user id the file belongs to
	FileName string `json:"filename"` // name of the file
	Data     string `json:"data"`     // data should move to bytes i guess thats much safer
}

// websocket to upgrader
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

/*
This function handles websocket connection which is basically used to get the chunks
*/
func handleWebSocketUpload(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		slog.Debug("websocket upgrade error", "error", err)
		return
	}
	defer conn.Close()

	slog.Info("WebSocket client connected", "error", err)

	var allChunks []Chunk

	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {

			slog.Debug("Error reading from websocket: ", "error", err)
			break
		}

		if string(msg) == "__EOF__" {
			slog.Info("upgrade complete")
			break
		}

		var chunk Chunk
		if err := json.Unmarshal(msg, &chunk); err != nil {
			log.Println("", err)
			slog.Debug("Failed to unmarshal chunk:", "error", err)
			continue
		}

		allChunks = append(allChunks, chunk)
	}

	if len(allChunks) == 0 {
		fmt.Println("No chunks received")
		return
	}

	// Collect SHA list and build SHA → Chunk map
	var shaList []string
	shaToChunk := make(map[string]Chunk)

	//can u adda log.fatal here if key already exist in the map
	for _, chunk := range allChunks {
		shaList = append(shaList, chunk.SHA)
		shaToChunk[chunk.SHA] = chunk
	}

	_, nonExisting, err := CheckSHAExistence(RedisClient, shaList)
	if err != nil {
		log.Println("Error checking SHA existence:", err)
		return
	}

	var newChunks []Chunk
	for _, sha := range nonExisting {
		newChunks = append(newChunks, shaToChunk[sha])
	}

	if len(newChunks) == 0 {
		fmt.Println(" All chunks already existed. Nothing to enqueue.")
		return
	}

	globalQueue.EnqueueBack(newChunks)
	fmt.Printf(" Enqueued %d new chunks into queue\n", len(newChunks))
}

func main() {
	//redis client setup
	InitRedis()

	//s3 config setup
	InitS3()

	//started the concurent queue
	StartDispatcher(globalQueue)

	//gin setup
	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"}, //allowing frontend
		AllowMethods:     []string{"GET", "POST"},           // for get and post only
		AllowHeaders:     []string{"Content-Type"},
		AllowCredentials: true,
	}))

	//register websocket handler to /ws/upload endpoint
	r.GET("/ws/upload", handleWebSocketUpload)

	slog.Info("Server running on http://localhost:3000")
	r.Run(":3000")
}
