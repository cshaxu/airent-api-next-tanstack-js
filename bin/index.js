#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(question, defaultAnswer) {
  return new Promise((resolve) =>
    rl.question(`${question} (${defaultAnswer}): `, resolve)
  ).then((a) => (a?.length ? a : defaultAnswer));
}

async function getShouldEnable(name) {
  const shouldEnable = await askQuestion(`Enable "${name}"`, "yes");
  return shouldEnable === "yes";
}

/** @typedef {Object} Config
 *  @property {"commonjs" | "module"} type
 *  @property {?string} libImportPath
 *  @property {string} schemaPath
 *  @property {string} entityPath
 *  @property {?string[]} [augmentors]
 *  @property {?Template[]} [templates]
 */

const PROJECT_PATH = process.cwd();
const CONFIG_FILE_PATH = path.join(PROJECT_PATH, "airent.config.json");

const AIRENT_API_NEXT_TANSTACK_RESOURCES_PATH =
  "node_modules/@airent/api-next-tanstack/resources";
const API_NEXT_TANSTACK_AUGMENTOR_PATH =
  `${AIRENT_API_NEXT_TANSTACK_RESOURCES_PATH}/augmentor.js`;

const API_NEXT_TANSTACK_TEMPLATE_CONFIGS = [
  {
    name: `${AIRENT_API_NEXT_TANSTACK_RESOURCES_PATH}/base-template.ts.ejs`,
    outputPath: `{generatedPath}/tanstack-hooks/{kababEntityName}-base.ts`,
    skippable: false,
  },
  {
    name: `${AIRENT_API_NEXT_TANSTACK_RESOURCES_PATH}/types-template.ts.ejs`,
    outputPath: `{generatedPath}/tanstack-hooks/{kababEntityName}-types.ts`,
    skippable: false,
  },
  {
    name: `${AIRENT_API_NEXT_TANSTACK_RESOURCES_PATH}/client-hooks-template.ts.ejs`,
    outputPath: `{generatedPath}/tanstack-hooks/{kababEntityName}-client.ts`,
    skippable: false,
  },
  {
    name: `${AIRENT_API_NEXT_TANSTACK_RESOURCES_PATH}/server-hooks-template.ts.ejs`,
    outputPath: `{generatedPath}/tanstack-hooks/{kababEntityName}-server.ts`,
    skippable: false,
  },
  {
    name: `${AIRENT_API_NEXT_TANSTACK_RESOURCES_PATH}/server-cached-hooks-template.ts.ejs`,
    outputPath: `{generatedPath}/tanstack-hooks/{kababEntityName}-server-cached.ts`,
    skippable: false,
  },
];

async function loadConfig() {
  const configContent = await fs.promises.readFile(CONFIG_FILE_PATH, "utf8");
  const config = JSON.parse(configContent);
  const augmentors = config.augmentors ?? [];
  const templates = config.templates ?? [];
  return { ...config, augmentors, templates };
}

function addTemplate(config, draftTemplate) {
  const { templates } = config;
  const template = templates.find((t) => t.name === draftTemplate.name);
  if (template === undefined) {
    templates.push(draftTemplate);
  }
}

async function configure() {
  const config = await loadConfig();
  const { augmentors } = config;
  const isAugmentorEnabled = augmentors.includes(
    API_NEXT_TANSTACK_AUGMENTOR_PATH
  );
  const shouldEnableApiNextTanstack = isAugmentorEnabled
    ? true
    : await getShouldEnable("Api Next Tanstack");
  if (!shouldEnableApiNextTanstack) {
    return;
  }
  if (!isAugmentorEnabled) {
    augmentors.push(API_NEXT_TANSTACK_AUGMENTOR_PATH);
  }
  API_NEXT_TANSTACK_TEMPLATE_CONFIGS.forEach((t) => addTemplate(config, t));

  const content = JSON.stringify(config, null, 2) + "\n";
  await fs.promises.writeFile(CONFIG_FILE_PATH, content);
  console.log(`[AIRENT-API-NEXT-TANSTACK/INFO] Package configured.`);
}

async function main() {
  try {
    if (!fs.existsSync(CONFIG_FILE_PATH)) {
      throw new Error(
        '[AIRENT-API-NEXT-TANSTACK/ERROR] "airent.config.json" not found'
      );
    }
    await configure();
  } finally {
    rl.close();
  }
}

main().catch(console.error);