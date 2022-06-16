const { build } = require("esbuild");

const shared = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  define: {
    "import.meta.vitest": undefined,
  },
};

build({
  ...shared,
  format: "cjs",
  outfile: "dist/index.js",
});

build({
  ...shared,
  format: "esm",
  outfile: "dist/index.mjs",
});
