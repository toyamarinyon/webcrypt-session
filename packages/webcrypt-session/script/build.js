const { build } = require("esbuild");
const { join } = require("path");

const prefixes = ["", "adapters/trpc"];
const shared = {
  bundle: true,
  define: {
    "import.meta.vitest": "undefined",
  },
};
prefixes.map((prefix) => {
  const entryPoint = join("src", prefix, "index.ts");
  const cjsOutFile = join("dist", prefix, "index.js");
  const esmOutFile = join("dist", prefix, "index.mjs");
  build({
    ...shared,
    entryPoints: [entryPoint],
    format: "cjs",
    outfile: cjsOutFile,
  });

  build({
    ...shared,
    entryPoints: [entryPoint],
    format: "esm",
    outfile: esmOutFile,
  });
});
