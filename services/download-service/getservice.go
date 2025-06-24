package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	"github.com/redis/go-redis/v9"
)

type ChunkMeta struct {
	Filename string `json:"filename"`
	Start    int    `json:"start"`
	End      int    `json:"end"`
}

var ctx = context.Background()

// OrganizeAndSortChunks groups by filename, sorts by start byte

func FetchChunkMetadata(rdb *redis.Client, keys []string) (map[string]ChunkMeta, error) {
	result := make(map[string]ChunkMeta)

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

		result[keys[i]] = meta
	}

	return result, nil
}

func DownloadAndAssembleFiles(metaMap map[string][]ChunkMeta) {
	for filename, chunks := range metaMap {
		if len(chunks) == 0 {
			continue
		}

		start := chunks[0].Start
		end := chunks[len(chunks)-1].End

		fmt.Printf("📂 Fetching file %s from byte range [%d - %d]\n", filename, start, end)

		data, err := FetchByteRangeFromS3(filename, start, end)
		if err != nil {
			fmt.Printf("❌ Error fetching file %s: %v\n", filename, err)
			continue
		}

		// Use original filename, ensure PDF extension
		base := filepath.Base(filename)
		if filepath.Ext(base) != ".pdf" {
			base += ".pdf"
		}
		outPath := "output_" + base

		if err := os.WriteFile(outPath, data, 0644); err != nil {
			fmt.Printf("❌ Failed to write file %s: %v\n", outPath, err)
			continue
		}

		fmt.Printf("✅ File written: %s (%d bytes)\n", outPath, len(data))
	}
}
