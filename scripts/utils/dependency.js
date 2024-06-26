const { execSync } = require('child_process');

function checkDependencyInstalled(packageName, global = false) {
  const result = { local: false, global: false };
  try {
    // Check locally
    execSync(`npm list ${packageName}`, { stdio: 'ignore' });
    result.local = true;
  } catch (localError) {
    try {
      if (global) {
        // If not found locally, check globally
        execSync(`npm list -g ${packageName}`, { stdio: 'ignore' });
        result.global = true;
      }
    } catch (globalError) {}
  }

  return result;
}

function getGlobalDependencyVersion(dependencyName) {
  const result = { version: '', scope: 'global' };
  try {
    const stdioResult = execSync(
      `npm ls -g ${dependencyName} --depth=0 --json`,
      {
        encoding: 'utf8'
      }
    );
    const jsonResult = JSON.parse(stdioResult);
    if (jsonResult.dependencies && jsonResult.dependencies[dependencyName]) {
      result.version = jsonResult.dependencies[dependencyName].version;
    }
  } catch (error) {
    // Ignore errors, assume dependency is not installed globally
  }
  return result;
}

function getDependencyVersion(dependencyName) {
  const has = checkDependencyInstalled(dependencyName, false);
  // Check local dependency
  if (has.local) {
    try {
      const localPackageJsonPath = require.resolve(
        `${dependencyName}/package.json`
      );
      const localPackageJson = require(localPackageJsonPath);
      return { version: localPackageJson.version, scope: 'local' };
    } catch (error) {
      // Local package.json not found, continue to global check
    }
  }

  // Check global dependency
  return getGlobalDependencyVersion(dependencyName);
}

module.exports = {
  checkDependencyInstalled,
  getGlobalDependencyVersion,
  getDependencyVersion
};
