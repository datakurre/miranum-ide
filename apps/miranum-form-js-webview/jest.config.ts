module.exports = {
    displayName: "miranum-form-js-webview",
    preset: "../../jest.preset.js",
    transform: {
        "^.+.vue$": "@vue/vue3-jest",
        ".+.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$":
            "jest-transform-stub",
        "^.+.tsx?$": [
            "ts-jest",
            {
                tsconfig: "apps/miranum-form-js-webview/tsconfig.spec.json",
            },
        ],
    },
    moduleFileExtensions: ["ts", "tsx", "vue", "js", "json"],
    coverageDirectory: "../../coverage/apps/miranum-form-js-webview",
    snapshotSerializers: ["jest-serializer-vue"],
    globals: {
        "vue-jest": {
            tsConfig: "apps/miranum-form-js-webview/tsconfig.spec.json",
        },
    },
};
