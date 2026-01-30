import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const partialsDir = path.join(root, "src", "partials");
const sharedPartialsDir = path.join(root, "..", "shared", "src", "partials");

const headerPartials = {
  root: "header-root.html",
  inner: "header-inner.html",
};

const footerPartials = {
  shared: "footer.html",
};

const targets = [
  { file: "public/index.html", header: "root", footer: "shared", baseUrl: "../" },
  { file: "public/404.html", header: "root", footer: "shared", baseUrl: "../" },
];

const headerRegex = /<!-- Header -->[\s\S]*?<\/header>/m;
const footerRegex = /<footer[\s\S]*?<\/footer>/m;
const cssRegex = /<link rel="stylesheet" href="[^"]*css\/output\.css">/g;
const assetRegex = /(src|href|content)="(\.\.\/)*assets\//g;
const faviconRegex = /href="(\.\.\/)*favicon\.svg"/g;

const readPartial = async (name, isShared = false) => {
  const dir = isShared ? sharedPartialsDir : partialsDir;
  const filePath = path.join(dir, name);
  return readFile(filePath, "utf8");
};

const replaceHeader = async ({ file, header }) => {
  const filePath = path.join(root, file);
  const html = await readFile(filePath, "utf8");
  const partialName = headerPartials[header];
  if (!partialName) {
    throw new Error(`Unknown header key: ${header}`);
  }

  const headerHtml = await readPartial(partialName);
  if (!headerRegex.test(html)) {
    throw new Error(`Header block not found in ${file}`);
  }

  const updated = html.replace(headerRegex, `<!-- Header -->\n${headerHtml}`);
  await writeFile(filePath, updated, "utf8");
};

const replaceFooter = async ({ file, footer, baseUrl }) => {
  if (!footer) return;
  const filePath = path.join(root, file);
  const html = await readFile(filePath, "utf8");

  const isShared = footer === "shared";
  const partialName = footerPartials[footer];
  if (!partialName) {
    throw new Error(`Unknown footer key: ${footer}`);
  }

  let footerHtml = await readPartial(partialName, isShared);

  // Replace base URL placeholder
  if (baseUrl) {
    footerHtml = footerHtml.replace(/\{\{BASE_URL\}\}/g, baseUrl);
  }

  if (!footerRegex.test(html)) {
    throw new Error(`Footer block not found in ${file}`);
  }

  const updated = html.replace(footerRegex, footerHtml);

  // Update CSS path
  let finalHtml = updated.replace(cssRegex, `<link rel="stylesheet" href="${baseUrl}css/output.css">`);

  // Update other assets (images in content, favicons)
  finalHtml = finalHtml.replace(assetRegex, `$1="${baseUrl}assets/`);
  finalHtml = finalHtml.replace(faviconRegex, `href="${baseUrl}favicon.svg"`);

  await writeFile(filePath, finalHtml, "utf8");
};

const run = async () => {
  const failures = [];
  for (const target of targets) {
    try {
      await replaceHeader(target);
      await replaceFooter(target);
    } catch (error) {
      failures.push({ file: target.file, error: error.message });
    }
  }

  if (failures.length > 0) {
    failures.forEach((failure) => {
      console.error(`Failed: ${failure.file} - ${failure.error}`);
    });
    process.exit(1);
  }
};

run();
