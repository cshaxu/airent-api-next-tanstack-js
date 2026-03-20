const path = require("path");

const codeUtils = require("airent/resources/utils/code.js");
const pathUtils = require("airent/resources/utils/path.js");

// augment entity - add packages

function addPackages(entity, config) {
  const kababEntName = codeUtils.toKababCase(entity.name);
  const suffix = codeUtils.getModuleSuffix(config);
  const hooksPath = path.join(config.generatedPath, "tanstack-hooks");

  entity._packages.apiNextTanstack = {
    hookToTypeFull: pathUtils.buildRelativePath(
      hooksPath,
      path.join(config.generatedPath, "types", entity._strings.moduleName)
    ),
    hookToRequestFull: pathUtils.buildRelativePath(
      hooksPath,
      path.join(config.api.typesPath, entity._strings.moduleName)
    ),
    hookToClientFull: pathUtils.buildRelativePath(
      hooksPath,
      path.join(config.generatedPath, "clients", entity._strings.moduleName)
    ),
    hookToServerClientFull: pathUtils.buildRelativePath(
      hooksPath,
      path.join(
        config.generatedPath,
        "server-clients",
        entity._strings.moduleName
      )
    ),
    hookToCachedServerClientFull: pathUtils.buildRelativePath(
      hooksPath,
      path.join(
        config.generatedPath,
        "server-clients",
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
