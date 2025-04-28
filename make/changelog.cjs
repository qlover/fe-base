const getReleaseLine = async (changeset, type, options) => {
  const [firstLine, ...futureLines] = changeset.summary
    .split('\n')
    .map((l) => l.trimEnd());

  let returnVal = `  ${firstLine}`;

  if (futureLines.length > 0) {
    returnVal += `\n${futureLines.map((l) => `  ${l}`).join('\n')}`;
  }

  return returnVal;
};

const getDependencyReleaseLine = async () => {
  return '';
};

module.exports = {
  getReleaseLine,
  getDependencyReleaseLine
};
