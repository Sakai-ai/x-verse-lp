import { copyFile, mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();

const syncSharedAssets = async () => {
    const publicShared = path.join(root, "..", "shared", "public");
    const jsShared = path.join(root, "..", "shared", "src", "js");

    // Ensure target dirs exist
    await mkdir(path.join(root, "public", "js"), { recursive: true });

    try {
        // Sync favicon.svg
        await copyFile(path.join(publicShared, "favicon.svg"), path.join(root, "public", "favicon.svg"));
        // Sync 404.html
        await copyFile(path.join(publicShared, "404.html"), path.join(root, "public", "404.html"));
        // Sync main.js
        await copyFile(path.join(jsShared, "main.js"), path.join(root, "public", "js", "main.js"));
        console.log("Shared assets synchronized.");
    } catch (err) {
        console.error("Failed to sync shared assets:", err.message);
    }
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
    try {
        await syncSharedAssets();
        await syncToTopProject();
        console.log("Sync completed successfully.");
    } catch (err) {
        console.error("Sync failed:", err.message);
        process.exit(1);
    }
};

run();
