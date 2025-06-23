package main

import (
	"fmt"
	"sync"
	"time"
)

type Task struct {
	Chunks []Chunk
}

func (t *Task) Process() {
	//p

	fmt.Printf("Processing task with %d chunks\n", len(t.Chunks))
	time.Sleep(time.Second)
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
