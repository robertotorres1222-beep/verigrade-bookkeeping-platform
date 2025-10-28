#!/usr/bin/env node

/**
 * Script to fix logger import issues across all service files
 * Changes: import { logger } from '../utils/logger' 
 * To: import logger from '../utils/logger'
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all TypeScript files in the services directory
const serviceFiles = glob.sync('backend/src/services/**/*.ts');

console.log(`Found ${serviceFiles.length} service files to check...`);

let fixedCount = 0;

serviceFiles.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix logger import
    const loggerImportRegex = /import\s*{\s*logger\s*}\s*from\s*['"]\.\.\/utils\/logger['"];?/g;
    if (loggerImportRegex.test(content)) {
      content = content.replace(loggerImportRegex, "import logger from '../utils/logger';");
      modified = true;
    }

    // Fix other common import issues
    const otherImportRegex = /import\s*{\s*logger\s*}\s*from\s*['"]\.\.\/\.\.\/utils\/logger['"];?/g;
    if (otherImportRegex.test(content)) {
      content = content.replace(otherImportRegex, "import logger from '../../utils/logger';");
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed logger import in: ${filePath}`);
      fixedCount++;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log(`\n🎉 Fixed logger imports in ${fixedCount} files!`);

// Also fix controller files
const controllerFiles = glob.sync('backend/src/controllers/**/*.ts');
console.log(`\nFound ${controllerFiles.length} controller files to check...`);

let controllerFixedCount = 0;

controllerFiles.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix logger import
    const loggerImportRegex = /import\s*{\s*logger\s*}\s*from\s*['"]\.\.\/utils\/logger['"];?/g;
    if (loggerImportRegex.test(content)) {
      content = content.replace(loggerImportRegex, "import logger from '../utils/logger';");
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed logger import in: ${filePath}`);
      controllerFixedCount++;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log(`\n🎉 Fixed logger imports in ${controllerFixedCount} controller files!`);
console.log(`\n📊 Total files fixed: ${fixedCount + controllerFixedCount}`);







