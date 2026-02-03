import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '..', 'dist');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
    });
}

console.log('Post-build: Converting absolute paths to relative paths in HTML files...');

walkDir(distDir, (filePath) => {
    if (path.extname(filePath) === '.html') {
        let content = fs.readFileSync(filePath, 'utf8');

        // 置換対象: href="/...", src="/..." (外部URLでないもの)
        // 階層の深さに応じて ../ を計算
        const relativeDir = path.relative(path.dirname(filePath), distDir);
        const prefix = relativeDir === '' ? './' : relativeDir.replace(/\\/g, '/') + '/';

        // href="/assets/..." -> href="./assets/..." or href="../../assets/..."
        // href="/_astro/..." -> href="./_astro/..." or href="../../_astro/..."
        // src="/assets/..." -> src="./assets/..."

        // 1. アセット類の置換（既存 + scripts追加）
        let newContent = content.replace(/(href|src)="\/(_astro|assets|scripts|favicon\.svg)/g, `$1="${prefix}$2`);

        // 2. ページリンクの置換 (href="/...", href="/logi/..." 等)
        // 外部URLやハッシュ、mailto/tel等を除外するための正規表現
        // href="/" -> href="./index.html" または ../index.html
        // href="/company/" -> href="./company/index.html"

        // まず href="/" を特殊対応
        const indexPage = prefix === './' ? './index.html' : prefix + 'index.html';
        newContent = newContent.replace(/href="\/"/g, `href="${indexPage}"`);

        // その他の / で始まるパス
        // ハッシュ付きパス（例: /logi/#product -> ./logi/#product）
        newContent = newContent.replace(/href="\/([^">#?]+)\/#([^"]+)"/g, `href="${prefix}$1/#$2"`);

        // 単純なハッシュリンク（例: /#features -> ./#features）
        newContent = newContent.replace(/href="\/#([^"]+)"/g, `href="${indexPage}#$1"`);

        // パス末尾に / がある場合（ディレクトリ形式を維持）
        newContent = newContent.replace(/href="\/([^">#?]+)\/"/g, `href="${prefix}$1/"`);

        // パス末尾に / がない場合（ファイルまたはディレクトリの可能性）
        newContent = newContent.replace(/href="\/([^">#?\/]+)"/g, (match, p1) => {
            if (p1.includes('.')) {
                return `href="${prefix}${p1}"`;
            } else {
                // 拡張子がない場合はディレクトリとして扱う
                return `href="${prefix}${p1}/"`;
            }
        });

        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log(`Updated: ${path.relative(distDir, filePath)}`);
        }
    }
});

console.log('Post-build: Path conversion complete.');
