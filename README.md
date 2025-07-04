# 🧠 Neuro Store

> A smarter file storage service with AI features, chunked deduplication, and semantic search — powered by Go, TypeScript, and WebAssembly.

![Status](https://img.shields.io/badge/status-in%20development-orange)
![License](https://img.shields.io/badge/license-MIT-blue)
![Tech](https://img.shields.io/badge/built%20with-Go%2C%20TypeScript%2C%20C%20%28WASM%29-9cf)

---

## 📦 What is Neuro Store?

**Neuro Store** is an intelligent file storage system that supports:

- Uploading files up to **150MB**
- **Version tracking**
- **Chunk-based storage** to **reduce duplication** (unlike S3's default behavior)
- A powerful **AI layer** for organizing and retrieving files

Although it uses **S3** for underlying storage, Neuro Store is **not just another S3 wrapper**. Files are broken down into **blocks and chunks**, allowing for **deduplication**, even across different versions of files — significantly saving on storage space.

---

## ✨ Features

- 🧩 **Chunked File Storage**
  - Files are divided into content-based chunks.
  - Shared chunks between versions or similar files are not stored again.
  
- 📚 **Versioning**
  - Keep track of changes and revert to previous versions of files.

- 🧠 **AI Tagging & Organization**
  - Files are auto-tagged using AI models (e.g., "invoice", "car", "notes").
  - No need to manually sort into folders.

- 🔍 **Semantic Search**
  - Search files using natural queries like:
    - _"files about cars"_
    - _"documents containing financial data"_

- ⚙️ **Client-Side WASM Processing**
  - Hashes and chunks are generated in-browser using **WASM** compiled from **C**.
  - Reduces server load and enhances privacy.

---

## 🔮 Coming Soon

- 🖼️ **Image Semantic Search**
- 🧠 **Smart File Grouping**
- 💬 **Chat with PDF**
- 📊 **Data Visualization of File Contents**

---

## 🛠️ Tech Stack

| Component       | Technology                      |
|----------------|----------------------------------|
| Backend Engine | [Go](https://golang.org)         |
| Frontend + API | [TypeScript](https://www.typescriptlang.org/) |
| AI Processing  | TypeScript + AI models           |
| WASM Engine    | C compiled to WebAssembly (WASM) |
| Storage        | AWS S3 (with custom logic layer) |

---

## 🧠 Why Not Just Use S3?

| Feature                  | S3         | Neuro Store         |
|--------------------------|------------|----------------------|
| File Deduplication       | ❌ No       | ✅ Yes (chunk-based) |
| Semantic AI Search       | ❌ No       | ✅ Yes               |
| Auto Tagging             | ❌ No       | ✅ Yes               |
| Smart Versioning         | ❌ Basic    | ✅ Chunk-level       |
| Client-side Hashing      | ❌ No       | ✅ Yes (via WASM)    |

Neuro Store adds intelligence, efficiency, and structure **on top of** the S3 foundation.

---

## 🧪 Dev Notes

- WASM hashing is computed before upload, which means **increased API hits** but significantly better **deduplication**.
- AI tagging uses lightweight models to keep inference fast and browser-friendly.
- Designed to scale with low overhead.

---

## 📬 Contact & Contribution

We welcome contributions and feedback!

- Open an [issue](https://github.com/your-org/neuro-store/issues)
- Submit a [pull request](https://github.com/your-org/neuro-store/pulls)
- Discuss ideas in the [Discussions](https://github.com/your-org/neuro-store/discussions)

---

## 📄 License

Licensed under the [MIT License](LICENSE).

---

