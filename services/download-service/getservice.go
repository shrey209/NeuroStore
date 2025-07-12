package main

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"sort"
	"sync"

	"github.com/gorilla/websocket"
	"github.com/redis/go-redis/v9"
)

type ChunkMeta struct {
	Filename string `json:"filename"`
	Start    int    `json:"start"`
	End      int    `json:"end"`
	No       int    `json:"no"`
}

var ctx = context.Background()

// OrganizeAndSortChunks groups by filename, sorts by start byte

func FetchChunkMetadata(rdb *redis.Client, keys []string) ([]ChunkMeta, error) {
	result := []ChunkMeta{}

	values, err := rdb.MGet(ctx, keys...).Result()
	if err != nil {
		return nil, fmt.Errorf("redis MGet failed: %v", err)
	}

	for i, val := range values {
		if val == nil {
			continue
		}

		strVal, ok := val.(string)
		if !ok {
			return nil, fmt.Errorf("invalid type for key %s", keys[i])
		}

		var meta ChunkMeta
		if err := json.Unmarshal([]byte(strVal), &meta); err != nil {
			return nil, fmt.Errorf("failed to unmarshal value for key %s: %v", keys[i], err)
		}
		meta.No = i

		result = append(result, meta)

	}

	return result, nil
}

type Wrapper struct {
	ChunkNo int
	Data    []byte
	Err     error
}

func DownloadAndAssembleFiles(metaMap map[string][][]int) {
	var wg sync.WaitGroup
	ch := make(chan Wrapper, 100)

	for filename, ranges := range metaMap {
		for _, chunk := range ranges {
			if len(chunk) != 3 {
				fmt.Println("⚠️ Invalid chunk format, expected [chunkNo, start, end]")
				continue
			}
			chunkNo := chunk[0]
			start := chunk[1]
			end := chunk[2]

			wg.Add(1)
			go func(f string, no, s, e int) {
				defer wg.Done()
				data, err := FetchByteRangeFromS3(f, s, e)
				ch <- Wrapper{ChunkNo: no, Data: data, Err: err}
			}(filename, chunkNo, start, end)
		}
	}

	go func() {
		wg.Wait()
		close(ch)
	}()

	var finalSlice []Wrapper
	for wrapper := range ch {
		if wrapper.Err != nil {
			fmt.Printf("❌ Failed to fetch chunk %d: %v\n", wrapper.ChunkNo, wrapper.Err)
			continue
		}
		finalSlice = append(finalSlice, wrapper)
	}

	// Sort by chunk number
	sort.Slice(finalSlice, func(i, j int) bool {
		return finalSlice[i].ChunkNo < finalSlice[j].ChunkNo
	})

	outputFile := "output.pdf"
	f, err := os.OpenFile(outputFile, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, 0644)
	if err != nil {
		fmt.Printf("❌ Failed to create output file: %v\n", err)
		return
	}
	defer f.Close()

	for _, wrapper := range finalSlice {
		_, err := f.Write(wrapper.Data)
		if err != nil {
			fmt.Printf("❌ Failed to write chunk %d: %v\n", wrapper.ChunkNo, err)
		}
	}

	fmt.Println("✅ All chunks successfully written to output.pdf")
}

func DownloadAndStreamChunks(metaMap map[string][][]int, conn *websocket.Conn) {
	var wg sync.WaitGroup
	ch := make(chan Wrapper, 100)

	for filename, ranges := range metaMap {
		for _, chunk := range ranges {
			if len(chunk) != 3 {
				fmt.Println("⚠️ Invalid chunk format, expected [chunkNo, start, end]")
				continue
			}
			chunkNo := chunk[0]
			start := chunk[1]
			end := chunk[2]

			wg.Add(1)
			go func(f string, no, s, e int) {
				defer wg.Done()
				data, err := FetchByteRangeFromS3(f, s, e)
				ch <- Wrapper{ChunkNo: no, Data: data, Err: err}
			}(filename, chunkNo, start, end)
		}
	}

	go func() {
		wg.Wait()
		close(ch)
	}()

	for wrapper := range ch {
		if wrapper.Err != nil {
			log.Printf("❌ Failed to fetch chunk %d: %v\n", wrapper.ChunkNo, wrapper.Err)
			continue
		}

		err := conn.WriteJSON(struct {
			ChunkNo int    `json:"chunk_no"`
			Data    string `json:"data"` // base64 encoded
		}{
			ChunkNo: wrapper.ChunkNo,
			Data:    base64.StdEncoding.EncodeToString(wrapper.Data),
		})
		if err != nil {
			log.Printf(" Failed to send chunk %d: %v", wrapper.ChunkNo, err)
			break
		}
	}
}
