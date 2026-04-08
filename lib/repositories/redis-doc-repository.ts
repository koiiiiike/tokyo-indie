import { Redis } from "@upstash/redis";
import type { DocRepository, JsonDoc, JsonDocListItem, JsonDocUpdateInput } from "./doc-repository";

const DOCS_SET_KEY = "json_editor:docs";
const docKey = (id: string) => `json_editor:doc:${id}`;

type DocHash = {
  title: string;
  body: string;
  updatedAt: string;
};

function makeRedis(): Redis {
  return new Redis({
    url: process.env.REDIS_URL as string,
    token: process.env.REDIS_TOKEN as string
  });
}

export const redisDocRepository: DocRepository = {
  async listDocs(): Promise<JsonDocListItem[]> {
    const redis = makeRedis();
    const ids = await redis.smembers(DOCS_SET_KEY);
    if (ids.length === 0) return [];

    const pipeline = redis.pipeline();
    for (const id of ids) {
      pipeline.hgetall(docKey(id));
    }
    const results = await pipeline.exec<(DocHash | null)[]>();

    const items: JsonDocListItem[] = [];
    for (let i = 0; i < ids.length; i++) {
      const hash = results[i];
      if (!hash) continue;
      items.push({ id: ids[i], title: hash.title, updatedAt: hash.updatedAt });
    }

    return items.sort((a, b) => a.title.localeCompare(b.title, "ja"));
  },

  async getDoc(id: string): Promise<JsonDoc | null> {
    const redis = makeRedis();
    const hash = await redis.hgetall<DocHash>(docKey(id));
    if (!hash) return null;

    return {
      id,
      title: hash.title,
      body: JSON.parse(hash.body) as unknown,
      updatedAt: hash.updatedAt
    };
  },

  async updateDoc(id: string, input: JsonDocUpdateInput): Promise<JsonDoc | null> {
    const redis = makeRedis();
    const exists = await redis.sismember(DOCS_SET_KEY, id);
    if (!exists) return null;

    const updatedAt = new Date().toISOString();
    const hash: DocHash = {
      title: input.title,
      body: JSON.stringify(input.body),
      updatedAt
    };

    await redis.hset(docKey(id), hash);

    return {
      id,
      title: input.title,
      body: input.body,
      updatedAt
    };
  }
};
