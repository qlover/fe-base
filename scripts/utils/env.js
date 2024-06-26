// Function to clear environment variable
function clearEnvVariable(variable) {
  if (process.env[variable]) {
    delete process.env[variable];
  }
}

module.exports = { clearEnvVariable };
