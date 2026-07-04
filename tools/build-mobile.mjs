import { copyFile, cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const allowedExtensions = new Set([".html", ".css", ".js", ".png"]);
const excludedFiles = new Set(["mobile-runtime.js"]);

await rm(dist, { recursive: true, force: true });
await mkdir(path.join(dist, "vendor"), { recursive: true });

const entries = await readdir(root, { withFileTypes: true });

for (const entry of entries) {
  if (!entry.isFile()) continue;
  if (!allowedExtensions.has(path.extname(entry.name).toLowerCase())) continue;
  if (excludedFiles.has(entry.name)) continue;

  await copyFile(path.join(root, entry.name), path.join(dist, entry.name));
}

let indexHtml = await readFile(path.join(dist, "index.html"), "utf8");
indexHtml = indexHtml.replace(
  '<script src="script.js"></script>',
  '<script src="script.js"></script>\n<script src="mobile-runtime.js"></script>'
);
await writeFile(path.join(dist, "index.html"), indexHtml, "utf8");

let stage5 = await readFile(path.join(dist, "stage5.js"), "utf8");
stage5 = stage5.replace(
  'https://unpkg.com/three@0.180.0/build/three.module.js',
  './vendor/three.module.js'
);
await writeFile(path.join(dist, "stage5.js"), stage5, "utf8");

await copyFile(
  path.join(root, "mobile-runtime.js"),
  path.join(dist, "mobile-runtime.js")
);

await cp(
  path.join(root, "node_modules", "three", "build", "three.module.js"),
  path.join(dist, "vendor", "three.module.js")
);

await cp(
  path.join(root, "node_modules", "three", "build", "three.core.js"),
  path.join(dist, "vendor", "three.core.js")
);

console.log("iOS web bundle created in dist/");
