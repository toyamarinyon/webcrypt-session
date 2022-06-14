const { build } = require("esbuild");

const shared = {
  entryPoints: ["src/webCryptSession.ts"],
  bundle: true,
  define: {
    "import.meta.vitest": undefined,
  },
};

build({
  ...shared,
  format: "esm",
  outfile: "dist/webCryptSession.js",
});
