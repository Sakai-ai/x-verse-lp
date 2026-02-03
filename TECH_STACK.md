# X-VERSE LP 技術スタック

このドキュメントは、X-VERSE ランディングページプロジェクトで使用している技術スタックをまとめたものです。

---

## プロジェクト概要

- **プロジェクト名**: X-VERSE Landing Page
- **リポジトリ**: `Sakai-ai/x-verse-lp`
- **目的**: X-VERSEプラットフォームとLogiサービスの紹介サイト

---

## フレームワーク・ライブラリ

### コアフレームワーク
- **Astro** `^5.17.1`
  - 静的サイト生成（SSG）に最適化されたフレームワーク
  - ファイルベースルーティング
  - コンポーネントベースのアーキテクチャ（`.astro`ファイル）

### スタイリング
- **Tailwind CSS** `^4.1.18`
  - ユーティリティファーストのCSSフレームワーク
  - カスタムカラー: `xverse-red`, `deep-ink` など
  - レスポンシブデザイン対応
- **@astrojs/tailwind** `^6.0.2`
  - Astro用Tailwind統合パッケージ
- **@tailwindcss/vite** `^4.1.18`
  - Vite用Tailwindプラグイン

---

## プロジェクト構成

### ディレクトリ構造
```
lp/
├── src/
│   ├── pages/         # ページファイル（index.astro, logi/index.astro等）
│   ├── components/    # 再利用可能なコンポーネント（Header.astro, Footer.astro等）
│   ├── layouts/       # レイアウトテンプレート
│   └── styles/        # グローバルスタイル
├── public/
│   ├── assets/        # 静的アセット（画像、動画等）
│   └── scripts/       # クライアントサイドJavaScript
├── scripts/           # ビルドスクリプト
│   ├── post-build.js  # ビルド後処理（URL正規化等）
│   └── record-trace.js # Gitトレース記録
└── dist/              # ビルド出力ディレクトリ
```

### 主要コンポーネント
- **Header.astro**: ヘッダーナビゲーション、サービススイッチャー
- **Footer.astro**: フッターナビゲーション
- **ServiceSwitcher.astro**: サービス切り替えバー

---

## ビルド・デプロイプロセス

### NPMスクリプト
```bash
# 開発サーバー起動（ポート4321）
npm run dev

# プロダクションビルド
npm run build

# プレビュー
npm run preview
```

### ビルド処理フロー
1. **Astro Build**: `astro build`
   - `.astro`ファイルを静的HTMLに変換
   - Tailwind CSSをコンパイル
   - アセットを最適化

2. **ポストビルド処理**: `node scripts/post-build.js`
   - 絶対パスを相対パスに変換
   - `index.html`をURLから除去してクリーンなURL構造を実現
   - ルートリンク・ハッシュリンク・ディレクトリリンクの正規化

3. **Git トレース**: `node scripts/record-trace.js`
   - 変更履歴を`.agent-traces/`に記録

---

## クライアントサイド機能

### JavaScript機能（`public/scripts/main.js`）
- **モバイルメニュー制御**: ハンバーガーメニューの開閉
- **スクロールアニメーション**: Intersection Observerを使用した要素の表示アニメーション
- **スムーススクロール**: アンカーリンクによる滑らかなスクロール
- **視差効果（パララックス）**: スクロールに応じた背景移動
- **カードチルトエフェクト**: マウスホバーによる3D傾斜効果
- **タイプライターエフェクト**: コードブロックのタイピング表示
- **ローカル環境対応**: `file://`プロトコルでのナビゲーション補正

---

## デザイン要素

### カラーパレット
- **xverse-red**: `#9D2124` - ブランドカラー（赤）
- **xverse-red-light**: `#C73E42` - ライト赤
- **deep-ink**: `#1E293B` - ダークグレー
- **cyber-teal**: `#06B6D4` - シアン（アクセント）

### アニメーション
- フェードイン・スライドイン効果
- ホバートランジション
- スタガーアニメーション（順次表示）
- カスタムキーフレームアニメーション

---

## URL構造

### クリーンURL設計
- **トップページ**: `/` → `./index.html`
- **Logiページ**: `/logi/` → `./logi/index.html`
- **会社案内**: `/company/` → `./company/index.html`
- **お問い合わせ**: `/contact/` → `./contact/index.html`

全てのリンクは`index.html`を含まないクリーンなURL形式で出力され、`post-build.js`によって自動的に正規化されます。

---

## 開発環境

### 前提条件
- **Node.js**: v18以降推奨
- **npm**: v9以降

### ローカル開発
```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev
# http://localhost:4321 でアクセス可能

# ビルド
npm run build
```

---

## Git ワークフロー

### ブランチ戦略
- **master**: 本番環境用メインブランチ

### Agent Trace
変更履歴は`.agent-traces/`ディレクトリにJSON形式で記録されます。これにより、AIエージェントによる変更を追跡可能です。

---

## 今後の拡張可能性

- **新規サービスページの追加**: `src/pages/[service]/`配下に追加
- **コンポーネントの再利用**: 共通UIを`src/components/`に追加
- **スタイルのカスタマイズ**: `tailwind.config.js`でテーマ拡張
