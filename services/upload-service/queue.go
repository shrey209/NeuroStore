package main

import (
	"fmt"
	"sync"
	"time"
)

type ConcurrentChunkDeque struct {
	queue         [][]Chunk
	totalChunks   int
	lock          sync.Mutex
	lastflushtime time.Time
}

func NewConcurrentChunkDeque() *ConcurrentChunkDeque {
	return &ConcurrentChunkDeque{
		queue:       [][]Chunk{},
		totalChunks: 0,
	}
}

func (q *ConcurrentChunkDeque) EnqueueBack(chunkSlice []Chunk) {
	q.lock.Lock()
	defer q.lock.Unlock()
	q.queue = append(q.queue, chunkSlice)
	q.totalChunks += len(chunkSlice)
}

func (q *ConcurrentChunkDeque) EnqueueFront(chunkSlice []Chunk) {
	q.lock.Lock()
	defer q.lock.Unlock()
	q.queue = append([][]Chunk{chunkSlice}, q.queue...)
	q.totalChunks += len(chunkSlice)
}

func (q *ConcurrentChunkDeque) PopFront() ([]Chunk, bool) {
	q.lock.Lock()
	defer q.lock.Unlock()
	if len(q.queue) == 0 {
		return nil, false
	}
	first := q.queue[0]
	q.queue = q.queue[1:]
	q.totalChunks -= len(first)
	return first, true
}

func (q *ConcurrentChunkDeque) PopBack() ([]Chunk, bool) {
	q.lock.Lock()
	defer q.lock.Unlock()
	if len(q.queue) == 0 {
		return nil, false
	}
	last := q.queue[len(q.queue)-1]
	q.queue = q.queue[:len(q.queue)-1]
	q.totalChunks -= len(last)
	return last, true
}

func (q *ConcurrentChunkDeque) Length() int {
	q.lock.Lock()
	defer q.lock.Unlock()
	return len(q.queue)
}

func (q *ConcurrentChunkDeque) TotalChunks() int {
	q.lock.Lock()
	defer q.lock.Unlock()
	return q.totalChunks
}

func (q *ConcurrentChunkDeque) Drain() [][]Chunk {
	q.lock.Lock()
	defer q.lock.Unlock()
	drained := q.queue
	q.queue = [][]Chunk{}
	q.totalChunks = 0
	return drained
}

func (q *ConcurrentChunkDeque) enqueueFrontNoLock(chunkSlice []Chunk) {
	q.queue = append([][]Chunk{chunkSlice}, q.queue...)
	q.totalChunks += len(chunkSlice)
}

func StartDispatcher(q *ConcurrentChunkDeque) {
	go func() {
		for {
			time.Sleep(10 * time.Second)
			fmt.Println("[Dispatcher] Checking queue...")

			q.lock.Lock()

			now := time.Now()
			shouldForceFlush := q.totalChunks > 0 && now.Sub(q.lastflushtime) > 60*time.Second

			for q.totalChunks >= 500 || shouldForceFlush {
				cur := 500
				if q.totalChunks < 500 {
					cur = q.totalChunks
					fmt.Println("[Dispatcher] Forcing flush due to 60s inactivity")
				}

				var task [][]Chunk
				fmt.Printf("[Dispatcher] Preparing new task from %d total chunks\n", q.totalChunks)

				for cur > 0 && len(q.queue) > 0 {
					temp := q.queue[0]
					q.queue = q.queue[1:]

					if len(temp) <= cur {
						task = append(task, temp)
						cur -= len(temp)
					} else {
						fit := temp[:cur]
						rest := temp[cur:]

						task = append(task, fit)
						q.queue = append([][]Chunk{rest}, q.queue...)
						cur = 0
					}
				}

				q.totalChunks -= countChunks(task)
				q.lastflushtime = time.Now()

				fmt.Printf("[Dispatcher] Task ready with %d sub-slices. Submitting to worker pool.\n", len(task))
				GlobalPool.Submit(Task{Chunks: task})

				shouldForceFlush = q.totalChunks > 0 && time.Since(q.lastflushtime) > 60*time.Second
			}

			if q.totalChunks < 500 {
				fmt.Printf("[Dispatcher] Not enough chunks to dispatch. TotalChunks: %d\n", q.totalChunks)
			}

			q.lock.Unlock()
		}
	}()
}

func countChunks(batch [][]Chunk) int {
	count := 0
	for _, b := range batch {
		count += len(b)
	}
	return count
}
