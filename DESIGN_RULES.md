# デザインルール - X-VERSE LP

## タイポグラフィ

### フォントサイズの標準化

#### 本文テキスト（Body Text）
- **標準サイズ**: `text-lg md:text-xl` (18px → タブレット以上: 20px)
- **行間**: `leading-loose` または `leading-relaxed`
- **カラー**: `text-slate-700` (本文)
- **用途**: セクションの説明文、パラグラフテキスト

#### カード内説明テキスト（Card Description）
- **サイズ**: `text-lg` (18px)
- **用途**: カード内の説明文
- **カラー**: `text-slate-700` または `text-slate-600`
- **行間**: `leading-relaxed`

#### セクションタイトル
- **大見出し (H2)**: `text-4xl md:text-5xl lg:text-6xl` (36px → 48px → 60px)
- **中見出し (H3)**: `text-2xl md:text-3xl` (24px → 30px)
- **小見出し (H4)**: `text-xl md:text-2xl` (20px → 24px)

---

## カラーパレット

### ブランドカラー
- **xverse-red**: `#9D2124` - メインブランドカラー
- **xverse-red-light**: `#C73E42` - ライト赤
- **deep-ink**: `#1E293B` - ダークグレー（見出し）
- **cyber-teal**: `#06B6D4` - シアン（アクセント）

### テキストカラー
- **見出し**: `text-slate-900` または `text-deep-ink`
- **本文**: `text-slate-700`
- **補足**: `text-slate-600`
- **薄いテキスト**: `text-slate-500`

---

## スペーシング

### セクション間の余白
- **標準**: `py-20 md:py-32` (上下80px → タブレット以上: 128px)
- **コンパクト**: `py-16 md:py-24`

### コンテナ内の余白
- **水平**: `px-6` (24px)
- **カード内**: `p-8 md:p-10 md:p-12`

---

## コンポーネント

### カード
- **角丸**: `rounded-3xl` (24px radius)
- **背景**: `bg-slate-50`
- **ボーダー**: `border border-slate-100`
- **ホバー**: `hover:bg-xverse-red/10` + `hover:border-xverse-red/30`

### ボタン
- **主要ボタン**: `bg-xverse-red text-white rounded-full px-8 py-3`
- **ホバー**: `hover:bg-xverse-red-light` または `hover:scale-105`

---

## レスポンシブブレークポイント

- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px

---

## アニメーション

### スクロールアニメーション
- **クラス**: `.animate-on-scroll`
- **用途**: 要素が画面内に入ったときにフェードイン

### ホバーエフェクト
- **トランジション**: `transition-all duration-300`
- **トランスフォーム**: `hover:-translate-y-2`

---

## 適用ルール

### 統一すべき箇所
1. **本文テキスト**: 全ページで `text-lg md:text-xl` を使用
2. **説明テキスト**: セクション説明には `text-xl` ではなく `text-lg md:text-xl`
3. **カード内テキスト**: `text-lg` (カード内の説明文)

### ページ別の注意点
- **index.astro**: Conceptセクション以降の説明文を `text-lg md:text-xl` に統一
- **logi/index.astro**: 既に正しいサイズ（`text-lg md:text-xl`）を使用中
