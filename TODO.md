# TODO（人間向け実行手順）

このファイルは「あなたが実行する作業」だけを書いています。  
前提: コード実装はAI側で進める。あなたは公開作業と環境変数設定を担当。

## 1. Node / npm / TypeScript のバージョンを揃える（Mac）
推奨: `fnm` で Node 20 系を固定する。

```bash
brew install fnm
echo 'eval "$(fnm env --use-on-cd)"' >> ~/.zshrc
source ~/.zshrc
fnm install 20
fnm use 20
fnm default 20
```

まず最初に、バージョン確認を実行:

```bash
node -v
npm -v
npx tsc -v
```

期待する目安:
- Node.js: `v20.20.x`（20系LTS）
- npm: `10.x`
- TypeScript: `6.0.x`（このプロジェクトでは lock に合わせる）

ズレていたときの手順:
1. Node 20系をインストール（20系LTSを選ぶ）
2. ターミナルを閉じて開き直す
3. プロジェクトで依存を再現

```bash
npm ci
```

4. もう一度バージョン確認

```bash
node -v
npm -v
npx tsc -v
```

補足:
- `npm ci` は `package-lock.json` を基準に依存を正確に再現する
- TypeScript はグローバル版ではなく、プロジェクト内の版（`npx tsc -v`）を基準にする

## 2. Redis（Upstash推奨）を用意する
1. Upstash にログインして Redis DB を1つ作成
2. 接続情報を控える
- `REDIS_URL`
- `REDIS_TOKEN`

## 3. ローカル用 env を作る（コミットしない）
1. プロジェクト直下の `.env.local`（作成済み）を開く
2. 中身を必要に応じて更新する（値は自分のものに置換）

```env
USE_MOCK_REPOSITORY=false
REDIS_URL=ここにURL
REDIS_TOKEN=ここにTOKEN
```

補足:
- 共有用サンプルは `.env.example` に作成済み
- Redis 実装が入るまでは `USE_MOCK_REPOSITORY=true` のままでもOK

3. `.env.local` が Git 管理対象外か確認する
- `git check-ignore .env.local`
- `git status --short`

期待値:
- `git check-ignore` で `.env.local` が表示される
- `git status` に `.env.local` が出ない

## 4. ローカル動作確認
1. `npm run dev`
2. `http://localhost:3000` を開く
3. 以下を確認
- 一覧が表示される
- 選択で JSON が出る
- 保存できる
- 保存してダウンロードで `{タイトル}.json` が落ちる

## 5. GitHub へ push（envは含めない）
1. `git add .`
2. `git status --short` で `.env.local` が含まれていないことを確認
3. `git commit -m "..."` して `git push`

## 6. Vercel に環境変数を設定
1. Vercel の対象プロジェクトを開く
2. `Settings` → `Environment Variables`
3. 以下を登録（少なくとも Production）
- `USE_MOCK_REPOSITORY=false`
- `REDIS_URL=...`
- `REDIS_TOKEN=...`
4. 可能なら `Preview` にも同じ値を入れる
5. 再デプロイ

## 7. 公開後チェック
1. Vercel URL を開く
2. 保存・再読み込み・ダウンロードを確認
3. スマホ表示（DevTools 390px前後）で崩れないか確認

## 8. よくある詰まりポイント
1. `node` / `npm` が見つからない
- ターミナル再起動
- `source ~/.zshrc` を実行
- `fnm current` で Node バージョン確認
2. ポート `3000` が使用中
- `npm run dev -- --port 3011`
3. Redis 接続エラー
- Vercel 側 env のスペルミス
- `REDIS_TOKEN` 未設定
- Production/Preview の設定先間違い

## 9. 絶対にやらないこと
1. `.env.local` をコミットしない
2. Redis の URL/TOKEN を README や issue に貼らない
