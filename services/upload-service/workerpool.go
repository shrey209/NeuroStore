package main

import (
	"encoding/base64"
	"fmt"
	"os"
	"sync"
	"time"
)

type Task struct {
	Chunks [][]Chunk
}

func (t *Task) Process() {
	totalChunks := 0
	outputFile := fmt.Sprintf("output_%d.bin", time.Now().UnixNano())

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

			start := currentOffset
			n, err := file.Write(data)
			if err != nil {
				fmt.Printf("Failed to write chunk (%d,%d): %v\n", i, j, err)
				continue
			}
			end := currentOffset + n - 1
			currentOffset += n

			fmt.Printf("Chunk (%d,%d) written: Start=%d, End=%d\n", i, j, start, end)
			totalChunks++
		}
	}

	fmt.Printf("Processing completed: %d total chunks written to %s\n", totalChunks, outputFile)
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
