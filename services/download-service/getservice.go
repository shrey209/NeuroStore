package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"sort"

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

func DownloadAndAssembleFiles(metaMap map[string][]int) {
	type temp struct {
		Name  string
		No    int
		Start int
		End   int
	}

	var files []temp

	for filename, info := range metaMap {
		if len(info) < 3 {
			continue
		}
		files = append(files, temp{
			Name:  filename,
			No:    info[0],
			Start: info[1],
			End:   info[2],
		})
	}

	sort.Slice(files, func(i, j int) bool {
		return files[i].No < files[j].No
	})

	outputFile := "output.pdf"
	f, err := os.OpenFile(outputFile, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, 0644)
	if err != nil {
		fmt.Printf(" Failed to create output file: %v\n", err)
		return
	}
	defer f.Close()

	for _, file := range files {
		fmt.Printf(" Fetching %s [%d - %d] (chunk no: %d)\n", file.Name, file.Start, file.End, file.No)

		data, err := FetchByteRangeFromS3(file.Name, file.Start, file.End)
		if err != nil {
			fmt.Printf(" Failed to fetch data from S3 for %s: %v\n", file.Name, err)
			continue
		}

		_, err = f.Write(data)
		if err != nil {
			fmt.Printf(" Failed to write data to output.pdf: %v\n", err)
			continue
		}
	}

	fmt.Println(" All chunks written to output.pdf")
}
