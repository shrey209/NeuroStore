package main

import (
	"context"
	"encoding/json"

	"github.com/redis/go-redis/v9"
)

type ChunkMeta struct {
	Filename string `json:"filename"`
	Start    int    `json:"start"`
	End      int    `json:"end"`
	No       int    `json:"no"`
}

var ctx = context.Background()

func CheckSHAExistence(rdb *redis.Client, shas []string) (existing []string, missing []string, err error) {
	values, err := rdb.MGet(ctx, shas...).Result()
	if err != nil {
		return nil, nil, err
	}

	for i, val := range values {
		if val != nil {
			existing = append(existing, shas[i])
		} else {
			missing = append(missing, shas[i])
		}
	}

	return existing, missing, nil
}

func StoreSHAMetadata(rdb *redis.Client, metaMap map[string]ChunkMeta) error {

	kvPairs := make([]interface{}, 0, len(metaMap)*2)

	for sha, meta := range metaMap {
		jsonVal, err := json.Marshal(meta)
		if err != nil {
			return err
		}
		kvPairs = append(kvPairs, sha, jsonVal)
	}

	return rdb.MSet(ctx, kvPairs...).Err()
}
