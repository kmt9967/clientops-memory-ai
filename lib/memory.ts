export type MemoryType = "episodic" | "semantic" | "decision" | "commitment";
export type MemoryStatus = "active" | "superseded" | "completed" | "inaccurate";

export type Memory = {
  id: string;
  type: MemoryType;
  title: string;
  content: string;
  actor: string;
  source: string;
  confidence: number;
  status: MemoryStatus;
  createdAt: string;
  metadata?: Record<string, string>;
  supersedes?: string;
};

export type RetrievalResult = Memory & { relevance: number; relationship: string };

const stopwords = new Set(["the", "a", "an", "and", "or", "to", "for", "is", "it", "we", "what", "did", "about", "new", "same", "but"]);

export function tokenize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((word) => word.length > 2 && !stopwords.has(word));
}

export function classifyMemory(content: string): MemoryType {
  const text = content.toLowerCase();
  if (/\b(decide|approved?|instead|don['’]?t add|use the same process)\b/.test(text)) return "decision";
  if (/\b(todo|task|follow up|due|tomorrow|owner|commit)\b/.test(text)) return "commitment";
  if (/\b(prefers?|always|standing|assigned|service|rule)\b/.test(text)) return "semantic";
  return "episodic";
}

export function rankMemories(query: string, memories: Memory[]): RetrievalResult[] {
  const queryTokens = new Set(tokenize(query));
  return memories
    .filter((memory) => memory.status !== "inaccurate")
    .map((memory) => {
      const memoryTokens = new Set(tokenize(`${memory.title} ${memory.content}`));
      const overlap = [...queryTokens].filter((token) => memoryTokens.has(token)).length;
      const semanticBoost = /doesn['’]?t pick up|unanswered|voicemail/i.test(query) && /unanswered|voicemail/i.test(memory.content) ? 0.42 : 0;
      const roofingBoost = /roofing|angi|lead|campaign/i.test(query) && /roofing|angi|lead|campaign/i.test(memory.content) ? 0.3 : 0;
      const statusBoost = memory.status === "active" ? 0.08 : -0.12;
      return { ...memory, relevance: Math.min(0.99, 0.25 + overlap * 0.12 + semanticBoost + roofingBoost + statusBoost), relationship: memory.status === "superseded" ? "Historical context" : "Supports answer" };
    })
    .filter((memory) => memory.relevance >= 0.4)
    .sort((a, b) => b.relevance - a.relevance);
}

export function detectConflict(candidate: Memory, memories: Memory[]) {
  const related = rankMemories(candidate.content, memories).filter((memory) => memory.type === candidate.type && memory.id !== candidate.id);
  const negationMismatch = related.find((memory) => /\b(don['’]?t|not|never|paused)\b/i.test(candidate.content) !== /\b(don['’]?t|not|never|paused)\b/i.test(memory.content));
  return negationMismatch ?? null;
}

export function supersedeDecision(memories: Memory[], oldId: string, replacement: Memory) {
  return memories.map((memory) => memory.id === oldId ? { ...memory, status: "superseded" as const } : memory).concat({ ...replacement, supersedes: oldId, status: "active" });
}

export function updateTaskStatus(memory: Memory, status: "active" | "completed") {
  if (memory.type !== "commitment") throw new Error("Only commitments have task state");
  return { ...memory, status };
}

export const initialDemoMemories: Memory[] = [
  { id: "m-001", type: "semantic", title: "Lead routing owner", content: "New Angi roofing leads are assigned to Israel.", actor: "Operations", source: "Demo onboarding note", confidence: 0.98, status: "active", createdAt: "2026-08-12T09:12:00Z" },
  { id: "m-002", type: "semantic", title: "Qualified lead follower", content: "Matt follows qualified roofing leads.", actor: "Client", source: "Demo kickoff", confidence: 0.96, status: "active", createdAt: "2026-08-12T09:14:00Z" },
  { id: "m-003", type: "decision", title: "Angi outreach sequence", content: "Initial Angi outreach includes SMS and email; unanswered calls receive a voicemail and next-day follow-up.", actor: "Client", source: "Demo kickoff", confidence: 0.99, status: "active", createdAt: "2026-08-12T09:18:00Z" },
  { id: "m-004", type: "episodic", title: "Automation integration paused", content: "The previous automation integration was paused while the team reviewed lead attribution.", actor: "Israel", source: "Operations update", confidence: 0.91, status: "active", createdAt: "2026-08-13T15:40:00Z" },
  { id: "m-005", type: "semantic", title: "Update preference", content: "The client prefers concise operational updates with clear owners and next steps.", actor: "Client", source: "Client preference", confidence: 0.95, status: "active", createdAt: "2026-08-14T11:22:00Z" },
  { id: "m-006", type: "commitment", title: "Review paused integration", content: "Israel will review the paused automation integration after lead attribution is verified.", actor: "Israel", source: "Operations update", confidence: 0.89, status: "active", createdAt: "2026-08-14T11:28:00Z", metadata: { due: "Aug 19", owner: "Israel" } },
];

export function extractInstructionMemories(input: string): Memory[] {
  const now = new Date().toISOString();
  const seed = Date.now().toString(36);
  if (/don['’]?t add matt/i.test(input)) {
    return [{ id: `m-${seed}`, type: "decision", title: "New campaign follower exception", content: "Use the established Angi lead workflow for the new campaign, but do not add Matt as a follower.", actor: "You", source: "Agent chat", confidence: 0.99, status: "active", createdAt: now, supersedes: "m-002" }];
  }
  if (/angi/i.test(input) && /israel/i.test(input)) {
    return [
      { id: `m-${seed}-a`, type: "semantic", title: "Angi lead assignment", content: "Assign new Angi leads to Israel.", actor: "You", source: "Agent chat", confidence: 0.99, status: "active", createdAt: now },
      { id: `m-${seed}-b`, type: "decision", title: "Angi follower rule", content: "Add Matt as a follower on new Angi leads.", actor: "You", source: "Agent chat", confidence: 0.99, status: "active", createdAt: now },
      { id: `m-${seed}-c`, type: "commitment", title: "Unanswered call sequence", content: "If the first call is unanswered, send a voicemail and follow up the next day.", actor: "You", source: "Agent chat", confidence: 0.98, status: "active", createdAt: now, metadata: { cadence: "next day", owner: "Israel" } },
    ];
  }
  return [{ id: `m-${seed}`, type: classifyMemory(input), title: "Captured instruction", content: input, actor: "You", source: "Agent chat", confidence: 0.82, status: "active", createdAt: now }];
}
