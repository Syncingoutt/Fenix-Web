const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Parse current version
const [major, minor, patch] = packageJson.version.split('.').map(Number);

// Increment patch version
const newVersion = `${major}.${minor}.${patch + 1}`;
const tagName = `v${newVersion}`;

console.log(`🚀 Releasing version ${newVersion}...`);
console.log(`📦 Current version: ${packageJson.version}`);
console.log(`✨ New version: ${newVersion}`);

// Update package.json version
packageJson.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
console.log('✅ Updated package.json version');

// Stage package.json
try {
  execSync('git add package.json', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  console.log('✅ Staged package.json');
} catch (error) {
  console.error('❌ Failed to stage package.json:', error.message);
  process.exit(1);
}

// Check if there are any changes to commit
try {
  const status = execSync('git status --porcelain', { encoding: 'utf8', cwd: path.join(__dirname, '..') });
  const changes = status.trim().split('\n').filter(line => line.trim());
  
  // Remove package.json from changes list (we already staged it)
  const otherChanges = changes.filter(line => !line.includes('package.json'));
  
  if (otherChanges.length > 0) {
    console.log('📝 Staging other changes...');
    execSync('git add -A', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  }
  
  // Commit all changes
  console.log('💾 Committing changes...');
  execSync(`git commit -m "Release ${tagName}"`, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  console.log('✅ Changes committed');
} catch (error) {
  console.error('❌ Failed to commit changes:', error.message);
  process.exit(1);
}

// Push to GitHub
try {
  console.log('📤 Pushing to GitHub...');
  execSync('git push', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  console.log('✅ Pushed to GitHub');
} catch (error) {
  console.error('❌ Failed to push to GitHub:', error.message);
  console.log('💡 Make sure you have a remote repository set up and have push permissions');
  process.exit(1);
}

// Create and push tag
try {
  console.log(`🏷️  Creating tag ${tagName}...`);
  execSync(`git tag ${tagName}`, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  execSync(`git push origin ${tagName}`, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  console.log(`✅ Tag ${tagName} created and pushed`);
} catch (error) {
  console.error('❌ Failed to create/push tag:', error.message);
  process.exit(1);
}

console.log('\n🎉 Release process started!');
console.log(`📋 Version ${newVersion} has been pushed to GitHub with tag ${tagName}`);
console.log('⏳ GitHub Actions will now build and create the release automatically.');
console.log('💡 You can monitor the progress at: https://github.com/YOUR_USERNAME/torchlight-tracker/actions');

