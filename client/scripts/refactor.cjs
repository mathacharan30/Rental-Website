const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.join(__dirname, '../src');

// Define destinations
const dirs = [
  'features/admin/components',
  'features/admin/pages',
  'features/public/components',
  'features/public/pages',
  'features/super-admin/components',
  'features/super-admin/pages',
  'features/shared/components'
];

dirs.forEach(d => fs.mkdirSync(path.join(root, d), { recursive: true }));

// Mapping from old path to new path
const moves = {};

const componentsDir = path.join(root, 'components');
const pagesDir = path.join(root, 'pages');

// Admin
if (fs.existsSync(path.join(componentsDir, 'admin'))) {
  const adminComps = fs.readdirSync(path.join(componentsDir, 'admin'));
  adminComps.forEach(file => {
    moves[`components/admin/${file}`] = `features/admin/components/${file}`;
  });
}

if (fs.existsSync(path.join(pagesDir, 'Admin'))) {
  const adminPages = fs.readdirSync(path.join(pagesDir, 'Admin'));
  adminPages.forEach(file => {
    moves[`pages/Admin/${file}`] = `features/admin/pages/${file}`;
  });
}

// SuperAdmin
if (fs.existsSync(path.join(pagesDir, 'SuperAdmin'))) {
  const saPages = fs.readdirSync(path.join(pagesDir, 'SuperAdmin'));
  saPages.forEach(file => {
    moves[`pages/SuperAdmin/${file}`] = `features/super-admin/pages/${file}`;
  });
}

// Public Components mapping (shared vs feature-specific)
const sharedComps = ['Navbar.jsx', 'Footer.jsx', 'Loader.jsx', 'FavoriteButton.jsx']; // add others as needed
if (fs.existsSync(componentsDir)) {
  const allComps = fs.readdirSync(componentsDir).filter(f => !fs.statSync(path.join(componentsDir, f)).isDirectory());
  allComps.forEach(file => {
    if (sharedComps.includes(file)) {
      moves[`components/${file}`] = `features/shared/components/${file}`;
    } else {
      moves[`components/${file}`] = `features/public/components/${file}`;
    }
  });
}

// Public Pages
if (fs.existsSync(path.join(pagesDir, 'Main'))) {
  const pubPages = fs.readdirSync(path.join(pagesDir, 'Main'));
  pubPages.forEach(file => {
    moves[`pages/Main/${file}`] = `features/public/pages/${file}`;
  });
}

// Now move files
Object.keys(moves).forEach(oldPath => {
  const oldFull = path.join(root, oldPath);
  const newFull = path.join(root, moves[oldPath]);
  
  if (fs.existsSync(oldFull)) {
    fs.renameSync(oldFull, newFull);
    console.log(`Moved ${oldPath} -> ${moves[oldPath]}`);
  }
});

// Update Imports simply using regex across all jsx/js files
function updateImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Since we don't know exact nesting easily without an AST, we can just replace the basename relative paths
  // A safer approach: For every moved file, look for any import importing its name:
  // We'll calculate the relative path from the current file to the new destination.
  
  const currentDir = path.dirname(filePath);

  Object.keys(moves).forEach(oldPath => {
    // Note: oldPath might be `components/Categories.jsx`
    const newPath = moves[oldPath];
    const fileName = path.basename(oldPath, '.jsx');
    
    // Calculate new relative path
    const fileNewFull = path.join(root, newPath);
    let relToNew = path.relative(currentDir, fileNewFull).replace(/\\/g, '/');
    if (!relToNew.startsWith('.')) relToNew = './' + relToNew;
    
    // Strip extension for import
    relToNew = relToNew.replace(/\.jsx$/, '').replace(/\.js$/, '');

    // Now, search for the old import string formats.
    // They could be: 
    // import Navbar from '../../components/Navbar';
    // import Navbar from '../components/Navbar';
    // import Navbar from './components/Navbar';
    // Better way: use regex to catch imports matching the filename exactly at the end
    const reqRegex = new RegExp(`from\\s+['"]\.{1,2}/.*?${fileName}['"]`, 'g');
    content = content.replace(reqRegex, `from '${relToNew}'`);
    
    // dynamic imports: lazy(() => import('../../components/Navbar'))
    const dynRegex = new RegExp(`import\\(\\s*['"]\.{1,2}/.*?${fileName}['"]\\s*\\)`, 'g');
    content = content.replace(dynRegex, `import('${relToNew}')`);
    
    // what about root relative? mostly we don't have them unless configured aliases.
  });
  
  // also fix App.jsx routing component imports if we moved pages
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated imports in ${path.relative(root, filePath)}`);
  }
}

function processDirectory(dirToProc) {
  const entries = fs.readdirSync(dirToProc, { withFileTypes: true });
  for (let entry of entries) {
    const full = path.join(dirToProc, entry.name);
    if (entry.isDirectory()) {
      processDirectory(full);
    } else if (entry.name.endsWith('.jsx') || entry.name.endsWith('.js')) {
      updateImportsInFile(full);
    }
  }
}

// Run update process AFTER all files are moved, including files that were moved.
processDirectory(root);

// Cleanup empty old Dirs
try { fs.rmdirSync(path.join(componentsDir, 'admin')); } catch(e){}
try { fs.rmdirSync(componentsDir); } catch(e){}
try { fs.rmdirSync(path.join(pagesDir, 'Admin')); } catch(e){}
try { fs.rmdirSync(path.join(pagesDir, 'SuperAdmin')); } catch(e){}
try { fs.rmdirSync(path.join(pagesDir, 'Main')); } catch(e){}
try { fs.rmdirSync(pagesDir); } catch(e){}

console.log('Refactoring complete!');
