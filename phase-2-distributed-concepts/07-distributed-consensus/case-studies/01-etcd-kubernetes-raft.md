# Case Study: etcd in Kubernetes — Raft Consensus and the Cost of Losing Quorum

> How every Kubernetes cluster on Earth depends on a 3- or 5-node etcd Raft group, and what happens to your control plane when that quorum disappears.

## Context

Every Kubernetes cluster stores all its state — Pods, Deployments, Services, Secrets, every object the API server returns — in **etcd**, a distributed key-value store built on the **Raft consensus algorithm** (Ongaro & Ousterhout, 2014). A typical production K8s cluster runs **3 or 5 etcd nodes**, and Kubernetes' control plane is unable to make any state change without etcd quorum. CoreOS published the original etcd design in 2013; the Kubernetes architectural decision to use etcd is documented in `kubernetes/design-proposals`. The pain point: distributed coordination is hard, and Kubernetes punted it entirely to a single subsystem — making etcd the most operationally consequential component in the entire stack.

## The Decision

Kubernetes chose **Raft consensus over a strongly-consistent KV store** rather than a multi-master eventually-consistent design (e.g., Cassandra) or a single-leader RDBMS. The parent module README's "Paxos vs Raft vs ZooKeeper Atomic Broadcast" comparison is exactly the decision space. Raft was preferred over Paxos for understandability and over ZAB (ZooKeeper) for license/ecosystem reasons. The trade-off: every cluster-state mutation pays a quorum round-trip — but in exchange, the cluster has a single, linearizable source of truth that the API server, scheduler, and controllers can all watch.

## How It Works

- **Cluster size**: production etcd runs **3 nodes** (tolerates 1 failure) or **5 nodes** (tolerates 2). Even numbers are pointless: a 4-node cluster tolerates the same 1 failure as a 3-node cluster while costing more.
- **Raft roles**: one leader, rest followers. Leader serves all writes; followers replicate the log; reads can be served by followers via **linearizable read index** or **serializable** (stale) reads.
- **Write path**: client → leader → log append → replicate to followers → wait for **majority acknowledgment** → commit → reply. Typical commit latency **5–20 ms** intra-DC, **50–100+ ms** cross-region.
- **Snapshot + log compaction**: etcd takes periodic snapshots of state and compacts the Raft log; without this, the log grows unbounded.
- **Watch API**: Kubernetes API server holds a long-running `watch` on each resource type; etcd streams updates as they commit, fanning out to all controllers.
- **MVCC**: etcd v3 stores keys with revisions, enabling consistent point-in-time reads — what makes K8s `resourceVersion`-based optimistic concurrency work.
- **Sizing limits**: etcd is **not designed for huge databases** — recommended DB size is **<8 GB**; clusters >5,000 nodes typically split into multiple K8s clusters rather than scaling one etcd.
- TLS-mutual auth between etcd peers and between API server and etcd.

## What Surprised Engineers

The most painful and well-documented failure mode is **loss of quorum**. If a 3-node etcd cluster loses 2 nodes (network partition, simultaneous host failure, two disks dying), the surviving node **cannot make progress** — Raft requires a majority. The remaining node continues to *serve reads* (briefly) but rejects writes; the K8s API server returns errors; no new Pods are scheduled, no failing Pods are restarted. Recovery requires **either** waiting for nodes to return **or** performing an unsafe **`etcdctl snapshot restore --force-new-cluster`** which discards any unreplicated writes. The second surprise: **disk fsync latency** is the bottleneck — etcd writes the Raft log to disk before ACKing, so a slow disk (especially on EBS or shared NFS) silently caps the entire control plane's throughput. The community-known guidance is **dedicated SSDs, low-latency disks, and `fio`-tested fsync ≤10 ms p99**.

## Trade-offs in Their Choice

| Win | Cost |
|---|---|
| Single linearizable source of truth for the whole cluster | Quorum loss bricks the control plane until manual recovery |
| Watch API → controllers see changes within milliseconds | Every write pays a quorum RTT and a disk fsync |
| Raft is *understandable*; ops teams can reason about leader election | etcd doesn't scale horizontally — vertical only, capped at ~8 GB DB |

## Lessons for Your Interview

- Default to **Raft + odd-numbered cluster (3 or 5)** when asked to design metadata storage; explain why even sizes don't help.
- State the **quorum math** explicitly: "5-node cluster tolerates 2 failures; 3-node tolerates 1; we'd pick based on blast-radius vs cost".
- Mention **fsync latency as the hot bottleneck** for any Raft/Paxos system — interviewers love this concrete operational fact.
- Distinguish **linearizable reads (read index, paying RTT)** from **serializable reads (stale, follower-local)** — name both.
- Use **K8s API server + etcd Watch** as the canonical example of "controller pattern over a consistent KV store".

## Sources

- Ongaro & Ousterhout, "In Search of an Understandable Consensus Algorithm (Raft)" — USENIX ATC 2014 — https://raft.github.io/raft.pdf
- etcd documentation: "FAQ" and "Performance" — https://etcd.io/docs/v3.5/faq/
- CoreOS / etcd post-mortem and operator guides — https://etcd.io/docs/v3.5/op-guide/
- Kubernetes documentation: "Operating etcd clusters for Kubernetes" — https://kubernetes.io/docs/tasks/administer-cluster/configure-upgrade-etcd/
- *Designing Data-Intensive Applications*, Kleppmann — Chapter 9 on consensus and Chapter 8 on leader election
