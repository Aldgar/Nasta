// Learn more https://docs.expo.dev/guides/customizing-metro
const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// pnpm uses symlinks + a virtual store; make Metro follow them reliably.
config.resolver.unstable_enableSymlinks = true;
// Do NOT disable hierarchical lookup; Expo/Metro relies on it to find transitive deps
// inside package-scoped node_modules directories (common with pnpm).
config.resolver.disableHierarchicalLookup = false;
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// Allow Metro to watch workspace packages if/when you import them.
config.watchFolders = [workspaceRoot];

module.exports = config;
