---
description: モダンなLP制作ノウハウ（Tailwind CSS + お問い合わせフォーム + E2Eテスト）
---

# モダンLP制作ワークフロー（1から作成するノウハウ）

このワークフローは、Tailwind CSS、デモモード付きフォーム、SEO制御、自動テストなどを組み合わせたモダンなWebサイトを、ゼロから構築するための手順書です。

## 1. プロジェクトセットアップ

### ディレクトリ作成と初期化
```bash
# プロジェクトのルートで実行
npm init -y
```

### 必要なディレクトリの作成
```bash
mkdir public src src\css public\css public\js public\contact
```

### Tailwind CSS の導入
```bash
npm install -D tailwindcss
npx tailwindcss init
```

### 設定ファイルの更新

**tailwind.config.js**
※プロジェクトのデザイン（カラーパレット、フォントなど）に合わせて設定してください。
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/**/*.{html,js}"],
  theme: {
    extend: {
      // colors, fontFamily などをデザインに合わせて定義
    },
  },
  plugins: [],
}
```

**src/css/input.css**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* カスタムスタイル */
@layer components {
  .btn {
    @apply px-6 py-3 rounded-full font-bold transition-all duration-300;
  }
}
```

### CSSビルドコマンド（package.json）
`package.json` の `scripts` に以下を追加:
```json
"scripts": {
  "dev": "tailwindcss -i ./src/css/input.css -o ./public/css/output.css --watch",
  "build": "tailwindcss -i ./src/css/input.css -o ./public/css/output.css --minify"
}
```

---

## 2. 共通機能の実装 (SEO & UX)

### public/js/main.js
全ページで読み込む共通スクリプトを作成します。
- **SEO制御**: 設定一つで `noindex` を一括適用
- **ローカル閲覧対応**: `file://` でのリンク切れ防止

```javascript
/**
 * Common JavaScript
 */
document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // Site Configuration
    // ==========================================
    const CONFIG = {
        // サイト全体を検索エンジンにインデックスさせない場合は true
        PREVENT_INDEXING: true
    };

    // SEO Control (noindex)
    if (CONFIG.PREVENT_INDEXING) {
        const meta = document.createElement('meta');
        meta.name = 'robots';
        meta.content = 'noindex';
        document.head.appendChild(meta);
        console.log('SEO: noindex meta tag added via main.js');
    }

    // Local Environment Link Fix
    if (window.location.protocol === 'file:') {
        document.querySelectorAll('a').forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.endsWith('/')) {
                link.setAttribute('href', href + 'index.html');
            }
        });
    }
});
```

---

## 3. お問い合わせフォーム（デモモード + スパム対策付き）

### HTML: public/contact/index.html (抜粋)
スパムボット対策として、**ハニーポット（隠しフィールド）**を設置します。
CSS（`display:none`）で隠しているため、通常のユーザーは入力しませんが、ボットは入力しようとします。

```html
<form id="contact-form">
  <!-- 他の入力フィールド... -->
  
  <!-- スパム対策用ハニーポット（非表示） -->
  <div style="display:none;">
    <input type="text" name="confirm_email" value="">
  </div>
  
  <button type="submit">送信</button>
</form>
```

### フロントエンド: public/js/contact.js
サーバーがないローカル環境でもテストできるよう、**デモモード**を実装します。
また、ハニーポットの値も送信データに含めます。

```javascript
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('contact-form');
    
    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        
        const formData = {
            name: form.user_name.value,
            email: form.email.value,
            tel: form.tel.value, // 電話番号対応
            message: form.message.value,
            confirm_email: form.confirm_email.value // ハニーポット
        };

        try {
            const response = await fetch('./mail.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                alert('送信完了しました！');
                form.reset();
            } else {
                throw new Error(result.message || '送信失敗');
            }

        } catch (error) {
            // 自動判定デモモード
            const isLocal = window.location.protocol === 'file:' || 
                           window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1';

            if (isLocal) {
                console.warn('Demo Mode: Simulated success.');
                alert('【デモモード】\nローカル環境のため送信成功をシミュレーションしました。');
                form.reset();
            } else {
                alert('送信エラー: ' + error.message);
            }
        }
    });
});
```

### バックエンド: public/contact/mail.php
ハニーポットに値が入っている場合は、送信処理を行わずに終了します（スパム判定）。

```php
<?php
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit;
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);

// スパム対策 (Honeypot)
// 隠しフィールドに値が入っている＝ボットによる自動入力とみなす
if (!empty($data['confirm_email'])) {
    // スパム業者に気づかれないよう、成功を装って終了する
    echo json_encode(['success' => true, 'message' => 'Sent']);
    exit;
}

// 設定
$to = 'info@example.com'; // ※送信先アドレスを設定
$subject = 'お問い合わせ';

// 本文作成
$body = "氏名: " . $data['name'] . "\n";
$body .= "電話: " . $data['tel'] . "\n";
$body .= "内容:\n" . $data['message'];

// 送信
if (mail($to, $subject, $body)) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server Error']);
}
?>
```

---

## 4. GitHub Actions (CI)

プロジェクトの品質担保のため、GitHub Actionsを設定します。

### 自動テスト (CI): .github/workflows/ci.yml
pushのたびに自動テストを実行します。

```yaml
name: CI
on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: lts/*
    - name: Install dependencies
      run: npm ci
    - name: Install Playwright Browsers
      run: npx playwright install --with-deps
    - name: Run Playwright tests
      run: npx playwright test
```



## 5. 自動テスト (Playwright)

品質を担保するため、E2Eテストツール「Playwright」を導入します。

### インストール
```bash
npm install -D @playwright/test
npx playwright install
```

### 設定ファイル: playwright.config.ts
ルートディレクトリに作成し、テスト実行時にローカルサーバー（PHP）を自動起動する設定などを記述します。

### テストコード: tests/contact.spec.ts
お問い合わせフォームの正常系（デモモード）と、スパム対策（ハニーポット）の挙動を検証します。

### テストの実行
```bash
npx playwright test
```

---

## 5. 動作確認・テスト手順

### 開発サーバーの起動 (Tailwind)
CSSの変更をリアルタイム反映させるため、変更のタイミングで別ターミナルで以下を実行します。
```bash
npm run dev
```

### ローカルサーバーでの確認 (PHP)
お問い合わせフォーム（PHP）の動作を確認する場合、簡易サーバーを起動します。
```bash
# publicディレクトリに移動してから実行
cd public
php -S localhost:8000
```
ブラウザで `http://localhost:8000` にアクセスします。

### 動作テスト項目
1.  **デザイン確認**: 全ページのデザイン崩れがないかチェック。
2.  **リンク確認**: ナビゲーションメニューのリンクが正しく遷移するか（ローカル/サーバー両方で）。
3.  **フォーム確認**:
    - `php -S` で起動中 → 実際に送信されるか（またはPHPのエラーが出ないか/ログ確認）。
    - ファイルを直接開いている時 → 「デモモード」のアラートが表示されるか。
4.  **SEO確認**:
    - ブラウザの開発者ツールで `<head>` 内に `<meta name="robots" content="noindex">` があるか確認。
    - 本番公開時は `public/js/main.js` の `PREVENT_INDEXING` を `false` に変更する。

---

## 6. 開発・コンテンツ実装ガイドライン

Webサイト構築時、以下の指針に従ってコンテンツを作成してください。

### 画像・動画の取り扱い
- **プレースホルダの使用**: 画像や動画を挿入する箇所には、仮のプレースホルダ画像（`https://placehold.co/600x400` など）や、背景色を設定した `div` 要素を一時的に配置してください。
- **デザインの優先**: 最終的な素材がない場合でも、レイアウトやデザインが崩れないように枠を確保します。

### コンテンツ不足時の対応
- **ダミーデータの提案**: ユーザーからの具体的な指示がなく、コンテンツ情報（テキスト、キャッチコピー、詳細説明など）が不足している場合は、空欄にせずダミーデータを作成して提案してください。
- **検索機能の活用**: ダミーデータを作成する際は、その業界や類似サービスのWebサイトを検索・リサーチし、リアリティのあるそれらしい文章や構成を提案します。「Lorem Ipsum」などの無意味なテキストは極力避け、文脈に沿った内容にします。