/// <reference types="vitest" />
import { defineConfig } from "vite";
import { nxViteTsPaths } from "@nx/vite/plugins/nx-tsconfig-paths.plugin";
import { resolve } from "path";

export default defineConfig({
    root: __dirname,
    cacheDir: "../../node_modules/.vite/miranum-form-js-webview",

    plugins: [
        nxViteTsPaths(),
    ],

    build: {
        target: "es2021",
        commonjsOptions: { transformMixedEsModules: true },
        chunkSizeWarningLimit: 1200,
        outDir: "../../dist/apps/miranum-modeler/miranum-form-js-webview",
        emptyOutDir: true,
        rollupOptions: {
            input: {
                index: resolve(__dirname, "src/main.ts"),
            },
            output: {
                // don't hash the name of the output file (index.js)
                entryFileNames: `[name].js`,
                assetFileNames: "[name].[ext]",
            },
        },
    },

    define: {
        "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    },
});
