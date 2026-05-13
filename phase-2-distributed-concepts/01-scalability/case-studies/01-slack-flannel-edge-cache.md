# Case Study: Slack — Flannel and Scaling One Workspace to a Million Concurrent Users

> How Slack's edge cache "Flannel" turned a single workspace from a few-thousand-user limit into a million-user capable system without rewriting the core monolith.

## Context

Slack's product is, at the protocol level, a long-lived WebSocket per client plus a state-heavy login bootstrap that streams the user's channels, members, and message history. Around 2017, the largest workspaces (IBM publicly hit 100,000+ users; later customers approached 500,000+) caused two problems: the **login payload** ballooned to tens of megabytes (every channel and member of the workspace), and every message had to fan out to every connected client in the channel. Slack engineering published "Flannel: An Application-Level Edge Cache to Make Slack Scale" (2017) describing the architecture. The motivation: scale per-workspace user count by **10–100×** without rewriting the core PHP/Hack monolith.

## The Decision

Slack chose to **insert an edge cache between the WebSocket and the monolith** rather than refactor the database tier. The parent module README's "vertical vs horizontal scaling, stateless vs stateful tier" trade-off applies: the monolith was *stateful per workspace* in caches and DB indices, so just adding monolith replicas didn't help. Flannel is a stateless cache fleet that lives at every Slack edge POP, holds the **slowly-changing workspace metadata** (channels, members, users), and serves the bootstrap and lazy lookups from memory — letting the monolith handle only the *actually mutating* requests.

## How It Works

- **Flannel** runs at every Slack POP, written in Java (later partially Go), holding **per-workspace metadata in memory**: users, channels, channel memberships.
- On WebSocket connect, the client talks to Flannel, which serves the bootstrap from cache; only **deltas** for very large workspaces require lookups back to origin.
- Flannel subscribes to a **change feed** from the core service so it receives invalidations (`user joined channel`, `user updated profile`) within seconds.
- **WebSocket fan-out** also goes through Flannel: messages destined for many subscribers in a region are fanned out once to Flannel, which delivers to each socket — origin sends one copy per region, not per user.
- Reported scale at original publication: serving **>1 million concurrent connections per workspace** for the biggest customers; aggregate **10s of millions of concurrent connections** across the platform.
- **Autoscaling**: Flannel fleet scales with connection count; monolith fleet scales with mutation rate; the two decouple cleanly.
- Cache hit rate on bootstrap reportedly **>99 %** post-Flannel.
- Workspace data is **partitioned by team_id**; Flannel uses consistent hashing within a region to route a workspace to a stable cache node.
- Origin (the "webapp" tier) reads from MySQL shards keyed by team_id and from Memcached for hot rows.

## What Surprised Engineers

The non-obvious surprise was that **lazy loading user/channel data on demand** was insufficient once workspaces crossed ~10,000 users. Even loading-as-you-go produced enough small queries during the morning login spike to overload the origin. The fix was not a faster cache; it was **bulk pre-loading of the workspace into Flannel at WebSocket connect**, accepting larger per-connection memory in exchange for near-zero per-request lookups afterward. A second lesson: when a 500k-user workspace has a "@channel" mention, the fan-out is half a million WebSocket frames in seconds — without Flannel doing the multiplication once-per-region, the origin egress NIC would saturate.

## Trade-offs in Their Choice

| Win | Cost |
|---|---|
| Bootstrap & metadata reads served from RAM at the edge | Cache invalidation must be near-real-time or stale member lists confuse users |
| Origin only handles mutations; can be scaled independently | New stateful tier (Flannel) to operate, monitor, and shard |
| Per-region fan-out cuts origin egress dramatically | A Flannel-tier outage blocks logins even though origin is healthy |

## Lessons for Your Interview

- For chat / collaboration designs, propose a **per-region edge cache for slow-changing metadata** layered in front of the monolith — this is the cheapest 10× scale lever.
- Distinguish **bootstrap state vs message stream** in your design; they have different shapes and shouldn't share the same tier.
- Mention **per-region fan-out at the cache tier** as the fix for celebrity / megachannel fan-out problems.
- Cite **autoscaling on connection count vs mutation count** as a concrete reason to split tiers.
- Use Slack's "1 million concurrent users in one workspace" as your scale anchor for "really big tenants in a multi-tenant app".

## Sources

- Slack Engineering: "Flannel: An Application-Level Edge Cache to Make Slack Scale" (2017) — https://slack.engineering/flannel-an-application-level-edge-cache-to-make-slack-scale/
- Slack Engineering: "Scaling Slack" QCon and Strange Loop talks (2017–2019)
- Slack Engineering: "Real-time messaging at Slack" — https://slack.engineering/
- *Designing Data-Intensive Applications*, Kleppmann — Chapter 6 on partitioning, Chapter 11 on stream-driven cache invalidation
