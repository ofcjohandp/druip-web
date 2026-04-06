// Pre-evaluate Expo's lazy globals to prevent "outside of scope" errors
// when a test file runs first alphabetically and the lazy getters from
// expo/src/winter/runtime.native.ts fire during module initialization.
// Each of these matches an `install(...)` call in that file.
/* eslint-disable no-unused-expressions */
void globalThis.__ExpoImportMetaRegistry;
void globalThis.TextDecoder;
void globalThis.TextDecoderStream;
void globalThis.TextEncoderStream;
void globalThis.URL;
void globalThis.URLSearchParams;
void globalThis.structuredClone;
/* eslint-enable no-unused-expressions */
