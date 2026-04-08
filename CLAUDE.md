# CLAUDE.md

このファイルは Claude Code がこのリポジトリで作業する際の指示書です。

---

## プロジェクト概要

JSON 編集ツール（MVP）。身内向け小規模運用。  
Next.js (App Router) + TypeScript で構成し、Vercel にデプロイする。

---

## 技術スタック

- **フレームワーク**: Next.js (App Router) + TypeScript
- **デプロイ**: Vercel
- **データ層**: モック実装 → Redis (Upstash) に切り替え可能な構成
- **Node.js**: v20.20.2 / npm: 10.8.2

---

## ローカル起動

```bash
npm run dev
# → http://localhost:3000
```

ポート競合時:
```bash
npm run dev -- --port 3011
```

---

## 環境変数

`.env.local`（コミット禁止）に以下を設定する：

```env
USE_MOCK_REPOSITORY=false   # trueにするとRedis不要でモック動作
REDIS_URL=...
REDIS_TOKEN=...
```

- `.env.example` にサンプルあり
- Redis 実装が未完成なら `USE_MOCK_REPOSITORY=true` で進める

---

## ディレクトリ構成（主要部分）

```
app/
  api/docs/         # 一覧・詳細・更新 API
  page.tsx          # メイン画面 UI
lib/
  repositories/     # モック or Redis の Repository 実装
.env.local          # ローカル環境変数（Git管理外）
.env.example        # 環境変数のサンプル
```

---

## API 仕様

| メソッド | パス | 説明 |
|---|---|---|
| GET | `/api/docs` | 一覧取得（id, title, updatedAt） |
| GET | `/api/docs/:id` | 詳細取得（id, title, body, updatedAt） |
| PUT | `/api/docs/:id` | 更新（title, body を受け取る） |

エラーコード: 400（JSON不正）/ 404（ID不在）/ 500（サーバーエラー）

---

## Repository 層の切り替え方針

- `USE_MOCK_REPOSITORY=true` → モック実装を使う
- `USE_MOCK_REPOSITORY=false` → Redis 実装を使う
- モックと Redis は同じインターフェースを実装すること
- API 側はどちらの実装かを意識しない構造にする

---

## 実装済みタスク

| ID | 内容 | 状態 |
|---|---|---|
| T001 | Next.js + TypeScript 初期化 | ✅ 完了 |
| T002 | モック Repository 実装 | ✅ 完了 |
| T003 | 一覧/詳細/更新 API | ✅ 完了 |
| T004 | メイン画面 UI | ✅ 完了 |
| T005 | 保存してダウンロード機能 | ✅ 完了 |

**現在の残タスク: Redis Repository の実装**

---

## Redis 実装時の指針

- Upstash Redis（REST API）を使う
- 接続には `REDIS_URL` と `REDIS_TOKEN` を使う
- モック Repository と同じインターフェースで実装する
- `USE_MOCK_REPOSITORY` フラグで切り替えられるようにする

---

## コーディング規約

- TypeScript の型は明示的に書く（`any` は使わない）
- API レスポンスは仕様に沿った型を返す
- エラーは適切なステータスコードで返す
- UI メッセージは日本語

---

## やってはいけないこと

- `.env.local` をコミットしない
- `REDIS_URL` / `REDIS_TOKEN` をコード中にハードコードしない
- README や issue に Redis の認証情報を書かない
