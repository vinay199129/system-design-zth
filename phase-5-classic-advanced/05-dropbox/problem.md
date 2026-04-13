# Problem: Design Dropbox / File Storage & Sync

## Requirements

### Functional

- Users can upload, download, and delete files/folders.
- Files sync automatically across all of a user's devices.
- Users can share files/folders with other users (view or edit permissions).
- The system supports file versioning (restore previous versions).
- Concurrent edits to the same file from different devices are handled gracefully.
- Large files (multi-GB) can be uploaded reliably over unreliable networks.

### Non-Functional

- **Durability:** 99.999999999% (11 nines) — zero data loss ever.
- **Availability:** 99.9% for uploads; 99.99% for downloads.
- **Latency:** Small file sync across devices < 5 seconds.
- **Bandwidth efficiency:** Only transfer changed portions of files (delta sync).
- **Scalability:** Support 600M+ registered users, 1B+ files stored.
- **Consistency:** Strong consistency for metadata; eventual consistency for cross-device sync.

## Constraints & Scale

| Metric | Value |
|--------|-------|
| Registered users | 600 million |
| Daily Active Users | 100 million |
| Average files per user | 200 |
| Total files stored | 120 billion |
| New files uploaded per day | 2 billion |
| Average file size | 1 MB |
| Large files (>100 MB) | 5% of uploads |
| Chunk size | 4 MB |
| New storage per day | ~2 PB |
| Sync events per second (peak) | 500,000 |
| Read:Write ratio | 1:1 (sync-heavy workload) |

## Hints

### Hint 1: File Chunking

Uploading a 1 GB file as a single blob is fragile — any network interruption means starting over. If you split the file into 4 MB chunks, you can retry individual chunks, upload in parallel, and only re-upload chunks that changed on update. How do you track which chunks make up a file?

### Hint 2: Delta Sync

When a user edits a 100 MB file and changes 1 paragraph, uploading the entire file again wastes bandwidth. Content-addressable storage (hash each chunk) lets you detect exactly which chunks changed. How do you compute and transmit only the delta?

### Hint 3: Conflict Resolution

User edits `report.docx` on their laptop (offline) and also edits it on their phone. When both come online, which version wins? Think about vector clocks, version vectors, or operational transforms. What's the user experience for conflicts?

## Think About

- How do you deduplicate identical files across different users? (Hint: content-addressable storage.)
- What happens if the client crashes mid-upload? How do you resume?
- How do you notify a user's other devices that a file changed? Long-polling, WebSocket, push notification?
- How do you handle a user with 100,000 files in a single folder?
- What metadata schema tracks the file tree, chunks, versions, and sharing permissions?
- How do you prevent a malicious user from consuming unlimited storage?
