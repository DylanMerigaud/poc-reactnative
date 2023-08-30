import { nanoid } from "nanoid";
import { Job } from ".";
import { faker } from "@faker-js/faker";

export const createMockJob = (id?: string): Job => ({
  createdAt: faker.date.past().toISOString(),
  title: faker.person.jobTitle(),
  type: faker.person.jobType(),
  company: faker.company.name(),
  area: faker.location.city(),
  descriptor: faker.lorem.paragraph(),
  image: faker.image.urlLoremFlickr({ category: "business" }),
  dayRate: faker.number.int({ min: 100, max: 1000 }),
  id: id ?? nanoid(),
});

export const mockedJobsDataSet = Array.from({ length: 100 }, createMockJob);
