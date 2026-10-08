const fs = require('fs');
const path = require('path');
const { buildApk } = require('./auto-build-apk.cjs');

const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');

let isBuilding = false;
let pendingBuild = false;
let debounceTimer = null;

console.log('\x1b[35m========================================================\x1b[0m');
console.log('\x1b[36m👀 Concept Academy APK Auto-Watcher is active!\x1b[0m');
console.log(`\x1b[90mWatching directory: ${srcDir}\x1b[0m`);
console.log('\x1b[32mAny saved code change will automatically rebuild the APK.\x1b[0m');
console.log('\x1b[35m========================================================\x1b[0m\n');

function triggerBuild(filename) {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(() => {
    if (isBuilding) {
      console.log('\x1b[33m⏳ Build already running. Queuing next update...\x1b[0m');
      pendingBuild = true;
      return;
    }

    isBuilding = true;
    console.log(`\n\x1b[33m⚡ Detected file change in: ${filename || 'src'}\x1b[0m`);
    console.log('\x1b[36m⏳ Auto-updating APK...\x1b[0m');

    try {
      buildApk();
    } catch (e) {
      console.error('\x1b[31mError during auto-build:\x1b[0m', e.message);
    } finally {
      isBuilding = false;
      if (pendingBuild) {
        pendingBuild = false;
        triggerBuild('queued changes');
      }
    }
  }, 3500); // 3.5s debounce to batch multiple fast edits
}

try {
  fs.watch(srcDir, { recursive: true }, (eventType, filename) => {
    if (!filename) return;
    // Ignore temporary, swap, git or build files
    if (filename.includes('.git') || filename.includes('node_modules') || filename.endsWith('~') || filename.startsWith('.')) {
      return;
    }
    triggerBuild(filename);
  });
} catch (err) {
  console.error('\x1b[31mFailed to start fs.watch:\x1b[0m', err.message);
}
