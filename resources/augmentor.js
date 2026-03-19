const path = require('path');
const utils = require('airent/resources/utils.js');

function buildRelativePath(sourcePath, targetPath) /* string */ {
  const rawRelativePath = path
    .relative(sourcePath, targetPath)
    .replaceAll('\\', '/');
  return rawRelativePath.startsWith('.')
    ? rawRelativePath
    : `./${rawRelativePath}`;
}

// augment entity - add packages

function addPackages(entity, config) {
  const kababEntName = utils.toKababCase(entity.name);
  const suffix = utils.getModuleSuffix(config);
  const hooksPath = path.join(config.generatedPath, 'tanstack-hooks');

  entity._packages.apiNextTanstack = {
    hookToTypeFull: buildRelativePath(
      hooksPath,
      path.join(config.generatedPath, 'types', entity._strings.moduleName)
    ),
    hookToRequestFull: buildRelativePath(
      hooksPath,
      path.join(config.api.typesPath, entity._strings.moduleName)
    ),
    hookToClientFull: buildRelativePath(
      hooksPath,
      path.join(config.generatedPath, 'clients', entity._strings.moduleName)
    ),
    hookToServerClientFull: buildRelativePath(
      hooksPath,
      path.join(
        config.generatedPath,
        'server-clients',
        entity._strings.moduleName
      )
    ),
    hookToCachedServerClientFull: buildRelativePath(
      hooksPath,
      path.join(
        config.generatedPath,
        'server-clients',
        `${kababEntName}-cached${suffix}`
      )
    ),
  };
}

function augment(data) {
  const { entityMap, config } = data;
  const entityNames = Object.keys(entityMap).sort();
  const entities = entityNames.map((n) => entityMap[n]);
  entities.forEach((entity) => addPackages(entity, config));
}

module.exports = { augment };