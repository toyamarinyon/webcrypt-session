require("esbuild").build({
  entryPoints: ["./src/index.ts"],
  bundle: true,
  outdir: "dist",
  define: {
    "import.meta.vitest": undefined,
  },
  minify: true,
  sourcemap: true,
});
