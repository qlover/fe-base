const path = require('path');
const { readFileSync } = require('fs');
const _ = require('lodash');

const loadTemplate = _.template;
const feConfig = readFileSync(
  path.join(__dirname, '..', 'fe-config.json'),
  'utf-8'
);
const feConfigJson = JSON.parse(feConfig);

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

const getDependencyReleaseLine = async (
  changesets,
  dependenciesUpdated,
  options
) => {
  if (!dependenciesUpdated || dependenciesUpdated.length === 0) return '';

  return _getDependencyReleaseChangelog(dependenciesUpdated);
};

function _getDependencyReleaseChangelog(dependenciesUpdated) {
  const { dependencyReleaseTemplate } = feConfigJson.release.changesetVersion;
  const lines = dependenciesUpdated.map((dep) => {
    return loadTemplate(dependencyReleaseTemplate)(dep);
  });

  return lines.join('\n');
}

module.exports = {
  getReleaseLine,
  getDependencyReleaseLine
};
