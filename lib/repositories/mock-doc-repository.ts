export type JsonDoc = {
  id: string;
  title: string;
  body: unknown;
  updatedAt: string;
};

export type JsonDocListItem = Pick<JsonDoc, "id" | "title" | "updatedAt">;

type JsonDocUpdateInput = {
  title: string;
  body: unknown;
};

// TODO(HO-001): `doc-repository.ts` の interface を切り出し、
// mock/redis の実装を同じ契約で差し替えられる構成にする。
// TODO(HO-002): `redis-doc-repository.ts` を追加し、Redis 実接続を実装する。
const seedDocs: JsonDoc[] = [
  {
    id: "customer-config",
    title: "顧客設定",
    body: {
      featureA: true,
      limit: 100,
      tags: ["alpha", "vip"]
    },
    updatedAt: "2026-04-08T00:00:00.000Z"
  },
  {
    id: "ui-settings",
    title: "UI設定",
    body: {
      theme: "light",
      compact: false,
      locale: "ja-JP"
    },
    updatedAt: "2026-04-08T00:00:00.000Z"
  },
  {
    id: "job-flags",
    title: "バッチフラグ",
    body: {
      dryRun: false,
      retries: 3,
      notify: true
    },
    updatedAt: "2026-04-08T00:00:00.000Z"
  }
];

type GlobalWithStore = typeof globalThis & {
  __jsonEditorMockDocs?: Map<string, JsonDoc>;
};

const globalWithStore = globalThis as GlobalWithStore;

if (!globalWithStore.__jsonEditorMockDocs) {
  globalWithStore.__jsonEditorMockDocs = new Map(
    seedDocs.map((doc) => [doc.id, deepClone(doc)])
  );
}

function store() {
  return globalWithStore.__jsonEditorMockDocs as Map<string, JsonDoc>;
}

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export async function listDocs(): Promise<JsonDocListItem[]> {
  return Array.from(store().values())
    .map((doc) => ({
      id: doc.id,
      title: doc.title,
      updatedAt: doc.updatedAt
    }))
    .sort((a, b) => a.title.localeCompare(b.title, "ja"));
}

export async function getDoc(id: string): Promise<JsonDoc | null> {
  const doc = store().get(id);
  if (!doc) {
    return null;
  }

  return deepClone(doc);
}

export async function updateDoc(
  id: string,
  input: JsonDocUpdateInput
): Promise<JsonDoc | null> {
  const existing = store().get(id);
  if (!existing) {
    return null;
  }

  const next: JsonDoc = {
    ...existing,
    title: input.title,
    body: deepClone(input.body),
    updatedAt: new Date().toISOString()
  };

  store().set(id, next);
  return deepClone(next);
}
