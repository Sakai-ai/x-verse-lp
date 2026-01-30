import { readFile, writeFile, mkdir, copyFile, readdir, rm } from "node:fs/promises";
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
  { file: "public/404.html", header: "root", footer: "local", baseUrl: "./" },
];

const headerRegex = /<!-- Header -->[\s\S]*?<\/header>/m;
const footerRegex = /<footer[\s\S]*?<\/footer>/m;
const cssRegex = /<link [^>]*href="[^"]*css\/output\.css"[^>]*>/g;
// Keep asset replacement for main content if needed, but header/footer are now hardcoded
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

  // Header is now hardcoded locally, just read it
  let headerHtml = await readPartial(partialName);

  // NOTE: We used to replace {{ROOT_URL}} here, but moved to hardcoded local partials
  // Logic removed for simplification as requested by user.

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

  // Always use local footer
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

// --- Synchronization to TOP/public/logi ---
const copyRecursive = async (src, dest) => {
  await mkdir(dest, { recursive: true });
  const entries = await readdir(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyRecursive(srcPath, destPath);
    } else {
      await copyFile(srcPath, destPath);
    }
  }
};

const syncToTopProject = async () => {
  const publicDir = path.join(root, "public");
  const destDir = path.join(root, "..", "top", "public", "logi");

  try {
    // Clean old logi in top
    await rm(destDir, { recursive: true, force: true });
    // Copy new build
    await copyRecursive(publicDir, destDir);
    console.log(`Successfully synced logi build to: ${destDir}`);
  } catch (err) {
    console.error("Failed to sync logi build to top project:", err.message);
  }
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

  // Final step: Sync to TOP project to enable cross-project relative links
  await syncToTopProject();

  if (failures.length > 0) {
    failures.forEach((failure) => {
      console.error(`Failed: ${failure.file} - ${failure.error}`);
    });
    process.exit(1);
  }
};

run();
