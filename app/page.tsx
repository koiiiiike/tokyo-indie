"use client";

import { useEffect, useMemo, useState } from "react";

type JsonDocListItem = {
  id: string;
  title: string;
  updatedAt: string;
};

type JsonDoc = {
  id: string;
  title: string;
  body: unknown;
  updatedAt: string;
};

type StatusType = "info" | "success" | "error";

export default function Home() {
  const [docs, setDocs] = useState<JsonDocListItem[]>([]);
  const [selectedId, setSelectedId] = useState("");
  // TODO(HO-006): タイトル編集を許可する場合は input を追加し、保存前バリデーションを入れる。
  const [title, setTitle] = useState("");
  const [editorText, setEditorText] = useState("");
  const [status, setStatus] = useState<{ type: StatusType; message: string } | null>(
    null
  );
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingDoc, setIsLoadingDoc] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const hasSelection = selectedId.length > 0;

  const selectedDocLabel = useMemo(() => {
    return docs.find((doc) => doc.id === selectedId)?.title ?? "";
  }, [docs, selectedId]);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const loadList = async () => {
      setIsLoadingList(true);
      setStatus(null);

      try {
        const res = await fetch(`/api/docs?t=${Date.now()}`, { signal: controller.signal });
        if (!res.ok) {
          throw new Error("一覧の読み込みに失敗しました。");
        }

        const items = (await res.json()) as JsonDocListItem[];
        setDocs(items);

        if (items.length > 0) {
          setSelectedId(items[0].id);
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          setStatus({ type: "error", message: "読み込みがタイムアウトしました。再読み込みしてください。" });
        } else {
          setStatus({
            type: "error",
            message: error instanceof Error ? error.message : "一覧の読み込み中にエラーが発生しました。"
          });
        }
      } finally {
        clearTimeout(timeoutId);
        setIsLoadingList(false);
      }
    };

    void loadList();
    return () => { clearTimeout(timeoutId); controller.abort(); };
  }, []);

  useEffect(() => {
    if (!selectedId) {
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const loadDoc = async () => {
      setIsLoadingDoc(true);
      setStatus(null);

      try {
        const res = await fetch(`/api/docs/${encodeURIComponent(selectedId)}?t=${Date.now()}`, { signal: controller.signal });
        if (!res.ok) {
          throw new Error("詳細の読み込みに失敗しました。");
        }

        const doc = (await res.json()) as JsonDoc;
        setTitle(doc.title);
        setEditorText(JSON.stringify(doc.body, null, 2));
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          setStatus({ type: "error", message: "読み込みがタイムアウトしました。再読み込みしてください。" });
        } else {
          setStatus({
            type: "error",
            message: error instanceof Error ? error.message : "詳細の読み込み中にエラーが発生しました。"
          });
        }
      } finally {
        clearTimeout(timeoutId);
        setIsLoadingDoc(false);
      }
    };

    void loadDoc();
    return () => { clearTimeout(timeoutId); controller.abort(); };
  }, [selectedId]);

  const handleSave = async (withDownload: boolean) => {
    if (!selectedId) {
      return;
    }

    let parsedBody: unknown;
    try {
      parsedBody = JSON.parse(editorText);
    } catch {
      setStatus({ type: "error", message: "JSONの構文が不正です。" });
      return;
    }

    setIsSaving(true);
    setStatus(null);

    try {
      const res = await fetch(`/api/docs/${encodeURIComponent(selectedId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          body: parsedBody
        })
      });

      if (!res.ok) {
        const err = (await safeJson(res)) as { message?: string } | null;
        throw new Error(err?.message ?? "保存に失敗しました。");
      }

      const updated = (await res.json()) as JsonDoc;
      const nextText = JSON.stringify(updated.body, null, 2);
      setEditorText(nextText);
      setTitle(updated.title);
      setDocs((prev) =>
        prev.map((item) =>
          item.id === updated.id
            ? { ...item, title: updated.title, updatedAt: updated.updatedAt }
            : item
        )
      );
      setStatus({ type: "success", message: "保存しました。" });

      if (withDownload) {
        downloadJsonFile(updated.title, nextText);
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "保存中にエラーが発生しました。"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="page">
      <section className="editor-shell">
        <header className="editor-header">
          <h1>JSON Editor</h1>
          <p>モックデータを編集して保存できます。</p>
        </header>

        <div className="form-row">
          <label htmlFor="doc-select">タイトル</label>
          <select
            id="doc-select"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            disabled={isLoadingList || docs.length === 0}
          >
            {docs.length === 0 ? (
              <option value="">データなし</option>
            ) : (
              docs.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.title}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="form-row">
          <label htmlFor="json-editor">JSON</label>
          <textarea
            id="json-editor"
            value={editorText}
            onChange={(e) => setEditorText(e.target.value)}
            disabled={!hasSelection || isLoadingDoc}
            spellCheck={false}
          />
        </div>

        <div className="action-row">
          <button
            type="button"
            onClick={() => void handleSave(false)}
            disabled={!hasSelection || isLoadingDoc || isSaving}
          >
            保存
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => void handleSave(true)}
            disabled={!hasSelection || isLoadingDoc || isSaving}
          >
            保存してダウンロード
          </button>
        </div>

        <div className="meta-row">
          {isLoadingList ? <span>一覧を読み込み中...</span> : null}
          {!isLoadingList && isLoadingDoc ? <span>詳細を読み込み中...</span> : null}
          {!isLoadingList && !isLoadingDoc && selectedDocLabel ? (
            <span>選択中: {selectedDocLabel}</span>
          ) : null}
        </div>

        {status ? <p className={`status ${status.type}`}>{status.message}</p> : null}
      </section>
    </main>
  );
}

async function safeJson(res: Response): Promise<unknown | null> {
  try {
    return (await res.json()) as unknown;
  } catch {
    return null;
  }
}

function downloadJsonFile(title: string, content: string) {
  const safeTitle = sanitizeFileName(title);
  const filename = `${safeTitle}.json`;
  const blob = new Blob([content], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function sanitizeFileName(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "untitled";
  }

  return trimmed.replace(/[\\/:*?"<>|]/g, "_").slice(0, 80);
}
