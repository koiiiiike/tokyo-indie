# Handover (2026-04-08)

## 1. 現状サマリ
- Next.js + TypeScript 環境は構築済み
- JSON エディタ UI（プルダウン + textarea）は実装済み
- `保存` / `保存してダウンロード` は実装済み
- API はモック実装で動作中
- スマホ幅で崩れない最小レスポンシブ対応済み
- VSCode デバッグ設定（Chrome 起動）済み

## 2. 実装済みファイル（主要）
- `app/page.tsx` UI と保存/ダウンロードロジック
- `app/globals.css` 白基調 + 中央寄せ + モバイル縮小
- `app/api/docs/route.ts` 一覧 API
- `app/api/docs/[id]/route.ts` 詳細/更新 API
- `lib/repositories/mock-doc-repository.ts` モックデータ層
- `.vscode/launch.json` VSCode デバッグ設定（Chrome）
- `README.md` 仕様と運用メモ

## 3. 未実装（この後やるべきこと）
- Redis 実接続への切り替え（現状はモック）
- Repository の切替設計（mock/redis）を明確化
- 最終受け入れ確認（手動テストの項目化）
- Vercel 公開前の環境変数依存確認

## 3.1 タスクリスト（TODO紐づけ）
| ID | タスク | 対象ファイル | コードTODO | 状態 |
|---|---|---|---|---|
| HO-001 | Repository interface 切り出し | `lib/repositories/doc-repository.ts`（新規）, `lib/repositories/mock-doc-repository.ts` | `TODO(HO-001)` | 未着手 |
| HO-002 | Redis Repository 実装 | `lib/repositories/redis-doc-repository.ts`（新規）, `lib/repositories/mock-doc-repository.ts` | `TODO(HO-002)` | 未着手 |
| HO-003 | mock/redis 切替エントリ追加 | `lib/repositories/index.ts`（新規）, `app/api/docs/route.ts` | `TODO(HO-003)` | 未着手 |
| HO-004 | APIのrepository参照を統一 | `app/api/docs/route.ts`, `app/api/docs/[id]/route.ts` | `TODO(HO-004)` | 未着手 |
| HO-005 | title 空文字バリデーション方針確定 | `app/api/docs/[id]/route.ts` | `TODO(HO-005)` | 未着手 |
| HO-006 | title 編集UI + 保存前バリデーション | `app/page.tsx` | `TODO(HO-006)` | 未着手 |
| HO-007 | 受け入れ確認項目を確定して実施 | `handover.md`, `README.md` | （コードTODOなし） | 未着手 |
| HO-008 | Vercel公開前の env 確認手順を確定 | `README.md` | （コードTODOなし） | 未着手 |

## 3.2 TODO 運用ルール
- コード内 TODO は `TODO(HO-xxx)` 形式を使用
- 実装完了時は、該当 TODO を削除し、この表の状態を更新する

## 4. Redis 実装の推奨方針
## 4.1 Repository インターフェース化
- 新規: `lib/repositories/doc-repository.ts`
- ここに `listDocs/getDoc/updateDoc` の型付き interface を定義
- `mock-doc-repository.ts` はこの interface 実装に合わせる

## 4.2 Redis Repository 追加
- 新規: `lib/repositories/redis-doc-repository.ts`
- 使用ライブラリ候補:
1. `@upstash/redis`（Vercel と相性が良い）
2. `ioredis`（汎用）
- 環境変数（Upstash想定）:
1. `REDIS_URL`
2. `REDIS_TOKEN`

## 4.3 キー設計（READMEと揃える）
- `json_editor:docs` (Set): id 一覧
- `json_editor:doc:{id}` (Hash): `title`, `body`, `updatedAt`

## 4.4 呼び出し切替
- 新規: `lib/repositories/index.ts`
- `USE_MOCK_REPOSITORY=true/false` 等でモック/Redisを選択
- API Route は repository import 先だけを使う形に統一

## 5. API 側で追加したい最低限
- `PUT /api/docs/:id` で title 空文字の扱いを明示（許可 or 400）
- エラーメッセージをクライアント表示前提で短く統一
- 可能なら `updatedAt` を必ず ISO8601 で返却

## 6. UI 側で追加したい最低限
- 保存前に title 未入力時の簡易バリデーション
- 保存ボタン連打対策（現状 `isSaving` でほぼ対応済み）
- ダウンロードファイル名の sanitize は実装済み（継続利用）

## 7. テスト/確認手順（次AIが実施）
1. `npm run lint`
2. `npm run build`
3. `npm run dev`
4. ブラウザ確認:
- 初期表示でプルダウンに一覧表示される
- 選択で textarea に JSON が入る
- 保存でステータスメッセージが成功になる
- 保存してダウンロードで `{タイトル}.json` が落ちる
- スマホ幅（DevTools 390px 前後）で崩れない

## 8. 既知注意点
- 端末によっては `node`/`npm` が PATH 反映前で見えないことがある
- その場合はターミナル再起動
- `3000` ポート使用中だと `next dev` が起動失敗する
- その場合は既存プロセス停止か `--port 3011` で起動

## 9. 依頼者側で実施予定（実装対象外）
- GitHub への push
- Vercel 登録/公開操作

## 10. 完了条件（このタスクの最終）
- Redis 実接続で `GET/PUT` が通る
- モック切替可（開発時）
- UI操作（保存/ダウンロード/モバイル表示）が崩れない
- `lint` と `build` が成功
