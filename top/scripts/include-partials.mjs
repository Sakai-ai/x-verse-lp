import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const partialsDir = path.join(root, "src", "partials");
const sharedPartialsDir = path.join(root, "..", "shared", "src", "partials");

const headerPartials = {
  root: "header-root.html",
  inner: "header-inner.html",
};

// Use local footer now
const footerPartials = {
  local: "footer.html",
};

const targets = [
  { file: "public/index.html", header: "root", footer: "local", baseUrl: "./" },
  { file: "public/company/index.html", header: "inner", footer: "local", baseUrl: "../" },
  { file: "public/contact/index.html", header: "inner", footer: "local", baseUrl: "../" },
  { file: "public/contact/thanks.html", header: "inner", footer: "local", baseUrl: "../" },
  { file: "public/privacy/index.html", header: "inner", footer: "local", baseUrl: "../" },
  { file: "public/terms/index.html", header: "inner", footer: "local", baseUrl: "../" },
];

const headerRegex = /<!-- Header -->[\s\S]*?<\/header>/m;
const footerRegex = /<footer[\s\S]*?<\/footer>/m;
const cssRegex = /<link [^>]*href="[^"]*css\/output\.css"[^>]*>/g;
const assetRegex = /(src|href|content)="(\.\.\/)*assets\//g;
const faviconRegex = /href="(\.\.\/)*favicon\.svg"/g;

const readPartial = async (name, isShared = false) => {
  const dir = isShared ? sharedPartialsDir : partialsDir;
  const filePath = path.join(dir, name);
  return readFile(filePath, "utf8");
};

const replaceHeader = async ({ file, header, baseUrl }) => {
  const filePath = path.join(root, file);
  const html = await readFile(filePath, "utf8");
  const partialName = headerPartials[header];
  if (!partialName) {
    throw new Error(`Unknown header key: ${header}`);
  }

  let headerHtml = await readPartial(partialName);

  // ROOT_URL for Top project is same as BASE_URL
  const rootUrl = baseUrl;

  // Replace placeholders
  if (baseUrl) {
    headerHtml = headerHtml.replace(/\{\{BASE_URL\}\}/g, baseUrl);
    headerHtml = headerHtml.replace(/\{\{ROOT_URL\}\}/g, rootUrl);
  }

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

  // Always use local footer now
  const partialName = footerPartials[footer];
  if (!partialName) {
    throw new Error(`Unknown footer key: ${footer}`);
  }

  // FORCE LOCAL READ
  let footerHtml = await readPartial(partialName, false);

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

const syncSharedAssets = async () => {
  const publicShared = path.join(root, "..", "shared", "public");
  const jsShared = path.join(root, "..", "shared", "src", "js");

  // Ensure target dirs exist
  await mkdir(path.join(root, "public", "js"), { recursive: true });

  // Sync favicon.svg
  await copyFile(path.join(publicShared, "favicon.svg"), path.join(root, "public", "favicon.svg"));
  // Sync 404.html
  await copyFile(path.join(publicShared, "404.html"), path.join(root, "public", "404.html"));
  // Sync main.js
  await copyFile(path.join(jsShared, "main.js"), path.join(root, "public", "js", "main.js"));

  console.log("Shared assets synchronized.");
};

const run = async () => {
  const failures = [];

  try {
    await syncSharedAssets();
  } catch (err) {
    console.error("Failed to sync shared assets:", err.message);
  }

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
