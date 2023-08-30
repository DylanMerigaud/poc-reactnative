import { faker } from "@faker-js/faker";
import { z } from "zod";

export const JobSchema = z.object({
  createdAt: z.string(),
  title: z.string(),
  type: z.string(),
  area: z.string(),
  descriptor: z.string(),
  image: z.string(),
  id: z.string(),
  dayRate: z.number(),
});

export type Job = z.infer<typeof JobSchema>;

export const createMockJob = (id: string): Job => ({
  createdAt: faker.date.past().toISOString(),
  title: faker.person.jobTitle(),
  type: faker.person.jobType(),
  area: faker.location.city(),
  descriptor: faker.lorem.paragraph(),
  image: faker.image.url(),
  dayRate: faker.number.int({ min: 100, max: 1000 }),
  id,
});
