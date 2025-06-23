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
	outputFile := fmt.Sprintf("chunk_set_%s.bin", uid.String())

	file, err := os.Create(outputFile)
	if err != nil {
		fmt.Printf("Failed to create file: %v\n", err)
		return
	}
	defer file.Close()

	currentOffset := 0

	for i, chunkSlice := range t.Chunks {
		for j, chunk := range chunkSlice {
			data, err := base64.StdEncoding.DecodeString(chunk.Data)
			if err != nil {
				fmt.Printf("Failed to decode chunk (%d,%d): %v\n", i, j, err)
				continue
			}
			n, err := file.Write(data)
			if err != nil {
				fmt.Printf("Failed to write chunk (%d,%d): %v\n", i, j, err)
				continue
			}

			currentOffset += n

			// fmt.Printf("Chunk (%d,%d) written: Start=%d, End=%d\n", i, j, start, end)
			totalChunks++
		}
	}

	fmt.Printf("Processing completed: %d total chunks written to %s\n", totalChunks, outputFile)

	key := fmt.Sprintf("chunk_set_%d.bin")
	err = UploadBinFileToS3(outputFile, key)
	if err != nil {
		fmt.Printf("Failed to upload to S3: %v\n", err)
	} else {
		fmt.Printf("File uploaded to S3 with key: %s\n", key)
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
