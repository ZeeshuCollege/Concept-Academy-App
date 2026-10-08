const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const androidDir = path.join(rootDir, 'android');
const apkSource = path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
const rootApk = path.join(rootDir, 'ConceptAcademy.apk');
const rootDebugApk = path.join(rootDir, 'ConceptAcademy-debug.apk');
const publicApk = path.join(rootDir, 'public', 'ConceptAcademy.apk');

function runCommand(cmd, cwd = rootDir) {
  console.log(`\x1b[36m▶ Running: ${cmd}\x1b[0m`);
  execSync(cmd, { cwd, stdio: 'inherit' });
}

function buildApk() {
  const startTime = Date.now();
  console.log('\n\x1b[33m========================================\x1b[0m');
  console.log('\x1b[32m🚀 Starting Auto APK Build Pipeline\x1b[0m');
  console.log('\x1b[33m========================================\x1b[0m\n');

  try {
    // 1. Build web bundle
    runCommand('npx vite build', rootDir);

    // 2. Sync to Capacitor Android
    runCommand('npx cap sync android', rootDir);

    // 3. Assemble APK via Gradle
    const gradlewCmd = process.platform === 'win32' ? '.\\gradlew.bat assembleDebug' : './gradlew assembleDebug';
    runCommand(gradlewCmd, androidDir);

    // 4. Copy APK to convenient root location
    if (fs.existsSync(apkSource)) {
      fs.copyFileSync(apkSource, rootApk);
      fs.copyFileSync(apkSource, rootDebugApk);

      // Clean up any stale APK from public/dist assets to ensure tiny APK size
      if (fs.existsSync(publicApk)) {
        try { fs.unlinkSync(publicApk); } catch (e) {}
      }

      const stats = fs.statSync(rootApk);
      const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

      console.log('\n\x1b[32m========================================\x1b[0m');
      console.log(`\x1b[32m✔ APK UPDATED SUCCESSFULLY in ${elapsed}s!\x1b[0m`);
      console.log(`\x1b[36m📦 Root APK: ${rootApk} (${sizeMb} MB)\x1b[0m`);
      console.log(`\x1b[36m📦 Android Output: ${apkSource}\x1b[0m`);
      console.log('\x1b[32m========================================\x1b[0m\n');
    } else {
      console.error(`\x1b[31m✖ Error: Expected APK file not found at ${apkSource}\x1b[0m`);
      process.exit(1);
    }
  } catch (err) {
    console.error(`\x1b[31m✖ Build failed: ${err.message}\x1b[0m`);
    process.exit(1);
  }
}

if (require.main === module) {
  buildApk();
}

module.exports = { buildApk };
