import { z } from "zod";

export const JobSchema = z.object({
  createdAt: z.string(),
  title: z.string(),
  type: z.string(),
  area: z.string(),
  descriptor: z.string(),
  image: z.string(),
  id: z.string(),
});

export type Job = z.infer<typeof JobSchema>;
