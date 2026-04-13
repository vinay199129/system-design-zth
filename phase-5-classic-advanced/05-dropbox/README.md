# Design: Dropbox / File Storage & Sync

> Design a cloud file storage system that synchronizes files across devices using chunked uploads, delta sync, and conflict resolution.

## Overview

Dropbox allows users to store files in the cloud and sync them seamlessly across multiple devices. The system must handle large file uploads via chunking, minimize bandwidth through delta sync (only transferring changed blocks), deduplicate content across users using content-addressable storage, and resolve conflicts when the same file is edited on multiple devices simultaneously. Reliability and consistency are paramount.

## Difficulty: Hard

## Core Concepts Tested

- File chunking (4 MB blocks) and reassembly
- Delta sync: transferring only changed chunks
- Content-addressable storage and deduplication
- Conflict resolution with vector clocks / version vectors
- Metadata service and file tree management
- Notification service for cross-device sync
- Object storage integration (S3-like backend)

## Companies That Ask This

Dropbox, Google, Microsoft, Amazon, Box, Apple, Salesforce

## Prerequisites

- 01-scaling-foundations (distributed systems basics)
- 02-databases (metadata storage, consistency)
- 05-message-queues (notification pipelines)
- 06-distributed-systems (consistency models, vector clocks)
- 07-blob-storage (object storage patterns)

## Approach

1. Clarify scope: upload, download, sync, share, versioning, conflict resolution.
2. Estimate traffic: files uploaded/day, sync events/sec, average file size.
3. Design chunking: split files into 4 MB blocks, hash each chunk (SHA-256).
4. Design upload flow: client detects changed chunks → uploads only deltas.
5. Design metadata service: file tree per user, chunk-to-file mapping.
6. Design sync protocol: long-polling / WebSocket for change notifications.
7. Design conflict resolution: vector clocks, last-writer-wins with manual merge.
8. Address scaling: deduplication ratio, chunk storage optimization, consistency guarantees.
