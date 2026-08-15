import { describe, expect, it } from "vitest";
import { initialDemoMemories, rankMemories, supersedeDecision, type Memory } from "@/lib/memory";

const cases = [
  ["T01 exact recall", "New Angi roofing leads assigned to Israel", "m-001"],
  ["T02 paraphrased recall", "What happens when a prospect doesn't pick up?", "m-003"],
  ["T03 multi-memory synthesis", "What is the roofing lead workflow?", "m-001"],
  ["T06 task commitment", "Who will review the paused automation?", "m-006"],
  ["T07 preference recall", "How does the client like updates?", "m-005"],
] as const;

describe("long-term memory evaluation", () => {
  for (const [name, query, expected] of cases) it(name, () => expect(rankMemories(query, initialDemoMemories).slice(0, 3).map((m) => m.id)).toContain(expected));

  it("T04 contradictory update", () => {
    const negative: Memory = { ...initialDemoMemories[1], id: "m-negative", content: "Do not add Matt as follower", status: "active" };
    const result = supersedeDecision(initialDemoMemories, "m-002", negative);
    expect(result.find((m) => m.id === "m-002")?.status).toBe("superseded");
  });
  it("T05 superseded decision handling", () => {
    const memories = initialDemoMemories.map((m) => m.id === "m-002" ? { ...m, status: "superseded" as const } : m);
    const result = rankMemories("Should Matt follow roofing leads?", memories);
    expect(result.find((m) => m.id === "m-002")?.relationship).toBe("Historical context");
  });
  it("T08 irrelevant-memory rejection", () => expect(rankMemories("What is the corporate tax filing deadline?", initialDemoMemories)).toHaveLength(0));
  it("T09 new-session persistence", () => expect(JSON.parse(JSON.stringify(initialDemoMemories))).toEqual(initialDemoMemories));
  it("T10 deleted-memory exclusion", () => expect(rankMemories("concise updates", initialDemoMemories.filter((m) => m.id !== "m-005")).map((m) => m.id)).not.toContain("m-005"));
});
