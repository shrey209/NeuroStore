package main

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

type Chunk struct {
	SHA  string `json:"sha"`
	Data string `json:"data"` // base64-encoded
}

// WebSocket upgrader
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		// Allow all origins for dev; restrict in production
		return true
	},
}

// WebSocket handler for chunk uploads
func handleWebSocketUpload(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println("WebSocket upgrade error:", err)
		return
	}
	defer conn.Close()

	fmt.Println("🧬 WebSocket client connected")

	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			log.Println("❌ Error reading from WebSocket:", err)
			break
		}

		if string(msg) == "__EOF__" {
			fmt.Println("📦 Upload complete")
			break
		}

		var chunk Chunk
		if err := json.Unmarshal(msg, &chunk); err != nil {
			log.Println("⚠️ Failed to unmarshal chunk:", err)
			continue
		}

		decoded, err := base64.StdEncoding.DecodeString(chunk.Data)
		if err != nil {
			fmt.Printf("❌ Failed to decode chunk %s: %v\n", chunk.SHA, err)
			continue
		}

		fmt.Printf("🧱 Chunk %s — Size: %d bytes\n", chunk.SHA, len(decoded))
	}

	fmt.Println("✅ All chunks received, closing connection")
}

func main() {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST"},
		AllowHeaders:     []string{"Content-Type"},
		AllowCredentials: true,
	}))

	r.GET("/ws/upload", handleWebSocketUpload) // WebSocket endpoint

	fmt.Println("🚀 Server running on http://localhost:3000")
	r.Run(":3000")
}
