package main

import (
	"encoding/base64"
	"fmt"
	"os"
	"sync"

	"github.com/google/uuid"
)

type Task struct {
	Chunks [][]Chunk
}

func (t *Task) Process() {
	totalChunks := 0
	uid := uuid.New()
	key := fmt.Sprintf("chunk_set_%s.bin", uid.String())
	outputFile := key

	file, err := os.Create(outputFile)
	if err != nil {
		fmt.Printf("Failed to create file: %v\n", err)
		return
	}
	defer file.Close()

	currentOffset := 0
	chunkMetaMap := make(map[string]ChunkMeta)

	for i, chunkSlice := range t.Chunks {
		for j, chunk := range chunkSlice {
			data, err := base64.StdEncoding.DecodeString(chunk.Data)
			if err != nil {
				fmt.Printf("Failed to decode chunk (%d,%d): %v\n", i, j, err)
				continue
			}

			start := currentOffset
			n, err := file.Write(data)
			if err != nil {
				fmt.Printf("Failed to write chunk (%d,%d): %v\n", i, j, err)
				continue
			}
			end := currentOffset + n - 1
			currentOffset += n
			totalChunks++

			chunkMetaMap[chunk.SHA] = ChunkMeta{
				Filename: key,
				Start:    start,
				End:      end,
			}
		}
	}

	fmt.Printf("Processing completed: %d total chunks written to %s\n", totalChunks, outputFile)

	for sha, meta := range chunkMetaMap {
		fmt.Printf("SHA: %s -> %+v\n", sha, meta)
	}

	err = UploadBinFileToS3(outputFile, key)
	if err != nil {
		fmt.Printf("Failed to upload to S3: %v\n", err)
	} else {
		fmt.Printf("File uploaded to S3 with key: %s\n", key)
	}

	err = StoreSHAMetadata(RedisClient, chunkMetaMap)
	if err != nil {
		fmt.Printf("Failed to store metadata in Redis: %v\n", err)
	} else {
		fmt.Printf("Chunk metadata stored in Redis for %d chunks\n", totalChunks)
	}
}

type WorkerPool struct {
	concurrency int
	taskChan    chan Task
	wg          sync.WaitGroup
}

func NewWorkerPool(concurrency int) *WorkerPool {
	wp := &WorkerPool{
		concurrency: concurrency,
		taskChan:    make(chan Task, 100),
	}
	wp.start()
	return wp
}

func (wp *WorkerPool) start() {
	for i := 0; i < wp.concurrency; i++ {
		go wp.worker()
	}
}

func (wp *WorkerPool) worker() {
	for task := range wp.taskChan {
		fmt.Println("picking task")
		task.Process()
		wp.wg.Done()
	}
}

func (wp *WorkerPool) Submit(task Task) {
	wp.wg.Add(1)
	wp.taskChan <- task
}

func (wp *WorkerPool) Wait() {
	wp.wg.Wait()
}
