#include <string.h>
#include <stdint.h>
#include <stdlib.h>
#include <stdio.h>
#include <stdbool.h>
#include <emscripten.h>
#include "tomcrypt.h"
#include "cJSON.h"

#define MIN_CHUNK 2048
#define AVG_CHUNK 8192
#define MAX_CHUNK 16384
#define CHUNK_MASK (AVG_CHUNK - 1)
#define MAX_BLOCKS 10000

typedef struct {
    size_t start;
    size_t end;
    size_t chunk_no;
    char sha[65];
} Block;

static uint8_t curData[MAX_CHUNK];
static size_t curDataLen = 0;
static uint64_t rollingHash = 0;
static size_t byteIndex = 0;
static size_t chunkStart = 0;
static size_t currentChunkSize = 0;
static size_t totalChunks = 0;

static Block blocks[MAX_BLOCKS];
static size_t blockCount = 0;

void crypt_argchk(const char *v, const char *s, int d) {}

void to_hex(uint8_t *in, int len, char *out) {
    for (int i = 0; i < len; i++) {
        sprintf(out + (i * 2), "%02x", in[i]);
    }
    out[len * 2] = '\0';
}

char* hash_current_block() {
    static char hash_hex[65];
    hash_state md;
    uint8_t digest[32];
    if (sha256_init(&md) != CRYPT_OK ||
        sha256_process(&md, curData, curDataLen) != CRYPT_OK ||
        sha256_done(&md, digest) != CRYPT_OK) {
        strcpy(hash_hex, "HASH_ERR");
        return hash_hex;
    }
    to_hex(digest, 32, hash_hex);
    return hash_hex;
}

void slide(uint8_t byte) {
    rollingHash = ((rollingHash << 5) + rollingHash + byte) % 0xFFFFFFFF;
}

EMSCRIPTEN_KEEPALIVE
void reset_chunking_state() {
    curDataLen = 0;
    rollingHash = 0;
    byteIndex = 0;
    chunkStart = 0;
    currentChunkSize = 0;
    totalChunks = 0;
    blockCount = 0;
}

EMSCRIPTEN_KEEPALIVE
void process_chunk(uint8_t* chunk, int len, bool isEnd) {
    for (int i = 0; i < len; i++) {
        uint8_t byte = chunk[i];
        slide(byte);
        curData[curDataLen++] = byte;
        currentChunkSize++;
        byteIndex++;

        bool isBoundary = (rollingHash & CHUNK_MASK) == 0;
        if ((currentChunkSize >= MIN_CHUNK && isBoundary) || currentChunkSize >= MAX_CHUNK) {
            if (blockCount >= MAX_BLOCKS) return;

            char* hash = hash_current_block();
            Block b;
            b.start = chunkStart;
            b.end = byteIndex - 1;
            b.chunk_no = totalChunks + 1;
            strncpy(b.sha, hash, sizeof(b.sha));
            blocks[blockCount++] = b;

            curDataLen = 0;
            rollingHash = 0;
            chunkStart = byteIndex;
            currentChunkSize = 0;
            totalChunks++;

            if (i + 1 < len) {
                process_chunk(chunk + i + 1, len - (i + 1), isEnd);
            }
            return;
        }
    }

    if (isEnd && curDataLen > 0) {
        if (blockCount >= MAX_BLOCKS) return;
        char* hash = hash_current_block();
        Block b;
        b.start = chunkStart;
        b.end = byteIndex - 1;
        b.chunk_no = totalChunks + 1;
        strncpy(b.sha, hash, sizeof(b.sha));
        blocks[blockCount++] = b;
        curDataLen = 0;
        rollingHash = 0;
        chunkStart = byteIndex;
        currentChunkSize = 0;
        totalChunks++;
    }
}

EMSCRIPTEN_KEEPALIVE
size_t get_block_count() {
    return blockCount;
}

EMSCRIPTEN_KEEPALIVE
Block get_block(int index) {
    if (index < 0 || index >= blockCount) {
        Block empty = {0, 0, 0, "INVALID"};
        return empty;
    }
    return blocks[index];
}

EMSCRIPTEN_KEEPALIVE
char* get_blocks_json() {
    static char* json_output = NULL;

    if (json_output) {
        free(json_output);
        json_output = NULL;
    }

    cJSON* root = cJSON_CreateArray();
    for (size_t i = 0; i < blockCount; i++) {
        cJSON* blk = cJSON_CreateObject();
        cJSON_AddNumberToObject(blk, "start", (double)blocks[i].start);
        cJSON_AddNumberToObject(blk, "end", (double)blocks[i].end);
        cJSON_AddNumberToObject(blk, "chunk_no", (double)blocks[i].chunk_no);
        cJSON_AddStringToObject(blk, "sha", blocks[i].sha);
        cJSON_AddItemToArray(root, blk);
    }

    json_output = cJSON_PrintUnformatted(root);
    cJSON_Delete(root);
    return json_output;
}
