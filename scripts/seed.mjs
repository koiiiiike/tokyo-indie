import { Redis } from "@upstash/redis";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");

// .env.local を手動パース
const env = Object.fromEntries(
  readFileSync(envPath, "utf-8")
    .split("\n")
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => line.split("=").map((s) => s.trim().replace(/^"|"$/g, "")))
    .filter(([k]) => k)
);

const redis = new Redis({ url: env.REDIS_URL, token: env.REDIS_TOKEN });

const docs = [
  {
    id: "customer-config",
    title: "顧客設定",
    body: { featureA: true, limit: 100, tags: ["alpha", "vip"] },
    updatedAt: "2026-04-08T00:00:00.000Z"
  },
  {
    id: "ui-settings",
    title: "UI設定",
    body: { theme: "light", compact: false, locale: "ja-JP" },
    updatedAt: "2026-04-08T00:00:00.000Z"
  },
  {
    id: "job-flags",
    title: "バッチフラグ",
    body: { dryRun: false, retries: 3, notify: true },
    updatedAt: "2026-04-08T00:00:00.000Z"
  }
];

const pipeline = redis.pipeline();
for (const doc of docs) {
  pipeline.sadd("json_editor:docs", doc.id);
  pipeline.hset(`json_editor:doc:${doc.id}`, {
    title: doc.title,
    body: JSON.stringify(doc.body),
    updatedAt: doc.updatedAt
  });
}
await pipeline.exec();
console.log("シード完了:", docs.map((d) => d.id).join(", "));
