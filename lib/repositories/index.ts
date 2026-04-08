import type { DocRepository } from "./doc-repository";
import { mockDocRepository } from "./mock-doc-repository";
import { redisDocRepository } from "./redis-doc-repository";

export const docRepository: DocRepository =
  process.env.USE_MOCK_REPOSITORY === "true"
    ? mockDocRepository
    : redisDocRepository;
