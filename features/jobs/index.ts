import { z } from "zod";

export const JobSchema = z.object({
  createdAt: z.string(),
  title: z.string(),
  type: z.string(),
  company: z.string(),
  area: z.string(),
  descriptor: z.string(),
  image: z.string(),
  id: z.string(),
  dayRate: z.number(),
});

export type Job = z.infer<typeof JobSchema>;
