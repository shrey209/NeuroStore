package main

import (
	"fmt"
	"sync"
	"time"
)

type ConcurrentChunkDeque struct {
	queue       [][]Chunk
	totalChunks int
	lock        sync.Mutex
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

func StartDispatcher(q *ConcurrentChunkDeque) {
	go func() {
		for {
			time.Sleep(10 * time.Second)

			fmt.Println(" Dispatcher triggered")
			batch := q.Drain()

			if len(batch) == 0 {
				fmt.Println(" Nothing to dispatch")
				continue
			}

			for i, slice := range batch {
				fmt.Printf("🔧 Processing batch #%d (%d chunks)\n", i+1, len(slice))
			}

			fmt.Println(" Dispatcher finished processing")
		}
	}()
}
