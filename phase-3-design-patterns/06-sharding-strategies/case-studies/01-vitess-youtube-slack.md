# Case Study: Vitess at YouTube and Slack — Sharded MySQL That Survived 1,000× Growth

> How YouTube built Vitess to keep MySQL viable from launch through Google's acquisition and how Slack reused it a decade later to absorb million-user workspaces without rewriting their core.

## Context

YouTube's MySQL fleet in the mid-2000s was the company's biggest scaling pain: every product feature (video metadata, watch history, comments) lived in MySQL, and the fleet was growing faster than the team could shard manually. The team built **Vitess** as a transparent sharding/connection-pooling layer on top of MySQL, open-sourcing it in 2012; Google later donated it to the CNCF (2018). The pain point Slack hit a decade later was identical: their MySQL fleet at hundreds of shards was approaching the limit of human-operable manual sharding. Slack adopted Vitess in 2020 and publicly described migrating their **main message store from custom-sharded MySQL to Vitess** in "Scaling Datastores at Slack with Vitess" (2020).

## The Decision

Both companies chose **Vitess (MySQL + transparent sharding proxy + topology service)** rather than migrating to a distributed SQL system. The parent module README's "directory-based vs hash-based vs range-based sharding; lookup vs encoded routing" matrix lives at the heart of Vitess. The key bet: **MySQL is a mature single-node engine; sharding is the actual hard part**. Rather than throw away MySQL's reliability, indexes, and tooling, Vitess **adds sharding as a layer above** — a stateless proxy (`vtgate`) that knows the topology, fans out queries to the right shards (`vttablet` instances wrapping MySQL), and merges results. Slack inherited a battle-tested system rather than building their own sharding logic from scratch.

## How It Works

- **vtgate**: stateless query router. Clients connect to vtgate using the MySQL wire protocol; vtgate parses SQL, identifies the **vindex** (the column used for sharding), and routes to the correct shard(s).
- **vttablet**: a sidecar in front of each MySQL instance, handling connection pooling, query rewriting, throttling, and online schema changes.
- **topology service** (etcd or ZooKeeper): authoritative map of keyspaces → shards → tablets.
- **vindex**: pluggable sharding function. Common types: `hash` (uniform spread), `lookup` (secondary index across shards), `numeric` (range).
- **Online resharding**: split a shard by spawning new shards, replicating data via MySQL binlog, then swapping traffic — **with no downtime**. This is Vitess's killer feature.
- YouTube reported scaling MySQL from **a handful of machines to thousands of shards** carrying watch history, comments, and metadata through 2010s growth.
- Slack reported their message store on Vitess handling **>5 million QPS at peak** as of 2022, across hundreds of shards on thousands of MySQL instances.
- **Cross-shard joins** are supported but expensive; Vitess will scatter-gather and warn — best practice is to design so they're rare.
- **VReplication**: Vitess's own replication layer for moving data between shards (resharding, materialized views, CDC).

## What Surprised Engineers

The non-obvious lesson YouTube and Slack both report is that **online resharding is the feature that pays the bills**. Sharding sounds like a design-time decision, but reality is: traffic skews change, a new feature explodes one shard, an acquisition merges data. Without online resharding, every shard split is a multi-week outage-prone project. With it, the team can rebalance in days, and bad sharding decisions are recoverable. The second surprise: **`vtgate`'s SQL parser must understand every query** to route correctly — unusual SQL constructs (window functions, subqueries) sometimes hit edges, requiring rewrite hints. Both teams report investing in **query linting** to keep ORMs from generating Vitess-unfriendly SQL.

## Trade-offs in Their Choice

| Win | Cost |
|---|---|
| Keep MySQL — proven engine, mature tooling, familiar operators | New components to operate: vtgate, vttablet, topo service |
| Online resharding turns shard layout from a permanent decision into an operational tunable | Cross-shard transactions are best-effort; design must keep transactions inside one shard |
| Scales from one MySQL to thousands of shards without app rewrite | Some SQL constructs are restricted; ORMs may need wrappers |

## Lessons for Your Interview

- When the interviewer pushes on "what happens when one shard gets hot", answer with **online resharding via Vitess** (or equivalent) rather than "we'd plan capacity better".
- Default to **hash-vindex on a high-cardinality column** (user_id, account_id) for the common case; mention lookup vindexes for secondary access patterns.
- Sketch **vtgate as a stateless SQL router** — this is the right level of abstraction to discuss before diving into shard layout.
- Use Slack/YouTube as proof points that **MySQL + Vitess scales further than most teams ever need** — pushes back on premature NoSQL adoption.
- Mention **VReplication for CDC / materialized views / re-sharding** — the same primitive serves all three.

## Sources

- "Vitess" project documentation — https://vitess.io/docs/
- YouTube Engineering: original Vitess paper / talks at Percona Live and Google Cloud Next
- Slack Engineering: "Scaling Datastores at Slack with Vitess" (2020) — https://slack.engineering/scaling-datastores-at-slack-with-vitess/
- Slack Engineering: "Sharding the past: Migrating Slack to Vitess" (2022) — https://slack.engineering/
- *Designing Data-Intensive Applications*, Kleppmann — Chapter 6 on partitioning and rebalancing
