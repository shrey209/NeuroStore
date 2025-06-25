package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"sort"
	"sync"

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

type Wrapper struct {
	Meta ChunkMeta
	Data []byte
	Err  error
}

func DownloadAndAssembleFiles(metaMap map[string][]ChunkMeta) {
	var wg sync.WaitGroup
	ch := make(chan Wrapper, 100)

	for filename, chunks := range metaMap {
		for _, chunk := range chunks {
			wg.Add(1)
			go func(f string, c ChunkMeta) {
				defer wg.Done()
				data, err := FetchByteRangeFromS3(f, c.Start, c.End)
				ch <- Wrapper{Meta: c, Data: data, Err: err}
			}(filename, chunk)
		}
	}

	go func() {
		wg.Wait()
		close(ch)
	}()

	var finalSlice []Wrapper
	for wrapper := range ch {
		if wrapper.Err != nil {
			fmt.Printf(" Failed to fetch chunk %d: %v\n", wrapper.Meta.No, wrapper.Err)
			continue
		}
		finalSlice = append(finalSlice, wrapper)
	}

	sort.Slice(finalSlice, func(i, j int) bool {
		return finalSlice[i].Meta.No < finalSlice[j].Meta.No
	})

	outputFile := "output.pdf"
	f, err := os.OpenFile(outputFile, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, 0644)
	if err != nil {
		fmt.Printf(" Failed to create output file: %v\n", err)
		return
	}
	defer f.Close()

	for _, wrapper := range finalSlice {
		_, err := f.Write(wrapper.Data)
		if err != nil {
			fmt.Printf(" Failed to write chunk %d: %v\n", wrapper.Meta.No, err)
		}
	}

	fmt.Println(" All chunks successfully written to output.pdf")
}
