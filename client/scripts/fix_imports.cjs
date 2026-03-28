const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "../src");

// List of non-moved directories whose imports we need to fix
const staticDirs = ["services", "utils", "config", "context", "data", "assets"];

function fixFile(filePath, oldDepth, newDepth) {
  let content = fs.readFileSync(filePath, "utf8");
  let original = content;

  // Function to build relative up-path: e.g. depth 2 -> '../../'
  const oldUp = "../".repeat(oldDepth);
  const newUp = "../".repeat(newDepth);

  staticDirs.forEach((dir) => {
    // Regex for: from '../../services/
    // or: from '../utils'
    const oldImportRegex = new RegExp(
      `from\\s+['"]${oldUp}${dir}(/.*?)?['"]`,
      "g",
    );
    content = content.replace(oldImportRegex, `from '${newUp}${dir}$1'`);

    // Also dynamic imports
    const oldDynRegex = new RegExp(
      `import\\(\\s*['"]${oldUp}${dir}(/.*?)?['"]\\s*\\)`,
      "g",
    );
    content = content.replace(oldDynRegex, `import('${newUp}${dir}$1')`);
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`Fixed static imports in ${path.relative(root, filePath)}`);
  }
}

function processDirectory(dirToProc, oldDepth, newDepth) {
  if (!fs.existsSync(dirToProc)) return;
  const entries = fs.readdirSync(dirToProc, { withFileTypes: true });
  for (let entry of entries) {
    const full = path.join(dirToProc, entry.name);
    if (entry.isDirectory()) {
      processDirectory(full, oldDepth, newDepth);
    } else if (entry.name.endsWith(".jsx") || entry.name.endsWith(".js")) {
      fixFile(full, oldDepth, newDepth);
    }
  }
}

// 1. Files that moved from level 1 (components) to level 3
// oldDepth = 1, newDepth = 3
processDirectory(path.join(root, "features/shared/components"), 1, 3);
processDirectory(path.join(root, "features/public/components"), 1, 3);

// 2. Files that moved from level 2 (pages/Main, pages/Admin, components/admin) to level 3
// oldDepth = 2, newDepth = 3
processDirectory(path.join(root, "features/public/pages"), 2, 3);
processDirectory(path.join(root, "features/admin/pages"), 2, 3);
processDirectory(path.join(root, "features/super-admin/pages"), 2, 3);
processDirectory(path.join(root, "features/admin/components"), 2, 3);

console.log("Static imports fixed");
