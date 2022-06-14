require("esbuild").build({
  entryPoints: ["./src/webCryptSession.ts"],
  bundle: true,
  outdir: "dist",
  define: {
    "import.meta.vitest": undefined,
  },
  minify: true,
  sourcemap: true,
});
