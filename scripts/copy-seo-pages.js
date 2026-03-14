import fs from "fs";
import path from "path";

const root = process.cwd();
const sourceRoot = path.join(root, "seo-pages");
const targetRoot = path.join(root, "dist");

function copyRecursive(sourceDir, targetDir) {
  if (!fs.existsSync(sourceDir)) return;
  fs.mkdirSync(targetDir, { recursive: true });
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      copyRecursive(sourcePath, targetPath);
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      fs.mkdirSync(path.dirname(targetPath), { recursive: true });
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

copyRecursive(sourceRoot, targetRoot);
console.log("SEO pages copied to dist/");
