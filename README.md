# Zathura — AI Insurance Claims Council

Zathura is a multi-agent AI system that processes insurance claims using a council of three language models. Each agent debates the claim from a different angle, then a synthesis step produces a structured decision with full reasoning, payout calculation, and a customer-facing message.

---

## What it does (in plain English)

When you submit an insurance claim, three AI agents powered by your local Ollama models each independently analyze it, argue with each other, and then reach a consensus. The result is:

- **Claim status**: Approved / Rejected / Pending
- **Estimated payout** with deductible applied
- **Confidence score** explaining how certain the decision is
- **Fraud flags** if anything looks suspicious
- **Step-by-step reasoning** for the decision
- **Customer message** ready to send

---

## How to run

### Prerequisites

1. **[Ollama](https://ollama.com)** installed and running locally
2. **Node.js 18+**

### Install models (first time)

```bash
ollama pull qwen2.5:7b          # Strategist — reasoning
ollama pull qwen2.5vl:latest    # Critic — vision + analysis
ollama pull llama3.2-vision:latest   # Executor — vision + efficiency
```

### Start the app

```bash
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

Open **http://127.0.0.1:5173** in your browser.

---

## The Three Agents

| Agent | Model | Role |
|---|---|---|
| **Strategist** | `qwen2.5:7b` | Designs the claim processing workflow. Proposes a 6-step pipeline. |
| **Critic** | `qwen2.5vl:latest` | Challenges the Strategist. Hunts for fraud indicators and edge cases. |
| **Executor** | `llama3.2-vision:latest` | Focuses on efficiency and operational feasibility. Assigns models to steps. |

All three are auto-assigned from your installed Ollama models — nothing is hardcoded. If you have different models installed, the system picks distinct ones automatically.

---

## Claim Input Fields

| Field | Description |
|---|---|
| **Claim ID** | Unique identifier (e.g. C-001) |
| **Description** | Free-text description of the incident |
| **Policy Type** | `Comprehensive` or `Third-Party` |
| **Claim Amount** | Amount claimed in ₹ |
| **Past Claims** | Number of previous claims by this customer |
| **Documents** | `Complete`, `Partial`, or `Missing` |
| **Image URL** | Optional URL to a damage photo — analyzed by the vision model |

---

## Policy Rules (built-in, applied by AI)

| Rule | Logic |
|---|---|
| Coverage | Comprehensive → covers own damage. Third-Party → does **not** cover own damage. |
| Fraud: past claims | More than 3 past claims raises a flag. |
| Fraud: amount vs. damage | High claim amount for a minor description raises a flag. |
| Fraud: documents | Missing documents + suspicious description → rejected. |

---

## Damage & Payout Logic

| Severity | Description examples | Payout % |
|---|---|---|
| **Minor** | Scratch, dent, bumper damage | 70–90% |
| **Moderate** | Panel damage, broken lights, smashed trunk | 50–70% |
| **Major** | Engine damage, total loss, undriveable vehicle | 30–50% |

**Deductible**: ₹3,000 is subtracted from every approved claim.

**Formula**: `Final Payout = (Payout% × Claim Amount) − ₹3,000`

---

## Confidence Score

| Band | Range | Meaning |
|---|---|---|
| **High** | 0.80–0.95 | Clear case, complete data, no flags |
| **Medium** | 0.60–0.80 | Partial documents or borderline fraud risk |
| **Low** | < 0.60 | Missing data, multiple fraud indicators |

---

## How a Debate Works (Step by Step)

### Round 1 — Parallel Assessment
All three agents receive the claim simultaneously and respond in parallel:
- Strategist proposes a workflow pipeline (e.g., "6-step sequential + parallel fraud/coverage check")
- Critic identifies risks, fraud signals, and edge cases
- Executor maps each step to an available model and estimates processing time

### Round 2 — Cross-Examination (Sequential)
1. Critic raises a specific **OBJECTION** to the Strategist's proposal
2. Strategist **RESPONDS** and revises the pipeline if the objection is valid
3. Executor finalizes the operational plan

### Vision Assessment (if image provided)
If the claim includes an image URL, the vision model (qwen2.5vl or llama3.2-vision) analyzes the image and checks whether:
- The damage visible in the image matches the claim description
- The severity is consistent with the claimed amount

### Synthesis
The strongest text model (Strategist) produces a single JSON object containing:
- The full pipeline workflow (nodes, parallel groups, conditions)
- The `claimDecision` with status, payout, confidence, reason, fraud flags, and customer message

If the LLM synthesis fails or Ollama is offline, a deterministic rule-based fallback computes the decision using the same policy rules — no data is fabricated.

---

## The Pipeline Tab

After the council reaches consensus, the **Pipeline tab** shows the visual workflow the agents agreed on. Click **▶ Execute** to run the claim through each node and see what each step produces:

| Node | What it does |
|---|---|
| **Intake** | Extracts claim ID, policy type, amount, document status |
| **Coverage Check** | Validates policy coverage for the claimed damage |
| **Fraud Detection** | Scores fraud risk (0–100) based on flags |
| **Vision AI** | Assesses image damage severity and consistency |
| **Decision Gate** | Branches to Approved / Pending / Rejected |
| **Payout Engine** | Calculates gross payout, applies deductible |
| **Confidence** | Bands the confidence score as HIGH / MEDIUM / LOW |
| **Communication** | Generates the customer message |
| **Output** | Compiles the final result |

Each node uses the decision already computed by the AI council — no additional LLM calls are made during pipeline execution.

---

## Example Claims (pre-loaded)

| ID | Scenario | Expected outcome |
|---|---|---|
| **C-001** | Minor fender bender, comprehensive, docs complete | Approved |
| **C-002** | Own-damage claim on Third-Party policy | Rejected (coverage invalid) |
| **C-003** | 5 past claims, ₹800,000, partial docs | Rejected (fraud flags) |
| **C-004** | Missing documents | Pending |
| **C-005** | Severe collision with image (fine car photo) | Vision model detects mismatch |

---

## Viewing the Full Reasoning

After the council finishes:
- Click **"View Full Reasoning ↗"** in the **CONSENSUS** node
- Or click **"Full Dialogue ↗"** on any agent node

This opens a side panel with:
- **Full Debate tab** — every message from every agent, in full, grouped by round
- **Decision Reasoning tab** — step-by-step breakdown of how the decision was reached (coverage check → fraud check → damage assessment → payout calculation → confidence → final decision)

---

## Settings

Open the **⚙ Settings** drawer (top-right) to configure:

| Setting | Description |
|---|---|
| OpenRouter API Key | Use cloud models via OpenRouter instead of / in addition to Ollama |
| Debate Rounds | 1–4 rounds of cross-examination between agents |
| Round Timeout | Per-round timeout in seconds (default 60s) |
| Mock Fallback | If enabled, falls back to rule-based decision when Ollama is unavailable |
| Auto-layout | Automatically builds the pipeline graph after the council finishes |
| Animation Speed | Slow / Normal / Fast for the debate animations |

---

## Architecture

```
src/
├── components/
│   ├── council/          # Agent nodes, debate feed, consensus node, dialogue panel
│   ├── pipeline/         # Pipeline canvas and pipeline nodes
│   ├── form/             # Claim input form
│   ├── models/           # Model registry (auto-detects from Ollama)
│   ├── results/          # Result card component
│   ├── layout/           # Shell, header, left panel
│   └── settings/         # Settings drawer
├── council/
│   ├── runDebate.ts      # Core multi-agent debate orchestration
│   ├── prompts.ts        # All agent system prompts
│   └── fallbackConsensus.ts  # Rule-based fallback decision
├── stores/
│   ├── councilStore.ts   # Debate state, agent statuses, results
│   ├── modelStore.ts     # Auto-detects Ollama models, assigns to agents
│   ├── claimsStore.ts    # Claims history and stats
│   ├── workflowStore.ts  # Pipeline graph state and execution
│   └── settingsStore.ts  # User settings with localStorage persistence
├── pipeline/
│   ├── buildPipelineGraph.ts  # Converts consensus nodes to ReactFlow graph
│   └── executeAll.ts          # Runs claim through each pipeline node
├── data/
│   └── exampleClaims.ts  # 5 pre-loaded example claims
└── types/
    └── index.ts           # ClaimInput, ConsensusResult, ClaimDecision, etc.
```

---

## Key Design Decisions

- **No hardcoded models**: The system queries `http://localhost:11434/api/tags` at startup and auto-assigns models based on inferred capability tags (reasoning, vision, analysis, efficiency).
- **Deterministic fallback**: Every claim always gets a decision — even if all LLMs fail. The fallback uses the same policy rules the LLMs follow.
- **Separation of debate and pipeline**: The council *designs* the workflow; the pipeline *executes* it. These are two separate phases so you can inspect and modify the workflow before running it.
- **Vision model for image claims**: When an image URL is provided, the vision-capable model (qwen2.5vl or llama3.2-vision) analyzes the image and cross-checks it against the description. This catches text-image mismatches (a common fraud pattern).

---

## Research Foundation

Zathura is built on ideas from the following papers. Each one addresses a specific design decision in the system.

---

### 1. Du et al. — *Improving Factuality and Reasoning in Language Models through Multiagent Debate* (ICML 2024)
**arXiv: 2305.14325**

The foundational paper for the council architecture. It shows that when multiple LLM instances independently propose answers and then critique each other's responses over several rounds, factual accuracy and reasoning quality improve significantly compared to a single model queried once. Zathura's three-agent (Strategist → Critic → Executor) debate loop is a direct implementation of this multi-agent debate (MAD) protocol. The paper specifically demonstrates that disagreement between agents is a feature, not a bug — the Critic's objections in Round 2 often catch errors the Strategist misses.

---

### 2. Zhou & Chen — *A-HMAD: Adaptive Heterogeneous Multi-Agent Debate* (2025)

Extends Du et al. by addressing a key weakness: the original MAD paper uses *identical* models for all agents, which limits diversity of reasoning. A-HMAD shows that assigning agents with *different* model backbones (heterogeneous) produces richer debate, more varied perspectives, and better final decisions — especially on ambiguous or edge-case inputs. This is exactly why Zathura assigns three distinct Ollama models (qwen2.5:7b, qwen2.5vl, llama3.2-vision) to the Strategist, Critic, and Executor respectively, rather than using the same model three times.

---

### 3. Wei et al. — *Chain-of-Thought Prompting Elicits Reasoning in Large Language Models* (NeurIPS 2022)
**arXiv: 2201.11903**

Introduces Chain-of-Thought (CoT) prompting — instructing the model to reason step-by-step before giving an answer. Zathura's agent system prompts follow this pattern: each agent is required to structure its output (PROPOSAL → STEPS → CRITICAL for the Strategist; RISK → GAPS → VERDICT for the Critic) rather than producing a flat answer. The synthesis prompt similarly asks the LLM to produce a structured JSON output derived from the full transcript, which mirrors CoT's intermediate reasoning trace approach.

---

### 4. Yao et al. — *ReAct: Synergizing Reasoning and Acting in Language Models* (ICLR 2023)
**arXiv: 2210.03629**

Proposes the ReAct framework where LLMs interleave reasoning steps ("think") with action steps ("act") to solve multi-step tasks. Zathura's pipeline tab embodies this: the council debate is the *reasoning* phase, and pipeline execution (Intake → Coverage → Fraud → Vision → Gate → Payout → Output) is the *acting* phase. Keeping these two phases separate — rather than doing everything in one prompt — is directly inspired by ReAct's insight that explicit reasoning traces lead to more reliable downstream actions.

---

### 5. Li et al. — *Camel: Communicative Agents for "Mind" Exploration of Large Language Model Society* (NeurIPS 2023)
**arXiv: 2303.17760**

Introduces role-playing between agents, where each LLM is given a specific persona and role description that shapes how it interprets and responds to a shared task. Zathura's three agents each have a distinct persona (Strategist = "cold workflow architect", Critic = "paranoid fraud expert", Executor = "efficiency-obsessed pragmatist") defined in `prompts.ts`. CAMEL shows that enforcing role boundaries prevents agents from converging too quickly and ensures each perspective remains genuinely distinct throughout the debate.

---

### 6. Wu et al. — *AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation* (2023)
**arXiv: 2308.08155**

AutoGen demonstrates a general framework for orchestrating conversations between multiple LLM agents, where agents can take turns, critique each other, and produce structured outputs collaboratively. Zathura's `runDebate.ts` orchestration — parallel Round 1, sequential Round 2 cross-examination, and a dedicated synthesis step — is conceptually aligned with AutoGen's conversation patterns. The key difference is that Zathura is domain-specific (insurance claims) and uses local Ollama models rather than cloud APIs.

---

### 7. Radford et al. / OpenAI — *Learning Transferable Visual Models From Natural Language Supervision* (ICML 2021) + Vision-Language Models generally
**CLIP, LLaVA, Qwen-VL lineage**

The vision assessment component of Zathura (damage image analysis by qwen2.5vl and llama3.2-vision) builds on the broader lineage of vision-language models that can jointly reason over text and images. When a claim includes an image URL, the vision model receives the image alongside the claim description and checks for consistency — a key fraud-detection signal. This multimodal grounding capability (trained on image-text pairs) is what makes text-image mismatch detection possible without a separate computer-vision pipeline.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, custom CSS animations |
| State | Zustand |
| Graph/Canvas | ReactFlow (@xyflow/react) |
| AI Models | Ollama (local) + optional OpenRouter (cloud) |
| Animations | Framer Motion, Canvas API (starfield) |
