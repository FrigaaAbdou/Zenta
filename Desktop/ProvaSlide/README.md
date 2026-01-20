# ProvaSlide — Source-Grounded Agentic Presentation Builder (Reveal.js Native)

## 0. Context (Why ProvaSlide exists)

### The reality today
Presentations are still one of the most common “work outputs” in education, startups, and professional environments. Yet the tools we use are stuck in two extremes:

- **Traditional slide tools** (PowerPoint / Google Slides) are familiar but fundamentally outdated: they treat slides like a manual drawing canvas, not a structured artifact.
- **Design-first tools** (Canva) make slides look good, but don’t solve rigorous structure, pedagogy, source constraints, or reproducibility.
- **Code-first tools** (Reveal.js / MDX / LaTeX Beamer) are powerful for developers, but not accessible for most users and still lack a true modern “editor experience.”

At the same time, generic “AI presentation generators” often produce outputs that look polished, but can:
- hallucinate facts,
- add outside knowledge you did not authorize,
- mismatch student level or curriculum constraints,
- and cannot prove where each claim came from.

**ProvaSlide** is built around a simple idea:

> A presentation should be **compiled from approved resources**, not “invented.”  
> ProvaSlide should help users build **trustworthy, level-appropriate decks quickly**, while keeping a modern editing experience.

---

## 1. Vision

Build **ProvaSlide**, a next-generation **presentation editor** that feels like a modern web builder (Canva-like UX), but with a developer-grade foundation and a major differentiator:

> A **source-grounded agentic AI** that can ingest user-provided resources (books, PDFs, articles, notes), **understand the subject only from those resources**, propose a structured plan, generate a full deck, and continuously improve/refactor slides through iterative commands — **without inventing outside knowledge**.

The output should be:
- **Beautiful and consistent** (layout engine + templates)
- **Auditable and trustworthy** (citations per bullet)
- **Editable like code** (structured deck JSON)
- **Interactive** (Reveal.js components like quizzes, hotspots, drag & drop, etc.)

---

## 2. Problem (Expanded)

### 2.1 What’s broken with current presentation creation
Creating good presentations is still:
- slow,
- repetitive,
- manual,
- and inconsistent.

Even when users know the topic, they spend most of the time:
- extracting the right points,
- structuring them pedagogically,
- formatting slides to look good,
- maintaining consistency across decks,
- and checking that the content fits the intended audience.

### 2.2 Why existing tools fail the “real” needs
Most tools optimize for **drawing**, not for **thinking** or **compiling knowledge**.

#### Traditional tools (PowerPoint/Slides)
- Slides are “pixels and shapes,” not semantic blocks
- Reuse is painful (no components, no real system)
- Versioning is not natural (not Git-friendly)
- Hard to maintain consistency at scale
- Interactivity is limited or clunky

#### Design-first tools (Canva)
- Great templates, but weak structure semantics
- Technical/academic content is harder to maintain
- Not built for traceability to sources
- Hard to enforce strict scope constraints

#### Code-first tools (Reveal/MDX/Beamer)
- Output quality is excellent
- But creation UX is too technical for most
- Lacks a modern visual editor & direct manipulation

### 2.3 The teacher scenario (primary problem statement)
A teacher needs to create lessons as slides but:
- has **very limited time**,
- must use **approved resources only** (book/article),
- must avoid outside content (student level, curriculum constraints, chosen framing),
- must ensure correctness and simplify appropriately,
- wants a workflow: **give resources → get plan → get slides → revise quickly**.

If an AI adds content beyond those resources, it creates problems:
- wrong difficulty level,
- wrong framing,
- unwanted extra context,
- credibility risk.

### 2.4 The missing tool
There is no “real” presentation builder that is:

> **Semantic + Visual + Programmable + Trustworthy (source-grounded)**

---

## 3. Solution Overview (Expanded)

**ProvaSlide** is a **web-first presentation editor** built around:
1) A **modern editor UI** (drag/drop, blocks, templates, inspector)  
2) A **Reveal.js embedded slideshow viewer** (“diapo mode” inside the app)  
3) A **deck data model** (structured JSON) powering both editor and renderer  
4) An **agentic AI pipeline** that:
   - reads user sources,
   - builds a subject model,
   - proposes a plan,
   - generates slides **ONLY from sources**,
   - asks questions when uncertain,
   - edits the deck iteratively (like Codex, but for slide JSON)  
5) Interactive slide components as first-class blocks (quiz/hotspots/etc.)

The guiding concept:

> **Presentations are compiled** from sources into a structured deck (JSON IR),  
> then rendered through Reveal.js, edited visually, and verified by citations.

---

## 4. Target Users & Use Cases

### 4.1 Primary persona: Teacher (time-constrained, accuracy-critical)
- Uploads book chapter + an article
- Sets: student grade level, duration, slide count, tone, language
- AI generates: outline + deck with citations
- Teacher reviews and adjusts
- Exports to PDF or presents directly

### 4.2 Secondary personas
- Students making structured presentations from reading assignments
- Founders: investor decks grounded in internal docs
- Engineers/researchers: technical talks grounded in papers

---

## 5. Product Principles (Non-Negotiables)

### 5.1 Source-only generation (No outside knowledge)
AI must not add facts beyond provided resources.

This must be enforced architecturally, not just by prompting:
- Every bullet/claim must carry **citations**
- If citations are missing → AI must either ask the user or mark “not found in sources”
- “Strict mode” can block export if anything is uncited

### 5.2 Auditable output
Trust layer:
- Hover any bullet → exact snippet + source location (page/paragraph)
- Coverage meter: % of content backed by sources
- Export report: citations + source usage summary

### 5.3 Plan-first workflow
AI does not jump directly to slides:
- proposes **lesson plan** first (outline + slide count + objectives)
- user approves/adjusts
- then slides are generated

### 5.4 Ask when uncertain (never guess)
If information is missing, ambiguous, conflicting, or too dense for constraints:
- AI must stop and ask targeted questions with quick options

### 5.5 Editor/Presenter separation
Reveal runtime must not break editor UX:
- embedded “diapo mode” should be isolated and stable

---

## 6. Core Product Features

## 6.1 Editor (Presentation Builder)
A modern web editor including:
- slide list sidebar (create/delete/duplicate)
- slide reorder (DnD)
- canvas with blocks (text/image/code/quote/etc.)
- inspector panel (properties: typography, spacing, theme, block settings)
- templates & layouts (consistent style)
- export (HTML + PDF print mode)
- version history (later)

### 6.1.1 Block-based approach
Slides are composed of semantic blocks/components, not raw shapes.

Examples:
- Title
- Bullet list
- Quote (with citation)
- Image (with caption)
- Code block
- Diagram placeholder
- Quiz block (later)

---

## 6.2 Embedded “Diapo Mode” Viewer (Reveal.js)
A slideshow preview panel **inside** the app (Canvas/Canva-like):
- Reveal.js runs embedded
- supports navigation, transitions, scaling
- can go fullscreen later

**Recommended technical approach:** run Reveal in an **iframe** to avoid:
- CSS conflicts
- keyboard hijacking in editor
- lifecycle issues with frequent React updates

### 6.2.1 Sync mechanism
Editor deck JSON → viewer iframe via `postMessage`:
- `DECK_UPDATE`: refresh content
- `GO_TO`: sync selected slide
- optional `GET_STATE`: current slide position

---

## 6.3 Deck Data Model (JSON “IR”)
A structured schema is the foundation for:
- editor rendering
- Reveal rendering
- AI generation/editing
- exports
- citations & verification

### 6.3.1 Conceptual schema
- **Deck**
  - `meta`: title, theme, aspect ratio, language, target level
  - `sources`: list of uploaded resources + metadata
  - `slides[]`
- **Slide**
  - `type`: lecture / definition / timeline / recap / quiz…
  - `layout`: template id
  - `blocks[]`
- **Block**
  - `type`: text / image / code / quiz / hotspots…
  - `props`: content + settings
  - `layoutHints`: position/size or grid slots
  - `citations[]` (when factual)

### 6.3.2 Citations
Each bullet/claim should include:
- `sourceId`
- `location` (page number, paragraph id, section)
- `snippet` excerpt (evidence)

This enables:
- hover-to-verify
- strict-mode enforcement
- scope filtering (“only chapter 3”)

---

## 7. AI System (Agentic + Grounded + Iterative)

## 7.1 AI Goals
AI acts like a **presentation compiler**:
- transforms provided sources into a structured deck JSON
- always provides evidence
- never invents
- can iteratively refactor slides as user requests

## 7.2 AI Pipeline (Stages)

### Stage A — Ingestion & Indexing
- parse PDFs/articles/notes
- chunk by page/paragraph/section
- build retrieval index
- extract metadata (title, headings)
- store anchors for citation (page/offset)

### Stage B — Subject Understanding (From Sources Only)
- identify key concepts, definitions, relationships
- extract:
  - terminology list
  - important claims
  - key examples
  - sequences/timelines
- estimate difficulty/reading level

### Stage C — Pedagogical Planning (Teacher Mode)
Inputs:
- student level
- duration (e.g., 45 min)
- slide count target (e.g., 10–15)
- tone + language
- strictness (strict citations mode)
- source scope (optional: chapter/pages)

Outputs (for user approval):
- learning objectives
- deck outline (sections → slide titles)
- recommended slide distribution/pacing
- “must include” vs “optional”

### Stage D — Slide Drafting (Grounded Generation)
For each planned slide:
- retrieve relevant chunks
- generate blocks (title + bullets + examples)
- attach citations to each bullet
- enforce density rules (word count + reading level)

### Stage E — Layout Selection + Layout Engine
LLM should not place pixels.
- LLM chooses: template id + slot content + importance weights
- Deterministic layout engine enforces:
  - typography scale
  - margins and spacing rhythm
  - overflow rules (split slide or condense)

### Stage F — Verification / Guardrails
Before presenting output:
- citation coverage validator (no missing citations in strict mode)
- scope validator (citations only from selected sources/pages)
- level validator (reading level, jargon thresholds)
- contradiction detection (if sources conflict)
- density validator (time/slide constraints)

If fails → AI asks the user questions.

---

## 8. “Ask When Uncertain” System

### 8.1 When to ask
- missing definition/claim in sources
- ambiguous audience level
- ambiguous scope (which chapter/pages?)
- conflicting sources
- too dense for requested slides/time

### 8.2 Question format (structured)
Use “clarification cards” instead of only chat:
- “I need 1 choice to continue”
- multiple-choice buttons
- include evidence snippets + locations

Example:
> I can’t find a clear definition of **X** in your sources.  
> Closest mentions: p12, p18 (no definition).  
> Choose how to proceed:
- Use only mentions (no definition)
- Ask me to upload the definition page
- Treat as prerequisite (no explanation)
- Allow external knowledge (off by default)

---

## 9. Interactive Components (Future Differentiator)

Reveal supports interactive HTML/JS slides → add teaching blocks:

### 9.1 Best interactive blocks for teachers
1) **Quiz (MCQ)** with reveal-answer + explanation (grounded + cited)
2) **Flashcards** (front/back definitions)
3) **Hotspots on image** (click area → tooltip explanation)
4) **Drag & drop matching** (term ↔ definition, order steps)
5) **Code block** (editable; runnable later)

### 9.2 Guardrails for interactivity
- answers/explanations require citations
- if quiz can’t be supported by sources → ask teacher

---

## 10. Platform Choice: Web vs Electron

### 10.1 Recommended approach
**Web-first** to ship faster and grow:
- instant access + easy sharing
- simplest deployment
- Reveal.js is web-native

### 10.2 Desktop later (optional)
Electron/Tauri can be added later for:
- offline-first
- local filesystem projects (open/save)
- local PDF/video export automation

---

## 11. MVP Scope (First Shippable Version)

### 11.1 Editor MVP
- create/delete/duplicate slides
- reorder slides (DnD)
- basic blocks: title, text, bullets, image, code
- theme presets (few)
- embedded diapo viewer (iframe Reveal)
- export HTML
- PDF via Reveal print mode

### 11.2 AI MVP (Grounded v1)
- upload resources + index
- ask user constraints (level, duration, #slides, strict mode)
- generate outline/plan (approval step)
- generate deck with citations
- slide-level actions:
  - simplify
  - expand
  - regenerate from sources
  - (later) convert slide to quiz

### 11.3 Trust layer MVP
- citation hover UI (show snippet + location)
- strict mode toggle (uncited content blocked)
- uncertainty questions when needed

---

## 12. Roadmap (Phased)

### Phase 1 — Builder + Reveal Embedded + Export
- solid editor UX
- stable deck schema
- templates/themes

### Phase 2 — Grounded AI deck generation + plan-first
- citations per bullet
- strict mode
- slide-level refinements

### Phase 3 — Agentic editing + quality checks
- deck linting (density, level, jargon)
- contradiction handling
- version history

### Phase 4 — Interactive teaching blocks
- quiz, flashcards, hotspots
- presenter controls overlay for teachers

### Phase 5 — Collaboration / classroom features (optional)
- sharing + permissions
- student join mode / polls

---

## 13. Key Technical Architecture

### 13.1 Core modules
- **Editor App (React + TS)**
  - deck store (Zustand/Redux)
  - block renderer + inspector
  - dnd-kit for slide reorder (later block move)

- **Reveal Renderer (iframe)**
  - deck JSON → Reveal `<section>` slides
  - postMessage commands: update deck / go to slide

- **AI Services**
  - ingestion + chunking
  - retrieval index
  - planner
  - slide generator
  - verifiers (citations, scope, level, density)

### 13.2 Deck JSON is the moat
- AI writes it
- editor edits it
- renderer presents it
- exports compile from it

It’s the “intermediate representation” of presentations.

---

## 14. Quality Metrics (What “Good” Means)

### Trust
- citation coverage (% bullets with citations)
- scope violations (0 in strict mode)
- uncertainty questions rate (expected early; decreases with UX improvements)

### Pedagogy
- reading level match
- slide density vs time
- teacher edit time saved (target: 70–90%)

### Product
- time-to-first-deck
- export success rate
- retention (weekly reuse)

---

## 15. Differentiation & Moat

1) **Grounded-by-design** (citations + strict mode + scope enforcement)
2) **Plan-first pedagogy** (teacher workflow)
3) **Deck as code (JSON IR)** enabling agentic refactors
4) **Reveal-native interactivity** (quizzes, hotspots, drag-drop)
5) **Auditable output** (every claim traceable)

---

## 16. Open Decisions (Later)
- content format: JSON blocks vs Markdown per slide (or hybrid)
- local vs cloud indexing (privacy/enterprise)
- PDF/video export automation (server vs desktop)
- collaboration model (real-time vs async)

---

# ProvaSlide — Minimal Premium (Notion-ish) Palette — Integration Guide

## Palette
- **Background:** `#FFFFFF`
- **Surface:** `#F6F7F9`
- **Border:** `#E5E7EB`
- **Text:** `#0F172A`
- **Muted:** `#64748B`
- **Primary:** `#111827`
- **Accent (indigo):** `#4F46E5`
- **Accent 2 (rose):** `#FB7185`

---

## 1) Design Tokens (CSS Variables)

Create `src/styles/tokens.css`:

```css
:root {
  --bg: #FFFFFF;
  --surface: #F6F7F9;
  --border: #E5E7EB;

  --text: #0F172A;
  --muted: #64748B;

  --primary: #111827;
  --accent: #4F46E5;
  --accent2: #FB7185;

  --radius: 14px;
  --shadow-sm: 0 1px 2px rgba(15, 23, 42, 0.06);
  --shadow-md: 0 8px 24px rgba(15, 23, 42, 0.10);
}