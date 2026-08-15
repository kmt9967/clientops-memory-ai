import { describe, expect, it } from "vitest";
import { classifyMemory, detectConflict, extractInstructionMemories, initialDemoMemories, rankMemories, supersedeDecision, updateTaskStatus } from "@/lib/memory";
import { memoryExtractionSchema } from "@/lib/schemas";

describe("memory classifier", () => {
  it("classifies decisions, facts, tasks, and events", () => {
    expect(classifyMemory("We decided to use email instead")).toBe("decision");
    expect(classifyMemory("The client prefers concise updates")).toBe("semantic");
    expect(classifyMemory("Follow up tomorrow")).toBe("commitment");
    expect(classifyMemory("We met on Tuesday")).toBe("episodic");
  });
});

describe("memory extraction schema", () => {
  it("accepts bounded confidence and explicit relation", () => {
    expect(memoryExtractionSchema.parse({ memories: [{ type: "decision", title: "Follower rule", content: "Add Matt", confidence: .9, relation: "new" }] }).memories).toHaveLength(1);
    expect(() => memoryExtractionSchema.parse({ memories: [{ type: "fact", title: "x", content: "x", confidence: 2, relation: "new" }] })).toThrow();
  });
});

describe("conflicts and superseding", () => {
  it("detects negated related guidance", () => {
    const candidate = { ...initialDemoMemories[1], id: "new", content: "Do not add Matt to roofing leads" };
    expect(detectConflict(candidate, initialDemoMemories)?.id).toBe("m-002");
  });
  it("preserves history and activates replacement", () => {
    const replacement = extractInstructionMemories("Use the same process, but don't add Matt")[0];
    const result = supersedeDecision(initialDemoMemories, "m-002", replacement);
    expect(result.find((m) => m.id === "m-002")?.status).toBe("superseded");
    expect(result.at(-1)?.supersedes).toBe("m-002");
  });
});

describe("retrieval and task state", () => {
  it("retrieves paraphrased unanswered-call memory", () => {
    const results = rankMemories("What happens when a roofing prospect doesn't pick up?", initialDemoMemories);
    expect(results[0].id).toBe("m-003");
    expect(results[0].relevance).toBeGreaterThan(.8);
  });
  it("completes commitments and rejects invalid task updates", () => {
    expect(updateTaskStatus(initialDemoMemories[5], "completed").status).toBe("completed");
    expect(() => updateTaskStatus(initialDemoMemories[0], "completed")).toThrow();
  });
});
