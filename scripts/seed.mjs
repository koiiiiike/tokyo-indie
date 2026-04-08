import { Redis } from "@upstash/redis";
import { readFileSync, readdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");

// .env.local を手動パース
const env = Object.fromEntries(
  readFileSync(envPath, "utf-8")
    .split("\n")
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const idx = line.indexOf("=");
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 1).trim().replace(/^"|"$/g, "");
      return [key, val];
    })
    .filter(([k]) => k)
);

const redis = new Redis({ url: env.REDIS_URL, token: env.REDIS_TOKEN });

const WIKI_DIR = "/Users/koiiiiike/Desktop/wiki";
const files = readdirSync(WIKI_DIR).filter((f) => f.startsWith("result_artist_") && f.endsWith(".json"));

// 既存データを全削除
const existingIds = await redis.smembers("json_editor:docs");
if (existingIds.length > 0) {
  const delPipeline = redis.pipeline();
  for (const id of existingIds) {
    delPipeline.del(`json_editor:doc:${id}`);
  }
  delPipeline.del("json_editor:docs");
  await delPipeline.exec();
  console.log(`既存データ削除: ${existingIds.length}件`);
}

// アーティストデータを登録
const pipeline = redis.pipeline();
const registered = [];

for (const file of files.sort()) {
  const raw = readFileSync(resolve(WIKI_DIR, file), "utf-8");
  const parsed = JSON.parse(raw);
  // 配列形式（要素1つ）のファイルはアンラップする
  const doc = Array.isArray(parsed) ? parsed[0] : parsed;

  if (!doc || !doc.id || !doc.name) {
    console.warn(`スキップ (id/name が null): ${file}`);
    continue;
  }

  const id = doc.id;
  const title = doc.name;
  const updatedAt = new Date().toISOString();

  pipeline.sadd("json_editor:docs", id);
  pipeline.hset(`json_editor:doc:${id}`, {
    title,
    body: JSON.stringify(doc, null, 2),
    updatedAt,
  });
  registered.push(`${id}: ${title}`);
}

await pipeline.exec();
console.log(`登録完了: ${registered.length}件`);
registered.forEach((r) => console.log(" -", r));
