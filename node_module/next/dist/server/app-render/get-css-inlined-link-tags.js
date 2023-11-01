"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "getCssInlinedLinkTags", {
    enumerable: true,
    get: function() {
        return getCssInlinedLinkTags;
    }
});
const _clientreference = require("../../lib/client-reference");
function getCssInlinedLinkTags(clientReferenceManifest, serverCSSManifest, filePath, serverCSSForEntries, injectedCSS, collectNewCSSImports) {
    var _clientReferenceManifest_cssFiles;
    const layoutOrPageCssModules = serverCSSManifest.cssImports[filePath];
    const filePathWithoutExt = filePath.replace(/(\.[A-Za-z0-9]+)+$/, "");
    const cssFilesForEntry = new Set(((_clientReferenceManifest_cssFiles = clientReferenceManifest.cssFiles) == null ? void 0 : _clientReferenceManifest_cssFiles[filePathWithoutExt]) || []);
    if (!layoutOrPageCssModules || !cssFilesForEntry.size) {
        return [];
    }
    const chunks = new Set();
    const isNotFoundPage = /(\/|\\)not-found/.test(filePathWithoutExt);
    for (const mod of layoutOrPageCssModules){
        // We only include the CSS if it's a global CSS, or it is used by this
        // entrypoint (CSS files that actually affect this layer).
        const isGlobalCSS = !/\.module\.(css|sass|scss)$/.test(mod);
        // For not-found pages, it will generally match all non-existing entries so
        // even if `serverCSSForEntries` is empty, we still want to include the CSS.
        const isImportedByEntry = serverCSSForEntries.includes(mod) || isNotFoundPage;
        if (isImportedByEntry || isGlobalCSS) {
            // If the CSS is already injected by a parent layer, we don't need
            // to inject it again.
            if (!injectedCSS.has(mod)) {
                const modData = clientReferenceManifest.clientModules[(0, _clientreference.getClientReferenceModuleKey)(mod, "")];
                if (modData) {
                    for (const chunk of modData.chunks){
                        // If the current entry in the final tree-shaked bundle has that CSS
                        // chunk, it means that it's actually used. We should include it.
                        if (cssFilesForEntry.has(chunk)) {
                            chunks.add(chunk);
                            // This might be a new layout, and to make it more efficient and
                            // not introducing another loop, we mutate the set directly.
                            if (collectNewCSSImports) {
                                injectedCSS.add(mod);
                            }
                        }
                    }
                }
            }
        }
    }
    return [
        ...chunks
    ];
}

//# sourceMappingURL=get-css-inlined-link-tags.js.map