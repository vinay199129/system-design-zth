# Phase 6: Mock Interviews & Review

> Days 55-60. Practice under realistic conditions. The goal is to simulate real interviews.

## Mock Interview Structure

### The 45-Minute Mock

Use the dashboard timer (set to 45 minutes with phases) or a physical timer.

| Phase | Time | What to Do |
|-------|------|-----------|
| Requirements | 0:00 - 5:00 | Clarify scope, write FR/NFR on paper |
| Estimation | 5:00 - 10:00 | QPS, storage, bandwidth calculations |
| High-Level Design | 10:00 - 25:00 | Draw architecture, define APIs |
| Detailed Design | 25:00 - 40:00 | Deep dive 2-3 components |
| Evaluation | 40:00 - 45:00 | Trade-offs, bottlenecks, improvements |

### Mock Interview Topics

Pick from Phase 4-5 designs you haven't attempted yet, or redo weak ones:

**Round 1 (Day 55):** Pick one starter + one advanced
- Option A: URL Shortener + YouTube
- Option B: Chat System + Payment System
- Option C: News Feed + Uber

**Round 2 (Day 56):** Pick two you struggled with from Phase 4-5

**Round 3 (Day 59):** Pick one you've never seen before (interviewers love novel problems)
- Design a collaborative document editor (Google Docs)
- Design a food delivery system (DoorDash)
- Design a metrics monitoring system (Datadog)

## Self-Assessment Rubric

After each mock, grade yourself on a 1-5 scale:

| Criteria | 1 (Poor) | 3 (Adequate) | 5 (Excellent) |
|----------|----------|--------------|----------------|
| **Requirements** | Jumped to design without asking | Asked some questions | Systematically clarified FR/NFR, defined scope |
| **Estimation** | Skipped or wrong | Rough numbers, some errors | Clean calculation, numbers drove design decisions |
| **Architecture** | Missing key components | Basic diagram, some gaps | Complete diagram, clear data flow, labeled technologies |
| **API Design** | No APIs shown | Basic endpoints | RESTful with pagination, idempotency, versioning |
| **Deep Dive** | Surface-level | Explained one component well | Deep dived 2-3 components with trade-offs |
| **Trade-offs** | Not mentioned | Listed some | Analyzed trade-offs with alternatives and justification |
| **Communication** | Long silences, unclear | Mostly clear | Structured, talked through reasoning, invited feedback |

### Scoring

- **28-35:** Interview-ready. Focus on speed and polish.
- **20-27:** Good foundation. Practice weak areas.
- **Below 20:** Re-read Phase 0-3, focus on framework adherence.

## Common Follow-Up Deep Dives

Interviewers love these follow-up questions. Practice answering them:

### Scaling Questions
- "How would you handle 10x the current traffic?"
- "What if we need to expand to 3 more regions?"
- "The database is becoming a bottleneck -- what do you do?"

### Failure Scenarios
- "What happens if the cache goes down?"
- "A database shard becomes unreachable -- now what?"
- "You're getting 10x normal traffic (flash sale/viral event) -- how does the system behave?"
- "A downstream service is timing out -- what happens to user requests?"

### Cost Optimization
- "This design is too expensive -- where can we cut costs?"
- "Can we use cheaper storage tiers for older data?"
- "How would you reduce the number of servers needed?"

### Consistency vs Availability
- "A user just posted but their friend can't see it -- is that OK?"
- "What if two users try to book the same seat at the same time?"
- "How do you handle network partitions between data centers?"

## Behavioral Aspects of System Design

In senior-level interviews (L5/L6+), interviewers also assess:

### Technical Leadership

| Signal | What They're Looking For |
|--------|------------------------|
| Clear communication | You explain your reasoning at every step |
| Trade-off awareness | You don't just pick an approach -- you explain why |
| Pragmatic decisions | You don't over-engineer; you start simple and scale |
| Collaboration | You check in with the interviewer: "Does this direction make sense?" |
| Handling ambiguity | You make reasonable assumptions and state them clearly |

### STAR Stories for System Design Context

Prepare 2-3 stories about times you:

1. **Designed a system** that handled significant scale
2. **Debugged a production issue** related to scale, caching, or distributed systems
3. **Made a technical decision** with trade-offs and defended it to stakeholders

Format: Situation -> Task -> Action -> Result (with metrics if possible)

## Final Review (Day 60)

### Confidence Assessment

Go through every design in Phase 4-5 and rate your confidence:

| Rating | Meaning | Action |
|--------|---------|--------|
| Green | Can design from scratch in 45 min | Ready |
| Yellow | Know the approach, need practice on details | Do one more mock |
| Red | Struggle with core concepts | Re-study the building blocks, re-read solution |

### Review Checklist

- [ ] Can I apply RESHADED framework without thinking?
- [ ] Can I do estimation in under 5 minutes?
- [ ] Can I draw a high-level architecture for any common system?
- [ ] Can I deep-dive into caching, sharding, message queues, and fan-out?
- [ ] Can I discuss 3+ trade-offs for any design?
- [ ] Can I handle follow-up questions about scaling 10x?
- [ ] Can I explain failure scenarios and mitigations?
- [ ] Can I communicate my design clearly and confidently?

### What To Do After Day 60

1. **Keep practicing** -- do 2-3 mock interviews per week until your interview
2. **Pair with a friend** -- practice with someone who can ask follow-up questions
3. **Check the redo queue** -- revisit designs on a spaced repetition schedule
4. **Cross-train** -- combine with [DSA Zero to Hero](https://vinay199129.github.io/dsa-zth/) for complete FAANG prep
