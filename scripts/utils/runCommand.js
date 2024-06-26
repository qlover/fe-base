const { execSync } = require('child_process');

function runCommand(command, options = {}) {
  const { catchError, ...opts } = options;
  try {
    return execSync(command, { stdio: 'inherit', ...opts });
  } catch (error) {
    if (catchError !== false) {
      console.error(`Error executing command: ${command}`, error);
      process.exit(1);
    } else {
      return error;
    }
  }
}

module.exports = { runCommand };
