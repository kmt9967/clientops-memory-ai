import { z } from "zod";

export const memoryExtractionSchema = z.object({
  memories: z.array(z.object({
    type: z.enum(["episodic", "semantic", "decision", "commitment"]),
    title: z.string().min(3),
    content: z.string().min(3),
    confidence: z.number().min(0).max(1),
    relation: z.enum(["new", "reinforces", "contradicts", "supersedes"]),
    relatedMemoryId: z.string().optional(),
  })),
});
